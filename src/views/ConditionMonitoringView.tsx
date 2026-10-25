import React, { useState } from 'react';
import {
  Activity,
  Zap,
  TrendingUp,
  AlertTriangle,
  Cpu,
  Sparkles,
  CheckCircle,
  PlusCircle,
  Clock,
  Radio
} from 'lucide-react';
import { IoTTelemetrySensor } from '../types';
import { INITIAL_IOT_SENSORS } from '../services/mockData';

export const ConditionMonitoringView: React.FC = () => {
  const [sensors, setSensors] = useState<IoTTelemetrySensor[]>(INITIAL_IOT_SENSORS);
  const [selectedSensor, setSelectedSensor] = useState<IoTTelemetrySensor>(INITIAL_IOT_SENSORS[0]);
  const [simulating, setSimulating] = useState(true);

  // Simulated live pulse: tweak random reading
  const handleSimulateNewReading = () => {
    const updated = sensors.map((s) => {
      const delta = (Math.random() - 0.48) * (s.sensorType === 'VIBRATION' ? 0.4 : 1.2);
      const newVal = Math.max(0.1, Number((s.currentValue + delta).toFixed(2)));
      let status: 'NORMAL' | 'WARNING' | 'CRITICAL' = 'NORMAL';
      if (newVal >= s.criticalThreshold) status = 'CRITICAL';
      else if (newVal >= s.warningThreshold) status = 'WARNING';

      const newHistory = [...s.historicalSeries.slice(1), { timestamp: 'Agora', value: newVal }];
      return {
        ...s,
        currentValue: newVal,
        status,
        historicalSeries: newHistory
      };
    });
    setSensors(updated);
    const updatedSelected = updated.find((s) => s.id === selectedSensor.id);
    if (updatedSelected) setSelectedSensor(updatedSelected);
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Activity size={28} color="var(--accent-cyan)" />
            Monitoramento Preditivo & Telemetria IoT com IA
          </h1>
          <p className="page-subtitle">
            Aquisição contínua de vibração FFT, termometria, pressão hidráulica, análise acústica e detecção de anomalias por Machine Learning.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleSimulateNewReading} className="btn btn-secondary btn-sm">
            <Radio size={16} color="var(--accent-cyan)" /> Injetar Leitura IoT em Tempo Real
          </button>
        </div>
      </div>

      {/* Sensor Tiles Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {sensors.map((sensor) => {
          const isSelected = sensor.id === selectedSensor.id;
          return (
            <div
              key={sensor.id}
              onClick={() => setSelectedSensor(sensor)}
              className="glass-card"
              style={{
                cursor: 'pointer',
                borderColor: isSelected
                  ? 'var(--accent-cyan)'
                  : sensor.status === 'CRITICAL'
                  ? 'rgba(244, 63, 94, 0.4)'
                  : 'var(--border-subtle)',
                background: isSelected ? 'rgba(6, 182, 212, 0.08)' : 'var(--bg-card)',
                padding: '18px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="tag-mono">{sensor.assetTag}</span>
                <span className={`badge ${sensor.status === 'CRITICAL' ? 'badge-rose' : sensor.status === 'WARNING' ? 'badge-amber' : 'badge-emerald'}`}>
                  {sensor.status}
                </span>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {sensor.sensorType}
              </div>

              <div style={{ fontSize: '1.8rem', fontWeight: 800, margin: '6px 0', color: sensor.status === 'CRITICAL' ? 'var(--accent-rose)' : 'var(--text-primary)' }}>
                {sensor.currentValue} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{sensor.unit}</span>
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Alerta: {sensor.warningThreshold} | Crítico: {sensor.criticalThreshold}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Focus: Live Oscilloscope / Spectrum & AI Diagnosis */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '24px', marginBottom: '28px' }}>
        
        {/* Trend Graph Simulator */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem' }}>
                Curva de Tendência Temporal &bull; {selectedSensor.assetTag} ({selectedSensor.sensorType})
              </h2>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Amostragem em alta frequência calibrada conforme norma ISO 10816-3
              </div>
            </div>
            <span className="pulse-indicator" />
          </div>

          {/* Interactive CSS Bar Waveform Visualizer */}
          <div
            style={{
              height: '190px',
              background: 'var(--bg-canvas)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: '12px',
              position: 'relative'
            }}
          >
            {/* Warning limit line */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: '35%',
                borderTop: '1px dashed rgba(245, 158, 11, 0.5)',
                pointerEvents: 'none'
              }}
            >
              <span style={{ position: 'absolute', right: '12px', top: '-18px', fontSize: '0.68rem', color: 'var(--accent-amber)' }}>
                Limite Alerta ({selectedSensor.warningThreshold} {selectedSensor.unit})
              </span>
            </div>

            {selectedSensor.historicalSeries.map((pt, idx) => {
              const maxScale = selectedSensor.criticalThreshold * 1.3;
              const heightPct = Math.min(100, Math.max(15, (pt.value / maxScale) * 100));
              const isOver = pt.value >= selectedSensor.criticalThreshold;
              return (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: isOver ? 'var(--accent-rose)' : 'var(--accent-cyan)' }}>
                    {pt.value}
                  </span>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '38px',
                      height: `${heightPct}%`,
                      background: isOver
                        ? 'linear-gradient(180deg, #f43f5e, #be123c)'
                        : 'linear-gradient(180deg, #06b6d4, #0284c7)',
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.4s ease'
                    }}
                  />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{pt.timestamp}</span>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <span>Protocolo de Rede: MQTT / OPC-UA Seguro (TLS 1.3)</span>
            <span>Taxa de Amostragem: 10 kHz</span>
          </div>
        </div>

        {/* AI Predictive Anomaly Diagnosis */}
        <div className="glass-card" style={{ border: '1px solid rgba(6, 182, 212, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={20} color="var(--accent-cyan)" />
              <h2 style={{ fontSize: '1.15rem' }}>Diagnóstico Preditivo por Inteligência Artificial</h2>
            </div>
            <span className="badge badge-cyan">Rede Neural Ativa</span>
          </div>

          <div
            style={{
              background: 'var(--bg-canvas)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              border: '1px solid var(--border-subtle)',
              marginBottom: '16px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>Índice de Anomalia de Espectro (AI Score)</span>
              <span style={{ fontWeight: 800, fontSize: '1.2rem', color: selectedSensor.aiAnomalyScore > 70 ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
                {selectedSensor.aiAnomalyScore}%
              </span>
            </div>

            <div style={{ width: '100%', height: '8px', background: 'var(--bg-surface-elevated)', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${selectedSensor.aiAnomalyScore}%`,
                  height: '100%',
                  background: selectedSensor.aiAnomalyScore > 70 ? 'linear-gradient(90deg, #f59e0b, #f43f5e)' : 'linear-gradient(90deg, #10b981, #06b6d4)'
                }}
              />
            </div>
          </div>

          {selectedSensor.predictedFailureDays ? (
            <div
              style={{
                background: 'rgba(244, 63, 94, 0.1)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                marginBottom: '16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-rose)', fontWeight: 700, fontSize: '0.9rem' }}>
                <Clock size={16} /> Vida Útil Restante Estimada (RUL): {selectedSensor.predictedFailureDays} Dias!
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                A IA comparou o padrão vibratório com mais de 250.000 horas históricas e identificou início de lascamento na pista interna do rolamento dianteiro.
              </p>
            </div>
          ) : (
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                marginBottom: '16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-emerald)', fontWeight: 700, fontSize: '0.9rem' }}>
                <CheckCircle size={16} /> Assinatura Vibratória e Térmica Saudável
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                Nenhum harmônico anormal de engrenamento, desbalanceamento ou folga mecânica detectado.
              </p>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-primary" style={{ flex: 1 }}>
              <PlusCircle size={16} /> Gerar Ordem Preditiva Automática
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
