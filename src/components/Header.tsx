import React from 'react';
import {
  Search,
  PlusCircle,
  Sun,
  Moon,
  Building2,
  KeyRound,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { ModuleCategory, LicenseValidationResult } from '../types';

interface HeaderProps {
  currentModule: ModuleCategory;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenNewOrderModal: () => void;
  onOpenLicenseModal: () => void;
  licenseResult: LicenseValidationResult;
  selectedPlant: string;
  onSelectPlant: (plant: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentModule,
  theme,
  onToggleTheme,
  onOpenNewOrderModal,
  onOpenLicenseModal,
  licenseResult,
  selectedPlant,
  onSelectPlant
}) => {
  const getModuleTitle = (mod: ModuleCategory) => {
    switch (mod) {
      case 'assets': return 'Gestão e Cadastro de Ativos Industriais';
      case 'work-orders': return 'Gestão de Solicitações e Ordens de Serviço (OS)';
      case 'planning': return 'Planejamento e Estratégias de Manutenção (RCM)';
      case 'scheduling': return 'Programação, Escalonamento e Gráfico de Gantt';
      case 'mobile': return 'Execução Móvel dos Serviços (PWA Técnico)';
      case 'inspections': return 'Inspeções, Medições e Calibração Metrológica';
      case 'reliability': return 'Engenharia de Confiabilidade (MTBF, MTTR, FMEA)';
      case 'iot-condition': return 'Monitoramento Preditivo e Telemetria IoT em Tempo Real';
      case 'inventory': return 'Gestão de Estoque, Almoxarifado e Peças MRO';
      case 'purchasing': return 'Compras, Fornecedores e Gestão de Contratos';
      case 'team': return 'Gestão de Equipes, Mão de Obra e Produtividade';
      case 'safety': return 'Segurança do Trabalho, LOTO e Permissões (PT/APR)';
      case 'turnaround': return 'Paradas Industriais, Turnaround e Projetos';
      case 'costs': return 'Custos, Orçamentos e TCO do Ciclo de Vida';
      case 'dashboards': return 'Cockpit Gerencial de Manutenção e BI';
      case 'automations': return 'Automação de Processos e Workflows Industriais';
      case 'integrations': return 'Integrações com ERP, SCADA, PLCs e APIs REST';
      case 'documents': return 'Gestão Documental, Desenhos e Manuais Técnicos';
      case 'operations-oee': return 'Operações Industriais, Paradas e Indicador OEE';
      case 'specialized': return 'Gestão de Frotas, Facilities e Ferramentaria';
      case 'energy': return 'Gestão de Energia, Sustentabilidade e Carbono';
      case 'helpdesk': return 'Portal de Autoatendimento e Chamados com SLA';
      case 'ai-copilot': return 'Assistente Copilot de Inteligência Artificial Industrial';
      case 'commercial-licensing': return 'Proteção Comercial & Sistema Anti-Cópia / Gerador de Licenças';
      default: return 'Visão Geral';
    }
  };

  return (
    <header
      style={{
        height: 'var(--header-height)',
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        position: 'sticky',
        top: 0,
        zIndex: 90,
        backdropFilter: 'blur(8px)'
      }}
    >
      {/* Left: Breadcrumbs / Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            NEXUS EAM &bull; Enterprise 2026
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {getModuleTitle(currentModule)}
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Plant Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-canvas)', padding: '6px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <Building2 size={16} color="var(--accent-cyan)" />
          <select
            value={selectedPlant}
            onChange={(e) => onSelectPlant(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.82rem',
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="Unidade Industrial 01">Planta 01 - Matriz SP</option>
            <option value="Unidade Industrial 02">Planta 02 - Joinville SC</option>
            <option value="Unidade Industrial 03">Planta 03 - Camaçari BA</option>
          </select>
        </div>

        {/* Commercial License Status Button */}
        <button
          onClick={onOpenLicenseModal}
          className="btn btn-secondary btn-sm"
          style={{
            borderColor: licenseResult.valid ? 'rgba(16, 185, 129, 0.4)' : 'rgba(244, 63, 94, 0.4)',
            background: licenseResult.valid ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)'
          }}
          title="Verificar Chave Comercial e Sistema Anti-Cópia"
        >
          {licenseResult.valid ? (
            <>
              <ShieldCheck size={15} color="var(--accent-emerald)" />
              <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>
                Licença: {licenseResult.daysRemaining}d
              </span>
            </>
          ) : (
            <>
              <AlertTriangle size={15} color="var(--accent-rose)" />
              <span style={{ color: 'var(--accent-rose)', fontWeight: 700 }}>
                Licença Irregular
              </span>
            </>
          )}
        </button>

        {/* Quick Action: New Work Order */}
        <button
          onClick={onOpenNewOrderModal}
          className="btn btn-primary btn-sm"
        >
          <PlusCircle size={16} />
          <span>+ Nova OS</span>
        </button>

        {/* Theme Switcher */}
        <button
          onClick={onToggleTheme}
          className="btn btn-secondary btn-sm"
          style={{ padding: '8px' }}
          title={theme === 'dark' ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro'}
        >
          {theme === 'dark' ? <Sun size={17} color="var(--accent-amber)" /> : <Moon size={17} />}
        </button>
      </div>
    </header>
  );
};
