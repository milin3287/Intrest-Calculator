# MRP Interestly — Financial Math & Precision Interest Calculator

> **High-Precision Financial Calculation Infrastructure & Date-to-Date Cash Flow Ledger**

MRP Interestly is a modern, responsive web application engineered for financial mathematics, multi-tranche staggered cash flow accounting, loan amortization, investment projections, and audit-grade interest reporting. Built with React 19, TypeScript, and Tailwind CSS.

---

## 🚀 How to Deploy on GitHub Pages

This repository is pre-configured with a GitHub Actions workflow (`.github/workflows/deploy.yml`) and relative asset resolution (`base: './'`) for effortless GitHub Pages deployment:

1. **Push this code to your GitHub repository** (on branch `main` or `master`).
2. In your GitHub repository, navigate to:
   **Settings** ➔ **Pages**
3. Under **Build and deployment**:
   - Change **Source** from *"Deploy from a branch"* to **"GitHub Actions"**.
4. GitHub Actions will automatically run the build and publish your site at `https://<your-username>.github.io/<your-repo-name>/`!
5. Any new push to `main` will automatically build and update your live website.

---

## Key Modules & Features

### 1. Custom Date-to-Date Cash Flow Ledger
* **Staggered Multi-Tranche Entry**: Log variable cash flows (receipts/inflows and withdrawals/outflows) on exact calendar dates.
* **Running Passbook Engine**:
  * Calculates exact day intervals elapsed between staggered dates.
  * Real-time running principal, period interest, cumulative interest, and net settlement.
  * Supports **Simple Interest** and **Daily Compounding** modes.
  * Flexible day-count conventions (**365-day** and **360-day** basis).
  * Annualized (p.a.) or Monthly percentage interest rates.
  * Dynamic Indian currency denomination words conversion (Lakhs & Crores).
* **Audit-Grade PDF Statement Generator**:
  * Instant vector PDF generation powered by `jspdf` and `jspdf-autotable`.
  * Clean executive summary cards, transaction schedule, and day-by-day passbook ledger.
* **Time-Slot Snapshots & History**:
  * Save versioned snapshots with custom notes and timestamps.
  * Single-click restore, diff inspection, JSON export, and individual slot PDF download.

### 2. Monthly Data Space & Ledger Vault
* **Categorized Monthly Buckets**: Automatically organizes all custom date transactions by calendar month.
* **Monthly Statements**: Generates dedicated monthly receipts, withdrawals, net movements, and closing balance sheets.
* **Individual Monthly PDF Export**: Direct download for monthly audit statements.

### 3. Core Financial Calculators
* **Compound & Simple Interest**: Interactive sliders and inputs for principal, rate, tenure, and compounding frequency (daily, monthly, quarterly, semi-annually, annually).
* **Dynamic Visualizations**: Side-by-side breakdown charts and interest-to-principal ratios.
* **Multi-Currency System**: Instant switching across Indian Rupee (₹ with Lakh/Crore compact notation), US Dollar ($), Euro (€), British Pound (£), Japanese Yen (¥), and more.

### 4. Loan Amortization & EMI Prepayment Planner
* **Standard & Custom EMI Computation**: Principal, interest rate, and loan duration breakdown.
* **Interactive Prepayment Simulations**: Test how one-time or recurring prepayments drastically reduce tenure and total interest paid.
* **Full Amortization Table**: Monthly and annual payment schedules with principal vs. interest splits.

### 5. Wealth & Investment Multiplier
* **SIP & Lumpsum Projections**: Calculate long-term compound growth for systematic investment plans and one-time deposits.
* **Wealth Multiplier & Real Purchasing Power**: Inflation adjustment toggle and real-return analysis.

### 6. Advanced Mathematical Solver
* **Quantitative Step-by-Step Derivations**: Step-by-step mathematical breakdown for solving principal $P$, rate $r$, time $t$, or future value $A$.
* **ISO 31-11 Quantitative Compliance**: Clean mathematical notation and formula derivations.

---

## Tech Stack

* **Framework**: [React 19](https://react.dev/) + [Vite 6](https://vitejs.dev/)
* **Language**: [TypeScript](https://www.typescriptlang.org/)
* **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
* **Document Generation**: [jsPDF](https://github.com/parallax/jsPDF) & [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable)
* **Animations**: [Motion](https://motion.dev/)
* **Icons**: [Lucide React](https://lucide.dev/) & [Google Material Symbols](https://fonts.google.com/icons)
* **PWA & Offline Support**: Service Worker caching with offline badge indicators

---

## Getting Started

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher

### Installation

1. Clone or download the repository:
```bash
git clone <YOUR_REPOSITORY_URL>
cd interestly
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser at `http://localhost:3000`.

### Production Build

To compile the production-ready optimized bundle:
```bash
npm run build
```

Preview the production build locally:
```bash
npm run preview
```

---

## Project Structure

```
├── public/                  # Static assets & PWA manifest
├── src/
│   ├── components/          # Reusable UI components (Header, Footer, Modals, etc.)
│   ├── context/             # Global application state & preferences (AppContext)
│   ├── pages/               # Primary application modules
│   │   ├── AdvancedSolverPage.tsx
│   │   ├── CalculatorsPage.tsx
│   │   ├── DateLedgerPage.tsx
│   │   ├── HistoryPage.tsx
│   │   ├── HomePage.tsx
│   │   ├── InvestmentPage.tsx
│   │   ├── LoanAndEmiPage.tsx
│   │   └── MonthlyDateVaultPage.tsx
│   ├── utils/               # Calculation algorithms, PDF engine & local storage
│   │   ├── customDatesStorage.ts
│   │   ├── dateLedgerEngine.ts
│   │   ├── dateLedgerPdfGenerator.ts
│   │   └── financialMath.ts
│   ├── App.tsx              # Main routing & layout controller
│   ├── main.tsx             # React entry point
│   ├── index.css            # Tailwind CSS configuration
│   └── types.ts             # TypeScript domain models & interfaces
├── metadata.json            # AI Studio application metadata
├── package.json
└── vite.config.ts
```

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.
