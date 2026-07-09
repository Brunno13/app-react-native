# 📱 React Native App (Expo + Bun)

Multiplatform mobile application (Android and iOS) built with React Native and Expo, using Bun for package management and scripts. The project adopts the **Feature-Sliced Design (FSD)** architecture and an **Offline-First** model, ensuring smooth navigation without internet and complete data security on the device.

### 🚀 Key Features
* **Authentication and Security:** Login via `better-auth`, encrypted native storage (`Secure Store`), and screen lock with biometrics (Face ID / Touch ID).
* **Architecture (FSD):** Modular organization focused on business domains, with strict rules to prevent improper coupling.
* **Offline Persistence:** Fast local database using `Expo SQLite` combined with `Drizzle ORM`.
* **Quality and Governance:** ESLint integrated into the pipeline (Fail Fast) to ensure architectural integrity before any deployment.
* **Automated Testing:** End-to-end coverage. Unit tests with `Jest` and E2E visual flow tests with `Detox`, running on Android emulators (including tablet responsiveness) and iOS simulators.
* **Smart Connectivity:** Real-time network monitoring with user-friendly alerts and API timeout control.
* **Infrastructure and CI/CD:** Isolated environments (Staging and Production), automated cross-platform native builds via Woodpecker CI, and instant Over-The-Air updates (EAS Update).

---

## 🗺️ Project Roadmap

### ✅ Completed 
- [x] **Initial Setup:** React Native, Expo, and Bun initialization.
- [x] **Authentication:** Integration of the `@better-auth/expo` client.
- [x] **Architecture:** Implementation of Feature-Sliced Design (FSD).
- [x] **Environment Management:** Dynamic flavors (Staging / Production).
- [x] **Tooling:** Cross-platform scripts for automated builds.
- [x] **CI/CD:** Pipeline configured in Woodpecker CI.
- [x] **Updates (OTA):** `expo-updates` (EAS Update) configuration for instant logic and interface fixes.
- [x] **Navigation:** Migration to Expo Router.
- [x] **Typing and Forms:** Implementation of `zod` and `react-hook-form`.
- [x] **Resilience and Internationalization:** Error handling with `react-error-boundary` and internationalization with `i18next`.
- [x] **Dependency Injection:** Provider layer using Context API.
- [x] **Offline Storage:** Local database (`Expo SQLite` + `Drizzle ORM`) combined with native vaults (`expo-secure-store`).
- [x] **Biometrics:** Screen lock implementation using `expo-local-authentication` linked to user profile settings.
- [x] **Dark Mode:** Implementation of `darkmode` where users can choose between Light, Dark, and System default settings.
- [x] **Code Governance:** Native ESLint configuration with boundary blocking to prevent FSD architecture coupling, integrated into CI/CD pipelines (Fail Fast).
- [x] **Unit Testing:** Test coverage using `Jest` and `React Native Testing Library`.
- [x] **E2E Testing:** Multiplatform implementation of `Detox` for automated user flow testing, with native support for multiple screen formats (mobile and tablets).
- [x] **UI Documentation:** Storybook configuration to map and test components in the `shared/ui` layer.

### ⏳ Next Steps
- [ ] **Observability:** Firebase Crashlytics integration for tracking production crashes.

---

## 🛠️ Tech Stack

* **Framework:** React Native + Expo (SDK 56)
* **Language:** TypeScript
* **Package Manager:** Bun
* **Navigation:** Expo Router
* **Authentication:** Better Auth (`@better-auth/expo`)
* **Database & ORM:** Expo SQLite + Drizzle ORM
* **Security and Biometrics:** Expo Secure Store + Expo Local Authentication
* **Automated Testing:** Jest + React Native Testing Library (Unit and Integration) + Detox (Multiplatform E2E)
* **UI Documentation:** Storybook (Native Component Catalog)
* **Network and Connectivity:** NetInfo (`@react-native-community/netinfo`)
* **Global State and Injection:** Context API
* **Forms and Validation:** React Hook Form + Zod
* **Resilience and Internationalization:** React Error Boundary + i18next
* **Updates (OTA):** Expo Updates (EAS)
* **Architecture & Quality:** Feature-Sliced Design (FSD) + ESLint (FSD boundaries)
* **CI/CD:** Woodpecker CI

---

## 🏗️ Project Architecture

The project strictly follows the **Feature-Sliced Design (FSD)** pattern, focusing on high cohesion, low coupling, and predictable scalability. The structure is organized into layers ranging from core infrastructure to business rules and physical routing.

The main folder structure within `src/` is as follows:

