import { readdir } from "node:fs/promises";

const root = process.cwd();
const androidDir = root + "/android";

const qualityEnvName =
  Bun.env.ANDROID_QUALITY_ENV || "production";

if (
  qualityEnvName !== "staging" &&
  qualityEnvName !== "production"
) {
  console.error(
    "ANDROID_QUALITY_ENV must be staging or production."
  );
  process.exit(1);
}

const qualityEnv = {
  ...Bun.env,
  APP_ENV: qualityEnvName,
  EXPO_PUBLIC_APP_ENV: qualityEnvName,
  NODE_ENV: "production",
  CI: "1",
  DETOX_ENABLED: "",
};


function fail(message: string): never {
  console.error("");
  console.error("ANDROID_QUALITY_GATE=FAIL");
  console.error(message);
  process.exit(1);
}

function check(condition: boolean, message: string): void {
  if (!condition) {
    fail(message);
  }
}

async function runCommand(
  label: string,
  command: string[],
  cwd = root,
  env = qualityEnv
): Promise<number> {
  console.log("");
  console.log("===== " + label + " =====");

  const child = Bun.spawn(command, {
    cwd,
    env,
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
  });

  const rc = await child.exited;

  console.log("");
  console.log(label.replaceAll(" ", "_") + "_RC=" + rc);

  return rc;
}

async function readRequired(path: string): Promise<string> {
  const file = Bun.file(path);

  if (!(await file.exists())) {
    fail("Required file not found: " + path);
  }

  return file.text();
}

async function collectTextFiles(directory: string): Promise<string[]> {
  const result: string[] = [];

  async function walk(current: string): Promise<void> {
    const entries = await readdir(current, {
      withFileTypes: true,
    });

    for (const entry of entries) {
      const fullPath = current + "/" + entry.name;

      if (entry.isDirectory()) {
        await walk(fullPath);
        continue;
      }

      if (
        /\.(xml|gradle|gradle\.kts|properties|java|kt)$/.test(
          entry.name
        )
      ) {
        result.push(fullPath);
      }
    }
  }

  await walk(directory);

  return result;
}

async function findMatches(
  files: string[],
  pattern: RegExp
): Promise<string[]> {
  const matches: string[] = [];

  for (const file of files) {
    const text = await Bun.file(file).text();

    if (pattern.test(text)) {
      matches.push(file);
    }

    pattern.lastIndex = 0;
  }

  return matches;
}

console.log("===== ANDROID QUALITY ENVIRONMENT =====");
console.log("PLATFORM=" + process.platform);
console.log("ARCH=" + process.arch);
console.log("BUN=" + Bun.version);
console.log("ANDROID_QUALITY_ENV=" + qualityEnvName);

const sdkDir =
  Bun.env.ANDROID_HOME ||
  Bun.env.ANDROID_SDK_ROOT;

check(
  Boolean(sdkDir),
  "ANDROID_HOME or ANDROID_SDK_ROOT is required."
);

console.log("ANDROID_SDK=" + sdkDir);

const javaRc = await runCommand(
  "JAVA VERSION",
  ["java", "-version"]
);

check(
  javaRc === 0,
  "Java runtime is not available."
);

const prebuildRc = await runCommand(
  "EXPO PREBUILD",
  [
    process.execPath,
    "x",
    "expo",
    "prebuild",
    "--platform",
    "android",
    "--clean",
    "--no-install",
  ]
);

check(
  prebuildRc === 0,
  "Expo Android prebuild failed."
);

const escapedSdkDir =
  process.platform === "win32"
    ? sdkDir!
        .replace(/\\/g, "\\\\")
        .replace(/:/g, "\\:")
    : sdkDir!;

await Bun.write(
  androidDir + "/local.properties",
  "sdk.dir=" + escapedSdkDir + "\n"
);

console.log("");
console.log("ANDROID_PREBUILD=PASS");

const manifestPath =
  androidDir + "/app/src/main/AndroidManifest.xml";

const manifest = await readRequired(manifestPath);
const manifestLines = manifest.split(/\r?\n/);

const writeExternalStorage = manifestLines.find(
  (line) =>
    line.includes(
      "android.permission.WRITE_EXTERNAL_STORAGE"
    )
);

check(
  Boolean(writeExternalStorage),
  "WRITE_EXTERNAL_STORAGE was not generated."
);

check(
  writeExternalStorage!.includes(
    "android:maxSdkVersion=\"28\""
  ),
  "WRITE_EXTERNAL_STORAGE must use maxSdkVersion=28."
);

const gradleProperties = await readRequired(
  androidDir + "/gradle.properties"
);

check(
  gradleProperties.includes(
    "-XX:MaxMetaspaceSize=1024m"
  ),
  "Gradle MaxMetaspaceSize must be 1024m."
);

const launcherIcon = await readRequired(
  androidDir +
    "/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml"
);

const launcherRoundIcon = await readRequired(
  androidDir +
    "/app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml"
);

check(
  launcherIcon.includes("<monochrome"),
  "ic_launcher.xml is missing monochrome icon."
);

