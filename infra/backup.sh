#!/bin/bash
set -euo pipefail

export RCLONE_CONFIG_R2_TYPE=s3
export RCLONE_CONFIG_R2_PROVIDER=Cloudflare
export RCLONE_CONFIG_R2_ACCESS_KEY_ID="$R2_ACCESS_KEY_ID"
export RCLONE_CONFIG_R2_SECRET_ACCESS_KEY="$R2_SECRET_ACCESS_KEY"
export RCLONE_CONFIG_R2_ENDPOINT="https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com"
export RCLONE_CONFIG_R2_NO_CHECK_BUCKET=true

name="terra-$(date -u +%Y%m%d-%H%M%S).sql.gz"
echo "[backup] dumping ${PGDATABASE} to r2:${R2_BUCKET}/${name}"
pg_dump --no-owner --no-privileges | gzip -9 | rclone rcat "r2:${R2_BUCKET}/${name}"
rclone delete --min-age "${BACKUP_KEEP_DAYS:-14}d" "r2:${R2_BUCKET}"
echo "[backup] done"
