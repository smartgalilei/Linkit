#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck disable=SC1091
source "$SCRIPT_DIR/load-linkit-env.sh"

exec node "$LINKIT_PLUGIN_ROOT/dist/publish-file.mjs" "$@"
