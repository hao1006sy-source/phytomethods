#!/usr/bin/env bash
set -euo pipefail
# Run from any directory. CAFE5_BIN points at the compiled, locked v5.1 executable.
here=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
: "${CAFE5_BIN:?Set CAFE5_BIN to the locked cafe5 executable}"
command -v python3 >/dev/null
[[ -x "$CAFE5_BIN" ]] || { echo 'CAFE5_BIN must be executable' >&2; exit 1; }
[[ $# -ge 1 ]] || { echo 'Usage: run-example.sh NEW_OUTPUT_DIR [INPUT_DIR]' >&2; exit 1; }
python3 "$here/run-example.py" --executable "$CAFE5_BIN" --output "$1" --inputs "${2:-$here/inputs}"
