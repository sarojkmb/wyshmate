#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
UI_DIR="$ROOT_DIR/ui"

cleanup() {
  if [[ -n "${API_PID:-}" ]] && kill -0 "$API_PID" 2>/dev/null; then
    kill "$API_PID" 2>/dev/null || true
  fi

  if [[ -n "${UI_PID:-}" ]] && kill -0 "$UI_PID" 2>/dev/null; then
    kill "$UI_PID" 2>/dev/null || true
  fi
}

trap cleanup EXIT INT TERM

echo "Building API..."
(
  cd "$BACKEND_DIR"
  if [[ ! -d ".venv" ]]; then
    python3 -m venv .venv
  fi
  source .venv/bin/activate
  pip install -r requirements.txt
)

echo "Starting API on http://localhost:8080 ..."
(
  cd "$BACKEND_DIR"
  source .venv/bin/activate
  uvicorn app.main:app --host 0.0.0.0 --port 8080
) &
API_PID=$!

echo "Waiting 5 seconds for API startup..."
sleep 5

echo "Building UI..."
(
  cd "$UI_DIR"
  npm run build
)

echo "Starting UI on http://localhost:3000 ..."
(
  cd "$UI_DIR"
  npm run start
) &
UI_PID=$!

echo "Wyshmate is starting up."
echo "API PID: $API_PID"
echo "UI PID: $UI_PID"
echo "Press Ctrl+C to stop both services."

wait "$API_PID" "$UI_PID"
