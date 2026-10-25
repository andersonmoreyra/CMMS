import React, { useEffect, useRef, useState } from 'react';
import {
  Activity, AlertTriangle, ArrowDownRight, ArrowUpRight, Clock, Gauge, Layers,
  MoreHorizontal, Plus, Sparkles, Wrench,
} from 'lucide-react';
import type { ModuleCategory, AssetStatus, OrderPriority, OrderStatus } from '../types';
import {
  INITIAL_RELIABILITY_METRICS,
  INITIAL_ASSETS,
  INITIAL_WORK_ORDERS,
  INITIAL_IOT_SENSORS,
  INITIAL_OEE,
} from '../services/mockData';
import type { CriticalityFilter } from '../components/Header';

interface DashboardViewProps {
  onNavigate: (module: ModuleCategory) => void;
  criticality?: CriticalityFilter;
}

const ASSET_STATUS: Record<AssetStatus, { label: string; chip: string }> = {
  OPERATIONAL: { label: 'Operando', chip: 'chip-ok' },
  IN_MAINTENANCE: { label: 'Manutenção', chip: 'chip-warn' },
  STANDBY: { label: 'Em espera', chip: 'chip-neutral' },
  QUARANTINE: { label: 'Parado', chip: 'chip-danger' },
  DECOMMISSIONED: { label: 'Desativado', chip: 'chip-neutral' },
};

const ORDER_STATUS: Record<OrderStatus, string> = {
  REQUESTED: 'Solicitada',
  TRIAGED: 'Triada',
  SCHEDULED: 'Programada',
  IN_PROGRESS: 'Em execução',
  WAITING_PARTS: 'Aguard. peças',
  WAITING_VALIDATION: 'Aguard. validação',
  COMPLETED: 'Concluída',
  CANCELLED: 'Cancelada',
};

const PRIORITY: Record<OrderPriority, { label: string; chip: string }> = {
  CRITICAL: { label: 'Crítica', chip: 'chip-danger' },
  HIGH: { label: 'Alta', chip: 'chip-warn' },
  MEDIUM: { label: 'Média', chip: 'chip-neutral' },
  LOW: { label: 'Baixa', chip: 'chip-neutral' },
};

interface KpiProps {
  label: string;
  value: React.ReactNode;
  unit?: string;
  icon: React.ReactNode;
  delta?: { text: string; direction: 'up' | 'down'; good: boolean };
  hint: string;
}

// Card de KPI: valor grande + variação contextual. Cor só no delta (estado).
const Kpi: React.FC<KpiProps> = ({ label, value, unit, icon, delta, hint }) => (
  <div className="kpi-card">
    <div className="kpi-header">
      <span>{label}</span>
      {icon}
    </div>
    <div className="kpi-value">
      {typeof value === 'number' ? value.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) : value}
      {unit && <span className="kpi-unit">{unit}</span>}
    </div>
    <div className="kpi-footer">
      {delta && (
        <span className={`delta ${delta.good ? 'good' : 'bad'}`}>
          {delta.direction === 'up' ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
          {delta.text}
        </span>
      )}
      <span>{hint}</span>
    </div>
  </div>
);

