import React, { useState } from 'react';
import {
  Boxes,
  Plus,
  Search,
  QrCode,
  FileText,
  AlertCircle,
  Activity,
  CheckCircle2,
  X,
  Printer
} from 'lucide-react';
import { Asset, AssetCriticality, AssetStatus } from '../types';
import { INITIAL_ASSETS } from '../services/mockData';

export const AssetsView: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCriticality, setSelectedCriticality] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [activeAssetModal, setActiveAssetModal] = useState<Asset | null>(null);
  const [showQrModal, setShowQrModal] = useState<Asset | null>(null);
  const [showNewAssetModal, setShowNewAssetModal] = useState(false);

  // New Asset form state
  const [newTag, setNewTag] = useState('');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Usinagem & Fabricação');
  const [newPlant, setNewPlant] = useState('Unidade Industrial 01');
  const [newArea, setNewArea] = useState('Estamparia Pesada');
  const [newLine, setNewLine] = useState('Linha 01');
  const [newCriticality, setNewCriticality] = useState<AssetCriticality>('A');
  const [newManufacturer, setNewManufacturer] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newSerial, setNewSerial] = useState('');
  const [newPower, setNewPower] = useState(75);
  const [newVoltage, setNewVoltage] = useState(440);

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.serialNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCriticality =
      selectedCriticality === 'ALL' || asset.criticality === selectedCriticality;

    const matchesStatus =
      selectedStatus === 'ALL' || asset.status === selectedStatus;

    return matchesSearch && matchesCriticality && matchesStatus;
  });

  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    const created: Asset = {
      id: `ast-${Date.now()}`,
      tag: newTag.toUpperCase(),
      name: newName,
      category: newCategory,
      plant: newPlant,
      area: newArea,
      line: newLine,
      criticality: newCriticality,
      status: 'OPERATIONAL',
      manufacturer: newManufacturer,
      model: newModel,
      serialNumber: newSerial,
      installDate: new Date().toISOString().split('T')[0],
      powerKw: Number(newPower),
      voltageV: Number(newVoltage),
      healthScore: 100,
      totalMaintenanceCost: 0,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=ASSET-${newTag.toUpperCase()}`,
      specs: {
        'Tensão de Alimentação': `${newVoltage} V`,
        'Potência Instalada': `${newPower} kW`,
        'Status do Ativo': 'Operando Conforme Projeto'
      },
      documentsCount: 1,
      warrantyExpiry: '2028-12-31'
    };

    setAssets([created, ...assets]);
    setShowNewAssetModal(false);
    // Reset
    setNewTag('');
    setNewName('');
    setNewManufacturer('');
    setNewModel('');
    setNewSerial('');
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Boxes size={28} color="var(--accent-cyan)" />
            Gestão e Cadastro de Ativos Industriais (EAM)
          </h1>
          <p className="page-subtitle">
            Catálogo completo com hierarquia funcional, especificações elétricas/mecânicas, histórico e etiquetagem QR Code.
          </p>
        </div>

        <button onClick={() => setShowNewAssetModal(true)} className="btn btn-primary">
          <Plus size={18} /> Novo Ativo Industrial
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div
        className="glass-panel"
        style={{
          marginBottom: '24px',
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
          <div className="search-input-box" style={{ flex: '1 1 280px' }}>
            <Search size={17} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Buscar por TAG, nome, fabricante, nº de série..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Criticidade:</span>
            <select
              className="form-select"
              style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem' }}
              value={selectedCriticality}
              onChange={(e) => setSelectedCriticality(e.target.value)}
            >
              <option value="ALL">Todas (A, B, C)</option>
              <option value="A">Classe A (Crítica)</option>
              <option value="B">Classe B (Média)</option>
              <option value="C">Classe C (Baixa)</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Status:</span>
            <select
              className="form-select"
              style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem' }}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="ALL">Todos os Status</option>
              <option value="OPERATIONAL">Em Operação</option>
              <option value="IN_MAINTENANCE">Em Manutenção</option>
              <option value="STANDBY">Reserva (Standby)</option>
            </select>
          </div>
        </div>

        <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
          Mostrando <strong>{filteredAssets.length}</strong> de {assets.length} ativos
        </div>
      </div>

      {/* Assets Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '22px' }}>
        {filteredAssets.map((asset) => (
          <div key={asset.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Top Tag & Status */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="tag-mono" style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                  {asset.tag}
                </span>
                <span className={`badge ${asset.criticality === 'A' ? 'badge-rose' : asset.criticality === 'B' ? 'badge-amber' : 'badge-slate'}`}>
                  Classe {asset.criticality}
                </span>
              </div>

              <span className={`badge ${asset.status === 'OPERATIONAL' ? 'badge-emerald' : 'badge-amber'}`}>
                {asset.status === 'OPERATIONAL' ? 'Operacional' : 'Manutenção'}
              </span>
            </div>

            {/* Asset Name & Category */}
            <div style={{ marginBottom: '14px', flex: 1 }}>
              <h3 style={{ fontSize: '1.08rem', lineHeight: 1.3, marginBottom: '4px' }}>
                {asset.name}
              </h3>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                {asset.category} &bull; {asset.area}
              </div>
            </div>

            {/* Manufacturer & Power specs */}
            <div
              style={{
                background: 'var(--bg-canvas)',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8rem',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                marginBottom: '16px'
              }}
            >
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Fabricante:</span>
                <div style={{ fontWeight: 600 }}>{asset.manufacturer}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Potência / Tensão:</span>
                <div style={{ fontWeight: 600 }}>{asset.powerKw} kW / {asset.voltageV}V</div>
              </div>
            </div>

            {/* Health Score Progress */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Condição de Saúde (Health Index)</span>
                <span style={{ fontWeight: 700, color: asset.healthScore > 80 ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>
                  {asset.healthScore}%
                </span>
              </div>
              <div style={{ width: '100%', height: '7px', background: 'var(--bg-canvas)', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${asset.healthScore}%`,
                    height: '100%',
                    background: asset.healthScore > 80 ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                  }}
                />
              </div>
            </div>

            {/* Actions Footer */}
            <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
              <button
                onClick={() => setActiveAssetModal(asset)}
                className="btn btn-secondary btn-sm"
                style={{ flex: 1 }}
              >
                <FileText size={15} /> Ficha Técnica
              </button>
              <button
                onClick={() => setShowQrModal(asset)}
                className="btn btn-secondary btn-sm"
                title="Imprimir QR Code de Campo"
              >
                <QrCode size={15} color="var(--accent-cyan)" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Asset Details Modal */}
      {activeAssetModal && (
        <div className="modal-backdrop" onClick={() => setActiveAssetModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="tag-mono" style={{ fontSize: '1rem' }}>{activeAssetModal.tag}</span>
                <h2 style={{ fontSize: '1.2rem' }}>{activeAssetModal.name}</h2>
              </div>
              <button onClick={() => setActiveAssetModal(null)} className="btn btn-secondary btn-sm">
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div className="glass-panel">
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>LOCALIZAÇÃO HIERÁRQUICA</div>
                  <div style={{ fontWeight: 600, marginTop: '4px' }}>
                    {activeAssetModal.plant} &gt; {activeAssetModal.area} &gt; {activeAssetModal.line}
                  </div>
                </div>
                <div className="glass-panel">
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>DADOS DE PLACA</div>
                  <div style={{ fontWeight: 600, marginTop: '4px' }}>
                    {activeAssetModal.manufacturer} &bull; Modelo {activeAssetModal.model}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>S/N: {activeAssetModal.serialNumber}</div>
                </div>
                <div className="glass-panel">
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CUSTO ACUMULADO DE MANUTENÇÃO</div>
                  <div style={{ fontWeight: 800, color: 'var(--accent-cyan)', fontSize: '1.2rem', marginTop: '4px' }}>
                    R$ {activeAssetModal.totalMaintenanceCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              <h3 style={{ fontSize: '1rem', marginBottom: '12px' }}>Especificações Técnicas Operacionais</h3>
              <div style={{ background: 'var(--bg-canvas)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '20px' }}>
                {Object.entries(activeAssetModal.specs).map(([key, val]) => (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.88rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{key}:</span>
                    <span style={{ fontWeight: 600 }}>{val}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>
                  Data de Instalação: {activeAssetModal.installDate} &bull; Garantia até: {activeAssetModal.warrantyExpiry}
                </span>
                <span className="badge badge-cyan">{activeAssetModal.documentsCount} Manuais e Desenhos Anexados</span>
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => setShowQrModal(activeAssetModal)} className="btn btn-secondary">
                <QrCode size={16} /> Ver QR Code
              </button>
              <button onClick={() => setActiveAssetModal(null)} className="btn btn-primary">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Inspection Modal */}
      {showQrModal && (
        <div className="modal-backdrop" onClick={() => setShowQrModal(null)}>
          <div className="modal-content" style={{ maxWidth: '420px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.1rem' }}>QR Code para Identificação em Campo</h2>
              <button onClick={() => setShowQrModal(null)} className="btn btn-secondary btn-sm"><X size={16} /></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ padding: '16px', background: '#ffffff', borderRadius: '12px', marginBottom: '16px', boxShadow: 'var(--shadow-md)' }}>
                <img
                  src={showQrModal.qrCodeUrl}
                  alt={`QR Code ${showQrModal.tag}`}
                  style={{ width: '180px', height: '180px', display: 'block' }}
                />
              </div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{showQrModal.tag}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>{showQrModal.name}</div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Os operadores e técnicos podem apontar a câmera do celular para este QR Code para abrir a OS ou iniciar uma inspeção sensitiva diretamente no aplicativo.
              </p>
            </div>
            <div className="modal-footer" style={{ justifyContent: 'center' }}>
              <button onClick={() => window.print()} className="btn btn-primary">
                <Printer size={16} /> Imprimir Etiqueta Patrimonial
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Asset Creation Modal */}
      {showNewAssetModal && (
        <div className="modal-backdrop" onClick={() => setShowNewAssetModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleCreateAsset}>
              <div className="modal-header">
                <h2 style={{ fontSize: '1.2rem' }}>Cadastrar Novo Ativo Industrial</h2>
                <button type="button" onClick={() => setShowNewAssetModal(false)} className="btn btn-secondary btn-sm"><X size={16} /></button>
              </div>

              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14px', marginBottom: '14px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">TAG Identificador *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ex: PREN-03"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Nome do Equipamento *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ex: Prensa Excêntrica 400 Toneladas"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Fabricante</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ex: Romi / Siemens"
                      value={newManufacturer}
                      onChange={(e) => setNewManufacturer(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Modelo</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ex: GL 240 M"
                      value={newModel}
                      onChange={(e) => setNewModel(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Nº de Série</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="SN-2026-XXXX"
                      value={newSerial}
                      onChange={(e) => setNewSerial(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Criticidade</label>
                    <select className="form-select" value={newCriticality} onChange={(e) => setNewCriticality(e.target.value as AssetCriticality)}>
                      <option value="A">Classe A (Parada Total de Linha)</option>
                      <option value="B">Classe B (Parada Parcial)</option>
                      <option value="C">Classe C (Sem Impacto Crítico)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Potência (kW)</label>
                    <input type="number" className="form-input" value={newPower} onChange={(e) => setNewPower(Number(e.target.value))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tensão (V)</label>
                    <input type="number" className="form-input" value={newVoltage} onChange={(e) => setNewVoltage(Number(e.target.value))} />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowNewAssetModal(false)} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Salvar Ativo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
