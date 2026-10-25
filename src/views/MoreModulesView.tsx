import React, { useState } from 'react';
import {
  ClipboardCheck,
  DollarSign,
  Zap,
  Cpu,
  FileText,
  Truck,
  HelpCircle,
  Plus,
  CheckCircle,
  AlertTriangle,
  Clock,
  Download,
  Key,
  ExternalLink,
  Sliders,
  Send
} from 'lucide-react';
import { ModuleCategory, InspectionRoute, CalibrationInstrument } from '../types';
import { INITIAL_INSPECTIONS, INITIAL_CALIBRATIONS, INITIAL_TICKETS } from '../services/mockData';

interface MoreModulesViewProps {
  module: ModuleCategory;
}

export const MoreModulesView: React.FC<MoreModulesViewProps> = ({ module }) => {
  // Inspections State
  const [inspections] = useState<InspectionRoute[]>(INITIAL_INSPECTIONS);
  const [calibrations] = useState<CalibrationInstrument[]>(INITIAL_CALIBRATIONS);

  // Helpdesk State
  const [tickets, setTickets] = useState(INITIAL_TICKETS);
  const [newSubject, setNewSubject] = useState('');
  const [newDept, setNewDept] = useState('Produção Linha 01');

  // Workflows state
  const [workflows] = useState([
    {
      id: 'wf-01',
      name: 'Geração Automática de OS por Alarme IoT de Vibração',
      trigger: 'Vibração RMS > 6.0 mm/s por mais de 3 minutos consecutivos',
      action: 'Gerar Ordem Crítica, atribuir ao Especialista Mecânico e enviar SMS de alerta',
      status: 'ATIVO'
    },
    {
      id: 'wf-02',
      name: 'Escalonamento de Ordem Atrasada para Gerência Industrial',
      trigger: 'OS Corretiva em ativo Classe A ultrapassar 4 horas sem início técnico',
      action: 'Alterar status para ESCALONADO e notificar Gerente Geral via Webhook Teams',
      status: 'ATIVO'
    },
    {
      id: 'wf-03',
      name: 'Ressuprimento Automático de Almoxarifado MRO',
      trigger: 'Saldo físico atingir Ponto de Reposição',
      action: 'Emitir Pedido de Compra de cotação para os fornecedores homologados',
      status: 'ATIVO'
    }
  ]);

  // Handle Helpdesk ticket submission
  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject) return;
    const created = {
      id: `tkt-${Date.now()}`,
      ticketNumber: `CHAM-2026-${Math.floor(100 + Math.random() * 900)}`,
      requester: 'Operador de Turno (Autoatendimento)',
      department: newDept,
      location: 'Chão de Fábrica',
      subject: newSubject,
      priority: 'HIGH' as const,
      slaDeadline: 'Em até 4 horas',
      status: 'IN_TRIAGE' as const
    };
    setTickets([created, ...tickets]);
    setNewSubject('');
  };

  // -------------------------------------------------------------
  // MODULE 6: INSPEÇÕES & CALIBRAÇÃO METROLÓGICA
  // -------------------------------------------------------------
  if (module === 'inspections') {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title">
              <ClipboardCheck size={28} color="var(--accent-cyan)" />
              Inspeções, Medições & Calibração Metrológica
            </h1>
            <p className="page-subtitle">
              Rotas sensitivas, controle de tolerâncias de instrumentos com certificados RBC e histórico de leituras.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '24px', marginBottom: '28px' }}>
          {/* Inspection Routes */}
          <div className="glass-card">
            <h2 style={{ fontSize: '1.15rem', marginBottom: '14px' }}>Rotas de Inspeção Técnica e Sensitiva</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {inspections.map((insp) => (
                <div key={insp.id} style={{ background: 'var(--bg-canvas)', borderRadius: 'var(--radius-md)', padding: '14px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '0.98rem' }}>{insp.title}</h3>
                    <span className={`badge ${insp.status === 'DEFECTS_FOUND' ? 'badge-rose' : 'badge-emerald'}`}>
                      {insp.status === 'DEFECTS_FOUND' ? 'Anomalia Detectada' : 'Aprovada OK'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                    Responsável: {insp.assignedTo} &bull; Frequência: {insp.interval}
                  </div>
                  <div style={{ background: 'var(--bg-surface)', padding: '10px', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem' }}>
                    {insp.points.map((pt, pIdx) => (
                      <div key={pIdx} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                        <span>{pt.pointName}:</span>
                        <span style={{ fontWeight: 700, color: pt.lastValue > pt.max ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
                          {pt.lastValue} {pt.unit} (Nom: {pt.nominal} {pt.unit})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Calibration Instruments Table */}
          <div className="glass-card">
            <h2 style={{ fontSize: '1.15rem', marginBottom: '14px' }}>Controle de Instrumentos de Calibração (Metrologia RBC)</h2>
            <div className="table-wrapper">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>TAG Padrão</th>
                    <th>Descrição</th>
                    <th>Tolerância</th>
                    <th>Validade</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {calibrations.map((c) => (
                    <tr key={c.id}>
                      <td><span className="tag-mono">{c.tag}</span></td>
                      <td style={{ fontSize: '0.82rem' }}>
                        <div style={{ fontWeight: 600 }}>{c.description}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{c.model}</div>
                      </td>
                      <td style={{ fontSize: '0.82rem' }}>{c.tolerance}</td>
                      <td style={{ fontSize: '0.82rem' }}>{c.nextCalibration}</td>
                      <td>
                        <span className={`badge ${c.status === 'VALID' ? 'badge-emerald' : c.status === 'WARNING' ? 'badge-amber' : 'badge-rose'}`}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // MODULE 14: CUSTOS & TCO (TOTAL COST OF OWNERSHIP)
  // -------------------------------------------------------------
  if (module === 'costs') {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title">
              <DollarSign size={28} color="var(--accent-cyan)" />
              Custos de Manutenção, Orçamento & TCO
            </h1>
            <p className="page-subtitle">
              Custo total de propriedade ao longo do ciclo de vida (LCC), Capex vs Opex e comparativo orçado x realizado.
            </p>
          </div>
        </div>

        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-header"><span>Orçamento Anual Aprovado</span><DollarSign size={18} /></div>
            <div className="kpi-value">R$ 1.850.000</div>
            <div className="kpi-footer"><span>Ano fiscal 2026</span></div>
          </div>
          <div className="kpi-card emerald">
            <div className="kpi-header"><span>Gasto Realizado Acumulado</span><CheckCircle size={18} /></div>
            <div className="kpi-value">R$ 1.280.400</div>
            <div className="kpi-footer"><span style={{ color: 'var(--accent-emerald)' }}>69.2% do teto financeiro</span></div>
          </div>
          <div className="kpi-card">
            <div className="kpi-header"><span>Custo de Manutenção / Faturamento</span><Sliders size={18} /></div>
            <div className="kpi-value">3.4%</div>
            <div className="kpi-footer"><span>Referência ABRAMAN: &lt; 4.0%</span></div>
          </div>
        </div>

        <div className="glass-card">
          <h2 style={{ fontSize: '1.15rem', marginBottom: '14px' }}>Composição dos Custos de Manutenção por Categoria</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            <div className="glass-panel">
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>MÃO DE OBRA PRÓPRIA</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-cyan)', margin: '4px 0' }}>R$ 640.200 (50.0%)</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Salários, encargos e horas de intervenção</div>
            </div>
            <div className="glass-panel">
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>PEÇAS & MATERIAIS MRO</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-emerald)', margin: '4px 0' }}>R$ 412.000 (32.2%)</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Rolamentos, óleos, filtros e sobressalentes</div>
            </div>
            <div className="glass-panel">
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>SERVIÇOS DE TERCEIROS ESPECIALIZADOS</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-amber)', margin: '4px 0' }}>R$ 228.200 (17.8%)</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Usinagem pesada, laudos RBC e alinhamentos</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // MODULE 16: AUTOMAÇÕES & WORKFLOWS
  // -------------------------------------------------------------
  if (module === 'automations') {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title">
              <Zap size={28} color="var(--accent-amber)" />
              Automação de Processos & Regras de Negócio
            </h1>
            <p className="page-subtitle">
              Gatilhos automáticos, rotinas de escalonamento de OS críticas e integrações de mensageria sem intervenção humana.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {workflows.map((wf) => (
            <div key={wf.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <Zap size={18} color="var(--accent-amber)" />
                  <h3 style={{ fontSize: '1.05rem' }}>{wf.name}</h3>
                  <span className="badge badge-emerald">{wf.status}</span>
                </div>
                <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  <strong>SE (Gatilho):</strong> {wf.trigger}
                </div>
                <div style={{ fontSize: '0.84rem', color: 'var(--accent-cyan)' }}>
                  <strong>ENTÃO (Ação):</strong> {wf.action}
                </div>
              </div>
              <button className="btn btn-secondary btn-sm">Editar Regra</button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // MODULE 17: INTEGRAÇÕES & APIS
  // -------------------------------------------------------------
  if (module === 'integrations') {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title">
              <Cpu size={28} color="var(--accent-cyan)" />
              Integrações Industriais (ERP, SCADA, PLCs & APIs REST)
            </h1>
            <p className="page-subtitle">
              Conectores prontos para SAP, TOTVS, Rockwell, Siemens, Webhooks de eventos e endpoints RESTful documentados.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', marginBottom: '28px' }}>
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Integração ERP Corporativo (SAP / TOTVS)</h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Sincronização bidirecional de centros de custo, baixas contábeis de peças e ordens de compra.
            </p>
            <span className="badge badge-emerald">Conector SAP Ativo (RFC)</span>
          </div>

          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Rede Industrial SCADA & PLCs (OPC-UA / MQTT)</h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Aquisição contínua de horímetros, contadores de ciclos e alarmes de CLP em campo.
            </p>
            <span className="badge badge-emerald">Servidor OPC-UA Online</span>
          </div>

          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>API RESTful NEXUS (Swagger / OpenAPI)</h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Endpoints autenticados por JWT para consulta e criação de OS a partir de sistemas externos.
            </p>
            <button className="btn btn-secondary btn-sm"><ExternalLink size={14} /> Ver Documentação API</button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // MODULE 19: GESTÃO DOCUMENTAL & MANUAIS
  // -------------------------------------------------------------
  if (module === 'documents') {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title">
              <FileText size={28} color="var(--accent-cyan)" />
              Central de Documentos Técnicos, Manuais & POPs
            </h1>
            <p className="page-subtitle">
              Biblioteca de procedimentos operacionais padrão, esquemas elétricos, catálogos de peças e lições aprendidas.
            </p>
          </div>
          <button className="btn btn-primary"><Plus size={16} /> Fazer Upload de Documento</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {[
            { title: 'Manual de Operação e Manutenção - GA 160 VSD+', tag: 'COMP-04', pages: '148 págs', format: 'PDF Técnico', date: 'Rev. 4.2' },
            { title: 'Diagrama Unifilar e Esquemático Subestação 13.8kV', tag: 'TURB-01', pages: '12 pranchas', format: 'AutoCAD / DWG', date: 'Rev. 2.0' },
            { title: 'POP-MEC-014: Procedimento de Alinhamento a Laser de Eixos', tag: 'GERAL', pages: '8 págs', format: 'Norma Interna', date: 'Aprovado 2026' },
            { title: 'Catálogo de Peças Sobressalentes Prensa H-Frame 600t', tag: 'PREN-02', pages: '84 págs', format: 'PDF Catálogo', date: 'Rev. 1.1' }
          ].map((doc, dIdx) => (
            <div key={dIdx} className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span className="tag-mono">{doc.tag}</span>
                <span className="badge badge-cyan">{doc.format}</span>
              </div>
              <h3 style={{ fontSize: '1rem', lineHeight: 1.4, marginBottom: '8px' }}>{doc.title}</h3>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                {doc.pages} &bull; {doc.date}
              </div>
              <button className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                <Download size={14} /> Abrir Documento Técnico
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // MODULE 21: FROTAS & FACILITIES
  // -------------------------------------------------------------
  if (module === 'specialized') {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title">
              <Truck size={28} color="var(--accent-cyan)" />
              Gestão de Frotas, Facilities & Ferramentaria
            </h1>
            <p className="page-subtitle">
              Controle de quilometragem e consumo de combustível de frotas pesadas, HVAC predial e empréstimo de ferramentas calibradas.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span className="tag-mono">FROTA-03</span>
              <span className="badge badge-emerald">Em Trânsito</span>
            </div>
            <h3 style={{ fontSize: '1.05rem', marginBottom: '6px' }}>Caminhão Cavalo Mecânico Scania R540 6x4</h3>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Hodômetro: <strong>128.450 km</strong> &bull; Consumo Médio: <strong>2.1 km/L Diesel S10</strong>
            </div>
            <div style={{ background: 'var(--bg-canvas)', padding: '10px', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', marginBottom: '14px' }}>
              Próxima Troca de Óleo e Filtros em: <strong>135.000 km</strong> (Faltam 6.550 km)
            </div>
            <button className="btn btn-secondary btn-sm" style={{ width: '100%' }}>Histórico de Abastecimentos e Pneus</button>
          </div>

          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span className="tag-mono">HVAC-CENTRAL-01</span>
              <span className="badge badge-cyan">Facilities</span>
            </div>
            <h3 style={{ fontSize: '1.05rem', marginBottom: '6px' }}>Sistema Chiller de Água Gelada 120 TR (CPD)</h3>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Temperatura de Saída: <strong>7.2 °C</strong> &bull; Pressão Sucção: <strong>4.8 bar</strong>
            </div>
            <div style={{ background: 'var(--bg-canvas)', padding: '10px', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', marginBottom: '14px' }}>
              PMOC (Plano de Manutenção, Operação e Controle) aprovado pela ANVISA.
            </div>
            <button className="btn btn-secondary btn-sm" style={{ width: '100%' }}>Laudo PMOC & Qualidade do Ar</button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // MODULE 23: PORTAL DE CHAMADOS & HELPDESK
  // -------------------------------------------------------------
  if (module === 'helpdesk') {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title">
              <HelpCircle size={28} color="var(--accent-cyan)" />
              Portal de Autoatendimento & Chamados com SLA
            </h1>
            <p className="page-subtitle">
              Canal de solicitação direta para operadores de linha, facilitadores e supervisores com contagem regressiva de SLA.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '24px' }}>
          {/* Submission Form */}
          <div className="glass-card">
            <h2 style={{ fontSize: '1.15rem', marginBottom: '14px' }}>Abrir Solicitação de Serviço de Manutenção</h2>
            <form onSubmit={handleCreateTicket}>
              <div className="form-group">
                <label className="form-label">Setor / Local da Ocorrência</label>
                <input
                  type="text"
                  className="form-input"
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Descrição do Problema / Sintoma</label>
                <textarea
                  rows={3}
                  className="form-textarea"
                  placeholder="Descreva o que está acontecendo na linha..."
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                <Send size={16} /> Enviar Chamado ao PCM
              </button>
            </form>
          </div>

          {/* Ticket List with SLA */}
          <div className="glass-card">
            <h2 style={{ fontSize: '1.15rem', marginBottom: '14px' }}>Chamados Recentes & Monitor de SLA</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {tickets.map((t) => (
                <div key={t.id} style={{ background: 'var(--bg-canvas)', borderRadius: 'var(--radius-md)', padding: '14px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span className="tag-mono">{t.ticketNumber}</span>
                    <span className={`badge ${t.status === 'RESOLVED' ? 'badge-emerald' : 'badge-amber'}`}>
                      {t.status === 'RESOLVED' ? 'Resolvido (Nota 5★)' : 'Em Triagem'}
                    </span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>{t.subject}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Solicitante: {t.requester} &bull; {t.department}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--accent-cyan)', marginTop: '8px' }}>
                    <Clock size={13} /> Prazo SLA de Resolução: <strong>{t.slaDeadline}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <div>Módulo não encontrado</div>;
};