```text
/ (Project Root)
├── .rnstorybook/         # Native Storybook configuration and environment setup
│   ├── main.ts           # Addons and stories path configuration
│   └── preview.tsx       # Global decorators (Theme, Providers) and FSD wrappers
│
├── e2e/                  # End-to-End automated tests with Detox
│   ├── helpers/          # Reusable auxiliary functions and flows (authHelpers.js)
│   └── *.test.js         # Visual scenarios and user flow tests (authFlow.test.js)
│
└── src/                  # Main application source code
    ├── __tests__/        # Testing refuge for Expo Router File-Based Routing bypasses
    │   └── app/          # Integration and routing tests of screens (isolated from src/app)
    │
    ├── shared/           # Corporate infrastructure, utilities, and global configurations
    │   ├── api/          # Centralized HTTP client (apiClient.ts, apiClient.test.ts)
    │   ├── config/       # App ecosystem configs (e.g., i18n/locales, storybook.config.ts)
    │   ├── db/           # Offline-First engine (Drizzle Client, migrations, and repositories)
    │   ├── lib/          # Library initializations and bridges
    │   ├── providers/    # Global context providers (AppProvider.tsx, AppProvider.test.tsx)
    │   └── ui/           # Atomized Design System with Stories (Toast.tsx, Toast.stories.tsx)
    │
    ├── features/         # Independent business slices, coupled to specific commercial domains
    │   ├── auth/         # Authentication, Security, and Hybrid Session Domain
    │   │   ├── index.ts  # Public API (Barrel File)
    │   │   ├── api/      # Network call isolation
    │   │   ├── hooks/    # State and action logic (useAuth.ts, useAuth.test.ts)
    │   │   ├── services/ # Complex business rules
    │   │   ├── ui/       # Co-located UI components and tests (LoginForm.tsx, LoginForm.test.tsx)
    │   │   └── domain/   # Runtime data validation schemas with Zod
    │   └── profile/      # User Profile Domain and local settings
    │       ├── index.ts  # Public API (Barrel File)
    │       ├── services/ # Persistent preference manipulation (preferenceService.ts, preferenceService.test.ts)
    │       └── ui/       # Profile domain forms and components (EditProfileForm.tsx, EditProfileForm.test.tsx)
    │
    └── app/              # Entry point, native routing, and visual orchestration (Expo Router)
        ├── (auth)/       # Public access flow (login.tsx, signup.tsx, forgot-password.tsx)
        ├── (main)/       # Session and biometric protected flow
        │   ├── (tabs)/   # Bottom tab navigation (home.tsx, profile.tsx)
        │   ├── edit-profile.tsx 
        │   └── security.tsx
        ├── _providers/   # Clean composition of local and global providers
        └── _layout.tsx   # App structural initialization (Provider Tree, Storybook Intercept & Error Boundary)
```

### 📏 Architecture Guidelines

To maintain clean, scalable, and loosely coupled code, we follow three basic rules:

**1. Dependency Flow (Top-Down)**
* **`app`** ➔ Can import from `features` and `shared`.
* **`features`** ➔ Can only import from `shared`.
* **`shared`** ➔ Agnostic components. Must never import from `features` or `app`.

**2. Feature Encapsulation (Barrel Files)**
* It is **strictly prohibited** to access internal files of a feature from outside it. Our linter (CI/CD) automatically blocks violations of this rule.
* ❌ *Wrong:* `import { LoginForm } from '@/features/auth/ui/LoginForm'`
* ✅ *Correct:* `import { LoginForm } from '@/features/auth'`

**3. Smart Hybrid Persistence**
* **Cache and Offline Mode:** UI data and preferences are stored in the relational database (`Expo SQLite` + `Drizzle ORM`).
* **Security:** Tokens, keys, and sensitive data are stored in the device's native encryption (`Secure Store`).

---

## 🌍 Environments (Dynamic Flavors)

The app uses `app.config.ts` alongside `cross-env` to switch between Staging and Production environments dynamically, without needing native Android/iOS flavors.

* **Staging:** App named "App Bun (Staging)", uses package `com.brunno.app.staging`, and points to the local API.
* **Production:** App named "App Bun", uses package `com.brunno.app`, and points to the server with HTTPS support.

---

## 🚀 How to Run and Build Locally

