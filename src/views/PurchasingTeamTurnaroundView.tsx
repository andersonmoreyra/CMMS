import React, { useState } from 'react';
import {
  ShoppingCart,
  Users,
  Flame,
  Plus,
  Clock,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Award,
  FileText
} from 'lucide-react';
import {
  INITIAL_PURCHASES,
  INITIAL_CONTRACTS,
  INITIAL_TECHNICIANS,
  INITIAL_SHUTDOWNS
} from '../services/mockData';

export const PurchasingTeamTurnaroundView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'PURCHASING' | 'TEAM' | 'TURNAROUND'>('PURCHASING');

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <ShoppingCart size={28} color="var(--accent-cyan)" />
            Suprimentos, Gestão de Mão de Obra & Paradas de Fábrica
          </h1>
          <p className="page-subtitle">
            Ordens de compra, contratos de terceiros com SLA, qualificações técnicas das equipes (NRs) e grandes paradas (Turnaround).
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-nav">
        <button
          onClick={() => setActiveTab('PURCHASING')}
          className={`tab-btn ${activeTab === 'PURCHASING' ? 'active' : ''}`}
        >
          <ShoppingCart size={17} /> Compras & Contratos Fornecedores (Módulos 10 e 14)
        </button>
        <button
          onClick={() => setActiveTab('TEAM')}
          className={`tab-btn ${activeTab === 'TEAM' ? 'active' : ''}`}
        >
          <Users size={17} /> Equipes & Certificações NRs (Módulo 11)
        </button>
        <button
          onClick={() => setActiveTab('TURNAROUND')}
          className={`tab-btn ${activeTab === 'TURNAROUND' ? 'active' : ''}`}
        >
          <Flame size={17} /> Grandes Paradas Industriais / Turnaround (Módulo 13)
        </button>
      </div>

      {/* Tab 1: Purchasing & Contracts */}
      {activeTab === 'PURCHASING' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Purchase Orders */}
          <div className="table-wrapper">
            <div className="table-header-tools">
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Ordens de Compra de Peças e Serviços (POs)</h3>
              <button className="btn btn-primary btn-sm"><Plus size={16} /> Nova Requisição de Compra</button>
            </div>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Nº Pedido</th>
                  <th>Fornecedor</th>
                  <th>Descrição da Aquisição</th>
                  <th>Valor Total</th>
                  <th>Previsão Entrega</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {INITIAL_PURCHASES.map((po) => (
                  <tr key={po.id}>
                    <td><span className="tag-mono">{po.number}</span></td>
                    <td style={{ fontWeight: 600 }}>{po.vendor}</td>
                    <td style={{ fontSize: '0.84rem' }}>{po.description}</td>
                    <td style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>
                      R$ {po.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td>{po.deliveryDate}</td>
                    <td>
                      <span className={`badge ${po.status === 'DELIVERED' ? 'badge-emerald' : 'badge-amber'}`}>
                        {po.status === 'IN_TRANSIT' ? 'Em Trânsito' : 'Aprovado'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* SLA Contracts */}
          <div className="table-wrapper">
            <div className="table-header-tools">
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Contratos de Prestação de Serviços & Terceirizados com SLA</h3>
            </div>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Fornecedor Contratado</th>
                  <th>Escopo do Serviço</th>
                  <th>Valor Mensal</th>
                  <th>Tempo Máximo SLA</th>
                  <th>Vigência</th>
                  <th>Status Contratual</th>
                </tr>
              </thead>
              <tbody>
                {INITIAL_CONTRACTS.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600 }}>{c.vendor}</td>
                    <td style={{ fontSize: '0.84rem' }}>{c.serviceType}</td>
                    <td style={{ fontWeight: 700 }}>R$ {c.valuePerMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês</td>
                    <td><span className="tag-mono">Até {c.slaResponseHours} horas</span></td>
                    <td>{c.startDate} até {c.endDate}</td>
                    <td>
                      <span className={`badge ${c.status === 'ACTIVE' ? 'badge-emerald' : 'badge-amber'}`}>
                        {c.status === 'ACTIVE' ? 'Vigente' : 'Próximo do Vencimento'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Team & Labor */}
      {activeTab === 'TEAM' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
          {INITIAL_TECHNICIANS.map((tech) => (
            <div key={tech.id} className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem' }}>{tech.name}</h3>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    Especialidade: <strong>{tech.specialty}</strong> &bull; {tech.shift}
                  </div>
                </div>
                <span className={`badge ${tech.status === 'AVAILABLE' ? 'badge-emerald' : 'badge-amber'}`}>
                  {tech.status === 'AVAILABLE' ? 'Disponível' : 'Em Atendimento'}
                </span>
              </div>

              <div style={{ background: 'var(--bg-canvas)', borderRadius: 'var(--radius-md)', padding: '12px', marginBottom: '14px' }}>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Habilitações e Certificações Legais:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {tech.certifications.map((cert, cIdx) => (
                    <div key={cIdx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Award size={14} color="var(--accent-cyan)" /> {cert.name}
                      </span>
                      <span className="badge badge-emerald" style={{ fontSize: '0.68rem' }}>Válida</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                <span>Custo Hora: <strong>R$ {tech.hourlyRate.toFixed(2)}/h</strong></span>
                <span>Ordens Atribuídas: <strong>{tech.assignedOrdersCount}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Turnaround Shutdowns */}
      {activeTab === 'TURNAROUND' && (
        <div>
          {INITIAL_SHUTDOWNS.map((sht) => (
            <div key={sht.id} className="glass-card" style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <span className="badge badge-amber" style={{ marginBottom: '6px' }}>{sht.status}</span>
                  <h2 style={{ fontSize: '1.25rem' }}>{sht.name}</h2>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Alvo: {sht.targetPlant} &bull; Janela Programada: {sht.startDate} até {sht.endDate}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>AVANÇO FÍSICO GERAL</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                    {sht.progressPercent}%
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ width: '100%', height: '10px', background: 'var(--bg-canvas)', borderRadius: '5px', overflow: 'hidden', marginBottom: '20px' }}>
                <div style={{ width: `${sht.progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, #06b6d4, #3b82f6)' }} />
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div className="glass-panel">
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ORDENS DE SERVIÇO NA PARADA</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '4px' }}>
                    {sht.completedWorkOrders} de {sht.totalWorkOrders} Concluídas
                  </div>
                </div>
                <div className="glass-panel">
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ORÇAMENTO PREVISTO (CAPEX)</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '4px' }}>
                    R$ {sht.budgetEstimated.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="glass-panel">
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>VALOR REALIZADO ATÉ O MOMENTO</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-emerald)', marginTop: '4px' }}>
                    R$ {sht.budgetSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
