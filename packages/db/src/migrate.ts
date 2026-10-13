import { sql } from "./client"
import { migrate } from "./schema"
import { migrateApi } from "./schema-api"
import { migrateBilling } from "./schema-billing"

await migrate(sql())
await migrateApi(sql())
await migrateBilling(sql())
console.log("Terra tables are ready.")
await sql().end()
