import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const authorizedOrigin = 'https://syre-web-pkauauz2jq-as.a.run.app'
const release = {
  branch: 'codex/syre-foundation-20260729',
  commit: '6dfc0cbf4fb0b6a848db75b0c7fabdf342c34922',
  tree: '48fe8474cec8800ae64a560ec2f37dab6748f681',
  revision: 'syre-web-6dfc0cbf',
  imageDigest: 'sha256:c0fcd4b51a06f76f609f109f23a0046ba4a82120ee89f95036f363b23abadf00',
  buildId: 'c5786e85-15d2-4ac7-b9b9-9370f3b8c78a',
  rootRuntimeGate: 'PASS_81_OF_81',
  rootRuntimeReportSha256: 'edffd50c5e349606a0aad48f3459d9e778b5c76f4b00db145dc41ca4b6f4cad0',
}

const sha256 = (value) => createHash('sha256').update(value).digest('hex')
const selectedHeaders = [
  'cache-control',
  'content-security-policy',
  'content-type',
  'etag',
  'last-modified',
  'permissions-policy',
  'referrer-policy',
  'x-content-type-options',
  'x-frame-options',
]

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function headersToObject(headers) {
  return Object.fromEntries(selectedHeaders.map((name) => [name, headers.get(name)]))
}

function assertSameOrigin(url) {
  const parsed = new URL(url, authorizedOrigin)
  assert(parsed.origin === authorizedOrigin, `Blocked non-authorized origin: ${parsed.href}`)
  return parsed
}

function assertSecurityHeaders(headers, pathname) {
  assert(headers.get('content-security-policy')?.includes("default-src 'self'"), `${pathname}: missing CSP`)
  assert(headers.get('x-content-type-options') === 'nosniff', `${pathname}: X-Content-Type-Options must be nosniff`)
  assert(headers.get('x-frame-options') === 'DENY', `${pathname}: X-Frame-Options must be DENY`)
  assert(Boolean(headers.get('referrer-policy')), `${pathname}: missing Referrer-Policy`)
  assert(Boolean(headers.get('permissions-policy')), `${pathname}: missing Permissions-Policy`)
}

async function get(pathname) {
  const url = assertSameOrigin(pathname)
  const response = await fetch(url, { method: 'GET', redirect: 'manual' })
  assert(response.status < 300 || response.status >= 400, `${url.pathname}: redirect responses are forbidden`)
  const bytes = Buffer.from(await response.arrayBuffer())
  return { url, response, bytes }
}

async function localShaFor(publicPathname) {
  const relativePath = publicPathname.replace(/^\//, '') || 'index.html'
  try {
    return sha256(await readFile(path.resolve('dist', relativePath)))
  } catch {
    return null
  }
}

const root = await get('/')
assert(root.response.status === 200, `/: expected 200, received ${root.response.status}`)
assert(root.response.headers.get('content-type')?.startsWith('text/html'), '/: expected text/html')
assert(root.response.headers.get('cache-control') === 'no-cache', '/: expected Cache-Control no-cache')
assertSecurityHeaders(root.response.headers, '/')

const html = root.bytes.toString('utf8')
const discoveredReferences = [...html.matchAll(/(?:src|href|content)=["']([^"']+)["']/g)]
  .map((match) => match[1])
  .filter((reference) => reference.startsWith('/') || reference.startsWith('http://') || reference.startsWith('https://'))

const assetUrls = [...new Set(discoveredReferences.map((reference) => assertSameOrigin(reference).href))].sort()
assert(assetUrls.length >= 5, `Expected at least 5 public asset references, found ${assetUrls.length}`)

const assets = []
for (const assetUrl of assetUrls) {
  const asset = await get(assetUrl)
  assert(asset.response.status === 200, `${asset.url.pathname}: expected 200, received ${asset.response.status}`)
  assertSecurityHeaders(asset.response.headers, asset.url.pathname)
  const cacheControl = asset.response.headers.get('cache-control')
  if (asset.url.pathname.startsWith('/assets/')) {
    assert(cacheControl === 'public, max-age=31536000, immutable', `${asset.url.pathname}: immutable cache policy missing`)
  } else {
    assert(cacheControl === 'no-cache', `${asset.url.pathname}: expected no-cache`)
  }
  const publicSha256 = sha256(asset.bytes)
  const localSha256 = await localShaFor(asset.url.pathname)
  assert(localSha256 !== null, `${asset.url.pathname}: matching local dist asset not found`)
  assert(publicSha256 === localSha256, `${asset.url.pathname}: public bytes do not match local build`)
  assets.push({
    path: asset.url.pathname,
    status: asset.response.status,
    bytes: asset.bytes.length,
    sha256: publicSha256,
    localDistSha256: localSha256,
    identityMatch: true,
    headers: headersToObject(asset.response.headers),
  })
}

const health = await get('/health')
const healthBody = health.bytes.toString('utf8')
assert(health.response.status === 200, `/health: expected 200, received ${health.response.status}`)
assert(healthBody === '{"status":"ok"}', `/health: unexpected body ${JSON.stringify(healthBody)}`)
assert(health.response.headers.get('content-type')?.startsWith('application/json'), '/health: expected application/json')
assert(health.response.headers.get('cache-control') === 'no-store', '/health: expected Cache-Control no-store')
assertSecurityHeaders(health.response.headers, '/health')

const report = {
  generatedBy: 'scripts/public-http-qa.mjs',
  requestPolicy: 'GET only; manual redirects; exact authorized origin and same-origin assets only',
  authorizedOrigin,
  release,
  root: {
    status: root.response.status,
    bytes: root.bytes.length,
    sha256: sha256(root.bytes),
    localDistSha256: await localShaFor('/'),
    identityMatch: sha256(root.bytes) === await localShaFor('/'),
    headers: headersToObject(root.response.headers),
  },
  health: {
    status: health.response.status,
    body: healthBody,
    sha256: sha256(health.bytes),
    headers: headersToObject(health.response.headers),
  },
  discoveredSameOriginAssets: assets.length,
  assets,
  checks: {
    redirects: 0,
    crossOriginRequests: 0,
    nonGetRequests: 0,
    failedResponses: 0,
    securityHeaderFailures: 0,
    cachePolicyFailures: 0,
    publicToLocalIdentityMismatches: 0,
    passed: true,
  },
}

assert(report.root.identityMatch, '/: public index.html does not match local dist build')
await mkdir(path.resolve('evidence/public'), { recursive: true })
await writeFile(path.resolve('evidence/public/http-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8')
process.stdout.write(`PUBLIC_HTTP_QA_PASS ${JSON.stringify({ origin: authorizedOrigin, assets: assets.length, health: report.health.status, identityMatch: true })}\n`)
