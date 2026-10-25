import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  KeyRound,
  Lock,
  Copy,
  Check,
  Download,
  Server,
  FileCode,
  Cloud,
  CheckCircle2,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { CommercialLicense, LicenseValidationResult, LicenseTier } from '../types';
import {
  getMachineFingerprint,
  generateCommercialLicense,
  exportLicenseKeyString,
  importLicenseKeyString,
  validateLicense,
  saveInstalledLicense
} from '../services/licensingEngine';

interface CommercialSecurityViewProps {
  licenseResult: LicenseValidationResult;
  onRefreshLicense: () => void;
}

export const CommercialSecurityView: React.FC<CommercialSecurityViewProps> = ({
  licenseResult,
  onRefreshLicense
}) => {
  const currentFingerprint = getMachineFingerprint();
  const [copiedFingerprint, setCopiedFingerprint] = useState(false);
  const [copiedLicenseKey, setCopiedLicenseKey] = useState(false);

  // Key Generator form state (For the Software Owner)
  const [clientName, setClientName] = useState('Metalúrgica Aliança S/A');
  const [clientTaxId, setClientTaxId] = useState('33.892.411/0001-44');
  const [tier, setTier] = useState<LicenseTier>('ENTERPRISE_AI');
  const [durationDays, setDurationDays] = useState(365);
  const [targetFingerprint, setTargetFingerprint] = useState(currentFingerprint);
  const [maxAssets, setMaxAssets] = useState(500);
  const [maxUsers, setMaxUsers] = useState(30);

  const [generatedLicense, setGeneratedLicense] = useState<CommercialLicense | null>(null);
  const [generatedKeyString, setGeneratedKeyString] = useState('');

  // Activation Input state
  const [inputLicenseKey, setInputLicenseKey] = useState('');
  const [activationFeedback, setActivationFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const handleCopyFingerprint = () => {
    navigator.clipboard.writeText(currentFingerprint);
    setCopiedFingerprint(true);
    setTimeout(() => setCopiedFingerprint(false), 2000);
  };

  const handleGenerateLicense = (e: React.FormEvent) => {
    e.preventDefault();
    const lic = generateCommercialLicense({
      clientName,
      clientTaxId,
      tier,
      durationDays: Number(durationDays),
      machineFingerprint: targetFingerprint,
      maxAssets: Number(maxAssets),
      maxUsers: Number(maxUsers),
      allowedModules: ['all']
    });

    const keyStr = exportLicenseKeyString(lic);
    setGeneratedLicense(lic);
    setGeneratedKeyString(keyStr);
  };

  const handleCopyGeneratedKey = () => {
    navigator.clipboard.writeText(generatedKeyString);
    setCopiedLicenseKey(true);
    setTimeout(() => setCopiedLicenseKey(false), 2000);
  };

  const handleDownloadLicFile = () => {
    if (!generatedLicense) return;
    const blob = new Blob([JSON.stringify(generatedLicense, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus_license_${generatedLicense.clientTaxId.replace(/[^0-9]/g, '')}.lic`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleApplyLicense = (licToApply: CommercialLicense) => {
    saveInstalledLicense(licToApply);
    onRefreshLicense();
    setActivationFeedback({
      success: true,
      message: 'Licença comercial instalada e validada com sucesso!'
    });
  };

  const handleActivateManualKey = () => {
    const lic = importLicenseKeyString(inputLicenseKey);
    if (!lic) {
      setActivationFeedback({
        success: false,
        message: 'Código de chave inválido ou corrompido! Verifique a chave recebida.'
      });
      return;
    }

    const testValidation = validateLicense(lic);
    if (!testValidation.valid) {
      setActivationFeedback({
        success: false,
        message: testValidation.message
      });
      return;
    }

    saveInstalledLicense(lic);
    onRefreshLicense();
    setActivationFeedback({
      success: true,
      message: `Licença ativada com sucesso para ${lic.clientName}!`
    });
    setInputLicenseKey('');
  };

  // Tamper Simulation Tests
  const handleSimulateTamper = () => {
    if (!licenseResult.license) return;
    const tampered: CommercialLicense = {
      ...licenseResult.license,
      expiresAt: '2099-12-31T23:59:59.000Z', // Client tried to alter expiration manually!
      maxAssets: 999999
    };
    saveInstalledLicense(tampered);
    onRefreshLicense();
  };

  const handleSimulateHardwareMismatch = () => {
    if (!licenseResult.license) return;
    const copiedLicense: CommercialLicense = {
      ...licenseResult.license,
      machineFingerprint: 'NX-SRV-9999-XXXX-UNAUTHORIZED-SERVER' // Copied to another server!
    };
    saveInstalledLicense(copiedLicense);
    onRefreshLicense();
  };

  const handleRestoreValidLicense = () => {
    const valid = generateCommercialLicense({
      clientName: 'Indústria Metalmecânica Exemplo Ltda',
      clientTaxId: '12.345.678/0001-90',
      tier: 'ENTERPRISE_AI',
      durationDays: 365,
      machineFingerprint: currentFingerprint,
      maxAssets: 500,
      maxUsers: 50
    });
    saveInstalledLicense(valid);
    onRefreshLicense();
    setActivationFeedback(null);
  };

  return (
    <div>
      {/* Header Banner */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Lock size={28} color="var(--accent-amber)" />
            Segurança Comercial & Sistema Anti-Cópia
          </h1>
          <p className="page-subtitle">
            Arquitetura de proteção digital, licenciamento criptográfico por hardware (Node-Locking) e gerador de chaves para clientes compradores.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleRestoreValidLicense} className="btn btn-secondary btn-sm">
            <RefreshCw size={15} /> Restaurar Licença Original
          </button>
        </div>
      </div>

      {/* Current License Status Card */}
      <div
        className="glass-card"
        style={{
          marginBottom: '28px',
          borderColor: licenseResult.valid ? 'rgba(16, 185, 129, 0.4)' : 'rgba(244, 63, 94, 0.6)',
          background: licenseResult.valid
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(6, 182, 212, 0.05))'
            : 'linear-gradient(135deg, rgba(244, 63, 94, 0.1), rgba(15, 23, 42, 0.8))'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '16px',
                background: licenseResult.valid ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {licenseResult.valid ? (
                <ShieldCheck size={32} color="var(--accent-emerald)" />
              ) : (
                <AlertTriangle size={32} color="var(--accent-rose)" />
              )}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h2 style={{ fontSize: '1.25rem' }}>
                  {licenseResult.valid ? 'Sistema Licenciado e Protegido' : 'ALERTA: Licença Inválida ou Cópia Ilegal'}
                </h2>
                <span className={`badge ${licenseResult.valid ? 'badge-emerald' : 'badge-rose'}`}>
                  {licenseResult.status}
                </span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
                {licenseResult.message}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>DIAS RESTANTES</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: licenseResult.valid ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                {licenseResult.daysRemaining} <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>dias</span>
              </div>
            </div>
          </div>
        </div>

        {/* License Technical Metadata */}
        {licenseResult.license && (
          <div
            style={{
              marginTop: '20px',
              paddingTop: '20px',
              borderTop: '1px solid var(--border-subtle)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
              fontSize: '0.85rem'
            }}
          >
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Empresa Licenciada:</span>
              <div style={{ fontWeight: 700 }}>{licenseResult.license.clientName}</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>CNPJ / Registro:</span>
              <div style={{ fontWeight: 600 }}>{licenseResult.license.clientTaxId}</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Plano Contratado:</span>
              <div><span className="badge badge-cyan">{licenseResult.license.tier}</span></div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Limite de Ativos / Usuários:</span>
              <div style={{ fontWeight: 700 }}>
                {licenseResult.license.maxAssets} Ativos &bull; {licenseResult.license.maxUsers} Usuários
              </div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Vencimento:</span>
              <div style={{ fontWeight: 600 }}>{new Date(licenseResult.license.expiresAt).toLocaleDateString('pt-BR')}</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Assinatura Criptográfica:</span>
              <div className="tag-mono" style={{ textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {licenseResult.license.signature}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Two Columns: Hardware Lock & License Generator */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        
        {/* Column 1: Hardware Fingerprint & Activation */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Server size={22} color="var(--accent-cyan)" />
            <h2 style={{ fontSize: '1.15rem' }}>Identificador de Servidor do Cliente (Hardware ID)</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginBottom: '16px' }}>
            Quando você for vender o software, cada cliente terá este Identificador único gerado automaticamente pelo hardware dele. Ao gerar a licença travada a este ID, <strong>o cliente não poderá copiar o programa para outra máquina ou empresa</strong>.
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--bg-canvas)',
              border: '1px solid var(--border-prominent)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '24px'
            }}
          >
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Hardware Fingerprint Deste Servidor:</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.05rem', color: 'var(--accent-cyan)' }}>
                {currentFingerprint}
              </div>
            </div>
            <button onClick={handleCopyFingerprint} className="btn btn-secondary btn-sm">
              {copiedFingerprint ? <Check size={16} color="var(--accent-emerald)" /> : <Copy size={16} />}
              {copiedFingerprint ? 'Copiado!' : 'Copiar ID'}
            </button>
          </div>

          <h3 style={{ fontSize: '0.98rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <KeyRound size={17} color="var(--accent-emerald)" /> Inserir Chave Comercial para Ativação
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', marginBottom: '12px' }}>
            Cole a chave de licença enviada após o pagamento para liberar o acesso:
          </p>

          <div style={{ marginBottom: '14px' }}>
            <textarea
              rows={3}
              className="form-textarea"
              placeholder="Cole aqui a chave criptografada em Base64..."
              value={inputLicenseKey}
              onChange={(e) => setInputLicenseKey(e.target.value)}
              style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}
            />
          </div>

          <button onClick={handleActivateManualKey} className="btn btn-primary" style={{ width: '100%' }}>
            Ativar Chave de Licença
          </button>

          {activationFeedback && (
            <div
              style={{
                marginTop: '12px',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.84rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: activationFeedback.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                color: activationFeedback.success ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                border: `1px solid ${activationFeedback.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`
              }}
            >
              {activationFeedback.success ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
              {activationFeedback.message}
            </div>
          )}

          {/* Anti-Piracy Simulation Demos */}
          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase' }}>
              Testar Reação do Sistema Anti-Pirataria:
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button onClick={handleSimulateTamper} className="btn btn-secondary btn-sm" style={{ color: 'var(--accent-rose)' }}>
                Testar: Hacker Alterou Validade
              </button>
              <button onClick={handleSimulateHardwareMismatch} className="btn btn-secondary btn-sm" style={{ color: 'var(--accent-amber)' }}>
                Testar: Cliente Copiou p/ Outro Servidor
              </button>
            </div>
          </div>
        </div>

        {/* Column 2: MASTER KEY GENERATOR (Software Owner Console) */}
        <div className="glass-card" style={{ border: '1px solid rgba(6, 182, 212, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <KeyRound size={22} color="var(--accent-cyan)" />
              <h2 style={{ fontSize: '1.15rem' }}>Gerador de Licenças do Proprietário (Sua Área de Vendas)</h2>
            </div>
            <span className="badge badge-cyan">Exclusivo Dono</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginBottom: '16px' }}>
            Use este gerador para emitir licenças digitais assinadas para seus clientes que comprarem o NEXUS CMMS.
          </p>

          <form onSubmit={handleGenerateLicense}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Nome da Empresa Compradora</label>
                <input
                  type="text"
                  className="form-input"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">CNPJ ou Documento</label>
                <input
                  type="text"
                  className="form-input"
                  value={clientTaxId}
                  onChange={(e) => setClientTaxId(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Plano Comercial</label>
                <select className="form-select" value={tier} onChange={(e) => setTier(e.target.value as LicenseTier)}>
                  <option value="STARTER">Starter (Até 50 Ativos)</option>
                  <option value="PROFESSIONAL">Professional (Até 250 Ativos)</option>
                  <option value="ENTERPRISE_AI">Enterprise AI (Ilimitado + IA)</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Duração da Licença (Dias)</label>
                <input
                  type="number"
                  className="form-input"
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  min={1}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Limite de Ativos</label>
                <input
                  type="number"
                  className="form-input"
                  value={maxAssets}
                  onChange={(e) => setMaxAssets(Number(e.target.value))}
                  min={5}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Limite de Usuários</label>
                <input
                  type="number"
                  className="form-input"
                  value={maxUsers}
                  onChange={(e) => setMaxUsers(Number(e.target.value))}
                  min={1}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Hardware Fingerprint do Servidor do Cliente</label>
              <input
                type="text"
                className="form-input"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
                value={targetFingerprint}
                onChange={(e) => setTargetFingerprint(e.target.value)}
                placeholder="Ex: NX-SRV-4A91-88F2 ou '*' para ilimitado"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '16px' }}>
              Emitir Chave Comercial Assinada
            </button>
          </form>

          {/* Generated Result Box */}
          {generatedLicense && (
            <div
              style={{
                background: 'var(--bg-canvas)',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-prominent)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                  Chave Gerada com Sucesso!
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={handleCopyGeneratedKey} className="btn btn-secondary btn-sm">
                    {copiedLicenseKey ? <Check size={14} color="var(--accent-emerald)" /> : <Copy size={14} />}
                    {copiedLicenseKey ? 'Copiado!' : 'Copiar Chave'}
                  </button>
                  <button onClick={handleDownloadLicFile} className="btn btn-secondary btn-sm">
                    <Download size={14} /> Baixar .lic
                  </button>
                  <button onClick={() => handleApplyLicense(generatedLicense)} className="btn btn-primary btn-sm">
                    Instalar Agora
                  </button>
                </div>
              </div>

              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.74rem',
                  maxHeight: '70px',
                  overflowY: 'auto',
                  wordBreak: 'break-all',
                  padding: '8px',
                  background: 'var(--bg-surface-elevated)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-secondary)'
                }}
              >
                {generatedKeyString}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Strategic Guide: How to Sell & Protect Your Software */}
      <div className="glass-card">
        <h2 style={{ fontSize: '1.25rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FileCode size={24} color="var(--accent-cyan)" />
          Como Vender Este Software Sem Correr Risco de Cópias Piratas
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
          Para comercializar seu software com total tranquilidade, recomendamos dois modelos testados de mercado:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
          {/* Model A */}
          <div className="glass-panel" style={{ borderLeft: '4px solid var(--accent-emerald)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <Cloud size={20} color="var(--accent-emerald)" />
              <h3 style={{ fontSize: '1.05rem', color: 'var(--accent-emerald)' }}>
                Modelo 1: Venda como SaaS Cloud (Máxima Segurança)
              </h3>
            </div>
            <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>
                <strong>O código nunca sai da sua mão:</strong> Você hospeda a aplicação no seu próprio servidor (ex: Vercel, AWS, Render ou DigitalOcean).
              </li>
              <li>
                <strong>Acesso via navegador por login:</strong> O cliente recebe um login e subdomain exclusivo (ex: <code>cliente.seucmms.com.br</code>).
              </li>
              <li>
                <strong>Assinatura mensal recorrente:</strong> Se o cliente deixar de pagar a mensalidade, você simplesmente desativa a conta dele no painel master em 1 clique.
              </li>
              <li>
                <strong>Zero risco de pirataria:</strong> O cliente nunca recebe os arquivos fonte, tornando a cópia impossível.
              </li>
            </ul>
          </div>

          {/* Model B */}
          <div className="glass-panel" style={{ borderLeft: '4px solid var(--accent-cyan)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <Server size={20} color="var(--accent-cyan)" />
              <h3 style={{ fontSize: '1.05rem', color: 'var(--accent-cyan)' }}>
                Modelo 2: Venda On-Premise (Servidor Local do Cliente)
              </h3>
            </div>
            <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>
                <strong>Node-Locking por Hardware:</strong> O software utiliza o <code>Hardware Fingerprint</code> (implementado acima) que vincula a licença ao processador/placa-mãe do servidor do cliente.
              </li>
              <li>
                <strong>Tentativa de cópia bloqueada:</strong> Se o cliente copiar o banco de dados ou a pasta para outro computador, o sistema recusa a execução automaticamente.
              </li>
              <li>
                <strong>Ofuscação de Código com Bytenode:</strong> Antes de entregar ao cliente, você compila o backend com o compilador V8 Bytecode (<code>bytenode</code>), transformando o código em arquivo binário fechado.
              </li>
              <li>
                <strong>Entrega via Docker Container fechado:</strong> Você entrega apenas a imagem Docker protegida, onde o cliente não tem acesso aos códigos de programação.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
