WITH params AS (SELECT $1::uuid AS site_id),
v AS (
  INSERT INTO visits (
    id, site_id, visitor_id, started_at, last_seen_at, entry_page, exit_page,
    hostname, views, interactions, is_bot, is_new, referrer, referrer_host,
    channel, utm_source, utm_campaign, country, city, latitude, longitude,
    device, browser, os, language, screen, as_org
  )
  SELECT gen_random_uuid(), p.site_id, 'v' || (random() * 2500)::int, t,
    t + ((random() * 420)::int || ' seconds')::interval,
    (ARRAY['/', '/', '/pricing', '/docs', '/blog/launch'])[1 + (random() * 4)::int],
    (ARRAY['/', '/pricing', '/docs', '/thanks'])[1 + (random() * 3)::int],
    (ARRAY['launch-now.dev', 'launch-now.dev', 'docs.launch-now.dev', 'app.launch-now.dev'])[1 + (random() * 3)::int],
    1 + (random() * 5)::int, (random() * 3)::int, random() < 0.04, random() < 0.65,
    NULL, src.host, src.channel,
    CASE WHEN random() < 0.15 THEN 'twitter' END,
    CASE WHEN random() < 0.12 THEN 'launch-week' END,
    geo.country, geo.city, geo.lat, geo.lon,
    (ARRAY['Desktop', 'Desktop', 'Mobile', 'Tablet'])[1 + (random() * 3)::int],
    (ARRAY['Chrome', 'Chrome', 'Safari', 'Firefox', 'Edge', 'Arc'])[1 + (random() * 5)::int],
    (ARRAY['macOS', 'Windows', 'iOS', 'Android', 'Linux'])[1 + (random() * 4)::int],
    (ARRAY['en-US', 'fr-FR', 'de-DE', 'en-GB'])[1 + (random() * 3)::int],
    (ARRAY['1440×900', '1920×1080', '390×844', '1512×982'])[1 + (random() * 3)::int],
    (ARRAY['Comcast', 'Orange', 'Deutsche Telekom', 'Telma', 'Free SAS'])[1 + (random() * 4)::int]
  FROM params p,
    LATERAL (
      SELECT now() - (random() * 30 || ' days')::interval
        - ((CASE WHEN random() < 0.6 THEN (random() * 8)::int ELSE 0 END) || ' hours')::interval AS t
      FROM generate_series(1, 3200)
    ) g,
    LATERAL (
      SELECT * FROM (VALUES
        ('google.com', 'Organic Search'), ('x.com', 'Organic Social'),
        ('chatgpt.com', 'AI'), ('news.ycombinator.com', 'Organic Social'),
        ('github.com', 'Referral'), (NULL, 'Direct'), (NULL, 'Direct'),
        ('perplexity.ai', 'AI'), ('reddit.com', 'Organic Social')
      ) s(host, channel) ORDER BY random() + 0 * extract(epoch FROM g.t) LIMIT 1
    ) src,
    LATERAL (
      SELECT * FROM (VALUES
        ('US', 'San Francisco', 37.8, -122.4), ('FR', 'Paris', 48.9, 2.3),
        ('DE', 'Berlin', 52.5, 13.4), ('GB', 'London', 51.5, -0.1),
        ('IN', 'Bangalore', 13.0, 77.6), ('MG', 'Antananarivo', -18.9, 47.5),
        ('CA', 'Toronto', 43.7, -79.4), ('BR', 'São Paulo', -23.5, -46.6)
      ) c(country, city, lat, lon) ORDER BY random() + 0 * extract(epoch FROM g.t) LIMIT 1
    ) geo
  RETURNING id, site_id, visitor_id, started_at, hostname, views, is_bot
),
pv AS (
  INSERT INTO views (
    id, site_id, visit_id, visitor_id, hostname, page, title, is_bot,
    entered_at, last_seen_at, duration_s, scroll_pct, lcp_ms, inp_ms, cls, fcp_ms, ttfb_ms
  )
  SELECT gen_random_uuid(), v.site_id, v.id, v.visitor_id, v.hostname,
    (ARRAY['/', '/pricing', '/docs', '/docs/install', '/blog/launch', '/changelog'])[1 + (random() * 5)::int],
    'Launch.now', v.is_bot,
    v.started_at + (n * 40 || ' seconds')::interval,
    v.started_at + (n * 40 + 30 || ' seconds')::interval,
    (random() * 120)::int, (20 + random() * 80)::int,
    CASE WHEN n = 0 THEN 900 + (random() * 2600)::int END,
    CASE WHEN n = 0 THEN 40 + (random() * 380)::int END,
    CASE WHEN n = 0 THEN round((random() * 0.25)::numeric, 3) END,
    CASE WHEN n = 0 THEN 500 + (random() * 1800)::int END,
    CASE WHEN n = 0 THEN 80 + (random() * 700)::int END
  FROM v, generate_series(0, v.views - 1) n
  RETURNING 1
),
ev AS (
  INSERT INTO events (site_id, visit_id, visitor_id, name, hostname, page, props, created_at)
  SELECT v.site_id, v.id, v.visitor_id, e.name, v.hostname, '/', e.props,
    v.started_at + interval '20 seconds'
  FROM v, LATERAL (
    SELECT * FROM (VALUES
      ('cta_click', '{"location":"hero"}'::jsonb), ('signup', '{"plan":"pro"}'::jsonb),
      ('outbound_click', '{"href":"https://github.com/"}'::jsonb), ('click', '{"text":"Pricing"}'::jsonb)
    ) x(name, props) ORDER BY random() + 0 * extract(epoch FROM v.started_at) LIMIT 1
  ) e
  WHERE random() < 0.45 AND NOT v.is_bot
  RETURNING 1
),
buy AS (
  INSERT INTO events (site_id, visit_id, visitor_id, name, page, amount_cents, currency, dedupe_key, created_at)
  SELECT v.site_id, v.id, v.visitor_id, 'purchase', '/thanks', 4900, 'USD',
    'purchase:demo_' || v.id, v.started_at + interval '5 minutes'
  FROM v WHERE random() < 0.012 AND NOT v.is_bot
  RETURNING visit_id, visitor_id, created_at
),
refund AS (
  INSERT INTO events (site_id, visit_id, visitor_id, name, page, amount_cents, currency, dedupe_key, created_at)
  SELECT (SELECT site_id FROM params), visit_id, visitor_id, 'refund', '/', -4900, 'USD',
    'refund:demo_' || visit_id, created_at + interval '2 days'
  FROM buy WHERE random() < 0.15
  RETURNING 1
)
INSERT INTO crawls (site_id, at, crawler, company, category, hostname, path, status, ip_verified)
SELECT p.site_id, now() - (random() * 30 || ' days')::interval, c.crawler, c.company, c.category,
  'launch-now.dev',
  (ARRAY['/', '/pricing', '/docs', '/robots.txt', '/llms.txt', '/sitemap.xml', '/blog/launch'])[1 + (random() * 6)::int],
  CASE WHEN random() < 0.05 THEN 404 ELSE 200 END, random() < 0.85
FROM params p, generate_series(1, 900) g, LATERAL (
  SELECT * FROM (VALUES
    ('chatgpt-user', 'OpenAI', 'answers'), ('chatgpt-user', 'OpenAI', 'answers'),
    ('gptbot', 'OpenAI', 'training'), ('claudebot', 'Anthropic', 'training'),
    ('googlebot', 'Google', 'indexing'), ('googlebot', 'Google', 'indexing'),
    ('perplexitybot', 'Perplexity', 'indexing'), ('claude-user', 'Anthropic', 'answers'),
    ('bingbot', 'Microsoft', 'indexing')
  ) x(crawler, company, category) ORDER BY random() + 0 * g LIMIT 1
) c
