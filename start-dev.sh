#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "Starting Classic Gadgets API on http://localhost:5000 ..."
(cd "$ROOT/server" && npm run dev) &
SERVER_PID=$!

echo "Starting Classic Gadgets client on http://localhost:3000 ..."
(cd "$ROOT/client" && npm run dev) &
CLIENT_PID=$!

cleanup() {
  echo "Stopping dev servers..."
  kill "$SERVER_PID" "$CLIENT_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "Both servers starting. Press Ctrl+C to stop."
wait
