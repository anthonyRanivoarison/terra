import type { Sql } from "./client"

export async function migrate(sql: Sql): Promise<void> {
  await sql.begin(async (tx) => {
    await tx`CREATE TABLE IF NOT EXISTS sites (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      public_id text NOT NULL UNIQUE,
      organization_id text NOT NULL,
      name text NOT NULL,
      domain text NOT NULL,
      allowed_hostnames text[] NOT NULL DEFAULT '{}',
      timezone text NOT NULL DEFAULT 'UTC',
      currency text NOT NULL DEFAULT 'USD',
      salt text NOT NULL,
      bot_token text NOT NULL UNIQUE,
      first_event_at timestamptz,
      created_at timestamptz NOT NULL DEFAULT now()
    )`
    await tx`CREATE INDEX IF NOT EXISTS idx_sites_org ON sites (organization_id)`
    await tx`CREATE TABLE IF NOT EXISTS visits (
      id uuid PRIMARY KEY,
      site_id uuid NOT NULL REFERENCES sites (id) ON DELETE CASCADE,
      visitor_id text NOT NULL,
      started_at timestamptz NOT NULL DEFAULT now(),
      last_seen_at timestamptz NOT NULL DEFAULT now(),
      entry_page text NOT NULL,
      exit_page text NOT NULL,
      hostname text,
      views integer NOT NULL DEFAULT 0,
      interactions integer NOT NULL DEFAULT 0,
      is_bot boolean NOT NULL DEFAULT false,
      is_new boolean NOT NULL DEFAULT true,
      referrer text,
      referrer_host text,
      channel text NOT NULL DEFAULT 'Direct',
      utm_source text,
      utm_medium text,
      utm_campaign text,
      utm_term text,
      utm_content text,
      ref text,
      country text,
      region text,
      city text,
      latitude double precision,
      longitude double precision,
      device text,
      browser text,
      browser_version text,
      os text,
      os_version text,
      language text,
      screen text,
      as_org text
    )`
    await tx`CREATE INDEX IF NOT EXISTS idx_visits_site_started
      ON visits (site_id, started_at) WHERE NOT is_bot`
    await tx`CREATE INDEX IF NOT EXISTS idx_visits_site_visitor
      ON visits (site_id, visitor_id, started_at)`
    await tx`CREATE INDEX IF NOT EXISTS idx_visits_site_last_seen
      ON visits (site_id, last_seen_at)`
    await tx`CREATE TABLE IF NOT EXISTS views (
      id uuid PRIMARY KEY,
      site_id uuid NOT NULL REFERENCES sites (id) ON DELETE CASCADE,
      visit_id uuid NOT NULL,
      visitor_id text NOT NULL,
      hostname text NOT NULL,
      page text NOT NULL,
      query text,
      title text,
      is_bot boolean NOT NULL DEFAULT false,
      entered_at timestamptz NOT NULL DEFAULT now(),
      last_seen_at timestamptz NOT NULL DEFAULT now(),
      left_at timestamptz,
      duration_s integer NOT NULL DEFAULT 0,
      scroll_pct smallint,
      lcp_ms integer,
      inp_ms integer,
      cls real,
      fcp_ms integer,
      ttfb_ms integer
    )`
    await tx`CREATE INDEX IF NOT EXISTS idx_views_site_entered
      ON views (site_id, entered_at) INCLUDE (page, title, hostname, visit_id)
      WHERE NOT is_bot`
    await tx`CREATE INDEX IF NOT EXISTS idx_views_visit ON views (visit_id)`
    await tx`CREATE INDEX IF NOT EXISTS idx_views_site_page
      ON views (site_id, page, visit_id)`
    await tx`CREATE TABLE IF NOT EXISTS events (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      site_id uuid NOT NULL REFERENCES sites (id) ON DELETE CASCADE,
      visit_id uuid,
      visitor_id text NOT NULL,
      name text NOT NULL,
      hostname text,
      page text,
      props jsonb,
      amount_cents integer,
      currency text,
      dedupe_key text,
      is_bot boolean NOT NULL DEFAULT false,
      created_at timestamptz NOT NULL DEFAULT now(),
      UNIQUE (site_id, dedupe_key)
    )`
    await tx`CREATE INDEX IF NOT EXISTS idx_events_site_created
      ON events (site_id, created_at) WHERE NOT is_bot`
    await tx`CREATE INDEX IF NOT EXISTS idx_events_visit ON events (visit_id)`
    await tx`CREATE INDEX IF NOT EXISTS idx_events_site_name
      ON events (site_id, name, visit_id)`
    await tx`CREATE TABLE IF NOT EXISTS crawls (
      id bigserial PRIMARY KEY,
      site_id uuid NOT NULL REFERENCES sites (id) ON DELETE CASCADE,
      at timestamptz NOT NULL DEFAULT now(),
      crawler text NOT NULL,
      company text NOT NULL,
      category text NOT NULL,
      hostname text NOT NULL,
      path text NOT NULL,
      status smallint,
      ip_verified boolean
    )`
    await tx`CREATE INDEX IF NOT EXISTS idx_crawls_site_at
      ON crawls (site_id, at)`
    await tx`CREATE TABLE IF NOT EXISTS imports (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      site_id uuid NOT NULL REFERENCES sites (id) ON DELETE CASCADE,
      source text NOT NULL,
      first_date date NOT NULL,
      last_date date NOT NULL,
      rows integer NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )`
    await tx`CREATE INDEX IF NOT EXISTS idx_imports_site ON imports (site_id)`
    await tx`CREATE TABLE IF NOT EXISTS imported_stats (
      site_id uuid NOT NULL REFERENCES sites (id) ON DELETE CASCADE,
      import_id uuid NOT NULL REFERENCES imports (id) ON DELETE CASCADE,
      date date NOT NULL,
      dimension text NOT NULL,
      value text NOT NULL,
      visitors bigint NOT NULL DEFAULT 0,
      visits bigint NOT NULL DEFAULT 0,
      pageviews bigint NOT NULL DEFAULT 0,
      bounces bigint NOT NULL DEFAULT 0,
      duration bigint NOT NULL DEFAULT 0
    )`
    await tx`CREATE INDEX IF NOT EXISTS idx_imported_site_dimension
      ON imported_stats (site_id, dimension, date)`
    await tx`CREATE INDEX IF NOT EXISTS idx_imported_import
      ON imported_stats (import_id)`
  })
}
