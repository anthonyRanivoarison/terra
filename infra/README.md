# Self-hosting Terra for free

Everything runs on one Oracle Cloud Always Free ARM VM with Docker Compose. Cloudflare Tunnel exposes it without opening any port, Cloudflare R2 stores nightly backups, and GitHub Actions builds the images into GHCR and deploys them.

| Piece        | Free tier used                               |
| ------------ | -------------------------------------------- |
| Compute      | Oracle Ampere A1: up to 4 OCPU, 24 GB RAM    |
| Ingress, CDN | Cloudflare Tunnel, DNS and cache             |
| Backups      | Cloudflare R2: 10 GB storage, no egress fees |
| CI, images   | GitHub Actions and GitHub Container Registry |

Services in `docker-compose.prod.yml`:

- `postgres`: Postgres 17 with a named volume and a healthcheck. No published port.
- `migrate`: runs the Terra and Better Auth migrations once, before `web` and `ingest` start.
- `ingest`: tracking script and event API on :4000.
- `web`: dashboard on :3000.
- `cron`: `pg_dump | gzip` to R2 every night (`backup.sh`), deletes dumps older than `BACKUP_KEEP_DAYS`.
- `cloudflared`: the only way in. It dials out to Cloudflare and forwards to `web` and `ingest`.

## 1. Create the VM

