import React, { useState } from 'react';
import {
  Package,
  Search,
  Plus,
  AlertTriangle,
  DollarSign,
  Layers,
  ArrowDownRight,
  ArrowUpRight,
  Barcode
} from 'lucide-react';
import { InventoryItem } from '../types';
import { INITIAL_INVENTORY } from '../services/mockData';

export const InventoryMROView: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.binLocation.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalStockValue = items.reduce((acc, curr) => acc + curr.currentStock * curr.unitPrice, 0);
  const lowStockCount = items.filter((i) => i.currentStock <= i.minStock).length;

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Package size={28} color="var(--accent-cyan)" />
            Almoxarifado MRO & Gestão de Peças Sobressalentes
          </h1>
          <p className="page-subtitle">
            Controle de inventário por endereço físico (corredor/prateleira/gaveta), ponto de ressuprimento e reserva para OS.
          </p>
        </div>

        <button className="btn btn-primary">
          <Plus size={18} /> Cadastrar Nova Peça
        </button>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <span>Valor Total em Estoque MRO</span>
            <DollarSign size={18} color="var(--accent-cyan)" />
          </div>
          <div className="kpi-value">
            R$ {totalStockValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="kpi-footer">
            <span>Total avaliado ao custo médio ponderado</span>
          </div>
        </div>

        <div className="kpi-card rose">
          <div className="kpi-header">
            <span>Itens em Ponto de Reposição</span>
            <AlertTriangle size={18} color="var(--accent-rose)" />
          </div>
          <div className="kpi-value">{lowStockCount} <span className="kpi-unit">Itens Críticos</span></div>
          <div className="kpi-footer">
            <span style={{ color: 'var(--accent-rose)' }}>Abaixo do estoque mínimo de segurança</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span>Acurácia de Inventário Rotativo</span>
            <Layers size={18} color="var(--accent-emerald)" />
          </div>
          <div className="kpi-value">98.4%</div>
          <div className="kpi-footer">
            <span>Conferência cega por código de barras</span>
          </div>
        </div>
      </div>

      {/* Table Wrapper */}
      <div className="table-wrapper">
        <div className="table-header-tools">
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
            <div className="search-input-box" style={{ flex: '1 1 260px' }}>
              <Search size={17} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Buscar código de peça, descrição ou endereço físico..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <select
              className="form-select"
              style={{ width: 'auto', padding: '6px 12px' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">Todos os Níveis</option>
              <option value="IN_STOCK">Estoque Normal</option>
              <option value="LOW_STOCK">Estoque Baixo</option>
            </select>
          </div>

          <button className="btn btn-secondary btn-sm">
            <Barcode size={16} /> Leitor de Código de Barras
          </button>
        </div>

        <table className="custom-table">
          <thead>
            <tr>
              <th>Código MRO</th>
              <th>Descrição do Item</th>
              <th>Endereço Físico</th>
              <th>Físico</th>
              <th>Reservado OS</th>
              <th>Disponível</th>
              <th>Mín / Reposição</th>
              <th>Preço Unit.</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.id}>
                <td><span className="tag-mono">{item.code}</span></td>
                <td>
                  <div style={{ fontWeight: 600 }}>{item.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.category} &bull; {item.supplier}</div>
                </td>
                <td><span className="badge badge-slate">{item.binLocation}</span></td>
                <td style={{ fontWeight: 700 }}>{item.currentStock} {item.unit}</td>
                <td style={{ color: 'var(--accent-amber)' }}>{item.reservedStock} {item.unit}</td>
                <td style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>{item.availableStock} {item.unit}</td>
                <td>{item.minStock} / {item.reorderPoint}</td>
                <td style={{ fontWeight: 600 }}>R$ {item.unitPrice.toFixed(2)}</td>
                <td>
                  <span className={`badge ${item.status === 'IN_STOCK' ? 'badge-emerald' : 'badge-rose'}`}>
                    {item.status === 'IN_STOCK' ? 'Normal' : 'Repor Urgente'}
                  </span>
                </td>
                <td>
                  <button className="btn btn-secondary btn-sm">
                    Movimentar
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
