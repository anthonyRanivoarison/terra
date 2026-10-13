const file = Bun.file(new URL("../dist/script.js", import.meta.url))
const raw = await file.arrayBuffer()
const gzip = Bun.gzipSync(new Uint8Array(raw)).byteLength
const limit = 6 * 1024
console.log(
  `script.js: ${raw.byteLength} B raw, ${gzip} B gzip (limit ${limit})`
)
if (gzip > limit) process.exit(1)
