#!/bin/bash
# PreToolUse hook (Bash): blocks dangerous git commands for this project.
# Installed via the git-guardrails-claude-code skill; jq is optional (falls back to
# system python3, then to matching the raw hook JSON) so the guard never fails open.

INPUT=$(cat)

COMMAND=""
if command -v jq >/dev/null 2>&1; then
  COMMAND=$(printf '%s' "$INPUT" | jq -r '.tool_input.command // empty' 2>/dev/null)
elif [ -x /usr/bin/python3 ]; then
  COMMAND=$(printf '%s' "$INPUT" | /usr/bin/python3 -c 'import sys, json; print(json.load(sys.stdin).get("tool_input", {}).get("command", ""))' 2>/dev/null)
fi
# Parsing failed or no parser available: check the raw JSON instead of letting it through.
[ -z "$COMMAND" ] && COMMAND="$INPUT"

DANGEROUS_PATTERNS=(
  "git push"
  "git reset --hard"
  "git clean -fd"
  "git clean -f"
  "git branch -D"
  "git checkout \."
  "git restore \."
  "push --force"
  "reset --hard"
)

for pattern in "${DANGEROUS_PATTERNS[@]}"; do
  if printf '%s' "$COMMAND" | grep -qE "$pattern"; then
    echo "BLOCKED: '$COMMAND' matches dangerous pattern '$pattern'. The user has prevented you from doing this." >&2
    exit 2
  fi
done

exit 0
