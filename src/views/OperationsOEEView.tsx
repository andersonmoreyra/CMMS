import React from 'react';
import {
  Layers,
  Zap,
  TrendingUp,
  Leaf,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Clock,
  Gauge
} from 'lucide-react';
import { INITIAL_OEE, INITIAL_ENERGY } from '../services/mockData';

export const OperationsOEEView: React.FC = () => {
  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Layers size={28} color="var(--accent-cyan)" />
            Operações Industriais, Eficiência OEE & Sustentabilidade
          </h1>
          <p className="page-subtitle">
            Cálculo em tempo real de Disponibilidade, Desempenho e Qualidade (OEE), controle de paradas e pegada de carbono.
          </p>
        </div>
      </div>

      {/* OEE Formula Breakdown Cards */}
      <div className="glass-card" style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '1.15rem', marginBottom: '16px' }}>
          Decomposição do OEE (Overall Equipment Effectiveness) &bull; Linha 01 Estamparia
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px' }}>
          {/* Availability */}
          <div className="glass-panel">
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>DISPONIBILIDADE (A)</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-blue)', margin: '4px 0' }}>
              {INITIAL_OEE[0].availability}%
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Tempo Operando / Tempo Programado
            </div>
          </div>

          {/* Performance */}
          <div className="glass-panel">
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>DESEMPENHO / RITMO (P)</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-cyan)', margin: '4px 0' }}>
              {INITIAL_OEE[0].performance}%
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Velocidade Real / Velocidade Nominal
            </div>
          </div>

          {/* Quality */}
          <div className="glass-panel">
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>TAXA DE QUALIDADE (Q)</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-emerald)', margin: '4px 0' }}>
              {INITIAL_OEE[0].quality}%
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Peças Boas / Peças Totais Produzidas
            </div>
          </div>

          {/* OEE TOTAL */}
          <div className="glass-panel" style={{ border: '2px solid var(--accent-cyan)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>OEE RESULTANTE (A &times; P &times; Q)</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-cyan)', margin: '2px 0' }}>
              {INITIAL_OEE[0].oee}%
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>
              Padrão World-Class (&gt;85%)
            </div>
          </div>
        </div>
      </div>

      {/* Energy & Sustainability Section */}
      <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Leaf size={20} color="var(--accent-emerald)" />
        Monitoramento de Energia & Sustentabilidade (ESG)
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {INITIAL_ENERGY.map((item, idx) => (
          <div key={idx} className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span className="tag-mono">{item.assetTag}</span>
              {item.anomalyDetected ? (
                <span className="badge badge-rose">Desvio de Consumo</span>
              ) : (
                <span className="badge badge-emerald">Eficiente</span>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Consumo Hoje:</span>
                <div style={{ fontSize: '1.3rem', fontWeight: 700 }}>
                  {item.kwhConsumedToday.toLocaleString()} <span style={{ fontSize: '0.8rem' }}>kWh</span>
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Consumo Específico:</span>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                  {item.specificConsumptionKwhTon} <span style={{ fontSize: '0.8rem' }}>kWh/ton</span>
                </div>
              </div>
            </div>

            <div style={{ background: 'var(--bg-canvas)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: '0.82rem', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Emissão de CO2 Equivalente:</span>
              <span style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>{item.co2EquivalentKg} kg CO2e</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
