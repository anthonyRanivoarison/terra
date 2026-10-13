import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto"

const VERSION = "v1"

function key(raw = process.env.ENCRYPTION_KEY): Buffer {
  const bytes = Buffer.from(raw ?? "", "base64")
  if (bytes.length !== 32) {
    throw new Error("ENCRYPTION_KEY must be 32 bytes encoded in base64")
  }
  return bytes
}

export function encrypt(plaintext: string, rawKey?: string): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv("aes-256-gcm", key(rawKey), iv)
  const data = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()
  return [VERSION, iv, tag, data]
    .map((part) =>
      typeof part === "string" ? part : part.toString("base64url")
    )
    .join(".")
}

export function decrypt(payload: string, rawKey?: string): string {
  const [version, iv, tag, data] = payload.split(".")
  if (version !== VERSION || !iv || !tag || data === undefined) {
    throw new Error("Invalid encrypted payload")
  }
  const decipher = createDecipheriv(
    "aes-256-gcm",
    key(rawKey),
    Buffer.from(iv, "base64url")
  )
  decipher.setAuthTag(Buffer.from(tag, "base64url"))
  return Buffer.concat([
    decipher.update(Buffer.from(data, "base64url")),
    decipher.final(),
  ]).toString("utf8")
}
