import React, { useState } from 'react';
import {
  Wrench,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  User,
  CheckSquare,
  FileCheck,
  ShieldAlert,
  Copy,
  X,
  Send
} from 'lucide-react';
import { WorkOrder, OrderType, OrderPriority, OrderStatus } from '../types';
import { INITIAL_WORK_ORDERS, INITIAL_ASSETS, INITIAL_TECHNICIANS } from '../services/mockData';

export const WorkOrdersView: React.FC = () => {
  const [orders, setOrders] = useState<WorkOrder[]>(INITIAL_WORK_ORDERS);
  const [viewMode, setViewMode] = useState<'KANBAN' | 'TABLE'>('KANBAN');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  const [activeOrderModal, setActiveOrderModal] = useState<WorkOrder | null>(null);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);

  // New Order Form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState(INITIAL_ASSETS[0].id);
  const [newType, setNewType] = useState<OrderType>('CORRECTIVE');
  const [newPriority, setNewPriority] = useState<OrderPriority>('HIGH');
  const [assignedTech, setAssignedTech] = useState(INITIAL_TECHNICIANS[0].name);
  const [estimatedHours, setEstimatedHours] = useState(4);
  const [requiresLoto, setRequiresLoto] = useState(false);

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.assetTag.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'ALL' || o.type === typeFilter;
    const matchesPriority = priorityFilter === 'ALL' || o.priority === priorityFilter;

    return matchesSearch && matchesType && matchesPriority;
  });

  const handleToggleChecklist = (orderId: string, index: number) => {
    setOrders(
      orders.map((o) => {
        if (o.id === orderId) {
          const updatedChecklists = [...o.checklists];
          updatedChecklists[index].done = !updatedChecklists[index].done;
          return { ...o, checklists: updatedChecklists };
        }
        return o;
      })
    );

    if (activeOrderModal && activeOrderModal.id === orderId) {
      const updatedChecklists = [...activeOrderModal.checklists];
      updatedChecklists[index].done = !updatedChecklists[index].done;
      setActiveOrderModal({ ...activeOrderModal, checklists: updatedChecklists });
    }
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const asset = INITIAL_ASSETS.find((a) => a.id === selectedAssetId) || INITIAL_ASSETS[0];
    const newCode = `OS-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const created: WorkOrder = {
      id: `wo-${Date.now()}`,
      code: newCode,
      title: newTitle,
      description: newDescription,
      assetId: asset.id,
      assetTag: asset.tag,
      assetName: asset.name,
      type: newType,
      priority: newPriority,
      status: 'SCHEDULED',
      requestedBy: 'Supervisor de Operação',
      assignedTechnician: assignedTech,
      scheduledDate: new Date().toISOString().split('T')[0],
      deadlineDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      estimatedHours: Number(estimatedHours),
      realHours: 0,
      costLabor: Number(estimatedHours) * 70,
      costMaterials: 0,
      totalCost: Number(estimatedHours) * 70,
      checklists: [
        { text: 'Avaliar condições de segurança e isolamento de energias', done: false },
        { text: 'Executar intervenção técnica conforme procedimento padrão', done: false },
        { text: 'Testar e devolver equipamento limpo para produção', done: false }
      ],
      requiresLoto,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };

    setOrders([created, ...orders]);
    setShowNewOrderModal(false);
    setNewTitle('');
    setNewDescription('');
  };

  const handleCompleteOrder = (orderId: string) => {
    setOrders(
      orders.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status: 'COMPLETED',
            electronicSignature: 'Validado tecnicamente com assinatura digital auditada.'
          };
        }
        return o;
      })
    );
    if (activeOrderModal && activeOrderModal.id === orderId) {
      setActiveOrderModal({
        ...activeOrderModal,
        status: 'COMPLETED',
        electronicSignature: 'Validado tecnicamente com assinatura digital auditada.'
      });
    }
  };

  const kanbanColumns: { status: OrderStatus; label: string; color: string }[] = [
    { status: 'SCHEDULED', label: 'Programada / Aprovada', color: 'var(--accent-blue)' },
    { status: 'IN_PROGRESS', label: 'Em Execução', color: 'var(--accent-cyan)' },
    { status: 'WAITING_PARTS', label: 'Aguardando Peças / Pendência', color: 'var(--accent-amber)' },
    { status: 'COMPLETED', label: 'Concluída & Validada', color: 'var(--accent-emerald)' }
  ];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Wrench size={28} color="var(--accent-cyan)" />
            Ordens de Serviço e Solicitações de Manutenção (OS)
          </h1>
          <p className="page-subtitle">
            Fluxo completo de triagem, programação, execução com checklists digitais, LOTO e encerramento técnico.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ display: 'flex', background: 'var(--bg-canvas)', borderRadius: 'var(--radius-md)', padding: '3px', border: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => setViewMode('KANBAN')}
              className={`btn btn-sm ${viewMode === 'KANBAN' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ border: 'none' }}
            >
              Quadro Kanban
            </button>
            <button
              onClick={() => setViewMode('TABLE')}
              className={`btn btn-sm ${viewMode === 'TABLE' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ border: 'none' }}
            >
              Tabela Detalhada
            </button>
          </div>

          <button onClick={() => setShowNewOrderModal(true)} className="btn btn-primary">
            <Plus size={18} /> Abrir Nova OS
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div
        className="glass-panel"
        style={{
          marginBottom: '24px',
          display: 'flex',
          gap: '14px',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1, flexWrap: 'wrap' }}>
          <div className="search-input-box" style={{ flex: '1 1 260px' }}>
            <Search size={17} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Buscar por código de OS, título, TAG..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="form-select"
            style={{ width: 'auto', padding: '6px 12px' }}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="ALL">Todos os Tipos</option>
            <option value="CORRECTIVE">Corretiva</option>
            <option value="PREVENTIVE">Preventiva</option>
            <option value="PREDICTIVE">Preditiva</option>
            <option value="IMPROVEMENT">Melhoria</option>
          </select>

          <select
            className="form-select"
            style={{ width: 'auto', padding: '6px 12px' }}
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="ALL">Todas as Prioridades</option>
            <option value="CRITICAL">Crítica</option>
            <option value="HIGH">Alta</option>
            <option value="MEDIUM">Média</option>
            <option value="LOW">Baixa</option>
          </select>
        </div>

        <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
          Total: <strong>{filteredOrders.length}</strong> ordens listadas
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'KANBAN' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '18px',
            alignItems: 'flex-start'
          }}
        >
          {kanbanColumns.map((col) => {
            const colOrders = filteredOrders.filter((o) => o.status === col.status);
            return (
              <div
                key={col.status}
                style={{
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-subtle)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: col.color }} />
                    <h3 style={{ fontSize: '0.92rem', fontWeight: 700 }}>{col.label}</h3>
                  </div>
                  <span className="badge badge-slate">{colOrders.length}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {colOrders.map((order) => (
                    <div
                      key={order.id}
                      onClick={() => setActiveOrderModal(order)}
                      style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        padding: '14px',
                        cursor: 'pointer',
                        transition: 'transform 0.15s ease, border-color 0.15s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent-cyan)')}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span className="tag-mono">{order.code}</span>
                        <span className={`badge ${order.priority === 'CRITICAL' ? 'badge-rose' : order.priority === 'HIGH' ? 'badge-amber' : 'badge-slate'}`}>
                          {order.priority}
                        </span>
                      </div>

                      <h4 style={{ fontSize: '0.92rem', fontWeight: 600, lineHeight: 1.3, marginBottom: '8px' }}>
                        {order.title}
                      </h4>

                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                        Ativo: <strong>{order.assetTag}</strong>
                      </div>

                      {order.requiresLoto && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--accent-rose)', marginBottom: '8px' }}>
                          <ShieldAlert size={14} /> Requer Bloqueio LOTO
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <User size={13} /> {order.assignedTechnician?.split(' ')[0]}
                        </div>
                        <div>
                          {order.realHours}h / {order.estimatedHours}h
                        </div>
                      </div>
                    </div>
                  ))}

                  {colOrders.length === 0 && (
                    <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      Nenhuma ordem nesta fase.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'TABLE' && (
        <div className="table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Código OS</th>
                <th>Título do Serviço</th>
                <th>Ativo</th>
                <th>Tipo</th>
                <th>Prioridade</th>
                <th>Status</th>
                <th>Responsável</th>
                <th>Horas</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((o) => (
                <tr key={o.id}>
                  <td><span className="tag-mono">{o.code}</span></td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{o.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{o.description.slice(0, 70)}...</div>
                  </td>
                  <td><strong>{o.assetTag}</strong></td>
                  <td><span className="badge badge-cyan">{o.type}</span></td>
                  <td>
                    <span className={`badge ${o.priority === 'CRITICAL' ? 'badge-rose' : 'badge-amber'}`}>
                      {o.priority}
                    </span>
                  </td>
                  <td><span className="badge badge-slate">{o.status}</span></td>
                  <td>{o.assignedTechnician}</td>
                  <td>{o.realHours}h / {o.estimatedHours}h</td>
                  <td>
                    <button onClick={() => setActiveOrderModal(o)} className="btn btn-secondary btn-sm">
                      Ver OS
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Detail & Execution Modal */}
      {activeOrderModal && (
        <div className="modal-backdrop" onClick={() => setActiveOrderModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="tag-mono" style={{ fontSize: '1rem' }}>{activeOrderModal.code}</span>
                <span className={`badge ${activeOrderModal.priority === 'CRITICAL' ? 'badge-rose' : 'badge-amber'}`}>
                  {activeOrderModal.priority}
                </span>
                <span className="badge badge-cyan">{activeOrderModal.status}</span>
              </div>
              <button onClick={() => setActiveOrderModal(null)} className="btn btn-secondary btn-sm"><X size={16} /></button>
            </div>

            <div className="modal-body">
              <h2 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>{activeOrderModal.title}</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
                {activeOrderModal.description}
              </p>

              {/* Key Info Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
                <div className="glass-panel">
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ATIVO VINCULADO</span>
                  <div style={{ fontWeight: 700, marginTop: '4px' }}>{activeOrderModal.assetTag}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{activeOrderModal.assetName}</div>
                </div>
                <div className="glass-panel">
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TÉCNICO RESPONSÁVEL</span>
                  <div style={{ fontWeight: 700, marginTop: '4px' }}>{activeOrderModal.assignedTechnician}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Prazo: {activeOrderModal.deadlineDate}</div>
                </div>
                <div className="glass-panel">
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CUSTO TOTAL DA ORDEM</span>
                  <div style={{ fontWeight: 800, color: 'var(--accent-cyan)', fontSize: '1.1rem', marginTop: '4px' }}>
                    R$ {activeOrderModal.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mão de Obra + Peças</div>
                </div>
              </div>

              {/* Checklist Tasks */}
              <h3 style={{ fontSize: '1.05rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckSquare size={18} color="var(--accent-emerald)" />
                Checklist Obrigatório de Procedimentos
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                {activeOrderModal.checklists.map((chk, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleToggleChecklist(activeOrderModal.id, idx)}
                    style={{
                      background: chk.done ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-canvas)',
                      border: `1px solid ${chk.done ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-subtle)'}`,
                      borderRadius: 'var(--radius-md)',
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={chk.done}
                      readOnly
                      style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                    />
                    <span style={{ fontSize: '0.88rem', textDecoration: chk.done ? 'line-through' : 'none', color: chk.done ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                      {chk.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* LOTO Alert if required */}
              {activeOrderModal.requiresLoto && (
                <div
                  style={{
                    background: 'rgba(244, 63, 94, 0.1)',
                    border: '1px solid rgba(244, 63, 94, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '20px'
                  }}
                >
                  <ShieldAlert size={22} color="var(--accent-rose)" />
                  <div style={{ fontSize: '0.84rem' }}>
                    <strong>Atenção Segurança (NR-10 / NR-12):</strong> Esta atividade exige Bloqueio Físico LOTO. Cadeados e etiquetas de sinalização devem estar instalados antes da abertura de painéis ou despressurização de vasos.
                  </div>
                </div>
              )}

              {/* Digital Signature */}
              {activeOrderModal.electronicSignature && (
                <div
                  style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <FileCheck size={20} color="var(--accent-emerald)" />
                  <div style={{ fontSize: '0.82rem', color: 'var(--accent-emerald)' }}>
                    {activeOrderModal.electronicSignature}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              {activeOrderModal.status !== 'COMPLETED' && (
                <button
                  onClick={() => handleCompleteOrder(activeOrderModal.id)}
                  className="btn btn-primary"
                >
                  <CheckCircle size={16} /> Validar e Concluir OS
                </button>
              )}
              <button onClick={() => setActiveOrderModal(null)} className="btn btn-secondary">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Work Order Modal */}
      {showNewOrderModal && (
        <div className="modal-backdrop" onClick={() => setShowNewOrderModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleCreateOrder}>
              <div className="modal-header">
                <h2 style={{ fontSize: '1.2rem' }}>Abertura de Nova Ordem de Serviço</h2>
                <button type="button" onClick={() => setShowNewOrderModal(false)} className="btn btn-secondary btn-sm"><X size={16} /></button>
              </div>

              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Título do Serviço / Falha Identificada *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: Vazamento de óleo na vedação do flange da bomba"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Descrição Detalhada e Sintomas *</label>
                  <textarea
                    rows={3}
                    className="form-textarea"
                    placeholder="Descreva o sintoma observado, condições operacionais e peças suspeitas..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Equipamento / Ativo *</label>
                    <select
                      className="form-select"
                      value={selectedAssetId}
                      onChange={(e) => setSelectedAssetId(e.target.value)}
                    >
                      {INITIAL_ASSETS.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.tag} - {a.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Tipo de Manutenção</label>
                    <select className="form-select" value={newType} onChange={(e) => setNewType(e.target.value as OrderType)}>
                      <option value="CORRECTIVE">Corretiva</option>
                      <option value="PREVENTIVE">Preventiva</option>
                      <option value="PREDICTIVE">Preditiva</option>
                      <option value="EMERGENCY">Emergencial</option>
                      <option value="IMPROVEMENT">Melhoria</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Prioridade</label>
                    <select className="form-select" value={newPriority} onChange={(e) => setNewPriority(e.target.value as OrderPriority)}>
                      <option value="CRITICAL">Crítica (Imediata)</option>
                      <option value="HIGH">Alta (Até 24h)</option>
                      <option value="MEDIUM">Média (Até 3 dias)</option>
                      <option value="LOW">Baixa (Programada)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Técnico Designado</label>
                    <select className="form-select" value={assignedTech} onChange={(e) => setAssignedTech(e.target.value)}>
                      {INITIAL_TECHNICIANS.map((t) => (
                        <option key={t.id} value={t.name}>
                          {t.name} ({t.specialty})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Horas Previstas</label>
                    <input
                      type="number"
                      className="form-input"
                      value={estimatedHours}
                      onChange={(e) => setEstimatedHours(Number(e.target.value))}
                      min={0.5}
                      step={0.5}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                  <input
                    type="checkbox"
                    id="loto-check"
                    checked={requiresLoto}
                    onChange={(e) => setRequiresLoto(e.target.checked)}
                  />
                  <label htmlFor="loto-check" style={{ fontSize: '0.88rem', cursor: 'pointer' }}>
                    Esta atividade exige bloqueio e etiquetagem LOTO (Lockout/Tagout)
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowNewOrderModal(false)} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Emitir Ordem de Serviço
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
