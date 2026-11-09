import { sql } from "./client"
import { migrate } from "./schema"
import { migrateApi } from "./schema-api"
import { migrateRevenue } from "./schema-revenue"

await migrate(sql())
await migrateApi(sql())
await migrateRevenue(sql())
console.log("Terra tables are ready.")
await sql().end()
