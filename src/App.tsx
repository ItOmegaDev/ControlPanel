import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { CommandPalette } from './components/CommandPalette';
import { OnboardingWizard } from './components/OnboardingWizard';
import { ServerList } from './components/servers/ServerList';
import { ServerDetail } from './components/servers/ServerDetail';
import { NodeManagement } from './components/nodes/NodeManagement';
import { PlacementScheduler } from './components/scheduler/PlacementScheduler';
import { EggMarketplace } from './components/eggs/EggMarketplace';
import { HorizonQueues } from './components/queues/HorizonQueues';
import { AuditLogs } from './components/audit/AuditLogs';
import { BillingDashboard } from './components/billing/BillingDashboard';
import { ApiWebhooks } from './components/api/ApiWebhooks';
import { SecuritySettings } from './components/security/SecuritySettings';
import { MultiTenantView } from './components/multitenant/MultiTenantView';
import { NewServerModal } from './components/modals/NewServerModal';
import { NewNodeModal } from './components/modals/NewNodeModal';

const MainContent: React.FC = () => {
  const { activeTab, selectedServerId } = useApp();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'servers':
        return selectedServerId ? <ServerDetail /> : <ServerList />;
      case 'nodes':
        return <NodeManagement />;
      case 'scheduler':
        return <PlacementScheduler />;
      case 'marketplace':
        return <EggMarketplace />;
      case 'horizon':
        return <HorizonQueues />;
      case 'audit':
        return <AuditLogs />;
      case 'billing':
        return <BillingDashboard initialTab="plans" />;
      case 'whitelabel':
        return <BillingDashboard initialTab="whitelabel" />;
      case 'security':
        return <SecuritySettings />;
      case 'multitenant':
        return <MultiTenantView />;
      case 'api':
        return <ApiWebhooks />;
      default:
        return selectedServerId ? <ServerDetail /> : <ServerList />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Global Command Palette (Cmd+K) */}
      <CommandPalette />

      {/* Onboarding Wizard (for first login / admin setup) */}
      <OnboardingWizard />

      {/* Modals */}
      <NewServerModal />
      <NewNodeModal />

      {/* Main Sidebar */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto bg-slate-950/90 scrollbar-thin">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