// Menu de contexto "···" da linha da tabela
const RowMenu: React.FC<{ actions: { label: string; onClick: () => void }[] }> = ({ actions }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <div className="row-menu" ref={ref}>
      <button
        className="btn btn-ghost btn-icon"
        aria-label="Mais ações"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <MoreHorizontal size={17} />
      </button>
      {open && (
        <div className="row-menu-pop" role="menu">
          {actions.map((a) => (
            <button key={a.label} role="menuitem" onClick={() => { setOpen(false); a.onClick(); }}>
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, criticality = 'ALL' }) => {
  const metrics = INITIAL_RELIABILITY_METRICS;
  const assets = INITIAL_ASSETS.filter((a) => (criticality === 'ALL' ? a.criticality === 'A' : a.criticality === criticality));
  const activeOrders = INITIAL_WORK_ORDERS.filter((o) => o.status !== 'COMPLETED' && o.status !== 'CANCELLED');
  const alertSensors = INITIAL_IOT_SENSORS.filter((s) => s.status !== 'NORMAL');

  const backlogHours = Math.round(
    activeOrders.reduce((sum, o) => sum + Math.max(o.estimatedHours - o.realHours, 0), 0)
  );
  const criticalPending = activeOrders.filter((o) => o.priority === 'CRITICAL').length;
  const tableTitle = criticality === 'ALL' ? 'Ativos críticos (criticidade A)' : `Ativos de criticidade ${criticality}`;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Cockpit executivo e operacional</h2>
          <p className="page-subtitle">
            Confiabilidade, ordens de serviço, alertas preditivos e OEE em uma única visão.
          </p>
        </div>
        <button onClick={() => onNavigate('ai-copilot')} className="btn btn-secondary">
          <Sparkles size={16} /> Assistente IA
        </button>
      </div>

      {/* KPIs */}
      <div className="kpi-grid">
        <Kpi
          label="MTBF"
          value={metrics.mtbfHours}
          unit="h"
          icon={<Activity size={18} />}
          delta={{ text: '8,4%', direction: 'up', good: true }}
          hint="vs. mês anterior"
        />
        <Kpi
          label="MTTR"
          value={metrics.mttrHours}
          unit="h"
          icon={<Clock size={18} />}
          delta={{ text: '12 min', direction: 'down', good: true }}
          hint="meta de atendimento atingida"
        />
        <Kpi
          label="Disponibilidade"
          value={metrics.availabilityPercent}
          unit="%"
          icon={<Gauge size={18} />}
          hint="meta classe mundial: > 95%"
        />
        <Kpi
          label="OEE global"
          value={INITIAL_OEE[0].oee}
          unit="%"
          icon={<Layers size={18} />}
          hint="disp. × desempenho × qualidade"
        />
        <Kpi
          label="Backlog"
          value={backlogHours}
          unit="h"
          icon={<AlertTriangle size={18} />}
          delta={criticalPending > 0 ? { text: `${criticalPending} crítica${criticalPending > 1 ? 's' : ''}`, direction: 'up', good: false } : undefined}
          hint={`${activeOrders.length} OS em aberto`}
        />
      </div>

      {/* Split view: alertas preditivos | OS ativas */}
      <div className="split-grid">
        <section className="glass-card" aria-labelledby="h-alertas">
          <div className="panel-head">
            <div>
              <h3 id="h-alertas" className="panel-title">
                <span className="pulse-indicator critical" /> Alertas preditivos
              </h3>
              <p className="panel-sub">Telemetria IoT com previsão de falha</p>
            </div>
            <button onClick={() => onNavigate('iot-condition')} className="btn btn-ghost btn-sm">Ver telemetria</button>
          </div>

          <div className="stack">
            {alertSensors.length === 0 && <p className="panel-sub">Nenhum sensor em alerta.</p>}
            {alertSensors.map((sensor) => {
              const critical = sensor.status === 'CRITICAL';
              return (
                <article key={sensor.id} className={`alert-card ${critical ? 'sev-critical' : 'sev-warning'}`}>
                  <div style={{ minWidth: 0 }}>
                    <div className="alert-meta">
                      <span className={`badge ${critical ? 'chip-danger' : 'chip-warn'}`}>{critical ? 'Crítico' : 'Atenção'}</span>
                      <span className="tag-mono">{sensor.assetTag}</span>
                    </div>
                    <div className="alert-title">
                      {sensor.sensorType}: {sensor.currentValue} {sensor.unit}
                    </div>
                    <div className="alert-desc">
                      Limite crítico {sensor.criticalThreshold} {sensor.unit}. Falha estimada em até{' '}
                      <strong>{sensor.predictedFailureDays} dias</strong>.
                    </div>
                  </div>
                  <button onClick={() => onNavigate('work-orders')} className="btn btn-primary btn-sm" style={{ whiteSpace: 'nowrap' }}>
                    <Plus size={14} /> Abrir OS
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        <section className="glass-card" aria-labelledby="h-os">
          <div className="panel-head">
            <div>
              <h3 id="h-os" className="panel-title"><Wrench size={16} /> Ordens de serviço ativas</h3>
              <p className="panel-sub">{activeOrders.length} em andamento</p>
            </div>
            <button onClick={() => onNavigate('work-orders')} className="btn btn-ghost btn-sm">Ver todas</button>
          </div>

          <div className="stack">
            {activeOrders.map((wo) => {
              const pct = wo.estimatedHours > 0 ? Math.min(100, Math.round((wo.realHours / wo.estimatedHours) * 100)) : 0;
              const over = wo.realHours > wo.estimatedHours;
              const pr = PRIORITY[wo.priority];
              return (
                <article key={wo.id} className="wo-row">
                  <div className="wo-row-top">
                    <div style={{ minWidth: 0 }}>
                      <div className="alert-meta" style={{ marginBottom: 6 }}>
                        <span className="tag-mono">{wo.code}</span>
                        <span className={`badge ${pr.chip}`}>{pr.label}</span>
                        <span className="badge chip-neutral">{ORDER_STATUS[wo.status]}</span>
                      </div>
                      <div className="wo-title">{wo.title}</div>
                      <div className="wo-sub">{wo.assetTag} · {wo.assetName} · {wo.assignedTechnician}</div>
                    </div>
                    <div className="wo-due">
                      Prazo<br />
                      <strong>{wo.scheduledDate}</strong>
                    </div>
                  </div>
                  <div className="progress-line">
                    <div className="progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                      <span className={over ? 'over' : ''} style={{ width: `${pct}%` }} />
                    </div>
                    <span>{wo.realHours}h / {wo.estimatedHours}h</span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>

      {/* Tabela de ativos */}
      <section className="table-wrapper" aria-labelledby="h-ativos">
        <div className="table-header-tools">
          <div>
            <h3 id="h-ativos" className="panel-title">{tableTitle}</h3>
            <p className="panel-sub">Equipamentos cuja parada impacta diretamente a produção.</p>
          </div>
          <button onClick={() => onNavigate('assets')} className="btn btn-secondary btn-sm">Todos os ativos</button>
        </div>

        <table className="custom-table">
          <thead>
            <tr>
              <th>TAG</th>
              <th>Equipamento</th>
              <th>Localização</th>
              <th>Saúde</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Custo de manutenção</th>
              <th aria-label="Ações" />
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => {
              const st = ASSET_STATUS[asset.status];
              const tone = asset.healthScore >= 80 ? 'ok' : asset.healthScore >= 60 ? 'warn' : 'bad';
              return (
                <tr key={asset.id}>
                  <td><span className="tag-mono">{asset.tag}</span></td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{asset.name}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{asset.manufacturer} · {asset.model}</div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{asset.plant} · {asset.area}</td>
                  <td>
                    <div className="health">
                      <div className="progress" role="progressbar" aria-valuenow={asset.healthScore} aria-valuemin={0} aria-valuemax={100}>
                        <span className={tone} style={{ width: `${asset.healthScore}%` }} />
                      </div>
                      <b>{asset.healthScore}%</b>
                    </div>
                  </td>
                  <td><span className={`badge chip-dot ${st.chip}`}>{st.label}</span></td>
                  <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                    R$ {asset.totalMaintenanceCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <RowMenu
                      actions={[
                        { label: 'Ver detalhes', onClick: () => onNavigate('assets') },
                        { label: 'Abrir OS', onClick: () => onNavigate('work-orders') },
                        { label: 'Ver telemetria', onClick: () => onNavigate('iot-condition') },
                      ]}
                    />
                  </td>
                </tr>
              );
            })}
            {assets.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 28 }}>
                Nenhum ativo com este filtro de criticidade.
              </td></tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
};
