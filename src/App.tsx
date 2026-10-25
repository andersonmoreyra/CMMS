import React, { useState, useEffect } from 'react';
import { ModuleCategory, LicenseValidationResult } from './types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './views/DashboardView';
import { AssetsView } from './views/AssetsView';
import { WorkOrdersView } from './views/WorkOrdersView';
import { MaintenancePlanningView } from './views/MaintenancePlanningView';
import { MobileTechnicianView } from './views/MobileTechnicianView';
import { ReliabilityFMEAView } from './views/ReliabilityFMEAView';
import { ConditionMonitoringView } from './views/ConditionMonitoringView';
import { InventoryMROView } from './views/InventoryMROView';
import { SafetyLOTOView } from './views/SafetyLOTOView';
import { OperationsOEEView } from './views/OperationsOEEView';
import { PurchasingTeamTurnaroundView } from './views/PurchasingTeamTurnaroundView';
import { AICopilotView } from './views/AICopilotView';
import { CommercialSecurityView } from './views/CommercialSecurityView';
import { MoreModulesView } from './views/MoreModulesView';
import { getInstalledLicense, validateLicense } from './services/licensingEngine';
import { AlertTriangle, ShieldCheck, KeyRound } from 'lucide-react';

export const App: React.FC = () => {
  const [currentModule, setCurrentModule] = useState<ModuleCategory>('dashboards');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState('Unidade Industrial 01');

  // Commercial Security & Anti-Piracy License state
  const [licenseResult, setLicenseResult] = useState<LicenseValidationResult>(() => {
    const installed = getInstalledLicense();
    return validateLicense(installed);
  });

  const refreshLicenseState = () => {
    const installed = getInstalledLicense();
    setLicenseResult(validateLicense(installed));
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Render view router based on selected module
  const renderView = () => {
    switch (currentModule) {
      case 'dashboards':
        return <DashboardView onNavigate={(mod) => setCurrentModule(mod)} />;
      case 'assets':
        return <AssetsView />;
      case 'work-orders':
        return <WorkOrdersView />;
      case 'planning':
      case 'scheduling':
        return <MaintenancePlanningView />;
      case 'mobile':
        return <MobileTechnicianView />;
      case 'reliability':
        return <ReliabilityFMEAView />;
      case 'iot-condition':
        return <ConditionMonitoringView />;
      case 'inventory':
        return <InventoryMROView />;
      case 'safety':
        return <SafetyLOTOView />;
      case 'operations-oee':
      case 'energy':
        return <OperationsOEEView />;
      case 'purchasing':
      case 'team':
      case 'turnaround':
        return <PurchasingTeamTurnaroundView />;
      case 'ai-copilot':
        return <AICopilotView />;
      case 'commercial-licensing':
        return (
          <CommercialSecurityView
            licenseResult={licenseResult}
            onRefreshLicense={refreshLicenseState}
          />
        );
      case 'inspections':
      case 'costs':
      case 'automations':
      case 'integrations':
      case 'documents':
      case 'specialized':
      case 'helpdesk':
      default:
        return <MoreModulesView module={currentModule} />;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar with all 24 catalog modules + commercial security */}
      <Sidebar
        currentModule={currentModule}
        onSelectModule={(mod) => setCurrentModule(mod)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        licenseResult={licenseResult}
      />

      {/* Main Content Area */}
      <div className={`main-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Top Header */}
        <Header
          currentModule={currentModule}
          theme={theme}
          onToggleTheme={toggleTheme}
          onOpenNewOrderModal={() => setCurrentModule('work-orders')}
          onOpenLicenseModal={() => setCurrentModule('commercial-licensing')}
          licenseResult={licenseResult}
          selectedPlant={selectedPlant}
          onSelectPlant={setSelectedPlant}
        />

        {/* Anti-Piracy Tamper Alert Banner (if invalid/unbound) */}
        {!licenseResult.valid && (
          <div
            style={{
              background: 'linear-gradient(90deg, #be123c, #9f1239)',
              color: '#ffffff',
              padding: '10px 32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.86rem',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(244, 63, 94, 0.3)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertTriangle size={18} />
              <span>{licenseResult.message}</span>
            </div>
            <button
              onClick={() => setCurrentModule('commercial-licensing')}
              className="btn btn-secondary btn-sm"
              style={{ background: '#ffffff', color: '#be123c', border: 'none', fontWeight: 700 }}
            >
              <KeyRound size={14} /> Ativar Chave Válida
            </button>
          </div>
        )}

        {/* Dynamic Page Body */}
        <main className="page-body">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default App;
