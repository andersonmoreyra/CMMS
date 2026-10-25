import { CommercialLicense, LicenseValidationResult, LicenseTier } from '../types';

// SECRET MASTER SALT - In production, this private key resides only on the owner's licensing server
const MASTER_SECRET_SALT = 'NEXUS-CMMS-ENTERPRISE-MASTER-KEY-2026-X99Z-AUTHENTIC';

// Generate pseudo-hardware machine fingerprint (Host/Browser/Environment unique hash)
export function getMachineFingerprint(): string {
  const stored = localStorage.getItem('nexus_machine_fingerprint');
  if (stored) return stored;

  // Derive stable fingerprint from browser/device characteristics
  const rawId = `${navigator.userAgent}::${navigator.language}::${screen.width}x${screen.height}::${screen.colorDepth}`;
  let hash = 0;
  for (let i = 0; i < rawId.length; i++) {
    const char = rawId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
  const fingerprint = `NX-SRV-${hex.slice(0, 4)}-${hex.slice(4, 8)}-${Date.now().toString(16).slice(-4).toUpperCase()}`;
  localStorage.setItem('nexus_machine_fingerprint', fingerprint);
  return fingerprint;
}

// Compute cryptographic checksum signature for tamper-proofing
function computeSignature(payload: Omit<CommercialLicense, 'signature'>): string {
  const serialized = JSON.stringify({
    licenseId: payload.licenseId,
    clientName: payload.clientName,
    clientTaxId: payload.clientTaxId,
    tier: payload.tier,
    issuedAt: payload.issuedAt,
    expiresAt: payload.expiresAt,
    machineFingerprint: payload.machineFingerprint,
    maxAssets: payload.maxAssets,
    maxUsers: payload.maxUsers,
    allowedModules: payload.allowedModules.sort(),
  });

  const fullStr = `${serialized}::${MASTER_SECRET_SALT}`;
  let hash = 5381;
  for (let i = 0; i < fullStr.length; i++) {
    hash = (hash * 33) ^ fullStr.charCodeAt(i);
  }
  const p1 = Math.abs(hash).toString(36).toUpperCase();

  let hash2 = 0;
  for (let i = 0; i < fullStr.length; i++) {
    hash2 = (hash2 << 7) - hash2 + fullStr.charCodeAt(i);
    hash2 |= 0;
  }
  const p2 = Math.abs(hash2).toString(36).toUpperCase();

  return `SIG-${p1}-${p2}-SECURE`;
}

// OWNER TOOL: Generate a new commercial license for a paying client
export function generateCommercialLicense(params: {
  clientName: string;
  clientTaxId: string;
  tier: LicenseTier;
  durationDays: number;
  machineFingerprint: string;
  maxAssets: number;
  maxUsers: number;
  allowedModules?: string[];
}): CommercialLicense {
  const now = new Date();
  const expiry = new Date(now.getTime() + params.durationDays * 24 * 60 * 60 * 1000);

  const base: Omit<CommercialLicense, 'signature'> = {
    licenseId: `LIC-${Math.random().toString(36).substring(2, 9).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`,
    clientName: params.clientName,
    clientTaxId: params.clientTaxId,
    tier: params.tier,
    issuedAt: now.toISOString(),
    expiresAt: expiry.toISOString(),
    machineFingerprint: params.machineFingerprint.trim(),
    maxAssets: params.maxAssets,
    maxUsers: params.maxUsers,
    allowedModules: params.allowedModules || ['all'],
    isActive: true,
  };

  const signature = computeSignature(base);
  return { ...base, signature };
}

// Encode license to base64 encrypted string format
export function exportLicenseKeyString(license: CommercialLicense): string {
  const json = JSON.stringify(license);
  return btoa(unescape(encodeURIComponent(json)));
}

// Decode license from base64 string
export function importLicenseKeyString(keyStr: string): CommercialLicense | null {
  try {
    const json = decodeURIComponent(escape(atob(keyStr.trim())));
    return JSON.parse(json) as CommercialLicense;
  } catch (e) {
    console.error('Falha ao decodificar chave de licença', e);
    return null;
  }
}

// VALIDATOR: Validate license against tampering, expiration and hardware lock
export function validateLicense(license: CommercialLicense | null): LicenseValidationResult {
  if (!license) {
    return {
      valid: false,
      status: 'TAMPERED',
      message: 'Nenhuma licença ativa encontrada no servidor. Modo de demonstração bloqueado.',
      daysRemaining: 0,
    };
  }

  // 1. Verify Tamper-Proof Cryptographic Signature
  const expectedSig = computeSignature(license);
  if (license.signature !== expectedSig) {
    return {
      valid: false,
      status: 'TAMPERED',
      message: 'ALERTA DE VIOLAÇÃO: A chave foi adulterada manualmente! A assinatura digital é inválida.',
      daysRemaining: 0,
      license: { ...license, tamperDetected: true },
    };
  }

  // 2. Verify Hardware Fingerprint Node-Lock
  const currentMachineId = getMachineFingerprint();
  if (license.machineFingerprint !== '*' && license.machineFingerprint !== currentMachineId) {
    return {
      valid: false,
      status: 'UNBOUND_HARDWARE',
      message: `CÓPIA NÃO AUTORIZADA: Esta licença foi gerada para o servidor [${license.machineFingerprint}], mas está sendo executada em [${currentMachineId}]. Bloqueado por proteção de direitos autorais.`,
      daysRemaining: 0,
      license,
    };
  }

  // 3. Verify Expiration Date
  const now = new Date();
  const expiry = new Date(license.expiresAt);
  const diffTime = expiry.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysRemaining <= 0) {
    return {
      valid: false,
      status: 'EXPIRED',
      message: `LICENÇA EXPIRADA em ${expiry.toLocaleDateString('pt-BR')}. Renove com o proprietário do software para continuar utilizando.`,
      daysRemaining: 0,
      license,
    };
  }

  return {
    valid: true,
    status: 'ACTIVE',
    message: `Licença comercial autêntica ativa para [${license.clientName}]. Válida por mais ${daysRemaining} dias.`,
    daysRemaining,
    license,
  };
}

// Default license storage helper
const STORAGE_KEY = 'nexus_commercial_license';

export function getInstalledLicense(): CommercialLicense {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // Fallback
    }
  }

  // Generate a valid trial license bound to this machine
  const machineId = getMachineFingerprint();
  const defaultLicense = generateCommercialLicense({
    clientName: 'Indústria Metalmecânica Exemplo Ltda',
    clientTaxId: '12.345.678/0001-90',
    tier: 'ENTERPRISE_AI',
    durationDays: 365,
    machineFingerprint: machineId,
    maxAssets: 500,
    maxUsers: 50,
    allowedModules: ['all'],
  });

  saveInstalledLicense(defaultLicense);
  return defaultLicense;
}

export function saveInstalledLicense(license: CommercialLicense): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(license));
}
