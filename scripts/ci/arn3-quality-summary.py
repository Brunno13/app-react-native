#!/usr/bin/env python3
"""ARN-3 - consulta somente leitura aos status reais de um commit no Gitea.

Não cria statuses, não recebe PAT e falha de forma fechada se um gate estiver
ausente, pendente, reprovado ou se a API não puder ser consultada.
Concebido para o workflow de resumo FINAL da fase 2 da ARN-3.
"""
from __future__ import annotations

import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

GATES = (
    'security-wake-x86',
    'quality-code',
    'quality-cpd',
    'quality-android',
    'security-gitleaks',
    'security-opengrep',
    'security-trivy',
)
BASE_URL = 'https://gitea.brunnoserver.duckdns.org'
REPO_PATH = 'brunno/app-react-native'


def latest_by_context(items: list[dict]) -> dict[str, dict]:
    # A API Gitea retorna os statuses mais novos primeiro. Na mesma lista,
    # para cada contexto, considerar somente a entrada mais recente.
    out: dict[str, dict] = {}
    for item in items:
        context = item.get('context')
        if isinstance(context, str) and context not in out:
            out[context] = item
    return out


def report(statuses: dict[str, dict], event: str) -> tuple[bool, str]:
    kind = {'pull_request': 'pr', 'push': 'push'}[event]
    good = True
    rows = ['===== ARN-3 - CONSOLIDATED QUALITY SUMMARY =====',
            'GATE | STATUS | CONTEXT']
    for name in GATES:
        context = f'ci/woodpecker/{kind}/{name}'
        status = statuses.get(context)
        state = (status or {}).get('state', 'missing')
        if state != 'success':
            good = False
        rows.append(f'{name} | {str(state).upper()} | {context}')
    rows += [f'CHECKS={len(GATES)}',
             'ARN3_CONSOLIDATED_GATE=' + ('PASS' if good else 'FAIL')]
    return good, '\n'.join(rows)


def fetch_statuses(sha: str) -> list[dict]:
    records = []
    for page in range(1, 11):
        api = (f'{BASE_URL}/api/v1/repos/{REPO_PATH}/commits/{sha}/statuses'
               f'?limit=50&page={page}')
        with urllib.request.urlopen(urllib.request.Request(
                api, headers={'Accept': 'application/json', 'User-Agent': 'ARN3-quality-summary/1'}),
                timeout=8) as response:
            part = json.load(response)
        if not isinstance(part, list):
            raise ValueError('unexpected API response: list expected')
        records.extend(item for item in part if isinstance(item, dict))
        if len(part) < 50:
            return records
    raise ValueError('statuses pagination exceeded; not safe to continue')


def main() -> int:
    event = os.environ.get('CI_PIPELINE_EVENT', '')
    sha = os.environ.get('CI_COMMIT_SHA', '')
    if event not in ('pull_request', 'push'):
        print('ARN3_CONSOLIDATED_GATE=FAIL unsupported event', file=sys.stderr)
        return 1
    if not re.fullmatch('[0-9a-fA-F]{40}', sha):
        print('ARN3_CONSOLIDATED_GATE=FAIL invalid CI_COMMIT_SHA', file=sys.stderr)
        return 1
    # A comunicação não contém token; Gitea precisará permitir leitura desse
    # repo pela API sem autenticação, caso contrário gate FAIL (sem bypass).
    for attempt in range(1, 9):
        try:
            by_context = latest_by_context(fetch_statuses(sha))
            good, summary = report(by_context, event)
            terminal = all((by_context.get(f'ci/woodpecker/{"pr" if event == "pull_request" else "push"}/{name}') or {}).get('state')
                           not in (None, 'pending') for name in GATES)
            if terminal or attempt == 8:
                print(summary)
                return 0 if good else 1
        except (ValueError, urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
            print(f'ARN3_SUMMARY_API_ATTEMPT={attempt} ERROR={type(exc).__name__}', file=sys.stderr)
            if attempt == 8:
                print('ARN3_CONSOLIDATED_GATE=FAIL status API unavailable', file=sys.stderr)
                return 1
        time.sleep(3)
    return 1


if __name__ == '__main__':
    sys.exit(main())
