WITH params AS (
  SELECT $1::uuid AS site_id, $2::text AS domain, $3::int AS visits,
    $4::int AS crawls, $5::text AS title, $6::text[] AS pages,
    $7::text[] AS hosts, $8::jsonb AS events, $9::int AS price,
    $10::float8 AS buy_rate, $11::text[] AS campaigns
),
seed AS (
  SELECT g.t, r.single
  FROM params p,
    LATERAL (
      SELECT CASE
        WHEN i <= greatest(3, p.visits / 1500) THEN now() - interval '1 second' * random() * 90
        WHEN i <= greatest(8, p.visits / 600) THEN now() - interval '1 minute' * random() * 30
        ELSE now() - interval '1 day' * power(random(), 1.6) * 400
          - ((CASE WHEN random() < 0.6 THEN (random() * 8)::int ELSE 0 END) || ' hours')::interval
      END AS t
      FROM generate_series(1, p.visits) i
    ) g,
    LATERAL (SELECT random() < 0.42 + 0 * extract(epoch FROM g.t) AS single) r
),
v AS (
  INSERT INTO visits (
    id, site_id, visitor_id, started_at, last_seen_at, entry_page, exit_page,
    hostname, views, interactions, is_bot, is_new, referrer, referrer_host,
    channel, utm_source, utm_campaign, country, city, latitude, longitude,
    device, browser, os, language, screen, as_org
  )
  SELECT gen_random_uuid(), p.site_id,
    'v' || (random() * p.visits * 0.6)::int, s.t,
    LEAST(now(), s.t + ((CASE WHEN s.single THEN (random() * 20)::int
      ELSE 30 + (random() * 900)::int END) || ' seconds')::interval),
    p.pages[1], p.pages[1],
    p.hosts[1 + floor(random() * array_length(p.hosts, 1))::int],
    CASE WHEN s.single THEN 1 ELSE 2 + (random() * 6)::int END,
    CASE WHEN s.single THEN (random() < 0.12)::int ELSE (random() * 4)::int END,
    random() < 0.04, random() < 0.65,
    NULL, src.host, src.channel, src.utm,
    CASE WHEN src.utm IS NOT NULL
      THEN p.campaigns[1 + floor(random() * array_length(p.campaigns, 1))::int] END,
    geo.country, geo.city, geo.lat, geo.lon,
    dev.device, dev.browser, dev.os,
    (ARRAY['en-US', 'en-US', 'fr-FR', 'de-DE', 'en-GB', 'pt-BR'])[1 + (random() * 5)::int],
    dev.screen,
    (ARRAY['Comcast', 'Orange', 'Deutsche Telekom', 'Telma', 'Free SAS', 'Vodafone'])[1 + (random() * 5)::int]
  FROM params p, seed s,
    LATERAL (
      SELECT * FROM (VALUES
        ('google.com', 'Organic Search', NULL), ('google.com', 'Organic Search', NULL),
        ('google.com', 'Organic Search', NULL), ('bing.com', 'Organic Search', NULL),
        ('duckduckgo.com', 'Organic Search', NULL), (NULL, 'Direct', NULL),
        (NULL, 'Direct', NULL), (NULL, 'Direct', NULL), ('chatgpt.com', 'AI', NULL),
        ('perplexity.ai', 'AI', NULL), ('claude.ai', 'AI', NULL),
        ('x.com', 'Organic Social', NULL), ('reddit.com', 'Organic Social', NULL),
        ('news.ycombinator.com', 'Organic Social', NULL),
        ('linkedin.com', 'Organic Social', NULL), ('github.com', 'Referral', NULL),
        (NULL, 'Email', 'newsletter'), ('instagram.com', 'Paid Social', 'instagram'),
        ('google.com', 'Paid Search', 'google')
      ) x(host, channel, utm) ORDER BY random() + 0 * extract(epoch FROM s.t) LIMIT 1
    ) src,
    LATERAL (
      SELECT * FROM (VALUES
        ('US', 'San Francisco', 37.8, -122.4), ('US', 'New York', 40.7, -74.0),
        ('FR', 'Paris', 48.9, 2.3), ('DE', 'Berlin', 52.5, 13.4),
        ('GB', 'London', 51.5, -0.1), ('IN', 'Bangalore', 13.0, 77.6),
        ('MG', 'Antananarivo', -18.9, 47.5), ('CA', 'Toronto', 43.7, -79.4),
        ('BR', 'São Paulo', -23.5, -46.6), ('JP', 'Tokyo', 35.7, 139.7)
      ) c(country, city, lat, lon) ORDER BY random() + 0 * extract(epoch FROM s.t) LIMIT 1
    ) geo,
    LATERAL (
      SELECT * FROM (VALUES
        ('Desktop', 'Chrome', 'Windows', '1920×1080'), ('Desktop', 'Chrome', 'macOS', '1512×982'),
        ('Desktop', 'Safari', 'macOS', '1440×900'), ('Desktop', 'Edge', 'Windows', '1920×1080'),
        ('Desktop', 'Firefox', 'Linux', '1920×1080'), ('Desktop', 'Arc', 'macOS', '1728×1117'),
        ('Mobile', 'Safari', 'iOS', '390×844'), ('Mobile', 'Safari', 'iOS', '393×852'),
        ('Mobile', 'Chrome', 'Android', '412×915'), ('Mobile', 'Chrome', 'Android', '360×800'),
        ('Tablet', 'Safari', 'iOS', '820×1180')
      ) d(device, browser, os, screen) ORDER BY random() + 0 * extract(epoch FROM s.t) LIMIT 1
    ) dev
  RETURNING id, site_id, visitor_id, started_at, hostname, views, is_bot
),
pv AS (
  INSERT INTO views (
    id, site_id, visit_id, visitor_id, hostname, page, title, is_bot,
    entered_at, last_seen_at, duration_s, scroll_pct, lcp_ms, inp_ms, cls, fcp_ms, ttfb_ms
  )
  SELECT gen_random_uuid(), v.site_id, v.id, v.visitor_id, v.hostname, pg.page,
    CASE WHEN pg.page = '/' THEN p.title
      ELSE initcap(replace(split_part(pg.page, '/', array_length(string_to_array(pg.page, '/'), 1)), '-', ' ')) || ' · ' || p.title
    END,
    v.is_bot,
    v.started_at + (n * 40 || ' seconds')::interval,
    v.started_at + (n * 40 + 30 || ' seconds')::interval,
    CASE WHEN v.views = 1 THEN (random() * 20)::int ELSE 10 + (random() * 150)::int END,
    (20 + random() * 80)::int,
    CASE WHEN n = 0 THEN 900 + (random() * 2600)::int END,
    CASE WHEN n = 0 THEN 40 + (random() * 380)::int END,
    CASE WHEN n = 0 THEN round((random() * 0.25)::numeric, 3) END,
    CASE WHEN n = 0 THEN 500 + (random() * 1800)::int END,
    CASE WHEN n = 0 THEN 80 + (random() * 700)::int END
  FROM v, params p, generate_series(0, v.views - 1) n,
    LATERAL (
      SELECT p.pages[1 + floor(power(random(), CASE WHEN n = 0 THEN 2.2 ELSE 1.3 END)
        * array_length(p.pages, 1))::int] AS page
    ) pg
  RETURNING 1
),
ev AS (
  INSERT INTO events (site_id, visit_id, visitor_id, name, hostname, page, props, created_at)
  SELECT v.site_id, v.id, v.visitor_id, e.value ->> 'name', v.hostname, '/',
    e.value -> 'props', v.started_at + interval '20 seconds'
  FROM v, params p, LATERAL (
    SELECT value FROM jsonb_array_elements(p.events)
    ORDER BY random() + 0 * extract(epoch FROM v.started_at) LIMIT 1
  ) e
  WHERE v.views > 1 AND random() < 0.55 AND NOT v.is_bot
  RETURNING 1
),
buy AS (
  INSERT INTO events (site_id, visit_id, visitor_id, name, page, amount_cents, currency, dedupe_key, created_at)
  SELECT v.site_id, v.id, v.visitor_id, 'purchase', '/thanks',
    p.price * (1 + (random() < 0.3)::int), 'USD',
    'purchase:demo_' || v.id, v.started_at + interval '5 minutes'
  FROM v, params p
  WHERE v.views > 1 AND random() + 0 * v.views < p.buy_rate AND NOT v.is_bot
  RETURNING visit_id, visitor_id, amount_cents, created_at
),
refund AS (
  INSERT INTO events (site_id, visit_id, visitor_id, name, page, amount_cents, currency, dedupe_key, created_at)
  SELECT (SELECT site_id FROM params), visit_id, visitor_id, 'refund', '/', -amount_cents, 'USD',
    'refund:demo_' || visit_id, created_at + interval '2 days'
  FROM buy WHERE random() < 0.08
  RETURNING 1
)
INSERT INTO crawls (site_id, at, crawler, company, category, hostname, path, status, ip_verified)
SELECT p.site_id, now() - interval '1 day' * power(random(), 1.4) * 400, c.crawler, c.company, c.category,
  p.domain,
  (p.pages || ARRAY['/robots.txt', '/llms.txt', '/sitemap.xml'])[1 + floor(random() * (array_length(p.pages, 1) + 3))::int],
  CASE WHEN random() < 0.05 THEN 404 ELSE 200 END, random() < 0.85
FROM params p, generate_series(1, p.crawls) g, LATERAL (
  SELECT * FROM (VALUES
    ('chatgpt-user', 'OpenAI', 'answers'), ('chatgpt-user', 'OpenAI', 'answers'),
    ('gptbot', 'OpenAI', 'training'), ('claudebot', 'Anthropic', 'training'),
    ('googlebot', 'Google', 'indexing'), ('googlebot', 'Google', 'indexing'),
    ('perplexitybot', 'Perplexity', 'indexing'), ('claude-user', 'Anthropic', 'answers'),
    ('bingbot', 'Microsoft', 'indexing')
  ) x(crawler, company, category) ORDER BY random() + 0 * g LIMIT 1
) c
