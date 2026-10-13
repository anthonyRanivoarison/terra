import { describe, expect, test } from "bun:test"
import { randomBytes } from "node:crypto"
import { decrypt, encrypt } from "@/lib/crypto"

const key = randomBytes(32).toString("base64")

describe("crypto", () => {
  test("round-trips a secret", () => {
    const secret = "pdl_sdbx_apikey_01h_secret_value"
    const payload = encrypt(secret, key)
    expect(payload).not.toContain(secret)
    expect(decrypt(payload, key)).toBe(secret)
  })

  test("uses a fresh IV every time", () => {
    expect(encrypt("same", key)).not.toBe(encrypt("same", key))
  })

  test("rejects tampering and wrong keys", () => {
    const payload = encrypt("secret", key)
    const parts = payload.split(".")
    parts[3] = Buffer.from("other").toString("base64url")
    expect(() => decrypt(parts.join("."), key)).toThrow()
    expect(() => decrypt(payload, randomBytes(32).toString("base64"))).toThrow()
  })

  test("requires a 32-byte key", () => {
    expect(() => encrypt("x", Buffer.from("short").toString("base64"))).toThrow(
      /32 bytes/
    )
  })
})
