import { mkdir, readdir, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { gzipSync } from 'node:zlib'

const budgets = {
  javascriptGzipBytes: 90 * 1024,
  cssGzipBytes: 24 * 1024,
  totalRawBytes: 350 * 1024,
}

const assetsDirectory = path.resolve('dist/assets')
const entries = await readdir(assetsDirectory)
const files = []

for (const name of entries.sort()) {
  const filePath = path.join(assetsDirectory, name)
  const fileStat = await stat(filePath)
  if (!fileStat.isFile()) continue
  const content = await import('node:fs/promises').then(({ readFile }) => readFile(filePath))
  files.push({
    name,
    bytes: content.byteLength,
    gzipBytes: gzipSync(content, { level: 9 }).byteLength,
  })
}

const totals = files.reduce(
  (result, file) => {
    result.rawBytes += file.bytes
    if (file.name.endsWith('.js')) result.javascriptGzipBytes += file.gzipBytes
    if (file.name.endsWith('.css')) result.cssGzipBytes += file.gzipBytes
    return result
  },
  { rawBytes: 0, javascriptGzipBytes: 0, cssGzipBytes: 0 },
)

const failures = []
if (totals.javascriptGzipBytes > budgets.javascriptGzipBytes) failures.push('JavaScript gzip budget exceeded')
if (totals.cssGzipBytes > budgets.cssGzipBytes) failures.push('CSS gzip budget exceeded')
if (totals.rawBytes > budgets.totalRawBytes) failures.push('Total raw asset budget exceeded')

const report = {
  target: 'dist/assets',
  budgets,
  totals,
  files,
  passed: failures.length === 0,
  failures,
}

await mkdir(path.resolve('evidence'), { recursive: true })
await writeFile(path.resolve('evidence/bundle-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8')
console.log(JSON.stringify(report, null, 2))
if (failures.length) process.exitCode = 1