### Prerequisites
* [Bun](https://bun.sh/) installed.
* **For Android:** Android Studio (Emulator) configured or a physical device with Expo Go.
* **For iOS (macOS only):** Xcode installed, Command Line Tools configured, CocoaPods installed (`brew install cocoapods`), and the iOS Simulator active.

### 💻 Development Mode (Live Reload)

1. **Install dependencies:**

    ```bash
    bun install
    ```

2. **Start the development server via Expo Go (Staging Environment):**

    ```bash
    bun run android  # Opens in Android Emulator
    # or
    bun run ios      # Opens in iOS Simulator via Expo Go
    # or
    bun start        # Opens the Metro Bundler panel
    ```

3. **To test on Expo Go with Production settings:**

    ```bash
    bun run android:prod
    # or
    bun run ios:prod
    ```

4. **To run with local native compilation (Dev Client):**
    If the project uses Prebuild-generated native libraries, compile directly to the emulator/simulator:

    ```bash
    bun run run:android  # Compile and run natively on Android
    # or
    bun run run:ios      # Install Pods and compile natively on Apple Simulator
    ```

### 📦 Generating Binaries Locally
Automated scripts detect the environment and configure local build variables.

#### 🤖 Android (APK Generation via Gradle)
The script configures the Android SDK path and JVM memory properties.

* **Generate Staging APK (Allows local HTTP):**

    ```bash
    bun run build:apk
    ```
* **Generate Production APK (Requires secure HTTPS):**

    ```bash
    bun run build:apk:prod
    ```
* **Result:** Files will be in the project root as `app-react-native-staging.apk` or `app-react-native-production.apk`.

#### 🍎 iOS (Package Generation via xcodebuild)
*Requires macOS*. The script runs prebuild, installs Apple dependencies, and compiles the project in Release mode.

* **Generate Staging iOS package:**

    ```bash
    bun run build:ios
    ```
* **Generate Production iOS package:**

    ```bash
    bun run build:ios:prod
    ```
    
* **Result:** The `.app` package for simulators will be exported as a compressed file in the root as `app-react-native-ios-staging.zip` or `app-react-native-ios-production.zip`.

### 🧪 Testing

#### **Unit & Integration Tests (Jest)**
Run the fast unit and integration tests (isolated from E2E files) to validate business logic and components:
    
    bun run test
    

#### **End-to-End (E2E) Tests (Detox)**
E2E tests interact with the compiled app on the emulator/simulator from the outside in.

**E2E Prerequisites:**
* **iOS:** Install applesimutils (required for Detox to communicate with the iOS Simulator):

    ```bash
    brew tap wix/brew
    brew install applesimutils
    ```

* **Android:** Ensure your Android Emulator (AVD) is currently running.

**Running iOS E2E Tests:**
1. **Build the app for the testing environment:**

    ```bash
    bunx detox build --configuration ios.sim.release
    ```

2. **Run the test suite:**

    ```bash
    bunx detox test --configuration ios.sim.release --cleanup
    ```
    **(Tip: To run a single test file and save time, append its path:** `bunx detox test e2e/authFlow.test.js --configuration ios.sim.release` **)**

**Running Android E2E Tests:**
1. **Build the app for the testing environment:**

    ```bash
    bunx detox build --configuration android.emu.release
    ```

2. **Run the test suite:**

    ```bash
    bunx detox test --configuration android.emu.release --cleanup
    ```

#### **UI Component Testing (Storybook)**
Storybook is integrated into the architecture to visually test and document the isolated components of the Design System (`src/shared/ui`).

1. **Enable Storybook Mode:**
    Open the static configuration file `src/shared/config/storybook.config.ts` and set the master flag to `true`:
   
    ```typescript
    export const STORYBOOK_ENABLED = true;
    ```

2. **Run the Component Catalog:**
    Start the application using the custom Storybook scripts. This command automatically parses your stories and opens the interactive UI catalog in the emulator:

    ```bash
    bun run storybook:android
    # or
    bun run storybook:ios
    # or
    bun run storybook
    ```

3. **Return to Normal Application Flow:**
    To exit the component catalog and continue developing the main application routing and features, simply revert the flag back to `false` in `storybook.config.ts`. The Metro Bundler will hot-reload the app instantly.

---

## 📦 CI/CD, Automation and Mirroring

The Woodpecker CI pipeline (`.woodpecker/release.yml`) automates APK/package generation, Over-the-Air updates (OTA), and repository mirroring.

**Release Pipeline Workflow:**
1. **Trigger:** Creation of a Tag (e.g., `v1.0.5`) on Gitea starts the pipeline.
2. **Native Agent:** Execution occurs on a macOS agent (`darwin/arm64`) to use Xcode and Apple Silicon.
3. **Dual Compilation:**
   * Injection of `APP_ENV=production` variable.
   * **Android:** Executes `expo prebuild` and Gradle packaging to generate the `.apk`.
   * **iOS:** Installs Pods and compiles via `xcodebuild`, generating the `.zip`.
4. **OTA Updates (Over-the-Air):** The JavaScript bundle is synced with Expo cloud (`eas update`), allowing instant logic and UI fixes without store approval.
5. **Internal Release:** Woodpecker generates the changelog, creates a version on the Gitea server, and attaches compiled artifacts.
6. **Mirroring (GitHub):** The source code associated with the Tag is pushed to GitHub, where an identical public Release is created with the `.apk` and `.zip`.

---

## 🔐 Security and Local Traffic

* **In Staging:** The app allows cleartext HTTP traffic (`usesCleartextTraffic: true`) for local API communication.
* **In Production:** Builds require secure HTTPS connections.