import React, { useState } from 'react';
import {
  Gauge,
  TrendingDown,
  Activity,
  AlertTriangle,
  Layers,
  FileQuestion,
  HelpCircle,
  Plus,
  CheckCircle2,
  Sliders
} from 'lucide-react';
import { FMEARow, ReliabilityMetrics } from '../types';
import { INITIAL_FMEA, INITIAL_RELIABILITY_METRICS } from '../services/mockData';

export const ReliabilityFMEAView: React.FC = () => {
  const [fmeaRows, setFmeaRows] = useState<FMEARow[]>(INITIAL_FMEA);
  const [metrics, setMetrics] = useState<ReliabilityMetrics>(INITIAL_RELIABILITY_METRICS);

  // 5-Whys Interactive Tool state
  const [whyProblem, setWhyProblem] = useState('Parada repentina do compressor por sobretemperatura');
  const [whys, setWhys] = useState([
    'Por que parou? O pressostato diferencial de óleo desarmou o motor.',
    'Por que o pressostato desarmou? A viscosidade do lubrificante caiu abaixo do limite seguro.',
    'Por que a viscosidade caiu? O radiador ar/óleo estava entupido de poeira de britagem.',
    'Por que estava entupido? Os filtros de ar da sala de compressores não foram trocados na data.',
    'Causa Raiz (5º Porquê): Falha no plano preventivo do ambiente de utilidades. Ação: Ajustar frequência de troca de filtros de 90 para 30 dias.'
  ]);

  // Pareto Categories Mock Data
  const paretoData = [
    { cause: 'Desgaste de Rolamentos / Fadiga', occurrences: 42, percentage: 42, cumulative: 42 },
    { cause: 'Vazamentos em Selos & Vedações', occurrences: 28, percentage: 28, cumulative: 70 },
    { cause: 'Contaminação de Lubrificante', occurrences: 15, percentage: 15, cumulative: 85 },
    { cause: 'Desalinhamento de Eixos / Acoplamento', occurrences: 10, percentage: 10, cumulative: 95 },
    { cause: 'Falha Elétrica em Bobinas / Inversores', occurrences: 5, percentage: 5, cumulative: 100 }
  ];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Gauge size={28} color="var(--accent-cyan)" />
            Engenharia de Confiabilidade & Análise de Causa Raiz
          </h1>
          <p className="page-subtitle">
            Cálculo de MTBF/MTTR, Matriz FMEA (RCM), Gráfico de Pareto de falhas crônicas e Análise dos 5 Porquês.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <span>MTBF (Tempo Médio Entre Falhas)</span>
            <Activity size={18} color="var(--accent-cyan)" />
          </div>
          <div className="kpi-value">
            {metrics.mtbfHours} <span className="kpi-unit">Horas</span>
          </div>
          <div className="kpi-footer">
            <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>Alta Confiabilidade</span>
          </div>
        </div>

        <div className="kpi-card emerald">
          <div className="kpi-header">
            <span>MTTR (Tempo Médio Para Reparo)</span>
            <TrendingDown size={18} color="var(--accent-emerald)" />
          </div>
          <div className="kpi-value">
            {metrics.mttrHours} <span className="kpi-unit">Horas</span>
          </div>
          <div className="kpi-footer">
            <span>Agilidade das equipes no diagnóstico</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span>Disponibilidade Mecânica</span>
            <Gauge size={18} color="var(--accent-cyan)" />
          </div>
          <div className="kpi-value">{metrics.availabilityPercent}%</div>
          <div className="kpi-footer">
            <span>Meta corporativa: 95%</span>
          </div>
        </div>

        <div className="kpi-card amber">
          <div className="kpi-header">
            <span>Proporção Preventiva / Corretiva</span>
            <Sliders size={18} color="var(--accent-amber)" />
          </div>
          <div className="kpi-value">{metrics.plannedMaintenanceRatio}%</div>
          <div className="kpi-footer">
            <span>84.5% das ordens planejadas com antecedência</span>
          </div>
        </div>
      </div>

      {/* Interactive FMEA Matrix */}
      <div className="glass-card" style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={20} color="var(--accent-cyan)" />
              Matriz FMEA de Ativos Críticos (Failure Mode and Effects Analysis)
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Cálculo do Número de Prioridade de Risco: <strong>NPR / RPN = Severidade (S) &times; Ocorrência (O) &times; Detecção (D)</strong>.
            </p>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Componente</th>
                <th>Modo de Falha</th>
                <th>Efeito Potencial</th>
                <th style={{ textAlign: 'center' }}>S</th>
                <th>Causa Raiz</th>
                <th style={{ textAlign: 'center' }}>O</th>
                <th style={{ textAlign: 'center' }}>D</th>
                <th style={{ textAlign: 'center' }}>RPN</th>
                <th>Ação Recomendada</th>
              </tr>
            </thead>
            <tbody>
              {fmeaRows.map((row) => (
                <tr key={row.id}>
                  <td style={{ fontWeight: 600 }}>{row.component}</td>
                  <td><span className="badge badge-amber">{row.failureMode}</span></td>
                  <td style={{ fontSize: '0.82rem', maxWidth: '240px' }}>{row.failureEffect}</td>
                  <td style={{ textAlign: 'center', fontWeight: 700 }}>{row.severity}</td>
                  <td style={{ fontSize: '0.82rem' }}>{row.failureCause}</td>
                  <td style={{ textAlign: 'center', fontWeight: 700 }}>{row.occurrence}</td>
                  <td style={{ textAlign: 'center', fontWeight: 700 }}>{row.detection}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`badge ${row.rpn > 100 ? 'badge-rose' : row.rpn > 60 ? 'badge-amber' : 'badge-emerald'}`}>
                      {row.rpn}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--accent-cyan)' }}>{row.recommendedAction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two Columns: Pareto Analysis & 5-Whys Root Cause */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '24px' }}>
        
        {/* Pareto Chart / Table */}
        <div className="glass-card">
          <h2 style={{ fontSize: '1.15rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} color="var(--accent-amber)" />
            Análise de Pareto de Falhas (Princípio 80/20)
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
            80% dos custos e paradas de linha são causados por apenas 20% dos tipos de falha.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {paretoData.map((item, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600 }}>{item.cause}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    <strong>{item.occurrences} falhas</strong> ({item.percentage}% &bull; Acum: {item.cumulative}%)
                  </span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'var(--bg-canvas)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${item.percentage * 2}%`,
                      height: '100%',
                      background: idx < 2 ? 'linear-gradient(90deg, #f43f5e, #fb7185)' : 'linear-gradient(90deg, #06b6d4, #3b82f6)'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5-Whys Root Cause Analyzer */}
        <div className="glass-card">
          <h2 style={{ fontSize: '1.15rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileQuestion size={18} color="var(--accent-cyan)" />
            Metodologia dos 5 Porquês (Análise de Falha Crônica)
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Investigação sistemática para atingir a raiz do problema em vez de tratar apenas os sintomas superficiais.
          </p>

          <div style={{ marginBottom: '14px' }}>
            <label className="form-label">Problema Declarado na Linha:</label>
            <input
              type="text"
              className="form-input"
              value={whyProblem}
              onChange={(e) => setWhyProblem(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {whys.map((step, idx) => (
              <div
                key={idx}
                style={{
                  background: idx === 4 ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-canvas)',
                  border: `1px solid ${idx === 4 ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 14px',
                  fontSize: '0.84rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px'
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: idx === 4 ? 'var(--accent-emerald)' : 'var(--accent-blue)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    flexShrink: 0
                  }}
                >
                  {idx + 1}
                </div>
                <div style={{ color: idx === 4 ? 'var(--accent-emerald)' : 'var(--text-primary)', fontWeight: idx === 4 ? 700 : 400 }}>
                  {step}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
