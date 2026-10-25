import React from 'react';
import {
  Boxes,
  Wrench,
  CalendarDays,
  Smartphone,
  Gauge,
  Activity,
  ClipboardCheck,
  Package,
  ShoppingCart,
  Users,
  ShieldAlert,
  Flame,
  DollarSign,
  BarChart3,
  Bot,
  Zap,
  Cpu,
  FileText,
  HelpCircle,
  Truck,
  Leaf,
  Layers,
  KeyRound,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { ModuleCategory, LicenseValidationResult } from '../types';

interface SidebarProps {
  currentModule: ModuleCategory;
  onSelectModule: (module: ModuleCategory) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  licenseResult: LicenseValidationResult;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentModule,
  onSelectModule,
  isCollapsed,
  onToggleCollapse,
  licenseResult
}) => {
  const clusters = [
    {
      title: 'Ativos & Operações',
      items: [
        { id: 'assets', label: '1. Ativos & Hierarquia', icon: Boxes },
        { id: 'specialized', label: '21. Frotas & Facilities', icon: Truck },
        { id: 'operations-oee', label: '20. Operações & OEE', icon: Layers },
        { id: 'energy', label: '22. Energia & Eco', icon: Leaf },
      ]
    },
    {
      title: 'Manutenção & Execução',
      items: [
        { id: 'work-orders', label: '2. Ordens de Serviço', icon: Wrench },
        { id: 'planning', label: '3. Planos & RCM', icon: CalendarDays },
        { id: 'scheduling', label: '4. Programação & Gantt', icon: BarChart3 },
        { id: 'mobile', label: '5. Técnico Móvel (PWA)', icon: Smartphone },
      ]
    },
    {
      title: 'Confiabilidade & Preditiva',
      items: [
        { id: 'iot-condition', label: '8. IoT & Telemetria', icon: Activity },
        { id: 'reliability', label: '7. Falhas & FMEA/MTBF', icon: Gauge },
        { id: 'inspections', label: '6. Inspeções & Calibração', icon: ClipboardCheck },
      ]
    },
    {
      title: 'Suprimentos & Finanças',
      items: [
        { id: 'inventory', label: '9. Almoxarifado MRO', icon: Package },
        { id: 'purchasing', label: '10. Compras & Contratos', icon: ShoppingCart },
        { id: 'costs', label: '14. Custos & TCO', icon: DollarSign },
      ]
    },
    {
      title: 'Segurança & Equipes',
      items: [
        { id: 'safety', label: '12. Segurança & LOTO', icon: ShieldAlert },
        { id: 'team', label: '11. Equipes & Mão de Obra', icon: Users },
        { id: 'turnaround', label: '13. Paradas de Fábrica', icon: Flame },
      ]
    },
    {
      title: 'Inteligência & Licenciamento',
      items: [
        { id: 'dashboards', label: '15. Indicadores & BI', icon: BarChart3 },
        { id: 'ai-copilot', label: '24. IA Copilot Industrial', icon: Bot },
        { id: 'automations', label: '16. Automações & Fluxos', icon: Zap },
        { id: 'integrations', label: '17. Integrações & APIs', icon: Cpu },
        { id: 'documents', label: '19. Manuais & POPs', icon: FileText },
        { id: 'helpdesk', label: '23. Portal de Chamados', icon: HelpCircle },
        { id: 'commercial-licensing', label: '🔐 Segurança & Licenças', icon: KeyRound, isHighlight: true },
      ]
    }
  ];

  return (
    <aside
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: isCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
        backgroundColor: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        overflowY: 'auto',
        overflowX: 'hidden'
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          height: 'var(--header-height)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          padding: isCollapsed ? '0' : '0 20px',
          borderBottom: '1px solid var(--border-subtle)',
          flexShrink: 0
        }}
      >
        {!isCollapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(6, 182, 212, 0.4)'
              }}
            >
              <Cpu size={20} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em' }}>
                NEXUS <span style={{ color: 'var(--accent-cyan)' }}>CMMS</span>
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                EAM Enterprise v4.8
              </div>
            </div>
          </div>
        )}

        {isCollapsed && (
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Cpu size={22} color="#ffffff" />
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="btn btn-secondary"
          style={{
            padding: '6px',
            borderRadius: '8px',
            display: isCollapsed ? 'none' : 'flex'
          }}
          title={isCollapsed ? 'Expandir Menu' : 'Recolher Menu'}
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      {/* Commercial License Status Tag */}
      <div
        style={{
          padding: isCollapsed ? '12px 8px' : '12px 18px',
          borderBottom: '1px solid var(--border-subtle)',
          background: licenseResult.valid ? 'rgba(16, 185, 129, 0.05)' : 'rgba(244, 63, 94, 0.08)',
          cursor: 'pointer'
        }}
        onClick={() => onSelectModule('commercial-licensing')}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
          {licenseResult.valid ? (
            <ShieldCheck size={18} color="var(--accent-emerald)" />
          ) : (
            <AlertTriangle size={18} color="var(--accent-rose)" />
          )}
          {!isCollapsed && (
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: licenseResult.valid ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                {licenseResult.valid ? 'Licença Comercial Ativa' : 'Proteção Ativada'}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {licenseResult.license?.clientName || 'Verificar Segurança'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Groups */}
      <div style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {clusters.map((cluster, cIdx) => (
          <div key={cIdx}>
            {!isCollapsed && (
              <div
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--text-muted)',
                  padding: '0 8px 6px 8px'
                }}
              >
                {cluster.title}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {cluster.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentModule === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectModule(item.id as ModuleCategory)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: isCollapsed ? '12px' : '9px 12px',
                      borderRadius: 'var(--radius-md)',
                      background: isActive
                        ? 'linear-gradient(90deg, rgba(6, 182, 212, 0.18), rgba(59, 130, 246, 0.12))'
                        : item.isHighlight
                        ? 'rgba(245, 158, 11, 0.08)'
                        : 'transparent',
                      border: isActive
                        ? '1px solid rgba(6, 182, 212, 0.35)'
                        : item.isHighlight
                        ? '1px dashed rgba(245, 158, 11, 0.35)'
                        : '1px solid transparent',
                      color: isActive
                        ? 'var(--accent-cyan)'
                        : item.isHighlight
                        ? 'var(--accent-amber)'
                        : 'var(--text-secondary)',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                      justifyContent: isCollapsed ? 'center' : 'flex-start',
                      transition: 'all 0.18s ease'
                    }}
                    title={item.label}
                  >
                    <Icon size={18} style={{ flexShrink: 0 }} />
                    {!isCollapsed && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Collapse Toggle Footer when collapsed */}
      {isCollapsed && (
        <div style={{ padding: '12px', textAlign: 'center', borderTop: '1px solid var(--border-subtle)' }}>
          <button
            onClick={onToggleCollapse}
            className="btn btn-secondary"
            style={{ padding: '8px', width: '100%' }}
            title="Expandir Menu"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </aside>
  );
};
