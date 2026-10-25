import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ChevronDown, ChevronRight, ChevronsDownUp, ChevronsUpDown, Pencil, Plus, Printer,
  QrCode, Search, Trash2, X, AlertCircle, Boxes, CornerDownRight,
} from 'lucide-react';
import { useAuth } from '../services/AuthContext';
import {
  ApiAsset, AssetCriticality, AssetInput, AssetStatus, TreeNode,
  assetsApi, buildTree, descendantIds, toInput,
} from '../services/assetsApi';

const STATUS: Record<AssetStatus, { label: string; chip: string; dot: string }> = {
  OPERATIONAL: { label: 'Operando', chip: 'chip-ok', dot: 'var(--accent-emerald)' },
  IN_MAINTENANCE: { label: 'Manutenção', chip: 'chip-warn', dot: 'var(--accent-amber)' },
  STANDBY: { label: 'Reserva', chip: 'chip-neutral', dot: 'var(--text-muted)' },
  QUARANTINE: { label: 'Parado', chip: 'chip-danger', dot: 'var(--accent-rose)' },
  DECOMMISSIONED: { label: 'Desativado', chip: 'chip-neutral', dot: 'var(--text-muted)' },
};
const CRIT_CHIP: Record<AssetCriticality, string> = { A: 'chip-danger', B: 'chip-warn', C: 'chip-neutral' };

const emptyForm = (parentId: string | null, parent?: ApiAsset): AssetInput => ({
  tag: '', name: '', category: '', parentId,
  plant: parent?.plant ?? '', area: parent?.area ?? '', line: parent?.line ?? '',
  criticality: 'B', status: 'OPERATIONAL',
  manufacturer: '', model: '', serialNumber: '', installDate: null,
  powerKw: 0, voltageV: 0, warrantyExpiry: null, specs: {},
});

const brl = (v: number) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

