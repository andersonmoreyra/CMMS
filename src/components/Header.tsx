import React from 'react';
import { Building2, CalendarRange, Flag, Moon, Plus, Sun } from 'lucide-react';
import type { ModuleCategory } from '../types';
import { findNav } from './navConfig';

export type Period = '7d' | '30d' | '90d' | '12m';
export type CriticalityFilter = 'ALL' | 'A' | 'B' | 'C';
export type Density = 'comfortable' | 'compact';

interface HeaderProps {
  currentModule: ModuleCategory;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  density: Density;
  onChangeDensity: (d: Density) => void;
  onOpenNewOrderModal: () => void;
  selectedPlant: string;
  onSelectPlant: (plant: string) => void;
  period: Period;
  onChangePeriod: (p: Period) => void;
  criticality: CriticalityFilter;
  onChangeCriticality: (c: CriticalityFilter) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentModule, theme, onToggleTheme, density, onChangeDensity, onOpenNewOrderModal,
  selectedPlant, onSelectPlant, period, onChangePeriod, criticality, onChangeCriticality,
}) => {
  const nav = findNav(currentModule);

  return (
    <header className="topbar">
      <div style={{ minWidth: 0 }}>
        <div className="topbar-crumb">{nav?.group.label ?? 'Nexus CMMS'}</div>
        <h1 className="topbar-title">{nav?.item.title ?? 'Visão Geral'}</h1>
      </div>

      <div className="topbar-right">
        <label className="filter-field" title="Planta">
          <Building2 size={15} />
          <select aria-label="Planta" value={selectedPlant} onChange={(e) => onSelectPlant(e.target.value)}>
            <option value="Unidade Industrial 01">Planta 01 · Matriz SP</option>
            <option value="Unidade Industrial 02">Planta 02 · Joinville SC</option>
            <option value="Unidade Industrial 03">Planta 03 · Camaçari BA</option>
          </select>
        </label>
        <label className="filter-field" title="Período">
          <CalendarRange size={15} />
          <select aria-label="Período" value={period} onChange={(e) => onChangePeriod(e.target.value as Period)}>
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
            <option value="12m">Últimos 12 meses</option>
          </select>
        </label>
        <label className="filter-field" title="Nível de criticidade">
          <Flag size={15} />
          <select
            aria-label="Criticidade"
            value={criticality}
            onChange={(e) => onChangeCriticality(e.target.value as CriticalityFilter)}
          >
            <option value="ALL">Todas as criticidades</option>
            <option value="A">Criticidade A</option>
            <option value="B">Criticidade B</option>
            <option value="C">Criticidade C</option>
          </select>
        </label>

        <div className="topbar-divider" />

        <div className="seg" role="group" aria-label="Densidade">
          <button aria-pressed={density === 'comfortable'} onClick={() => onChangeDensity('comfortable')}>Confortável</button>
          <button aria-pressed={density === 'compact'} onClick={() => onChangeDensity('compact')}>Compacto</button>
        </div>

        <button
          className="btn btn-secondary btn-icon"
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Tema claro' : 'Modo noturno'}
          title={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para modo noturno'}
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        <button id="btn-nova-os" className="btn btn-primary" onClick={onOpenNewOrderModal}>
          <Plus size={16} /> Nova OS
        </button>
      </div>
    </header>
  );
};
