import React, { useState } from 'react';
import {
  CalendarDays,
  Plus,
  Clock,
  Gauge,
  CheckCircle,
  Truck,
  RotateCcw,
  BarChart3,
  Users,
  Activity
} from 'lucide-react';
import { MaintenancePlan } from '../types';
import { INITIAL_PREVENTIVE_PLANS } from '../services/mockData';

export const MaintenancePlanningView: React.FC = () => {
  const [plans, setPlans] = useState<MaintenancePlan[]>(INITIAL_PREVENTIVE_PLANS);
  const [selectedPlan, setSelectedPlan] = useState<MaintenancePlan>(INITIAL_PREVENTIVE_PLANS[0]);

  // Gantt Timeline Simulation Rows
  const ganttTasks = [
    { name: 'OS-0481: Revisão Mancal Compressor', tech: 'Carlos E.', startCol: 1, span: 3, color: 'var(--accent-rose)' },
    { name: 'OS-0482: Preventiva Turbogerador', tech: 'Juliana V.', startCol: 3, span: 4, color: 'var(--accent-cyan)' },
    { name: 'OS-0479: Calibração Prensa 600t', tech: 'Renato F.', startCol: 2, span: 2, color: 'var(--accent-emerald)' },
    { name: 'PLN-03: Revisão 30.000km Frota 03', tech: 'Equipe Diesel', startCol: 5, span: 3, color: 'var(--accent-blue)' }
  ];

  const daysHeader = ['Seg 24/10', 'Ter 25/10', 'Qua 26/10', 'Qui 27/10', 'Sex 28/10', 'Sáb 29/10', 'Dom 30/10'];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <CalendarDays size={28} color="var(--accent-cyan)" />
            Planejamento Preventivo (RCM) & Cronograma Gantt
          </h1>
          <p className="page-subtitle">
            Estratégias disparadas por tempo, horímetro, odômetro, ciclos e condição monitorada com balanceamento de carga de trabalho.
          </p>
        </div>

        <button className="btn btn-primary">
          <Plus size={18} /> Criar Novo Plano Preventivo
        </button>
      </div>

      {/* Gantt Timeline Visualizer */}
      <div className="glass-card" style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={20} color="var(--accent-cyan)" />
              Linha do Tempo Visual das Intervenções (Gráfico de Gantt)
            </h2>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Programação semanal com verificação de conflitos de recursos e paradas operacionais
            </div>
          </div>
          <span className="badge badge-cyan">Semana 43 &bull; Outubro 2026</span>
        </div>

        {/* Gantt Grid */}
        <div style={{ overflowX: 'auto', background: 'var(--bg-canvas)', borderRadius: 'var(--radius-md)', padding: '16px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '220px repeat(7, 1fr)', gap: '8px', minWidth: '820px' }}>
            {/* Header row */}
            <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-muted)' }}>ORDEM / ATIVIDADE</div>
            {daysHeader.map((d, i) => (
              <div key={i} style={{ textAlign: 'center', fontWeight: 700, fontSize: '0.78rem', color: 'var(--text-secondary)', padding: '4px', background: 'var(--bg-surface-elevated)', borderRadius: '4px' }}>
                {d}
              </div>
            ))}

            {/* Task Rows */}
            {ganttTasks.map((t, idx) => (
              <React.Fragment key={idx}>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <span>{t.name}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.tech}</span>
                </div>

                <div
                  style={{
                    gridColumn: `${t.startCol + 1} / span ${t.span}`,
                    background: t.color,
                    borderRadius: '6px',
                    padding: '8px 12px',
                    fontSize: '0.75rem',
                    color: '#ffffff',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    boxShadow: 'var(--shadow-sm)',
                    margin: '4px 0'
                  }}
                >
                  {t.name}
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Preventive Strategy Plans Grid */}
      <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Clock size={20} color="var(--accent-cyan)" />
        Planos Preventivos Mestres e Gatilhos Configuráveis
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '22px' }}>
        {plans.map((plan) => (
          <div key={plan.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <span className="tag-mono">{plan.code}</span>
              <span className="badge badge-cyan">
                {plan.frequencyType === 'CALENDAR_DAYS' && `A cada ${plan.frequencyValue} dias`}
                {plan.frequencyType === 'RUN_HOURS' && `A cada ${plan.frequencyValue} horas`}
                {plan.frequencyType === 'ODOMETER_KM' && `A cada ${plan.frequencyValue.toLocaleString()} km`}
              </span>
            </div>

            <h3 style={{ fontSize: '1.05rem', marginBottom: '6px' }}>{plan.name}</h3>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Família: {plan.assetCategory} &bull; Duração Estimada: {plan.estimatedDurationHours}h
            </div>

            {/* Standard Procedures list */}
            <div style={{ background: 'var(--bg-canvas)', borderRadius: 'var(--radius-md)', padding: '12px', marginBottom: '16px', flex: 1 }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                Procedimentos Padrão Reutilizáveis:
              </div>
              <ul style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {plan.standardProcedures.map((proc, pIdx) => (
                  <li key={pIdx}>{proc}</li>
                ))}
              </ul>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', fontSize: '0.78rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>
                Próxima Execução: <strong>{plan.nextScheduled}</strong>
              </span>
              <button className="btn btn-secondary btn-sm">
                Disparar OS Agora
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
