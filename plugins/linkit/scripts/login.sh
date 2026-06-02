#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$PLUGIN_ROOT/.env.local"

LINKIT_API_BASE_URL="${LINKIT_API_BASE_URL:-https://linkit.smartgeo.tokyo}"

if [[ -f "$ENV_FILE" ]]; then
  # shellcheck disable=SC1090
  source "$ENV_FILE"
fi

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

if [[ "$status_code" != "200" ]]; then
  error_text="$(printf "%s" "$response_body" | node -e 'let s="";process.stdin.on("data",d=>s+=d);process.stdin.on("end",()=>{try{const j=JSON.parse(s);console.log(j.error||j.message||s);}catch{console.log(s);}});')"
  echo "Activation failed (${status_code}): ${error_text}" >&2
  exit 1
fi

API_KEY="$(printf "%s" "$response_body" | node -e 'let s="";process.stdin.on("data",d=>s+=d);process.stdin.on("end",()=>{const j=JSON.parse(s);if(!j.apiKey){process.exit(2)};process.stdout.write(String(j.apiKey));});')"
PUBLISHER_ID="$(printf "%s" "$response_body" | node -e 'let s="";process.stdin.on("data",d=>s+=d);process.stdin.on("end",()=>{const j=JSON.parse(s);process.stdout.write(String(j.publisherId||"unknown"));});')"
API_BASE_URL="$(printf "%s" "$response_body" | node -e 'let s="";process.stdin.on("data",d=>s+=d);process.stdin.on("end",()=>{const j=JSON.parse(s);process.stdout.write(String(j.apiBaseUrl||""));});')"

if ! command -v security >/dev/null 2>&1; then
  echo "Activation succeeded for ${PUBLISHER_ID}, but macOS Keychain CLI is unavailable." >&2
  echo "Set this in your shell before using Linkit:" >&2
  echo "export LINKIT_API_KEY='${API_KEY}'" >&2
  exit 0
fi

security add-generic-password -a "$USER" -s linkit-api-key -w "$API_KEY" -U >/dev/null
echo "Linkit activation succeeded for ${PUBLISHER_ID}."
echo "Stored API key in macOS Keychain service: linkit-api-key"
if [[ -n "$API_BASE_URL" ]]; then
  echo "API base URL: ${API_BASE_URL}"
fi
