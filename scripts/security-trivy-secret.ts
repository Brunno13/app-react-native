import { mkdir } from "node:fs/promises";

type TrivySecret = {
  RuleID?: string;
  Category?: string;
  Severity?: string;
  Title?: string;
  StartLine?: number;
  EndLine?: number;
};

type TrivyResult = {
  Target?: string;
  Secrets?: TrivySecret[];
};

type TrivyReport = {
  Results?: TrivyResult[];
};

function getArg(name: string): string | undefined {
  const prefix = name + "=";

  return process.argv
    .slice(2)
    .find((arg) => arg.startsWith(prefix))
    ?.slice(prefix.length);
}

const target =
  getArg("--target") ?? ".";

const reportPath =
  getArg("--report") ??
  ".security-results/trivy-secret.json";

const trivyBin =
  process.env.TRIVY_BIN ?? "trivy";

await mkdir(
  ".security-results",
  { recursive: true },
);

const args = [
  "filesystem",
  "--scanners",
  "secret",
  "--format",
  "json",
  "--output",
  reportPath,
  "--exit-code",
  "0",
];

if (target === ".") {
  for (const dir of [
    "node_modules",
    ".git",
    ".security-results",
    "coverage",
    "android",
    "ios",
  ]) {
    args.push(
      "--skip-dirs",
      dir,
    );
  }
}

args.push(target);

console.log(
  "TRIVY_SECRET_TARGET=" + target,
);
console.log(
  "TRIVY_BIN=" + trivyBin,
);
console.log(
  "TRIVY_REPORT=" + reportPath,
);
console.log("");

const scan = Bun.spawn(
  [trivyBin, ...args],
  {
    stdout: "inherit",
    stderr: "inherit",
  },
);

const scanRc = await scan.exited;

console.log("");
console.log(
  "TRIVY_SCAN_RC=" + scanRc,
);

if (scanRc !== 0) {
  console.error(
    "TRIVY_SECRET_SCAN=FAIL",
  );
  process.exit(scanRc);
}

console.log(
  "TRIVY_SECRET_SCAN=PASS",
);

const report =
  (await Bun.file(reportPath).json()) as TrivyReport;

const findings = (report.Results ?? []).flatMap(
  (result) =>
    (result.Secrets ?? []).map(
      (finding) => ({
        target:
          result.Target ?? "<unknown>",
        ruleId:
          finding.RuleID ?? "<unknown>",
        category:
          finding.Category ?? "<unknown>",
        severity:
          (
            finding.Severity ??
            "UNKNOWN"
          ).toUpperCase(),
        title:
          finding.Title ?? "<no title>",
        startLine:
          finding.StartLine ?? "<unknown>",
        endLine:
          finding.EndLine ?? "<unknown>",
      }),
    ),
);

function count(
  severity: string,
): number {
  return findings.filter(
    (finding) =>
      finding.severity === severity,
  ).length;
}

console.log("");
console.log(
  "TOTAL=" + findings.length,
);
console.log(
  "CRITICAL=" + count("CRITICAL"),
);
console.log(
  "HIGH=" + count("HIGH"),
);
console.log(
  "MEDIUM=" + count("MEDIUM"),
);
console.log(
  "LOW=" + count("LOW"),
);
console.log(
  "UNKNOWN=" + count("UNKNOWN"),
);

if (findings.length > 0) {
  console.error("");
  console.error(
    "===== SECRETS =====",
  );

  for (
    const finding of [...findings].sort(
      (a, b) =>
        [
          a.target,
          a.ruleId,
          String(a.startLine),
        ]
          .join("|")
          .localeCompare(
            [
              b.target,
              b.ruleId,
              String(b.startLine),
            ].join("|"),
          ),
    )
  ) {
    console.error(
      [
        finding.severity,
        finding.ruleId,
        finding.category,
        finding.target,
        "lines=" +
          finding.startLine +
          "-" +
          finding.endLine,
        finding.title,
      ].join("\t"),
    );
  }

  console.error("");
  console.error(
    "TRIVY_SECRET_GATE=FAIL",
  );
  process.exit(1);
}

console.log("");
console.log(
  "TRIVY_SECRET_GATE=PASS",
);
