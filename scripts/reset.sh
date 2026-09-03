#!/usr/bin/env bash
# Wipes uploaded files and re-seeds the database from the fixed demo dataset.
# Safe to run at any time while the stack is up — intended to be run on a
# schedule (see docs/DEPLOYMENT.md) on a shared, externally-tested instance.
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

echo "[reset] wiping uploaded files..."
docker compose exec -T api sh -c 'rm -rf /app/uploads/* 2>/dev/null; mkdir -p /app/uploads'

echo "[reset] syncing database schema..."
docker compose exec -T api npx prisma db push --accept-data-loss --skip-generate

echo "[reset] re-seeding demo dataset..."
docker compose exec -T api npm run seed

echo "[reset] done."
