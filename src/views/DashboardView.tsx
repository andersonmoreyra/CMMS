import React from 'react';
import {
  Gauge,
  Activity,
  AlertTriangle,
  Clock,
  DollarSign,
  TrendingUp,
  Cpu,
  Layers,
  Sparkles
} from 'lucide-react';
import { ModuleCategory } from '../types';
import {
  INITIAL_RELIABILITY_METRICS,
  INITIAL_ASSETS,
  INITIAL_WORK_ORDERS,
  INITIAL_IOT_SENSORS,
  INITIAL_OEE
} from '../services/mockData';

interface DashboardViewProps {
  onNavigate: (module: ModuleCategory) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const metrics = INITIAL_RELIABILITY_METRICS;
  const criticalAssets = INITIAL_ASSETS.filter((a) => a.criticality === 'A');
  const activeOrders = INITIAL_WORK_ORDERS.filter((o) => o.status !== 'COMPLETED' && o.status !== 'CANCELLED');
  const alertSensors = INITIAL_IOT_SENSORS.filter((s) => s.status !== 'NORMAL');

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Gauge size={28} color="var(--accent-cyan)" />
            Cockpit Executivo & Operacional da Manutenção
          </h1>
          <p className="page-subtitle">
            Visão consolidada em tempo real de confiabilidade, ordens de serviço, telemetria preditiva e indicadores OEE.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => onNavigate('work-orders')} className="btn btn-secondary btn-sm">
            Ver Todas as OS
          </button>
          <button onClick={() => onNavigate('ai-copilot')} className="btn btn-primary btn-sm">
            <Sparkles size={16} /> Assistente IA
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="kpi-grid">
        {/* MTBF */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span>MTBF (Tempo Médio Entre Falhas)</span>
            <Activity size={18} color="var(--accent-cyan)" />
          </div>
          <div className="kpi-value">
            {metrics.mtbfHours} <span className="kpi-unit">Horas</span>
          </div>
          <div className="kpi-footer">
            <TrendingUp size={14} color="var(--accent-emerald)" />
            <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>+8.4%</span>
            <span>vs média do mês anterior</span>
          </div>
        </div>

        {/* MTTR */}
        <div className="kpi-card emerald">
          <div className="kpi-header">
            <span>MTTR (Tempo Médio Para Reparo)</span>
            <Clock size={18} color="var(--accent-emerald)" />
          </div>
          <div className="kpi-value">
            {metrics.mttrHours} <span className="kpi-unit">Horas</span>
          </div>
          <div className="kpi-footer">
            <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>-12 min</span>
            <span>meta de atendimento atingida</span>
          </div>
        </div>

        {/* DISPONIBILIDADE GLOBAL */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span>Disponibilidade dos Ativos</span>
            <Gauge size={18} color="var(--accent-cyan)" />
          </div>
          <div className="kpi-value">
            {metrics.availabilityPercent}%
          </div>
          <div className="kpi-footer">
            <span className="pulse-indicator" />
            <span style={{ fontWeight: 600 }}>Classe Mundial (&gt;95%)</span>
          </div>
        </div>

        {/* OEE INDUSTRIAL */}
        <div className="kpi-card amber">
          <div className="kpi-header">
            <span>OEE Global das Linhas</span>
            <Layers size={18} color="var(--accent-amber)" />
          </div>
          <div className="kpi-value">
            {INITIAL_OEE[0].oee}%
          </div>
          <div className="kpi-footer">
            <span>Disponibilidade x Desempenho x Qualidade</span>
          </div>
        </div>

        {/* BACKLOG */}
        <div className="kpi-card rose">
          <div className="kpi-header">
            <span>Backlog de Manutenção</span>
            <AlertTriangle size={18} color="var(--accent-rose)" />
          </div>
          <div className="kpi-value">
            142 <span className="kpi-unit">Horas</span>
          </div>
          <div className="kpi-footer">
            <span style={{ color: 'var(--accent-amber)' }}>18 Ordens Críticas Pendentes</span>
          </div>
        </div>
      </div>

      {/* Grid: Live Predictive Alerts & Critical Work Orders */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '24px', marginBottom: '28px' }}>
        
        {/* Predictive AI IoT Alerts */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="pulse-indicator critical" />
              <h2 style={{ fontSize: '1.15rem' }}>Alertas Preditivos de Sensores IoT</h2>
            </div>
            <button onClick={() => onNavigate('iot-condition')} className="btn btn-secondary btn-sm">
              Ver Telemetria Completa
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {alertSensors.map((sensor) => (
              <div
                key={sensor.id}
                style={{
                  background: 'var(--bg-canvas)',
                  border: '1px solid rgba(244, 63, 94, 0.4)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '16px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="tag-mono">{sensor.assetTag}</span>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                      {sensor.sensorType} Anômalo: {sensor.currentValue} {sensor.unit}
                    </span>
                    <span className="badge badge-rose">CRÍTICO</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Limite máximo tolerado: {sensor.criticalThreshold} {sensor.unit}. IA estima falha em até {sensor.predictedFailureDays} dias!
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('work-orders')}
                  className="btn btn-primary btn-sm"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  Abrir OS Imediata
                </button>
              </div>
            ))}

            <div
              style={{
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Cpu size={18} color="var(--accent-cyan)" />
                <span style={{ fontSize: '0.86rem' }}>
                  <strong>32 sensores industriais conectados</strong> via protocolo MQTT / OPC-UA transmitindo a cada 1000ms.
                </span>
              </div>
              <span className="badge badge-emerald">Online</span>
            </div>
          </div>
        </div>

        {/* Real-time Work Orders Status */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.15rem' }}>Ordens de Serviço em Andamento</h2>
            <button onClick={() => onNavigate('work-orders')} className="btn btn-secondary btn-sm">
              Abrir Quadro Kanban
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {activeOrders.map((wo) => (
              <div
                key={wo.id}
                style={{
                  background: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="tag-mono">{wo.code}</span>
                    <span className={`badge ${wo.priority === 'CRITICAL' ? 'badge-rose' : 'badge-amber'}`}>
                      {wo.priority}
                    </span>
                    <span className="badge badge-cyan">{wo.status}</span>
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, marginTop: '4px' }}>
                    {wo.title}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Ativo: {wo.assetTag} - {wo.assetName} &bull; Técnico: {wo.assignedTechnician}
                  </div>
                </div>

                <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                    {wo.realHours}h / {wo.estimatedHours}h
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Previsto: {wo.scheduledDate}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Critical Assets Table Snapshot */}
      <div className="table-wrapper">
        <div className="table-header-tools">
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Parque de Ativos Críticos (Criticidade A)</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Máquinas cujo travamento interrompe 100% da linha de produção fabril.
            </p>
          </div>
          <button onClick={() => onNavigate('assets')} className="btn btn-secondary btn-sm">
            Gerenciar Todos os Ativos
          </button>
        </div>

        <table className="custom-table">
          <thead>
            <tr>
              <th>TAG</th>
              <th>Equipamento</th>
              <th>Localização / Linha</th>
              <th>Condição de Saúde</th>
              <th>Status</th>
              <th>Custo Manutenção</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {criticalAssets.map((asset) => (
              <tr key={asset.id}>
                <td><span className="tag-mono">{asset.tag}</span></td>
                <td>
                  <div style={{ fontWeight: 600 }}>{asset.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{asset.manufacturer} - {asset.model}</div>
                </td>
                <td>{asset.plant} &bull; {asset.area}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '80px', height: '8px', background: 'var(--bg-canvas)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${asset.healthScore}%`,
                          height: '100%',
                          background: asset.healthScore > 80 ? 'var(--accent-emerald)' : 'var(--accent-amber)'
                        }}
                      />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{asset.healthScore}%</span>
                  </div>
                </td>
                <td>
                  <span className={`badge ${asset.status === 'OPERATIONAL' ? 'badge-emerald' : 'badge-amber'}`}>
                    {asset.status === 'OPERATIONAL' ? 'Operando' : 'Em Manutenção'}
                  </span>
                </td>
                <td style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>
                  R$ {asset.totalMaintenanceCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td>
                  <button onClick={() => onNavigate('assets')} className="btn btn-secondary btn-sm">
                    Ficha Técnica
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
