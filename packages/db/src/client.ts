import postgres from "postgres"

let client: postgres.Sql | null = null

export function sql(): postgres.Sql {
  if (!client) {
    const url = process.env.DATABASE_URL
    if (!url) throw new Error("DATABASE_URL is not set")
    client = postgres(url, { max: 10, idle_timeout: 20, onnotice: () => {} })
  }
  return client
}

export type Sql = postgres.Sql
export type Tx = postgres.TransactionSql
