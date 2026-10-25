import React, { useState, useEffect } from 'react';
import { ModuleCategory, LicenseValidationResult } from './types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import type { Period, CriticalityFilter, Density } from './components/Header';
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
  const [theme, setTheme] = useState<'dark' | 'light'>(
    () => (localStorage.getItem('nexus.theme') === 'dark' ? 'dark' : 'light')
  );
  const [density, setDensity] = useState<Density>(
    () => (localStorage.getItem('nexus.density') === 'compact' ? 'compact' : 'comfortable')
  );
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
    () => localStorage.getItem('nexus.sidebar') === 'collapsed'
  );
  const [selectedPlant, setSelectedPlant] = useState('Unidade Industrial 01');
  const [period, setPeriod] = useState<Period>('30d');
  const [criticality, setCriticality] = useState<CriticalityFilter>('ALL');

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
    localStorage.setItem('nexus.theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-density', density);
    localStorage.setItem('nexus.density', density);
  }, [density]);

  useEffect(() => {
    localStorage.setItem('nexus.sidebar', isSidebarCollapsed ? 'collapsed' : 'expanded');
  }, [isSidebarCollapsed]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Render view router based on selected module
  const renderView = () => {
    switch (currentModule) {
      case 'dashboards':
        return <DashboardView onNavigate={(mod) => setCurrentModule(mod)} criticality={criticality} />;
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
      {/* Navegação lateral agrupada */}
      <Sidebar
        currentModule={currentModule}
        onSelectModule={(mod) => setCurrentModule(mod)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        licenseResult={licenseResult}
      />

      {/* Main Content Area */}
      <div className={`main-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Header
          currentModule={currentModule}
          theme={theme}
          onToggleTheme={toggleTheme}
          density={density}
          onChangeDensity={setDensity}
          onOpenNewOrderModal={() => setCurrentModule('work-orders')}
          selectedPlant={selectedPlant}
          onSelectPlant={setSelectedPlant}
          period={period}
          onChangePeriod={setPeriod}
          criticality={criticality}
          onChangeCriticality={setCriticality}
        />

        {/* Alerta de licença irregular (estado crítico = vermelho sóbrio) */}
        {!licenseResult.valid && (
          <div className="notice" role="alert">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertTriangle size={18} />
              <span>{licenseResult.message}</span>
            </div>
            <button onClick={() => setCurrentModule('commercial-licensing')} className="btn btn-secondary btn-sm">
              <KeyRound size={14} /> Ativar chave válida
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
