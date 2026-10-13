#!/bin/bash
set -euo pipefail

if ! command -v rclone >/dev/null 2>&1; then
  apt-get update -qq && apt-get install -y -qq --no-install-recommends rclone ca-certificates >/dev/null
fi

hour="${BACKUP_HOUR_UTC:-3}"
echo "[cron] nightly backup at ${hour}:00 UTC, keeping ${BACKUP_KEEP_DAYS:-14} days"

while true; do
  now=$(date -u +%s)
  next=$(date -u -d "today ${hour}:00" +%s)
  [ "$next" -le "$now" ] && next=$(date -u -d "tomorrow ${hour}:00" +%s)
  sleep $((next - now))
  bash /infra/backup.sh || echo "[cron] backup failed"
done
