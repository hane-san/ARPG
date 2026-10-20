#!/bin/bash
# Cloud (Claude Code on the web) sessions only: prepare the browser-test toolchain so
# overnight PR checks can run. Local machines keep their own setup. Never blocks startup.
set -uo pipefail
[ "${CLAUDE_CODE_REMOTE:-}" = "true" ] || exit 0
cd "$CLAUDE_PROJECT_DIR" || exit 0
exe=$(ls -d /opt/pw-browsers/chromium-*/chrome-linux/chrome 2>/dev/null | sort -V | tail -1 || true)
if [ ! -x /tmp/nagi-qa/bin/python ] || ! /tmp/nagi-qa/bin/python -c "import playwright" 2>/dev/null; then
  { python3 -m venv /tmp/nagi-qa && /tmp/nagi-qa/bin/python -m pip install -q playwright==1.57.0; } >/dev/null 2>&1 || echo "session-start: playwright venv failed; python browser checks unavailable"
fi
if [ -n "$exe" ] && [ -n "${CLAUDE_ENV_FILE:-}" ]; then echo "export CHROMIUM_PATH=$exe" >> "$CLAUDE_ENV_FILE"; fi
