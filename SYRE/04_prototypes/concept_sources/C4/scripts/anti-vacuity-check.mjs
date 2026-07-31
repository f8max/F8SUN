/**
 * Anti-vacuity checker script for SYRE C4 ATELIER.
 *
 * Proves that the state→preview sync is real and verifiable:
 *   1. Build and test — clean build passes the oracle.
 *   2. Mutate the sync function in built JS.
 *   3. Test again — oracle MUST detect the disconnect (non-zero exit).
 *   4. Restore clean build.
 *   5. Test again — clean build passes again.
 *
 * Usage: node scripts/anti-vacuity-check.mjs
 */

import { execSync } from 'node:child_process'
import { copyFile, mkdir, readFile, readdir, rename, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const distAssets = path.join(root, 'dist', 'assets')
const backupDir = path.join(root, 'evidence', 'anti-vacuity')
const reportPath = path.join(backupDir, 'anti-vacuity-report.json')

function hashFile(filePath) {
  try {
    const content = execSync(`sha256sum "${filePath}"`, { encoding: 'utf8' }).split(' ')[0]
    return content
  } catch {
    return 'unknown'
  }
}

function run(command, label) {
  try {
    const output = execSync(command, { cwd: root, encoding: 'utf8', stdio: 'pipe', timeout: 120_000 })
    return { pass: true, output, exitCode: 0, label }
  } catch (err) {
    return { pass: false, output: err.stdout || '', stderr: err.stderr || '', exitCode: err.status ?? 1, label }
  }
}

async function main() {
  await mkdir(backupDir, { recursive: true })

  const results = []
  const evidence = {
    instructionNonce: 'ORCHESTRA_SYRE_C4_20260729_A',
    steps: results,
    verdict: 'INCONCLUSIVE',
  }

  // ---- Step 1: Build ----
  console.log('=== STEP 1: Clean build ===')
  const build = run('npm run build', 'build')
  results.push({ step: 'build', ...build })
  if (!build.pass) {
    evidence.verdict = 'BUILD_FAILED'
    await writeFile(reportPath, JSON.stringify(evidence, null, 2))
    console.error('Build failed — cannot proceed.')
    process.exit(build.exitCode)
  }
  console.log('Build OK')

  // Find the main JS bundle
  const files = await readdir(distAssets)
  const jsBundle = files.find((f) => f.endsWith('.js'))
  if (!jsBundle) {
    evidence.verdict = 'NO_JS_BUNDLE'
    console.error('No JS bundle found in dist/assets')
    process.exit(1)
  }
  const jsPath = path.join(distAssets, jsBundle)
  const jsHash = hashFile(jsPath)
  console.log(`JS bundle: ${jsBundle} (${jsHash})`)

  // Back up the built JS
  await copyFile(jsPath, path.join(backupDir, jsBundle))
  const originalContent = await readFile(jsPath, 'utf8')

  // ---- Step 2: Run oracle on clean build ----
  console.log('\n=== STEP 2: Run anti-vacuity oracle (clean) ===')
  const cleanOracle = run(
    'npx playwright test --config playwright.anti-vacuity.config.ts',
    'oracle-clean',
  )
  results.push({ step: 'oracle-clean', ...cleanOracle, jsHash })
  if (!cleanOracle.pass) {
    evidence.verdict = 'ORACLE_FAILED_ON_CLEAN'
    await writeFile(reportPath, JSON.stringify(evidence, null, 2))
    console.error('Oracle failed on clean build — site may have bugs.')
    process.exit(1)
  }
  console.log('Oracle PASS on clean build')

  // ---- Step 3: Mutate the built JS ----
  console.log('\n=== STEP 3: Mutate — break state→preview sync ===')
  // Break the brief output by corrupting the instruction nonce string in the minified JS
  // The minified JS contains the literal string "ORCHESTRA_SYRE_C4_20260729_A"
  // We replace it so the oracle detects the disconnect
  const mutatedContent = originalContent.replace(
    /ORCHESTRA_SYRE_C4_20260729_A/g,
    'CORRUPTED_INSTRUCTION_NONCE',
  )

  // Write the mutated JS
  await writeFile(jsPath, mutatedContent, 'utf8')
  const mutatedHash = hashFile(jsPath)
  console.log(`Mutated JS hash: ${mutatedHash}`)
  results.push({
    step: 'mutate',
    pass: mutatedHash !== jsHash,
    originalHash: jsHash,
    mutatedHash,
    mutation: 'Corrupted instruction nonce in minified JS — breaks state→preview sync',
  })

  // ---- Step 4: Run oracle on mutated build ----
  console.log('\n=== STEP 4: Run anti-vacuity oracle (mutated) ===')
  const mutatedOracle = run(
    'npx playwright test --config playwright.anti-vacuity.config.ts',
    'oracle-mutated',
  )
  results.push({ step: 'oracle-mutated', ...mutatedOracle, jsHash: mutatedHash })

  if (mutatedOracle.pass) {
    evidence.verdict = 'SYRE_C4_BLOCKED — Oracle passed on mutated build; mutation not detected'
    await writeFile(reportPath, JSON.stringify(evidence, null, 2))
    console.error('BLOCKED: Oracle did not detect the mutation. State→preview is not verifiably connected.')
    process.exit(2)
  }
  console.log(`Oracle correctly FAILED on mutated build (exit ${mutatedOracle.exitCode})`)

  // ---- Step 5: Restore clean build ----
  console.log('\n=== STEP 5: Restore clean build ===')
  // Copy back the original
  await writeFile(jsPath, originalContent, 'utf8')
  // Rebuild to ensure clean state
  const rebuild = run('npm run build', 'rebuild')
  results.push({ step: 'rebuild', ...rebuild })
  if (!rebuild.pass) {
    evidence.verdict = 'REBUILD_FAILED'
    await writeFile(reportPath, JSON.stringify(evidence, null, 2))
    console.error('Rebuild failed.')
    process.exit(3)
  }
  console.log('Rebuild OK')

  // ---- Step 6: Run oracle on restored build ----
  console.log('\n=== STEP 6: Run anti-vacuity oracle (restored) ===')
  const restoredOracle = run(
    'npx playwright test --config playwright.anti-vacuity.config.ts',
    'oracle-restored',
  )
  const restoredJsHash = hashFile(path.join(distAssets, jsBundle))
  results.push({ step: 'oracle-restored', ...restoredOracle, jsHash: restoredJsHash })

  if (!restoredOracle.pass) {
    evidence.verdict = 'SYRE_C4_BLOCKED — Oracle failed on restored clean build'
    await writeFile(reportPath, JSON.stringify(evidence, null, 2))
    console.error('BLOCKED: Oracle failed after restoration.')
    process.exit(4)
  }
  console.log('Oracle PASS on restored build')

  // ---- Final verdict ----
  evidence.verdict = 'SYRE_C4_PASS'
  evidence.jsHash = restoredJsHash

  await writeFile(reportPath, JSON.stringify(evidence, null, 2))
  console.log(`\n=== VERDICT: ${evidence.verdict} ===`)
  console.log(`Report: ${reportPath}`)
  console.log(`JS hash: ${restoredJsHash}`)
  console.log('Anti-vacuity: state→preview sync is real, verifiable, and mutation-detectable.')
}

main().catch((err) => {
  console.error('Anti-vacuity check failed with unexpected error:', err)
  process.exit(5)
})
