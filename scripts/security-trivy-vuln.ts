import { mkdir } from "node:fs/promises";

type Scope = "production" | "all";

function getArg(name: string): string | undefined {
  const prefix = name + "=";

  return process.argv
    .slice(2)
    .find((arg) => arg.startsWith(prefix))
    ?.slice(prefix.length);
}

const scopeArg = getArg("--scope");

if (
  scopeArg !== "production" &&
  scopeArg !== "all"
) {
  console.error(
    "Usage: --scope=production|all",
  );
  process.exit(2);
}

const scope: Scope = scopeArg;

const trivyBin =
  process.env.TRIVY_BIN ?? "trivy";

const reportPath =
  scope === "production"
    ? ".security-results/trivy-vuln-prod.json"
    : ".security-results/trivy-vuln-all.json";

await mkdir(
  ".security-results",
  { recursive: true },
);

const args = [
  "filesystem",
  "--scanners",
  "vuln",
];

if (scope === "all") {
  args.push("--include-dev-deps");
}

args.push(
  "--format",
  "json",
  "--output",
  reportPath,
  "--list-all-pkgs",
  "--exit-code",
  "0",
  "bun.lock",
);

console.log("TRIVY_SCOPE=" + scope);
console.log("TRIVY_BIN=" + trivyBin);
console.log("TRIVY_REPORT=" + reportPath);
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
console.log("TRIVY_SCAN_RC=" + scanRc);

if (scanRc !== 0) {
  console.error("TRIVY_SCAN=FAIL");
  process.exit(scanRc);
}

console.log("TRIVY_SCAN=PASS");
console.log("");

const gate = Bun.spawn(
  [
    process.execPath,
    "run",
    "./scripts/security-trivy.ts",
    "--scope=" + scope,
    "--report=" + reportPath,
  ],
  {
    stdout: "inherit",
    stderr: "inherit",
  },
);

const gateRc = await gate.exited;

console.log("");
console.log("TRIVY_GATE_RC=" + gateRc);

if (gateRc !== 0) {
  console.error("TRIVY_VULN=FAIL");
  process.exit(gateRc);
}

console.log("TRIVY_VULN=PASS");
