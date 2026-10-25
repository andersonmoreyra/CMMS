import React, { useState } from 'react';
import { ChevronDown, ChevronsLeft, ChevronsRight, Cpu, LogOut, ShieldAlert, ShieldCheck } from 'lucide-react';
import type { ModuleCategory, LicenseValidationResult } from '../types';
import { NAV_GROUPS, findNav } from './navConfig';
import { useAuth } from '../services/AuthContext';

interface SidebarProps {
  currentModule: ModuleCategory;
  onSelectModule: (module: ModuleCategory) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  licenseResult: LicenseValidationResult;
}

const ROLE_LABEL: Record<string, string> = {
  ADMIN: 'Administrador', MANAGER: 'Gestor', PLANNER: 'Planejador',
  TECHNICIAN: 'Técnico', REQUESTER: 'Solicitante', VIEWER: 'Leitor',
};

export const Sidebar: React.FC<SidebarProps> = ({
  currentModule, onSelectModule, isCollapsed, onToggleCollapse, licenseResult,
}) => {
  const { user, logout } = useAuth();
  const activeGroup = findNav(currentModule)?.group.id;
  // O grupo do módulo ativo começa aberto; os demais podem ser expandidos/recolhidos
  const [closed, setClosed] = useState<Record<string, boolean>>({ plataforma: true });

  const toggleGroup = (id: string) => setClosed((c) => ({ ...c, [id]: !c[id] }));
  const initials = (user?.name || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

  return (
    <aside className={`sb ${isCollapsed ? 'collapsed' : ''}`} aria-label="Navegação principal">
      <div className="sb-brand">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <div className="sb-logo"><Cpu size={18} /></div>
          <div className="sb-brand-text">
            <div className="sb-brand-name">Nexus CMMS</div>
            <div className="sb-brand-sub">Gestão de Manutenção</div>
          </div>
        </div>
        {!isCollapsed && (
          <button className="btn btn-ghost btn-icon" onClick={onToggleCollapse} aria-label="Recolher menu" title="Recolher menu">
            <ChevronsLeft size={16} />
          </button>
        )}
      </div>

      <nav className="sb-nav">
        {NAV_GROUPS.map((group, idx) => {
          const isOpen = isCollapsed || !closed[group.id] || group.id === activeGroup;
          return (
            <div key={group.id}>
              {isCollapsed && idx > 0 && <div className="sb-sep" />}
              <button
                className="sb-group-btn"
                aria-expanded={isOpen}
                onClick={() => toggleGroup(group.id)}
              >
                {group.label}
                <ChevronDown size={14} />
              </button>
              {isOpen && (
                <div className="sb-items">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = currentModule === item.id;
                    return (
                      <button
                        key={item.id}
                        className={`sb-item ${active ? 'active' : ''}`}
                        data-tip={item.label}
                        aria-current={active ? 'page' : undefined}
                        onClick={() => onSelectModule(item.id)}
                      >
                        <Icon size={18} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="sb-footer">
        <button
          className="sb-item"
          data-tip={licenseResult.valid ? 'Licença ativa' : 'Licença irregular'}
          onClick={() => onSelectModule('commercial-licensing')}
          title="Licenciamento"
        >
          {licenseResult.valid
            ? <ShieldCheck size={18} color="var(--accent-emerald)" />
            : <ShieldAlert size={18} color="var(--accent-rose)" />}
          <span style={{ color: licenseResult.valid ? undefined : 'var(--accent-rose)' }}>
            {licenseResult.valid ? `Licença ativa · ${licenseResult.daysRemaining}d` : 'Licença irregular'}
          </span>
        </button>

        <div className="sb-user">
          <div className="sb-avatar" title={user?.name}>{initials}</div>
          {!isCollapsed && (
            <>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="sb-user-name">{user?.name}</div>
                <div className="sb-user-role">{user ? ROLE_LABEL[user.role] ?? user.role : ''}</div>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={logout} aria-label="Sair" title="Sair">
                <LogOut size={16} />
              </button>
            </>
          )}
        </div>

        {isCollapsed && (
          <>
            <button className="sb-item" data-tip="Sair" onClick={logout} aria-label="Sair"><LogOut size={18} /></button>
            <button className="sb-item" data-tip="Expandir menu" onClick={onToggleCollapse} aria-label="Expandir menu">
              <ChevronsRight size={18} />
            </button>
          </>
        )}
      </div>
    </aside>
  );
};