check(
  launcherRoundIcon.includes("<monochrome"),
  "ic_launcher_round.xml is missing monochrome icon."
);

const androidFiles = await collectTextFiles(androidDir);

const detoxMatches = await findMatches(
  androidFiles,
  /detox|com\.wix\.detox|detoxMavenPath|DetoxTest/i
);

if (detoxMatches.length > 0) {
  console.error("");
  console.error("===== DETOX REFERENCES =====");

  for (const file of detoxMatches.slice(0, 10)) {
    console.error(file);
  }

  fail(
    "Detox must not be present in the normal production build."
  );
}

const mainAndroidFiles = androidFiles.filter(
  (file) =>
    file.includes(
      "/app/src/main/"
    )
);

const networkMatches = await findMatches(
  mainAndroidFiles,
  /networkSecurityConfig|cleartextTrafficPermitted|usesCleartextTraffic/
);

if (
  qualityEnvName === "production" &&
  networkMatches.length > 0
) {
  console.error("");
  console.error(
    "===== PRODUCTION NETWORK SECURITY REFERENCES ====="
  );

  for (const file of networkMatches.slice(0, 10)) {
    console.error(file);
  }

  fail(
    "Production src/main must not contain cleartext network configuration."
  );
}

console.log("");
console.log("ANDROID_NATIVE_INVARIANTS=PASS");


if (process.platform !== "win32") {
  const chmod = Bun.spawnSync(
    ["chmod", "+x", androidDir + "/gradlew"],
    {
      stdout: "inherit",
      stderr: "inherit",
    }
  );

  check(
    chmod.exitCode === 0,
    "Could not make Gradle wrapper executable."
  );
}

const gradleCommand =
  process.platform === "win32"
    ? androidDir + "/gradlew.bat"
    : "./gradlew";

const lintRc = await runCommand(
  "ANDROID LINT RELEASE",
  [
    gradleCommand,
    "--no-daemon",
    ":app:lintRelease",
  ],
  androidDir
);

const reportPath =
  androidDir +
  "/app/build/reports/lint-results-release.txt";

const reportFile = Bun.file(reportPath);

if (!(await reportFile.exists())) {
  fail(
    "Android Lint report was not generated: " +
      reportPath
  );
}

const report = await reportFile.text();
const reportLines = report.split(/\r?\n/);

let errorCount = 0;
let warningCount = 0;

const warningCounts = new Map<string, number>();

for (const line of reportLines) {
  const idMatch = line.match(
    /\[([^\]]+)\]\s*$/
  );

  if (
    line.includes(": Error:") &&
    idMatch
  ) {
    errorCount += 1;
  }

  if (
    line.includes(": Warning:") &&
    idMatch
  ) {
    warningCount += 1;

    const id = idMatch[1];

    warningCounts.set(
      id,
      (warningCounts.get(id) ?? 0) + 1
    );
  }
}

console.log("");
console.log("===== ANDROID LINT SUMMARY =====");
console.log("ANDROID_LINT_RC=" + lintRc);
console.log(
  "ANDROID_LINT_ERRORS=" + errorCount
);
console.log(
  "ANDROID_LINT_WARNINGS=" + warningCount
);

for (
  const [id, count] of [...warningCounts.entries()]
    .sort((a, b) => {
      if (b[1] !== a[1]) {
        return b[1] - a[1];
      }

      return a[0].localeCompare(b[0]);
    })
) {
  console.log(
    "WARNING_" +
      id.replace(/[^A-Za-z0-9]/g, "_") +
      "=" +
      count
  );
}

const forbiddenWarnings = [
  "ScopedStorage",
  "MonochromeLauncherIcon",
  "MissingTranslation",
  "Untranslatable",
  "IconXmlAndPng",
  "InsecureBaseConfiguration",
  "GradleDynamicVersion",
];

const effectiveForbiddenWarnings =
  qualityEnvName === "production"
    ? forbiddenWarnings
    : forbiddenWarnings.filter(
        (id) => id !== "InsecureBaseConfiguration"
      );

const forbiddenFound =
  effectiveForbiddenWarnings.filter(
    (id) =>
      (warningCounts.get(id) ?? 0) > 0
  );

console.log("");
console.log(
  "ANDROID_LINT_FORBIDDEN=" +
    forbiddenFound.length
);

if (forbiddenFound.length > 0) {
  console.error("");
  console.error(
    "===== BLOCKING WARNING REGRESSIONS ====="
  );

  for (const id of forbiddenFound) {
    console.error(
      id +
        "=" +
        warningCounts.get(id)
    );
  }
}

if (lintRc !== 0) {
  fail(
    "Gradle Android Lint execution failed."
  );
}

if (errorCount > 0) {
  fail(
    "Android Lint reported blocking errors."
  );
}

if (forbiddenFound.length > 0) {
  fail(
    "Known Android quality regressions were detected."
  );
}

console.log("");
console.log("ANDROID_LINT=PASS");
console.log("ANDROID_QUALITY_GATE=PASS");
