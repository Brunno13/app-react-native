#!/bin/sh
# ARN-3: verificação de duplicação usando a baseline versionada.
set -u
start="$(date +%s)"
install_rc=0
bun install --frozen-lockfile || install_rc=$?
cpd_rc=0
if [ "$install_rc" -eq 0 ]; then
  bun run quality:cpd || cpd_rc=$?
else
  echo 'CPD=SKIPPED (install falhou)'
fi
duration=$(( $(date +%s) - start ))
echo
echo '===== ARN-3 QUALITY CPD — SUMMARY ====='
if [ "$install_rc" -eq 0 ]; then echo 'FROZEN_INSTALL=PASS'; else echo "FROZEN_INSTALL=FAIL RC=$install_rc"; fi
if [ "$install_rc" -eq 0 ] && [ "$cpd_rc" -eq 0 ]; then
  echo 'CPD_BASELINE=PASS'
  echo "DURATION_SECONDS=$duration"
  echo 'ARN3_QUALITY_CPD_GATE=PASS'
else
  if [ "$install_rc" -eq 0 ]; then echo "CPD_BASELINE=FAIL RC=$cpd_rc"; fi
  echo "DURATION_SECONDS=$duration"
  echo 'ARN3_QUALITY_CPD_GATE=FAIL' >&2
  exit 1
fi