export const AssetsView: React.FC = () => {
  const { user } = useAuth();
  const canWrite = !!user && ['ADMIN', 'MANAGER', 'PLANNER'].includes(user.role);
  const canDelete = !!user && ['ADMIN', 'MANAGER'].includes(user.role);

  const [assets, setAssets] = useState<ApiAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState('');
  const [critFilter, setCritFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [form, setForm] = useState<{ id: string | null; data: AssetInput } | null>(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [qrAsset, setQrAsset] = useState<ApiAsset | null>(null);
  const [actionError, setActionError] = useState('');

  const load = useCallback(async (opts?: { expandAll?: boolean }) => {
    try {
      const list = await assetsApi.list();
      setAssets(list);
      setLoadError('');
      if (opts?.expandAll) setExpanded(new Set(list.map((a) => a.id)));
      setSelectedId((cur) => (cur && list.some((a) => a.id === cur) ? cur : null));
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Falha ao carregar ativos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load({ expandAll: true }); }, [load]);

  const byId = useMemo(() => new Map(assets.map((a) => [a.id, a])), [assets]);
  const tree = useMemo(() => buildTree(assets), [assets]);
  const selected = selectedId ? byId.get(selectedId) ?? null : null;
  const childrenOf = useMemo(() => {
    const m = new Map<string, ApiAsset[]>();
    for (const a of assets) if (a.parentId) m.set(a.parentId, [...(m.get(a.parentId) ?? []), a]);
    return m;
  }, [assets]);

  // Filtro: mantém os ativos que casam + todos os seus ancestrais (contexto da árvore)
  const filtering = query.trim() !== '' || critFilter !== 'ALL' || statusFilter !== 'ALL';
  const { visible, matches } = useMemo(() => {
    const q = query.trim().toLowerCase();
    const match = new Set<string>();
    for (const a of assets) {
      const okText = !q || [a.tag, a.name, a.manufacturer, a.serialNumber, a.category].some((f) => f.toLowerCase().includes(q));
      if (okText && (critFilter === 'ALL' || a.criticality === critFilter) && (statusFilter === 'ALL' || a.status === statusFilter)) {
        match.add(a.id);
      }
    }
    const vis = new Set<string>(match);
    for (const id of match) {
      let p = byId.get(id)?.parentId;
      while (p && !vis.has(p)) { vis.add(p); p = byId.get(p)?.parentId; }
    }
    return { visible: vis, matches: match };
  }, [assets, byId, query, critFilter, statusFilter]);

  const toggle = (id: string) =>
    setExpanded((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  const path = (a: ApiAsset): ApiAsset[] => {
    const out: ApiAsset[] = [];
    let cur: ApiAsset | undefined = a;
    while (cur) { out.unshift(cur); cur = cur.parentId ? byId.get(cur.parentId) : undefined; }
    return out;
  };

  const openNew = (parent?: ApiAsset) => { setFormError(''); setForm({ id: null, data: emptyForm(parent?.id ?? null, parent) }); };
  const openEdit = (a: ApiAsset) => { setFormError(''); setForm({ id: a.id, data: toInput(a) }); };
  const setField = <K extends keyof AssetInput>(k: K, v: AssetInput[K]) =>
    setForm((f) => (f ? { ...f, data: { ...f.data, [k]: v } } : f));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setFormError('');
    try {
      const payload = { ...form.data, tag: form.data.tag.trim().toUpperCase() };
      let id = form.id;
      if (id) await assetsApi.update(id, payload);
      else id = (await assetsApi.create(payload)).id;
      if (payload.parentId) setExpanded((s) => new Set(s).add(payload.parentId as string));
      await load();
      setSelectedId(id);
      setForm(null);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Falha ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (a: ApiAsset) => {
    setActionError('');
    if ((childrenOf.get(a.id) ?? []).length > 0) {
      setActionError(`"${a.tag}" possui ativos filhos. Mova ou exclua os filhos antes.`);
      return;
    }
    if (!window.confirm(`Excluir o ativo ${a.tag} — ${a.name}? Esta ação não pode ser desfeita.`)) return;
    try {
      await assetsApi.remove(a.id);
      setSelectedId(null);
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Falha ao excluir');
    }
  };

  // Pais possíveis: qualquer ativo, exceto ele mesmo e seus descendentes (evita ciclos)
  const parentOptions = useMemo(() => {
    const blocked = form?.id ? descendantIds(assets, form.id) : new Set<string>();
    return assets.filter((a) => !blocked.has(a.id)).sort((a, b) => a.tag.localeCompare(b.tag));
  }, [assets, form?.id]);

  const renderNode = (n: TreeNode): React.ReactNode => {
    if (!visible.has(n.asset.id)) return null;
    const a = n.asset;
    const kids = n.children.filter((c) => visible.has(c.asset.id));
    const hasKids = kids.length > 0;
    const isOpen = filtering || expanded.has(a.id);
    const st = STATUS[a.status];
    const dim = filtering && !matches.has(a.id);
    return (
      <li key={a.id} role="none">
        <div
          role="treeitem"
          aria-level={n.depth + 1}
          aria-expanded={hasKids ? isOpen : undefined}
          aria-selected={selectedId === a.id}
          tabIndex={0}
          className={`tree-row ${selectedId === a.id ? 'selected' : ''} ${dim ? 'dim' : ''}`}
          style={{ paddingLeft: 8 + n.depth * 22 }}
          onClick={() => setSelectedId(a.id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedId(a.id); }
            if (e.key === 'ArrowRight' && hasKids && !isOpen) toggle(a.id);
            if (e.key === 'ArrowLeft' && hasKids && isOpen) toggle(a.id);
          }}
        >
          <button
            className="tree-toggle"
            aria-label={isOpen ? 'Recolher' : 'Expandir'}
            style={{ visibility: hasKids ? 'visible' : 'hidden' }}
            onClick={(e) => { e.stopPropagation(); toggle(a.id); }}
            tabIndex={-1}
          >
            {isOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
          </button>
          <span className="tree-dot" style={{ background: st.dot }} title={st.label} />
          <span className="tag-mono">{a.tag}</span>
          <span className="tree-name">{a.name}</span>
          {a.openOrders > 0 && <span className="badge chip-warn" title="Ordens de serviço abertas">{a.openOrders} OS</span>}
          <span className={`badge ${CRIT_CHIP[a.criticality]}`} title={`Criticidade ${a.criticality}`}>{a.criticality}</span>
        </div>
        {hasKids && isOpen && <ul role="group" className="tree-group">{kids.map(renderNode)}</ul>}
      </li>
    );
  };

  const kids = selected ? childrenOf.get(selected.id) ?? [] : [];
  const f = form?.data;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title"><Boxes size={22} /> Árvore de ativos</h2>
          <p className="page-subtitle">
            Hierarquia funcional: planta, linha, equipamento e componentes. Selecione um nó para ver a ficha técnica.
          </p>
        </div>
        {canWrite && (
          <button id="btn-novo-ativo" onClick={() => openNew()} className="btn btn-primary">
            <Plus size={16} /> Novo ativo raiz
          </button>
        )}
      </div>

      {loadError && (
        <div className="notice" role="alert" style={{ borderRadius: 'var(--radius-md)', marginBottom: 16, padding: '10px 14px' }}>
          <span><AlertCircle size={16} style={{ verticalAlign: -3 }} /> {loadError}</span>
          <button className="btn btn-secondary btn-sm" onClick={() => { setLoading(true); load(); }}>Tentar novamente</button>
        </div>
      )}

      <div className="assets-layout">
        {/* Árvore */}
        <section className="glass-card tree-panel" aria-label="Árvore de ativos">
          <div className="tree-tools">
            <div className="search-input-box" style={{ flex: 1, minWidth: 0 }}>
              <Search size={16} />
              <input
                type="text"
                aria-label="Buscar ativo"
                placeholder="Buscar TAG, nome, fabricante..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <button className="btn btn-ghost btn-icon" title="Expandir tudo" aria-label="Expandir tudo"
              onClick={() => setExpanded(new Set(assets.map((a) => a.id)))}><ChevronsUpDown size={16} /></button>
            <button className="btn btn-ghost btn-icon" title="Recolher tudo" aria-label="Recolher tudo"
              onClick={() => setExpanded(new Set())}><ChevronsDownUp size={16} /></button>
          </div>
          <div className="tree-tools" style={{ marginTop: 8 }}>
            <select className="form-select" aria-label="Filtrar criticidade" value={critFilter}
              onChange={(e) => setCritFilter(e.target.value)} style={{ padding: '6px 10px' }}>
              <option value="ALL">Toda criticidade</option>
              <option value="A">Classe A</option>
              <option value="B">Classe B</option>
              <option value="C">Classe C</option>
            </select>
            <select className="form-select" aria-label="Filtrar status" value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '6px 10px' }}>
              <option value="ALL">Todo status</option>
              {(Object.keys(STATUS) as AssetStatus[]).map((s) => <option key={s} value={s}>{STATUS[s].label}</option>)}
            </select>
          </div>
          <div className="panel-sub" style={{ margin: '10px 4px' }}>
            {filtering ? `${matches.size} de ${assets.length} ativos` : `${assets.length} ativos`}
          </div>

          {loading ? (
            <p className="panel-sub" style={{ padding: 16 }}>Carregando ativos...</p>
          ) : assets.length === 0 ? (
            <div style={{ padding: '24px 8px', textAlign: 'center' }}>
              <p className="panel-sub">Nenhum ativo cadastrado.</p>
              {canWrite && <button className="btn btn-secondary btn-sm" style={{ marginTop: 10 }} onClick={() => openNew()}>Cadastrar o primeiro</button>}
            </div>
          ) : visible.size === 0 ? (
            <p className="panel-sub" style={{ padding: 16 }}>Nenhum ativo com este filtro.</p>
          ) : (
            <ul role="tree" aria-label="Ativos" className="tree">{tree.map(renderNode)}</ul>
          )}
        </section>

        {/* Ficha do ativo */}
        <section className="glass-card detail-panel" aria-label="Ficha do ativo">
          {!selected ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '64px 16px' }}>
              <Boxes size={32} style={{ marginBottom: 12, opacity: 0.6 }} />
              <p>Selecione um ativo na árvore para ver os detalhes.</p>
            </div>
          ) : (
            <>
              <nav className="crumbs" aria-label="Localização na hierarquia">
                {path(selected).map((p, i, arr) => (
                  <React.Fragment key={p.id}>
                    {i > 0 && <ChevronRight size={13} />}
                    {i === arr.length - 1
                      ? <span aria-current="page">{p.name}</span>
                      : <button onClick={() => setSelectedId(p.id)}>{p.name}</button>}
                  </React.Fragment>
                ))}
              </nav>

              <div className="panel-head" style={{ alignItems: 'flex-start' }}>
                <div style={{ minWidth: 0 }}>
                  <div className="alert-meta">
                    <span className="tag-mono" style={{ fontSize: '0.9rem' }}>{selected.tag}</span>
                    <span className={`badge chip-dot ${STATUS[selected.status].chip}`}>{STATUS[selected.status].label}</span>
                    <span className={`badge ${CRIT_CHIP[selected.criticality]}`}>Classe {selected.criticality}</span>
                  </div>
                  <h3 style={{ fontSize: '1.2rem' }}>{selected.name}</h3>
                  <p className="panel-sub">{[selected.category, selected.plant, selected.area, selected.line].filter(Boolean).join(' · ')}</p>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => setQrAsset(selected)}><QrCode size={14} /> QR Code</button>
                  {canWrite && <button className="btn btn-secondary btn-sm" onClick={() => openNew(selected)}><Plus size={14} /> Subitem</button>}
                  {canWrite && <button className="btn btn-secondary btn-sm" onClick={() => openEdit(selected)}><Pencil size={14} /> Editar</button>}
                  {canDelete && <button className="btn btn-secondary btn-sm" style={{ color: 'var(--accent-rose)' }} onClick={() => remove(selected)}><Trash2 size={14} /> Excluir</button>}
                </div>
              </div>

              {actionError && <div className="notice" role="alert" style={{ borderRadius: 'var(--radius-md)', marginBottom: 14, padding: '8px 12px' }}>{actionError}</div>}

              <div className="info-grid">
                <div className="glass-panel"><div className="info-k">Fabricante / modelo</div><div className="info-v">{selected.manufacturer || '—'} {selected.model && `· ${selected.model}`}</div></div>
                <div className="glass-panel"><div className="info-k">Nº de série</div><div className="info-v">{selected.serialNumber || '—'}</div></div>
                <div className="glass-panel"><div className="info-k">Potência / tensão</div><div className="info-v">{selected.powerKw} kW / {selected.voltageV} V</div></div>
                <div className="glass-panel"><div className="info-k">Custo de manutenção</div><div className="info-v">{brl(selected.totalMaintenanceCost)}</div></div>
                <div className="glass-panel"><div className="info-k">OS abertas</div><div className="info-v">{selected.openOrders}</div></div>
                <div className="glass-panel"><div className="info-k">Instalação / garantia</div>
                  <div className="info-v">{selected.installDate?.slice(0, 10) ?? '—'} / {selected.warrantyExpiry?.slice(0, 10) ?? '—'}</div></div>
              </div>

              {Object.keys(selected.specs ?? {}).length > 0 && (
                <>
                  <h4 className="section-h">Especificações técnicas</h4>
                  <div className="spec-list">
                    {Object.entries(selected.specs).map(([k, v]) => (
                      <div key={k}><span>{k}</span><strong>{v}</strong></div>
                    ))}
                  </div>
                </>
              )}

              <h4 className="section-h">Subitens ({kids.length})</h4>
              {kids.length === 0 ? (
                <p className="panel-sub">Este ativo não possui subitens.</p>
              ) : (
                <div className="stack">
                  {kids.map((c) => (
                    <button key={c.id} className="child-row" onClick={() => { setSelectedId(c.id); }}>
                      <CornerDownRight size={14} />
                      <span className="tag-mono">{c.tag}</span>
                      <span style={{ flex: 1, textAlign: 'left' }}>{c.name}</span>
                      <span className={`badge chip-dot ${STATUS[c.status].chip}`}>{STATUS[c.status].label}</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {/* Modal criar/editar */}
      {form && f && (
        <div className="modal-backdrop" onClick={() => setForm(null)}>
          <div className="modal-content" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={save}>
              <div className="modal-header">
                <h3 style={{ fontSize: '1.1rem' }}>{form.id ? 'Editar ativo' : f.parentId ? 'Novo subitem' : 'Novo ativo raiz'}</h3>
                <button type="button" onClick={() => setForm(null)} className="btn btn-ghost btn-icon" aria-label="Fechar"><X size={16} /></button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label" htmlFor="as-parent">Ativo pai</label>
                  <select id="as-parent" className="form-select" value={f.parentId ?? ''} onChange={(e) => setField('parentId', e.target.value || null)}>
                    <option value="">— Nenhum (nível raiz) —</option>
                    {parentOptions.map((p) => <option key={p.id} value={p.id}>{p.tag} · {p.name}</option>)}
                  </select>
                </div>
                <div className="form-row" style={{ gridTemplateColumns: '1fr 2fr' }}>
                  <div className="form-group"><label className="form-label" htmlFor="as-tag">TAG *</label>
                    <input id="as-tag" className="form-input" required maxLength={60} value={f.tag} onChange={(e) => setField('tag', e.target.value)} placeholder="Ex: PREN-03" /></div>
                  <div className="form-group"><label className="form-label" htmlFor="as-name">Nome *</label>
                    <input id="as-name" className="form-input" required maxLength={160} value={f.name} onChange={(e) => setField('name', e.target.value)} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label" htmlFor="as-cat">Categoria</label>
                    <input id="as-cat" className="form-input" value={f.category} onChange={(e) => setField('category', e.target.value)} placeholder="Linha, Motor, Bomba..." /></div>
                  <div className="form-group"><label className="form-label" htmlFor="as-crit">Criticidade</label>
                    <select id="as-crit" className="form-select" value={f.criticality} onChange={(e) => setField('criticality', e.target.value as AssetCriticality)}>
                      <option value="A">Classe A (parada total)</option><option value="B">Classe B (parada parcial)</option><option value="C">Classe C (sem impacto crítico)</option>
                    </select></div>
                  <div className="form-group"><label className="form-label" htmlFor="as-status">Status</label>
                    <select id="as-status" className="form-select" value={f.status} onChange={(e) => setField('status', e.target.value as AssetStatus)}>
                      {(Object.keys(STATUS) as AssetStatus[]).map((s) => <option key={s} value={s}>{STATUS[s].label}</option>)}
                    </select></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label" htmlFor="as-plant">Planta</label>
                    <input id="as-plant" className="form-input" value={f.plant} onChange={(e) => setField('plant', e.target.value)} /></div>
                  <div className="form-group"><label className="form-label" htmlFor="as-area">Área</label>
                    <input id="as-area" className="form-input" value={f.area} onChange={(e) => setField('area', e.target.value)} /></div>
                  <div className="form-group"><label className="form-label" htmlFor="as-line">Linha</label>
                    <input id="as-line" className="form-input" value={f.line} onChange={(e) => setField('line', e.target.value)} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label" htmlFor="as-man">Fabricante</label>
                    <input id="as-man" className="form-input" value={f.manufacturer} onChange={(e) => setField('manufacturer', e.target.value)} /></div>
                  <div className="form-group"><label className="form-label" htmlFor="as-mod">Modelo</label>
                    <input id="as-mod" className="form-input" value={f.model} onChange={(e) => setField('model', e.target.value)} /></div>
                  <div className="form-group"><label className="form-label" htmlFor="as-sn">Nº de série</label>
                    <input id="as-sn" className="form-input" value={f.serialNumber} onChange={(e) => setField('serialNumber', e.target.value)} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label" htmlFor="as-kw">Potência (kW)</label>
                    <input id="as-kw" type="number" min={0} step="any" className="form-input" value={f.powerKw} onChange={(e) => setField('powerKw', Number(e.target.value))} /></div>
                  <div className="form-group"><label className="form-label" htmlFor="as-v">Tensão (V)</label>
                    <input id="as-v" type="number" min={0} step="any" className="form-input" value={f.voltageV} onChange={(e) => setField('voltageV', Number(e.target.value))} /></div>
                  <div className="form-group"><label className="form-label" htmlFor="as-inst">Instalação</label>
                    <input id="as-inst" type="date" className="form-input" value={f.installDate ?? ''} onChange={(e) => setField('installDate', e.target.value || null)} /></div>
                </div>
                {formError && <div className="notice" role="alert" style={{ borderRadius: 'var(--radius-md)', padding: '8px 12px' }}>{formError}</div>}
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setForm(null)} className="btn btn-secondary">Cancelar</button>
                <button type="submit" disabled={saving} className="btn btn-primary">{saving ? 'Salvando...' : 'Salvar ativo'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal QR */}
      {qrAsset && (
        <div className="modal-backdrop" onClick={() => setQrAsset(null)}>
          <div className="modal-content" style={{ maxWidth: 420, textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.05rem' }}>QR Code de identificação</h3>
              <button onClick={() => setQrAsset(null)} className="btn btn-ghost btn-icon" aria-label="Fechar"><X size={16} /></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ padding: 16, background: '#ffffff', borderRadius: 12, marginBottom: 14, border: '1px solid var(--border-subtle)' }}>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=ASSET-${encodeURIComponent(qrAsset.tag)}`}
                  alt={`QR Code ${qrAsset.tag}`} width={180} height={180} style={{ display: 'block' }} />
              </div>
              <div style={{ fontWeight: 700 }}>{qrAsset.tag}</div>
              <div className="panel-sub">{qrAsset.name}</div>
            </div>
            <div className="modal-footer" style={{ justifyContent: 'center' }}>
              <button onClick={() => window.print()} className="btn btn-primary"><Printer size={16} /> Imprimir etiqueta</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
