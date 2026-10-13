import { getMigrations } from "better-auth/db/migration"
import { auth } from "../lib/auth"

const { runMigrations } = await getMigrations(auth.options)
await runMigrations()
console.log("Auth tables are ready.")
process.exit(0)
