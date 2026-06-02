#!/usr/bin/env bash
set -euo pipefail

LINKIT_API_BASE_URL="${LINKIT_API_BASE_URL:-https://linkit.smartgeo.tokyo}"
HOME_LINKIT_DIR="${HOME}/.linkit"
HOME_ENV_FILE="${HOME_LINKIT_DIR}/linkit.env"

if [[ $# -gt 0 ]]; then
  ACTIVATION_CODE="$1"
else
  printf "Enter Linkit activation code: "
  read -r ACTIVATION_CODE
fi

if [[ -z "${ACTIVATION_CODE:-}" ]]; then
  echo "Activation code is required." >&2
  exit 1
fi

request_body="$(printf '{"activationCode":"%s"}' "$ACTIVATION_CODE")"
response_with_status="$(
  curl -sS -X POST "$LINKIT_API_BASE_URL/api/auth/activate" \
    -H "content-type: application/json" \
    --data "$request_body" \
    -w $'\n%{http_code}'
)"
status_code="$(printf "%s" "$response_with_status" | tail -n 1)"
response_body="$(printf "%s" "$response_with_status" | sed '$d')"

parse_json_field() {
  local field="$1"
  if command -v python3 >/dev/null 2>&1; then
    python3 -c 'import json,sys; data=json.load(sys.stdin); value=data.get(sys.argv[1], ""); print(value, end="")' "$field"
  else
    node -e 'let s="";process.stdin.on("data",d=>s+=d);process.stdin.on("end",()=>{const j=JSON.parse(s);process.stdout.write(String(j[process.argv[1]]||""));});' "$field"
  fi
}

if [[ "$status_code" != "200" ]]; then
  error_text="$(printf "%s" "$response_body" | parse_json_field error || true)"
  if [[ -z "$error_text" ]]; then
    error_text="$response_body"
  fi
  echo "Activation failed (${status_code}): ${error_text}" >&2
  exit 1
fi

API_KEY="$(printf "%s" "$response_body" | parse_json_field apiKey)"
PUBLISHER_ID="$(printf "%s" "$response_body" | parse_json_field publisherId)"
API_BASE_URL="$(printf "%s" "$response_body" | parse_json_field apiBaseUrl)"

if [[ -z "$API_KEY" ]]; then
  echo "Activation failed: response did not include an API key." >&2
  exit 1
fi

shell_quote() {
  printf "'"
  printf "%s" "$1" | sed "s/'/'\\\\''/g"
  printf "'"
}

mkdir -p "$HOME_LINKIT_DIR"
umask 077
{
  echo "# Created by Linkit activation."
  printf "export LINKIT_API_BASE_URL=%s\n" "$(shell_quote "${API_BASE_URL:-$LINKIT_API_BASE_URL}")"
  printf "export LINKIT_API_KEY=%s\n" "$(shell_quote "$API_KEY")"
} > "$HOME_ENV_FILE"
chmod 600 "$HOME_ENV_FILE" 2>/dev/null || true

if [[ "$(uname -s 2>/dev/null || true)" == "Darwin" ]] && command -v security >/dev/null 2>&1; then
  security add-generic-password -a "$USER" -s linkit-api-key -w "$API_KEY" -U >/dev/null 2>&1 || true
fi

echo "Linkit activation succeeded for ${PUBLISHER_ID:-unknown}."
echo "Stored Linkit credentials in ${HOME_ENV_FILE}."
