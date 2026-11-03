# Import your history

Moving to Terra does not mean starting from zero. Upload the daily totals you collected with another tool, and they show up in the overview, the chart and the pages, sources, location and device reports.

Open a site, then **Site → Import** in the sidebar (`/sites/<id>/settings/import`).

## What gets imported

Other tools only export daily totals, not individual visits. So imported days:

- appear in the overview numbers, the main chart, and the pages, entry and exit pages, referrers, channels, UTM, countries, regions, devices, browsers and operating systems reports, in the dashboard and in the public API;
- do **not** appear in sessions, realtime, funnels, revenue attribution or Web Vitals;
- are hidden as soon as a filter is applied, because daily totals cannot be crossed with each other;
- are only counted **before the first visit Terra recorded**. Install Terra, import, and the overlapping days are ignored, so nothing is counted twice.

Visitors are summed day by day, like Plausible does, so a person who came on two days counts twice over a long period.

Each upload is listed on the import page and can be deleted. Deleting removes its rows only.

## The format

Terra reads the CSV format of Plausible's full export. One file per report, a header row, one row per day and per value. File names must start with the report name; the date range suffix is optional:

```
visitors.csv
imported_pages_20240101_20241231.csv
```

Only `visitors.csv` is needed for the totals and the chart. Add the others for the reports.

| File                    | Columns                                                                                                                                     |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `visitors.csv`          | `date, visitors, pageviews, bounces, visits, visit_duration`                                                                                |
| `pages.csv`             | `date, hostname, page, visits, visitors, pageviews`                                                                                         |
| `entry_pages.csv`       | `date, entry_page, visitors, entrances, visit_duration, bounces, pageviews`                                                                 |
| `exit_pages.csv`        | `date, exit_page, visitors, visit_duration, exits, bounces, pageviews`                                                                      |
| `sources.csv`           | `date, source, referrer, utm_source, utm_medium, utm_campaign, utm_content, utm_term, pageviews, visitors, visits, visit_duration, bounces` |
| `locations.csv`         | `date, country, region, city, visitors, visits, visit_duration, bounces, pageviews`                                                         |
| `devices.csv`           | `date, device, visitors, visits, visit_duration, bounces, pageviews`                                                                        |
| `browsers.csv`          | `date, browser, browser_version, visitors, visits, visit_duration, bounces, pageviews`                                                      |
| `operating_systems.csv` | `date, operating_system, operating_system_version, visitors, visits, visit_duration, bounces, pageviews`                                    |

Rules:

- `date` is `YYYY-MM-DD` or `YYYYMMDD`, in the site's timezone.
- Column order does not matter, names do. Missing number columns count as 0: leave out what your tool does not have.
- `visit_duration` is the **total** seconds of all visits that day, not an average.
- `country` is a two-letter ISO code (`FR`). `region` is an ISO 3166-2 code (`FR-IDF`). `city` is ignored.
- `device` is `Desktop`, `Mobile` or `Tablet` (any case).
- In `sources.csv`, Terra takes the host of `referrer` (or `source` when there is no referrer) and works out the channel from it and the UTM tags, exactly as it does for live visits. `Direct / None` and empty values count as Direct.
- Up to 50 MB per upload. Split bigger exports by year.

## Plausible

1. Site settings → **Imports & Exports** → **Export to CSV**. Plausible emails a zip when it is ready.
2. Unzip it, choose **Plausible** on the Terra import page and select every CSV file.

Use the full export, not "Export stats" on the dashboard: that one holds the top entries of the whole period, not one row per day.

## Umami

Umami's CSV export (Umami Cloud: profile → Data → Export) contains raw events, not daily totals, so it needs one step of SQL. On a self-hosted Umami (PostgreSQL), run these queries with `psql --csv` and upload the files. Replace the website id and check the column names against your Umami version.

