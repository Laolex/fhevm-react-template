#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

# Build everything
echo "Building SDK and packages..."
pnpm install
pnpm sdk:build

# Start chain in background
echo "Starting local Hardhat chain..."
pnpm chain &
CHAIN_PID=$!
echo "Hardhat PID: $CHAIN_PID"

# Give the chain time to boot
sleep 4

# Deploy contracts
echo "Deploying contracts to localhost..."
pnpm deploy:localhost

# Run the smoke test via ts-node inside packages/node-example
echo "Running smoke test..."
# Ensure ts-node available; prefer local ts-node binary
pnpm --filter ./packages/node-example exec -- ts-node ./src/e2e-smoke.ts

# Tear down chain
echo "Tearing down Hardhat chain (PID: $CHAIN_PID)"
kill $CHAIN_PID || true

echo "Smoke run complete."
