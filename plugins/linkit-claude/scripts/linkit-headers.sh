#!/usr/bin/env bash
set -euo pipefail

HOME_ENV_FILE="${HOME}/.linkit/linkit.env"
PLUGIN_ENV_FILE="${CLAUDE_PLUGIN_DATA:-}/.env.local"

if [[ -f "$HOME_ENV_FILE" ]]; then
  # shellcheck disable=SC1090
  source "$HOME_ENV_FILE"
fi

if [[ -z "${LINKIT_API_KEY:-}" && -n "${PLUGIN_ENV_FILE:-}" && -f "$PLUGIN_ENV_FILE" ]]; then
  # shellcheck disable=SC1090
  source "$PLUGIN_ENV_FILE"
fi

if [[ -z "${LINKIT_API_KEY:-}" && "$(uname -s 2>/dev/null || true)" == "Darwin" ]] && command -v security >/dev/null 2>&1; then
  LINKIT_API_KEY="$(security find-generic-password -s linkit-api-key -w 2>/dev/null || true)"
fi

if [[ -z "${LINKIT_API_KEY:-}" ]]; then
  echo "Linkit is not activated. Request an activation code from https://linkit.smartgeo.tokyo, then run:" >&2
  echo "curl -fsSL https://raw.githubusercontent.com/smartgalilei/Linkit/main/plugins/linkit-claude/scripts/login.sh | bash -s -- <activation-code>" >&2
  exit 1
fi

json_escape() {
  if command -v python3 >/dev/null 2>&1; then
    python3 -c 'import json,sys; print(json.dumps(sys.argv[1]))' "$1"
  else
    printf '"%s"' "$(printf "%s" "$1" | sed 's/\\/\\\\/g; s/"/\\"/g')"
  fi
}

printf '{"Authorization":"Bearer %s","X-Linkit-Source":"claude"}\n' "$(json_escape "$LINKIT_API_KEY" | sed 's/^"//; s/"$//')"