1. Sign up at [cloud.oracle.com](https://cloud.oracle.com) and choose a home region with A1 capacity (you cannot change it later).
2. Compute > Instances > Create instance:
   - Image: Canonical Ubuntu 24.04 (aarch64).
   - Shape: `VM.Standard.A1.Flex`, 4 OCPU, 24 GB (2 OCPU, 12 GB is plenty to start).
   - Boot volume: up to 200 GB is free.
   - Add your SSH public key.
3. If creation fails with "out of capacity", retry later or pick another availability domain.
4. Leave the VCN security list as is. Only SSH (22) is needed, and you can restrict it to your IP.

## 2. Install Docker

```bash
ssh ubuntu@<vm-ip>
sudo apt-get update && sudo apt-get upgrade -y
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
exit
```

Log back in, then check with `docker run --rm hello-world`. Create the deploy folder:

```bash
mkdir -p ~/terra/infra/data
```

## 3. Cloudflare Tunnel and DNS

Your domain must use Cloudflare DNS.

1. Zero Trust > Networks > Tunnels > Create a tunnel > Cloudflared. Name it `terra` and copy the token (`CLOUDFLARE_TUNNEL_TOKEN`). Skip the connector install: the compose stack runs it.
2. Public hostnames for the tunnel:

   | Hostname              | Service              |
   | --------------------- | -------------------- |
   | `app.<domain>`        | `http://web:3000`    |
   | `ingest.<domain>`     | `http://ingest:4000` |
   | `cdn.<domain>` (opt.) | `http://ingest:4000` |

   Cloudflare creates the proxied DNS records itself.

3. Caching > Cache Rules > Create rule "Tracker script":
   - When: hostname is `ingest.<domain>` (or `cdn.<domain>`) and URI path equals `/js/script.js`.
   - Then: eligible for cache, edge TTL 1 hour, respect origin `stale-while-revalidate`.
4. Leave `/api/*` on the ingest host uncached (the default for POST).

## 4. R2 backups

1. R2 > Create bucket `terra-backups` (`R2_BUCKET`). Note the account id (`R2_ACCOUNT_ID`).
2. R2 > Manage API tokens > Create token with "Object Read & Write" on that bucket only. Copy the access key id and secret (`R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`).

## 5. Environment

Create `~/terra/infra/.env` on the VM. Compose reads it for variable substitution.

```bash
GHCR_OWNER=<github-user-or-org, lowercase>
TERRA_TAG=latest
POSTGRES_USER=terra
POSTGRES_PASSWORD=<openssl rand -hex 24>
POSTGRES_DB=terra
BETTER_AUTH_SECRET=<openssl rand -base64 32>
BETTER_AUTH_URL=https://app.<domain>
ENCRYPTION_KEY=<openssl rand -base64 32>
CLOUDFLARE_TUNNEL_TOKEN=<from step 3>
R2_ACCOUNT_ID=<from step 4>
R2_ACCESS_KEY_ID=<from step 4>
R2_SECRET_ACCESS_KEY=<from step 4>
R2_BUCKET=terra-backups
BACKUP_KEEP_DAYS=14
BACKUP_HOUR_UTC=3
```

Set `DISABLE_SIGNUP=true` once your own account exists to close sign ups on a private instance, then `docker compose -f docker-compose.prod.yml up -d web`. `SUPPORT_EMAIL` is optional; without it, "Contact support" links to GitHub issues.

Optional: `ASN_DB_PATH=/data/dbip-asn.mmdb` after placing a db-ip ASN `.mmdb` in `~/terra/infra/data`.

Use a hex password for Postgres: it goes into a connection URL unescaped. Keep `chmod 600 .env`.

`NEXT_PUBLIC_INGEST_URL` is not read on the VM. It is inlined into the web image at build time from the GitHub variable below.

## 6. GitHub Actions

`ci.yml` runs on every push and pull request: install, lint, typecheck, test, format check, build.

`deploy.yml` runs on pushes to `main` (or by hand). It builds `terra-web`, `terra-migrate` and `terra-ingest` for `linux/arm64`, pushes them to GHCR tagged `latest` and with the commit sha, copies the compose files to the VM, then runs `docker compose pull && up -d` with `TERRA_TAG=<sha>`.

Repository settings > Secrets and variables > Actions:

| Name                     | Kind     | Value                                                                                                         |
| ------------------------ | -------- | ------------------------------------------------------------------------------------------------------------- |
| `DEPLOY_HOST`            | secret   | VM public IP                                                                                                  |
| `DEPLOY_USER`            | secret   | `ubuntu`                                                                                                      |
| `DEPLOY_SSH_KEY`         | secret   | Private key of a key pair whose public key is in `~/.ssh/authorized_keys`                                     |
| `GHCR_TOKEN`             | secret   | Classic PAT with `read:packages`, used by the VM to pull images                                               |
| `NEXT_PUBLIC_INGEST_URL` | variable | `https://ingest.<domain>` (or `https://cdn.<domain>`)                                                         |
| `ARM_RUNNER`             | variable | Optional. `ubuntu-24.04-arm` for native ARM builds on public repos; otherwise QEMU on `ubuntu-latest` is used |

`GITHUB_TOKEN` pushes the images, so no secret is needed for that.

## 7. First deploy

Push to `main` or run the Deploy workflow by hand. Then on the VM:

```bash
cd ~/terra/infra
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f migrate web ingest
```

Open `https://app.<domain>`, sign up, add a site and paste the snippet. `https://ingest.<domain>/health` should answer.

To deploy by hand, or roll back to an earlier commit:

```bash
TERRA_TAG=<sha> docker compose -f docker-compose.prod.yml up -d
```

## Live demo

A public, read-only dashboard at `https://app.<domain>/demo`, filled with a year of sample traffic. It lives in its own workspace with no members, so nobody can sign in to it.

```bash
cd ~/terra/infra
docker compose -f docker-compose.prod.yml run --rm demo
```

Copy the `DEMO_SITE_ID=ws_…` line it prints into `.env`, then `docker compose -f docker-compose.prod.yml up -d web`. Running it again keeps the same id and replaces the sample data, so the demo stays current. Refresh it nightly from the VM's crontab (`crontab -e`):

```bash
30 4 * * * cd ~/terra/infra && docker compose -f docker-compose.prod.yml run --rm demo >/dev/null 2>&1
```

Leave `DEMO_SITE_ID` empty to turn the demo off.

## Backups and restore

Run a backup now:

```bash
docker compose -f docker-compose.prod.yml exec cron bash /infra/backup.sh
```

List backups and restore one (this replaces the current data):

```bash
docker compose -f docker-compose.prod.yml exec cron bash -c '
  export RCLONE_CONFIG_R2_TYPE=s3 RCLONE_CONFIG_R2_PROVIDER=Cloudflare \
    RCLONE_CONFIG_R2_ACCESS_KEY_ID=$R2_ACCESS_KEY_ID \
    RCLONE_CONFIG_R2_SECRET_ACCESS_KEY=$R2_SECRET_ACCESS_KEY \
    RCLONE_CONFIG_R2_ENDPOINT=https://$R2_ACCOUNT_ID.r2.cloudflarestorage.com
  rclone lsl r2:$R2_BUCKET'

docker compose -f docker-compose.prod.yml stop web ingest
docker compose -f docker-compose.prod.yml exec postgres \
  psql -U terra -d postgres -c "DROP DATABASE terra WITH (FORCE)" -c "CREATE DATABASE terra"
docker compose -f docker-compose.prod.yml exec cron bash -c '
  export RCLONE_CONFIG_R2_TYPE=s3 RCLONE_CONFIG_R2_PROVIDER=Cloudflare \
    RCLONE_CONFIG_R2_ACCESS_KEY_ID=$R2_ACCESS_KEY_ID \
    RCLONE_CONFIG_R2_SECRET_ACCESS_KEY=$R2_SECRET_ACCESS_KEY \
    RCLONE_CONFIG_R2_ENDPOINT=https://$R2_ACCOUNT_ID.r2.cloudflarestorage.com
  rclone cat r2:$R2_BUCKET/<file>.sql.gz | gunzip | psql -v ON_ERROR_STOP=1'
docker compose -f docker-compose.prod.yml start web ingest
```

## Local Postgres

`docker-compose.yml` in this folder is only for development: `docker compose -f infra/docker-compose.yml up -d` starts Postgres on port 5433.
