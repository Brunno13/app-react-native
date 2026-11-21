#!/bin/sh
# Executes the existing, approved Bun/Trivy scripts and summarizes every sub-gate.
# Does not modify the baseline or bypass failures.
set -u
export TRIVY_BIN="$(pwd)/.arn3-bin/trivy"
start="$(date +%s)"
failed=0
printf '%s\n' '===== ARN-3 TRIVY EXISTING SCRIPTS ====='
if [ ! -x "$TRIVY_BIN" ]; then
  echo 'TRIVY_BINARY=FAIL'
  echo 'TRIVY_VULN_PROD=SKIPPED TRIVY_MISCONFIG=SKIPPED TRIVY_SECRETS=SKIPPED'
  echo 'ARN3_SECURITY_TRIVY_GATE=FAIL'
  exit 127
fi

install_rc=0
bun install --frozen-lockfile || install_rc=$?
if [ "$install_rc" -ne 0 ]; then
  echo '===== ARN-3 TRIVY - SUMMARY ====='
  echo "INSTALL_FROZEN=FAIL RC=$install_rc"
  echo 'TRIVY_VULN_PROD=SKIPPED'
  echo 'TRIVY_MISCONFIG=SKIPPED'
  echo 'TRIVY_SECRETS=SKIPPED'
  echo 'ARN3_SECURITY_TRIVY_GATE=FAIL'
  exit 1
fi

check() {
  name="$1"
  shift
  started="$(date +%s)"
  rc=0
  "$@" || rc=$?
  elapsed=$(( $(date +%s) - started ))
  if [ "$rc" -eq 0 ]; then
    echo "$name=PASS SECONDS=$elapsed"
  else
    echo "$name=FAIL RC=$rc SECONDS=$elapsed"
    failed=$((failed+1))
  fi
}
check TRIVY_VULN_PROD bun run security:trivy:prod
check TRIVY_MISCONFIG bun run security:trivy:misconfig
check TRIVY_SECRETS bun run security:trivy:secret
duration=$(( $(date +%s) - start ))
echo
printf '%s\n' '===== ARN-3 TRIVY - SUMMARY ====='
echo 'INSTALL_FROZEN=PASS'
echo "SUBGATES_TOTAL=3 SUBGATES_FAIL=$failed"
echo "DURATION_SECONDS=$duration"
if [ "$failed" -eq 0 ]; then
  echo 'ARN3_SECURITY_TRIVY_GATE=PASS'
else
  echo 'ARN3_SECURITY_TRIVY_GATE=FAIL'
  exit 1
fi
