#!/bin/sh
# ARN-3: executa os quality gates existentes e resume resultados reais.
# Não redefine thresholds nem altera baselines.
set -u

FAILED=0
PASSED=0
TOTAL=0
LINES=''

record() {
  name="$1"
  status="$2"
  duration="$3"
  rc="$4"
  LINES="${LINES}${name}|${status}|${duration}|${rc}
"
  TOTAL=$((TOTAL + 1))
  if [ "$status" = PASS ]; then PASSED=$((PASSED + 1)); else FAILED=$((FAILED + 1)); fi
}

run_gate() {
  name="$1"
  shift
  echo "===== ARN-3: ${name} ====="
  started="$(date +%s)"
  rc=0
  "$@" || rc=$?
  elapsed=$(( $(date +%s) - started ))
  if [ "$rc" -eq 0 ]; then
    echo "${name}=PASS DURATION_SECONDS=${elapsed}"
    record "$name" PASS "$elapsed" "$rc"
  else
    echo "${name}=FAIL DURATION_SECONDS=${elapsed} EXIT_CODE=${rc}" >&2
    record "$name" FAIL "$elapsed" "$rc"
  fi
  return "$rc"
}

print_summary() {
  echo
  echo '===== ARN-3 QUALITY CODE — SUMMARY ====='
  printf 'GATE | RESULT | SECONDS | EXIT\n'
  printf '%s' "$LINES" | while IFS='|' read -r name status elapsed code; do
    [ -n "$name" ] || continue
    printf '%s | %s | %s | %s\n' "$name" "$status" "$elapsed" "$code"
  done
  printf 'TOTAL=%s PASS=%s FAIL=%s\n' "$TOTAL" "$PASSED" "$FAILED"
  if [ "$FAILED" -eq 0 ] && [ "$TOTAL" -eq 5 ]; then
    echo 'ARN3_QUALITY_CODE_GATE=PASS'
    return 0
  fi
  echo 'ARN3_QUALITY_CODE_GATE=FAIL' >&2
  return 1
}

# Se install falhar, fail-closed: NÃO considerar os demais gates como aprovados.
if ! run_gate 'INSTALL_FROZEN' bun install --frozen-lockfile; then
  echo 'ESLINT=SKIPPED TYPESCRIPT_APP=SKIPPED TYPESCRIPT_SCRIPTS=SKIPPED JEST_COVERAGE=SKIPPED'
  print_summary
  exit 1
fi

run_gate 'ESLINT' bun run lint || :
run_gate 'TYPESCRIPT_APP' bun x tsc --noEmit || :
run_gate 'TYPESCRIPT_SCRIPTS' bun x tsc --project scripts/tsconfig.json --noEmit || :
run_gate 'JEST_COVERAGE' bun run test:coverage || :

print_summary