```sql
-- visitors.csv
\copy (SELECT created_at::date AS date, COUNT(DISTINCT session_id) AS visitors, COUNT(*) FILTER (WHERE event_type = 1) AS pageviews, COUNT(DISTINCT visit_id) AS visits FROM website_event WHERE website_id = '<website-id>' GROUP BY 1 ORDER BY 1) TO 'visitors.csv' CSV HEADER

-- pages.csv
\copy (SELECT created_at::date AS date, url_path AS page, COUNT(DISTINCT session_id) AS visitors, COUNT(*) AS pageviews FROM website_event WHERE website_id = '<website-id>' AND event_type = 1 GROUP BY 1, 2 ORDER BY 1) TO 'pages.csv' CSV HEADER

-- sources.csv
\copy (SELECT created_at::date AS date, referrer_domain AS referrer, COUNT(DISTINCT session_id) AS visitors, COUNT(DISTINCT visit_id) AS visits, COUNT(*) AS pageviews FROM website_event WHERE website_id = '<website-id>' AND event_type = 1 GROUP BY 1, 2 ORDER BY 1) TO 'sources.csv' CSV HEADER
```

Countries, devices and browsers live in Umami's `session` table: join it on `session_id` and group by `country`, `device` or `browser` in the same way. On Umami Cloud, load the exported CSV files into any database or spreadsheet and build the same daily totals.

## Google Analytics 4

GA4 does not export one file per report, so build them in **Explore**:

1. Explore → **Free form**. Set the date range to everything you want to keep.
2. Rows: **Date**. Values: **Total users**, **Views**, **Sessions**, **Engaged sessions**, **Average session duration**. Show up to 1,000+ rows so every day is there.
3. Export → **CSV**, then make `visitors.csv` with these columns:

| Terra            | From GA4                                      |
| ---------------- | --------------------------------------------- |
| `date`           | Date (`YYYYMMDD` works as is)                 |
| `visitors`       | Total users                                   |
| `pageviews`      | Views                                         |
| `visits`         | Sessions                                      |
| `bounces`        | Sessions − Engaged sessions                   |
| `visit_duration` | Average session duration (seconds) × Sessions |

For the reports, repeat with a second row dimension: **Page path** (`pages.csv`: `date, page, visitors, pageviews`), **Session source** (`sources.csv`: `date, source, visitors, visits`), **Country ID** (`locations.csv`: `date, country, visitors`), **Device category** (`devices.csv`: `date, device, visitors`). GA4 Explore samples very large properties; for exact numbers use the GA4 Data API or the BigQuery export with the same dimensions.

## Vercel Web Analytics

Vercel only keeps data for your plan's reporting window, so export before you cancel. Use the [Web Analytics API](https://vercel.com/docs/analytics/web-analytics-api) with an access token, your project id and, for team projects, the team id:

```bash
q() {
  curl -s --get "https://api.vercel.com/v1/query/web-analytics/visits/aggregate" \
    -H "Authorization: Bearer $VERCEL_TOKEN" \
    --data-urlencode "projectId=$PROJECT_ID" --data-urlencode "teamId=$TEAM_ID" \
    --data-urlencode "since=$SINCE" --data-urlencode "until=$UNTIL" \
    --data-urlencode "limit=10000" "$@"
}

(echo "date,visitors,pageviews"
 q --data-urlencode "by=day" \
   | jq -r '.data[] | [.timestamp[0:10], .visitors, .pageviews] | @csv') > visitors.csv

(echo "date,page,visitors,pageviews"
 q --data-urlencode "by=day,requestPath" \
   | jq -r '.data[] | [.timestamp[0:10], .requestPath, .visitors, .pageviews] | @csv') > pages.csv

(echo "date,referrer,visitors,pageviews"
 q --data-urlencode "by=day,referrerHostname" \
   | jq -r '.data[] | [.timestamp[0:10], .referrerHostname, .visitors, .pageviews] | @csv') > sources.csv
```

Do the same with `country` (`locations.csv`), `deviceType` (`devices.csv`), `browserName` (`browsers.csv`, column `browser`) and `osName` (`operating_systems.csv`, column `operating_system`). Vercel has no visits, bounces or durations, so those stay at 0 and bounce rate and visit duration only use the days Terra collected. The dashboard's "Export as CSV" holds the top values of a panel, not daily rows, so prefer the API.

## Netlify Analytics

Netlify has no export for its analytics outside Enterprise plans (where Log Drains can send raw requests elsewhere). If you have server or CDN logs, count unique IPs and page requests per day and write `visitors.csv` and `pages.csv` by hand; otherwise start fresh with Terra.

## Any other tool

If your tool can give you one row per day, it can be imported: rename the columns to the ones above and upload. Fathom, Simple Analytics, Matomo, Cloudflare Web Analytics and server logs all work this way. When in doubt, start with `visitors.csv` alone and check the chart.
