import React, { useState } from 'react';
import {
  ShieldAlert,
  Lock,
  Plus,
  CheckCircle,
  AlertTriangle,
  FileCheck,
  Flame,
  ArrowUpRight,
  ShieldCheck,
  Key
} from 'lucide-react';
import { LotoPermit } from '../types';
import { INITIAL_LOTO } from '../services/mockData';

export const SafetyLOTOView: React.FC = () => {
  const [permits, setPermits] = useState<LotoPermit[]>(INITIAL_LOTO);
  const [showNewPermitModal, setShowNewPermitModal] = useState(false);

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <ShieldAlert size={28} color="var(--accent-rose)" />
            Segurança do Trabalho, LOTO & Permissões Especiais
          </h1>
          <p className="page-subtitle">
            Gestão de bloqueio de energias perigosas (Lockout/Tagout), Permissão de Trabalho (PT), NR-10, NR-12, NR-33 e NR-35.
          </p>
        </div>

        <button onClick={() => setShowNewPermitModal(true)} className="btn btn-primary">
          <Plus size={18} /> Emitir Nova Permissão (PT/LOTO)
        </button>
      </div>

      {/* LOTO Live Status Cards */}
      <div className="kpi-grid">
        <div className="kpi-card rose">
          <div className="kpi-header">
            <span>Pontos Bloqueados Atualmente (LOTO)</span>
            <Lock size={18} color="var(--accent-rose)" />
          </div>
          <div className="kpi-value">
            2 <span className="kpi-unit">Cadeados Ativos</span>
          </div>
          <div className="kpi-footer">
            <span style={{ color: 'var(--accent-rose)', fontWeight: 700 }}>Energia Zero Confirmada</span>
          </div>
        </div>

        <div className="kpi-card amber">
          <div className="kpi-header">
            <span>Permissões Especiais Válidas</span>
            <ShieldCheck size={18} color="var(--accent-amber)" />
          </div>
          <div className="kpi-value">
            {permits.length} <span className="kpi-unit">Autorizações</span>
          </div>
          <div className="kpi-footer">
            <span>Altura (NR-35) e Elétrica (NR-10)</span>
          </div>
        </div>

        <div className="kpi-card emerald">
          <div className="kpi-header">
            <span>Dias Sem Acidentes com Afastamento</span>
            <CheckCircle size={18} color="var(--accent-emerald)" />
          </div>
          <div className="kpi-value">
            842 <span className="kpi-unit">Dias</span>
          </div>
          <div className="kpi-footer">
            <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>Meta Zero Danos Atingida</span>
          </div>
        </div>
      </div>

      {/* Permits Table */}
      <div className="table-wrapper">
        <div className="table-header-tools">
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Registro de Permissões de Trabalho & Bloqueios LOTO Ativos</h3>
        </div>

        <table className="custom-table">
          <thead>
            <tr>
              <th>Código PT</th>
              <th>Ativo Bloqueado</th>
              <th>Tipo de Risco</th>
              <th>Descrição do Serviço</th>
              <th>Pontos de Isolamento de Energia</th>
              <th>Executante / Aprovador</th>
              <th>Validade</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {permits.map((p) => (
              <tr key={p.id}>
                <td><span className="tag-mono">{p.code}</span></td>
                <td><strong>{p.assetTag}</strong></td>
                <td>
                  <span className={`badge ${p.type === 'LOTO' ? 'badge-rose' : 'badge-amber'}`}>
                    {p.type}
                  </span>
                </td>
                <td style={{ fontSize: '0.84rem', maxWidth: '280px' }}>{p.description}</td>
                <td style={{ fontSize: '0.78rem' }}>
                  <ul style={{ paddingLeft: '14px', color: 'var(--text-secondary)' }}>
                    {p.isolationPoints.map((pt, idx) => (
                      <li key={idx}>{pt}</li>
                    ))}
                  </ul>
                </td>
                <td style={{ fontSize: '0.82rem' }}>
                  <div style={{ fontWeight: 600 }}>{p.issuedTo}</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Aprov: {p.approvedBy}</div>
                </td>
                <td style={{ fontSize: '0.82rem' }}>{p.validUntil}</td>
                <td>
                  <span className={`badge ${p.status === 'ACTIVE_LOCKED' ? 'badge-rose' : 'badge-emerald'}`}>
                    {p.status === 'ACTIVE_LOCKED' ? 'Bloqueado c/ Cadeado' : 'Autorizado'}
                  </span>
                </td>
                <td>
                  <button className="btn btn-secondary btn-sm">
                    Auditar LOTO
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
