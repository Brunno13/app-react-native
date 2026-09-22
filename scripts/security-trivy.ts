type Scope = "production" | "all";

type BaselineFinding = {
  packageName: string;
  installedVersion: string;
  vulnerabilityId: string;
  severity: string;
  scope: "production" | "dev-only";
  fixedVersion?: string;
  status?: string;
  ownerChain?: string[];
};

type Baseline = {
  schemaVersion: number;
  findings: BaselineFinding[];
};

type TrivyVulnerability = {
  PkgName?: string;
  InstalledVersion?: string;
  VulnerabilityID?: string;
  Severity?: string;
  FixedVersion?: string;
};

type TrivyResult = {
  Vulnerabilities?: TrivyVulnerability[];
};

type TrivyReport = {
  Results?: TrivyResult[];
};

function getArg(name: string): string | undefined {
  const prefix = name + "=";
  const value = process.argv
    .slice(2)
    .find((arg) => arg.startsWith(prefix));

  return value?.slice(prefix.length);
}

function fingerprint(
  packageName: string,
  installedVersion: string,
  vulnerabilityId: string,
): string {
  return [
    packageName,
    installedVersion,
    vulnerabilityId,
  ].join("|");
}

const scopeArg = getArg("--scope");
const reportPath = getArg("--report");
const baselinePath =
  getArg("--baseline") ??
  "security/trivy-vuln-baseline.json";

if (
  scopeArg !== "production" &&
  scopeArg !== "all"
) {
  console.error(
    "Usage: --scope=production|all --report=<path>",
  );
  process.exit(2);
}

if (!reportPath) {
  console.error(
    "Usage: --scope=production|all --report=<path>",
  );
  process.exit(2);
}

const scope: Scope = scopeArg;

const baseline =
  (await Bun.file(baselinePath).json()) as Baseline;

const report =
  (await Bun.file(reportPath).json()) as TrivyReport;

const expected = baseline.findings.filter(
  (finding) =>
    scope === "all" ||
    finding.scope === "production",
);

const actual = (report.Results ?? []).flatMap(
  (result) => result.Vulnerabilities ?? [],
);

const expectedByFingerprint = new Map<
  string,
  BaselineFinding
>();

for (const finding of expected) {
  const key = fingerprint(
    finding.packageName,
    finding.installedVersion,
    finding.vulnerabilityId,
  );

  if (expectedByFingerprint.has(key)) {
    console.error(
      "DUPLICATE_BASELINE=" + key,
    );
    process.exit(2);
  }

  expectedByFingerprint.set(key, finding);
}

const actualCounts = new Map<string, number>();

for (const finding of actual) {
  const key = fingerprint(
    finding.PkgName ?? "",
    finding.InstalledVersion ?? "",
    finding.VulnerabilityID ?? "",
  );

  actualCounts.set(
    key,
    (actualCounts.get(key) ?? 0) + 1,
  );
}

const duplicateActual = [...actualCounts.entries()]
  .filter(([, count]) => count > 1);

const unexpected = actual.filter((finding) => {
  const key = fingerprint(
    finding.PkgName ?? "",
    finding.InstalledVersion ?? "",
    finding.VulnerabilityID ?? "",
  );

  return !expectedByFingerprint.has(key);
});

const missing = expected.filter((finding) => {
  const key = fingerprint(
    finding.packageName,
    finding.installedVersion,
    finding.vulnerabilityId,
  );

  return !actualCounts.has(key);
});

const severityMismatch = actual.filter((finding) => {
  const key = fingerprint(
    finding.PkgName ?? "",
    finding.InstalledVersion ?? "",
    finding.VulnerabilityID ?? "",
  );

  const baselineFinding =
    expectedByFingerprint.get(key);

  if (!baselineFinding) {
    return false;
  }

  return (
    (finding.Severity ?? "").toUpperCase() !==
    baselineFinding.severity.toUpperCase()
  );
});

const blockers = actual.filter((finding) => {
  const severity =
    (finding.Severity ?? "").toUpperCase();

  return (
    severity === "HIGH" ||
    severity === "CRITICAL"
  );
});

function severityCount(severity: string): number {
  return actual.filter(
    (finding) =>
      (finding.Severity ?? "").toUpperCase() ===
      severity,
  ).length;
}

console.log("TRIVY_SCOPE=" + scope);
console.log("EXPECTED=" + expected.length);
console.log("ACTUAL=" + actual.length);
console.log(
  "CRITICAL=" + severityCount("CRITICAL"),
);
console.log("HIGH=" + severityCount("HIGH"));
console.log("MEDIUM=" + severityCount("MEDIUM"));
console.log("LOW=" + severityCount("LOW"));

console.log("");
console.log("===== FINDINGS =====");

for (
  const finding of [...actual].sort((a, b) =>
    fingerprint(
      a.PkgName ?? "",
      a.InstalledVersion ?? "",
      a.VulnerabilityID ?? "",
    ).localeCompare(
      fingerprint(
        b.PkgName ?? "",
        b.InstalledVersion ?? "",
        b.VulnerabilityID ?? "",
      ),
    )
  )
) {
  console.log(
    [
      finding.Severity ?? "UNKNOWN",
      finding.PkgName ?? "<unknown>",
      "installed=" +
        (finding.InstalledVersion ?? "<unknown>"),
      finding.VulnerabilityID ?? "<unknown>",
    ].join("\t"),
  );
}

let failed = false;

if (blockers.length > 0) {
  failed = true;
  console.error("");
  console.error("===== HIGH_OR_CRITICAL =====");

  for (const finding of blockers) {
    console.error(
      fingerprint(
        finding.PkgName ?? "",
        finding.InstalledVersion ?? "",
        finding.VulnerabilityID ?? "",
      ),
    );
  }
}

if (unexpected.length > 0) {
  failed = true;
  console.error("");
  console.error("===== UNEXPECTED =====");

  for (const finding of unexpected) {
    console.error(
      fingerprint(
        finding.PkgName ?? "",
        finding.InstalledVersion ?? "",
        finding.VulnerabilityID ?? "",
      ),
    );
  }
}

if (missing.length > 0) {
  failed = true;
  console.error("");
  console.error("===== MISSING_FROM_SCAN =====");

  for (const finding of missing) {
    console.error(
      fingerprint(
        finding.packageName,
        finding.installedVersion,
        finding.vulnerabilityId,
      ),
    );
  }
}

if (severityMismatch.length > 0) {
  failed = true;
  console.error("");
  console.error("===== SEVERITY_MISMATCH =====");

  for (const finding of severityMismatch) {
    const key = fingerprint(
      finding.PkgName ?? "",
      finding.InstalledVersion ?? "",
      finding.VulnerabilityID ?? "",
    );

    console.error(
      key +
        " actual=" +
        (finding.Severity ?? "UNKNOWN") +
        " baseline=" +
        expectedByFingerprint.get(key)?.severity,
    );
  }
}

if (duplicateActual.length > 0) {
  failed = true;
  console.error("");
  console.error("===== DUPLICATE_FINDINGS =====");

  for (const [key, count] of duplicateActual) {
    console.error(
      key + " count=" + count,
    );
  }
}

if (failed) {
  console.error("");
  console.error("TRIVY_BASELINE_GATE=FAIL");
  process.exit(1);
}

console.log("");
console.log("TRIVY_BASELINE_GATE=PASS");
