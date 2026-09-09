import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';
import { FormulaDrawer } from './components/FormulaDrawer';
import { OfflineIndicator } from './components/OfflineIndicator';

import { HomePage } from './pages/HomePage';
import { CalculatorsPage } from './pages/CalculatorsPage';
import { AdvancedSolverPage } from './pages/AdvancedSolverPage';
import { LoanAndEmiPage } from './pages/LoanAndEmiPage';
import { InvestmentPage } from './pages/InvestmentPage';
import { DateLedgerPage } from './pages/DateLedgerPage';
import { MonthlyDateVaultPage } from './pages/MonthlyDateVaultPage';
import { HistoryPage } from './pages/HistoryPage';
import { LearnPage } from './pages/LearnPage';

const AppContent: React.FC = () => {
  const { currentPath } = useApp();

  const renderCurrentPage = () => {
    switch (currentPath) {
      case 'home':
        return <HomePage />;
      case 'calculators':
        return <CalculatorsPage />;
      case 'date-ledger':
        return <DateLedgerPage />;
      case 'monthly-vault':
        return <MonthlyDateVaultPage />;
      case 'advanced-solver':
        return <AdvancedSolverPage />;
      case 'loan-and-emi':
        return <LoanAndEmiPage />;
      case 'investment':
        return <InvestmentPage />;
      case 'history':
        return <HistoryPage />;
      case 'learn':
        return <LearnPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface transition-colors duration-200">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-space-md sm:px-space-lg lg:px-space-xl pt-20 md:pt-24 pb-space-xl">
        {renderCurrentPage()}
      </main>
      <Footer />
      <Toast />
      <OfflineIndicator />
      <FormulaDrawer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
