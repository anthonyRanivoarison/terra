import type { Sql } from "./client"

export const GRACE_DAYS = 7
export const ACTIVE_STATUSES = ["active", "trialing", "past_due"]

export type QuotaState = {
  used: number
  quota: number | null
  plan: string
  over: boolean
  overGrace: boolean
  overSince: Date | null
  graceEndsAt: Date | null
}

export type QuotaInput = {
  used: number
  quota: number | null
  plan: string
  overSince: Date | null
  now?: Date
}

export function freeQuota(): number | null {
  const raw = Number(process.env.TERRA_FREE_EVENTS_QUOTA)
  return Number.isInteger(raw) && raw > 0 ? raw : null
}

export function evaluateQuota(input: QuotaInput): QuotaState {
  const now = input.now ?? new Date()
  const over = input.quota !== null && input.used > input.quota
  const overSince = over ? (input.overSince ?? now) : null
  const graceEndsAt = overSince
    ? new Date(overSince.getTime() + GRACE_DAYS * 86_400_000)
    : null
  return {
    used: input.used,
    quota: input.quota,
    plan: input.plan,
    over,
    overGrace: graceEndsAt !== null && now >= graceEndsAt,
    overSince,
    graceEndsAt,
  }
}

const month = (sql: Sql) =>
  sql`date_trunc('month', now() AT TIME ZONE 'UTC')::date`

export async function incrementUsage(
  sql: Sql,
  siteId: string,
  count: number
): Promise<number | null> {
  if (!Number.isInteger(count) || count <= 0) return null
  const [row] = await sql<{ events: number }[]>`
    WITH site AS (
      SELECT organization_id FROM sites WHERE id = ${siteId}
    ), limits AS (
      SELECT COALESCE(
        (SELECT events_quota FROM subscriptions s, site
          WHERE s.organization_id = site.organization_id
            AND s.status = ANY(${ACTIVE_STATUSES})),
        ${freeQuota()}::integer
      ) AS quota
    )
    INSERT INTO usage_monthly (organization_id, month, events, over_quota_since)
    SELECT site.organization_id, ${month(sql)}, ${count},
      CASE WHEN ${count} > (SELECT quota FROM limits) THEN now() END
    FROM site
    ON CONFLICT (organization_id, month) DO UPDATE SET
      events = usage_monthly.events + EXCLUDED.events,
      over_quota_since = COALESCE(
        usage_monthly.over_quota_since,
        CASE WHEN usage_monthly.events + EXCLUDED.events
          > (SELECT quota FROM limits) THEN now() END
      )
    RETURNING events
  `
  return row?.events ?? null
}

export async function quotaState(
  sql: Sql,
  organizationId: string
): Promise<QuotaState> {
  const [row] = await sql<
    {
      used: number | null
      overSince: Date | null
      plan: string | null
      quota: number | null
    }[]
  >`
    SELECT u.events AS used, u.over_quota_since AS "overSince",
      s.plan, s.events_quota AS quota
    FROM (SELECT ${organizationId}::text AS organization_id) o
    LEFT JOIN usage_monthly u
      ON u.organization_id = o.organization_id AND u.month = ${month(sql)}
    LEFT JOIN subscriptions s
      ON s.organization_id = o.organization_id
      AND s.status = ANY(${ACTIVE_STATUSES})
  `
  const subscribed = row?.plan != null && row.quota != null
  const state = evaluateQuota({
    used: row?.used ?? 0,
    quota: subscribed ? row!.quota : freeQuota(),
    plan: subscribed ? row!.plan! : "free",
    overSince: row?.overSince ?? null,
  })
  if (row?.overSince?.getTime() !== state.overSince?.getTime()) {
    await sql`
      UPDATE usage_monthly SET over_quota_since = ${state.overSince}
      WHERE organization_id = ${organizationId} AND month = ${month(sql)}
    `
  }
  return state
}
