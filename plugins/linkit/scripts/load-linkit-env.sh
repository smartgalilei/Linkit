#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$PLUGIN_ROOT/.env.local"

export LINKIT_PLUGIN_ROOT="$PLUGIN_ROOT"
export LINKIT_API_BASE_URL="${LINKIT_API_BASE_URL:-https://linkit.smartgeo.tokyo}"

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

if [[ -z "${LINKIT_API_KEY:-}" ]] && command -v security >/dev/null 2>&1; then
  LINKIT_API_KEY="$(security find-generic-password -s linkit-api-key -w 2>/dev/null || true)"
  export LINKIT_API_KEY
fi

if [[ -z "${LINKIT_API_KEY:-}" ]]; then
  echo "LINKIT_API_KEY must be set in the environment, the Linkit plugin .env.local file, or macOS Keychain item 'linkit-api-key'." >&2
  exit 1
fi
