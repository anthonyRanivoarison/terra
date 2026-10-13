import { sql } from "@terra/db/client"

export async function claimEvent(eventId: string): Promise<boolean> {
  const rows = await sql()`
    INSERT INTO webhook_events (event_id) VALUES (${eventId})
    ON CONFLICT (event_id) DO NOTHING
    RETURNING event_id
  `
  return rows.length > 0
}

export async function releaseEvent(eventId: string): Promise<void> {
  await sql()`DELETE FROM webhook_events WHERE event_id = ${eventId}`
}
