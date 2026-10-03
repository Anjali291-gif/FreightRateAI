import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import DashboardView from './components/views/DashboardView';
import ForecastView from './components/views/ForecastView';
import VesselSelectionView from './components/views/VesselSelectionView';
import AIDecisionView from './components/views/AIDecisionView';
import MarketInsightsView from './components/views/MarketInsightsView';
import ReportsView from './components/views/ReportsView';
import VesselModal from './components/common/VesselModal';
import Toast from './components/common/Toast';
import ToastStack from './components/common/ToastStack';

function MainLayout() {
  const { page, activeTab } = useApp();
  const currentView = page || activeTab || 'dashboard';

  const renderActiveView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'forecast':
        return <ForecastView />;
      case 'vessels':
        return <VesselSelectionView />;
      case 'decision':
        return <AIDecisionView />;
      case 'insights':
        return <MarketInsightsView />;
      case 'reports':
        return <ReportsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8FAFC] dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      {/* Left Navigation Sidebar */}
      <Sidebar />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <Header />

        {/* Scrollable Content View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-[1680px] mx-auto">
            {renderActiveView()}
          </div>
        </main>
      </div>

      {/* Overlays & Modals */}
      <VesselModal />
      <Toast />
      <ToastStack />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
