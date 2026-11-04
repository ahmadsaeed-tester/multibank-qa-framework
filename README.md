# Multibank QA Automation Framework

A robust, enterprise-grade test automation framework built with **Playwright** and **TypeScript** designed for comprehensive end-to-end (E2E), functional, visual regression, and API validation for **mb.io** and related platforms.

---

## 🏗️ Framework Architecture

The framework follows a modular, scalable architecture inspired by modern design patterns (such as Page Object Model principles and decoupled test suites) to ensure high maintainability, parallel execution capability, and clean separation of concerns.

```text
multibank-qa-framework/
├── .github/
│   └── workflows/
│       └── playwright.yml     # Continuous Integration (CI/CD) pipeline configuration
├── allure-results/            # Allure report raw result outputs
├── playwright-report/         # Playwright default HTML test reports
├── tests/
│   ├── 01_navigation.spec.ts  # Navigation & Layout test suite
│   ├── 02_trading_and_content.spec.ts # Trading functionality, content, and edge cases
│   └── 03_bonus_features.spec.ts      # API interception, parameterization, and visual regression
├── package.json               # Project dependencies and script definitions
├── playwright.config.ts       # Centralized Playwright configuration (base URL, viewports, reporters)
├── tsconfig.json              # TypeScript compiler configuration
├── generate-custom-report.js  # Custom HTML test summary report generator
└── mb-test-report.html        # Tailored mb.io test execution summary report
```

---

## 🚀 Key Features & Test Coverage

1. **Navigation & Layout Verification** (`01_navigation.spec.ts`)
   - Homepage load, title verification, and URL redirection validation.
   - Header and top navigation item visibility checks across standard desktop viewports (`1280x800`, `1440x900`, `1920x1080`).
   - Link destination integrity validation.

2. **Trading Functionality & Content** (`02_trading_and_content.spec.ts`)
   - Spot trading section rendering and market pair visibility.
   - Category filtering and data field presence checks.
   - Marketing banner placement and App Store / Google Play download link resolution.
   - "About Us / Why MultiBank" component verification.

3. **Negative & Edge Cases**
   - Invalid route handling (graceful 404 / custom error / redirect validation).
   - Mobile breakpoint viewport regression (`390x844` iPhone layout integrity).

4. **Bonus & Advanced Capabilities** (`03_bonus_features.spec.ts`)
   - **API & Network Interception**: Validates underlying API responses and GraphQL/network status codes.
   - **Visual Regression Checks**: Automated screenshot capture and snapshot comparison.
   - **Parameterized Test Data**: Scalable route and input parameterization.
   - **Continuous Integration (CI)**: GitHub Actions workflow automation (`playwright.yml`).
   - **Custom Executive Report**: Generates a professional `mb-test-report.html` summary dashboard.

---

## 🛠️ Getting Started

### Prerequisites
- **Node.js** (v18+ recommended)
- **npm** (comes with Node.js)

### Installation
Install all project dependencies:
```bash
npm install
```

Install Playwright browsers:
```bash
npx playwright install
```

---

## 🧪 Running Tests

### Run All Tests (Headless)
```bash
npx test
# or
npx playwright test
```

### Run Tests in Headed Mode
```bash
npm run test:headed
```

### Generate and View Custom Cross-Browser HTML Report
Run the Desktop Chrome and Desktop Edge projects, then generate the detailed report (`mb-test-report.html`). The report includes run totals, per-browser configuration and outcomes, and individual test status, duration, retry count, and failure details.
```bash
npx playwright test --reporter=json > test-results.json
node generate-custom-report.js
```
Open [mb-test-report.html](./mb-test-report.html) in your browser to view the report.

---

## 📊 CI/CD Integration

The repository includes a GitHub Actions pipeline ([.github/workflows/playwright.yml](file:///C:/Users/LENOVO/multibank-qa-framework/.github/workflows/playwright.yml)) that automatically triggers on every `push` and `pull_request` to:
1. Checkout code & setup Node.js environment.
2. Install dependencies & Playwright browser binaries.
3. Execute the full test suite in parallel.
4. Upload test artifacts and execution logs.

---

## 🛡️ Evaluation Criteria Alignment

| Area | Implementation Highlights |
|---|---|
| **Architecture** | Modular test structure (`tests/`), centralized config (`playwright.config.ts`), and decoupled custom reporters. |
| **Test Design** | Independent, deterministic test suites with clear scoping (`beforeEach` hooks and isolated test contexts). |
| **Assertions** | Meaningful, resilient matchers (`toBeVisible`, `toHaveURL`, network intercept checks). |
| **Edge Cases** | Comprehensive coverage for invalid routes, network timeouts, and mobile responsive breakpoints. |
| **Code Quality** | Clean TypeScript syntax, strict typing standards, and professional finish. |
