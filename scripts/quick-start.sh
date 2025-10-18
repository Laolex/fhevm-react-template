#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "1/6 — Installing dependencies (pnpm install)"
pnpm install

echo "2/6 — Building SDK (pnpm sdk:build)"
pnpm sdk:build

echo "3/6 — Starting local Hardhat chain in background"
# Start a chain in the background and capture PID so we can stop it later
pnpm chain &
CHAIN_PID=$!
echo "Hardhat chain started with PID: $CHAIN_PID"

# wait for a few seconds to let the chain start
sleep 4

echo "4/6 — Deploying contracts to localhost"
pnpm deploy:localhost

echo "5/6 — Start Next.js demo (in a new terminal or background)"
echo "To run frontend now: pnpm start"

echo "6/6 — Quick smoke test (optional): run 'pnpm smoke' in a separate terminal to perform an e2e smoke test."

echo "Quick start complete. To stop the local chain run: kill $CHAIN_PID"
