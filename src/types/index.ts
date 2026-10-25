// NEXUS CMMS/EAM Enterprise - Data Types & Licensing Model

export type ModuleCategory =
  | 'assets'
  | 'work-orders'
  | 'planning'
  | 'scheduling'
  | 'mobile'
  | 'inspections'
  | 'reliability'
  | 'iot-condition'
  | 'inventory'
  | 'purchasing'
  | 'team'
  | 'safety'
  | 'turnaround'
  | 'costs'
  | 'dashboards'
  | 'automations'
  | 'integrations'
  | 'admin-security'
  | 'documents'
  | 'operations-oee'
  | 'specialized'
  | 'energy'
  | 'helpdesk'
  | 'ai-copilot'
  | 'commercial-licensing';

// -------------------------------------------------------------
// COMMERCIAL LICENSING & ANTI-PIRACY SECURITY
// -------------------------------------------------------------
export type LicenseTier = 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE_AI' | 'UNLIMITED_OEM';

export interface CommercialLicense {
  licenseId: string;
  clientName: string;
  clientTaxId: string; // CNPJ / NIF
  tier: LicenseTier;
  issuedAt: string;
  expiresAt: string;
  machineFingerprint: string; // Bound to server/host
  maxAssets: number;
  maxUsers: number;
  allowedModules: string[];
  signature: string; // Asymmetric crypto signature
  isActive: boolean;
  tamperDetected?: boolean;
}

export interface LicenseValidationResult {
  valid: boolean;
  status: 'ACTIVE' | 'EXPIRED' | 'TAMPERED' | 'UNBOUND_HARDWARE' | 'LIMIT_EXCEEDED';
  message: string;
  daysRemaining: number;
  license?: CommercialLicense;
}

// -------------------------------------------------------------
// MODULE 1: ATIVOS (ASSETS) & HIERARCHY
// -------------------------------------------------------------
export type AssetCriticality = 'A' | 'B' | 'C'; // A = Ultra Crítico, B = Médio, C = Baixo
export type AssetStatus = 'OPERATIONAL' | 'IN_MAINTENANCE' | 'STANDBY' | 'QUARANTINE' | 'DECOMMISSIONED';

export interface Asset {
  id: string;
  tag: string;
  name: string;
  category: string;
  parentId?: string; // For hierarchy tree
  plant: string;
  area: string;
  line: string;
  criticality: AssetCriticality;
  status: AssetStatus;
  manufacturer: string;
  model: string;
  serialNumber: string;
  installDate: string;
  powerKw: number;
  voltageV: number;
  healthScore: number; // 0 - 100%
  totalMaintenanceCost: number;
  qrCodeUrl: string;
  specs: Record<string, string>;
  documentsCount: number;
  warrantyExpiry: string;
}

// -------------------------------------------------------------
// MODULE 2: ORDENS DE SERVIÇO & SOLICITAÇÕES
// -------------------------------------------------------------
export type OrderType = 'CORRECTIVE' | 'PREVENTIVE' | 'PREDICTIVE' | 'EMERGENCY' | 'IMPROVEMENT';
export type OrderPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type OrderStatus = 'REQUESTED' | 'TRIAGED' | 'SCHEDULED' | 'IN_PROGRESS' | 'WAITING_PARTS' | 'WAITING_VALIDATION' | 'COMPLETED' | 'CANCELLED';

export interface WorkOrder {
  id: string;
  code: string;
  title: string;
  description: string;
  assetId: string;
  assetTag: string;
  assetName: string;
  type: OrderType;
  priority: OrderPriority;
  status: OrderStatus;
  requestedBy: string;
  assignedTechnician?: string;
  scheduledDate: string;
  deadlineDate: string;
  estimatedHours: number;
  realHours: number;
  costLabor: number;
  costMaterials: number;
  totalCost: number;
  failureMode?: string;
  rootCause?: string;
  solution?: string;
  checklists: { text: string; done: boolean }[];
  requiresLoto: boolean;
  electronicSignature?: string;
  createdAt: string;
}

// -------------------------------------------------------------
// MODULE 3: PLANEJAMENTO & RCM
// -------------------------------------------------------------
export interface MaintenancePlan {
  id: string;
  code: string;
  name: string;
  assetCategory: string;
  frequencyType: 'CALENDAR_DAYS' | 'RUN_HOURS' | 'PRODUCTION_CYCLES' | 'ODOMETER_KM' | 'CONDITION_LIMIT';
  frequencyValue: number;
  estimatedDurationHours: number;
  standardProcedures: string[];
  requiredSkills: string[];
  requiredMaterials: { partCode: string; name: string; quantity: number }[];
  lastExecuted?: string;
  nextScheduled: string;
}

// -------------------------------------------------------------
// MODULE 6: INSPEÇÕES & CALIBRAÇÃO
// -------------------------------------------------------------
export interface InspectionRoute {
  id: string;
  title: string;
  assetCount: number;
  assignedTo: string;
  interval: string;
  lastRun: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED_OK' | 'DEFECTS_FOUND';
  points: { pointName: string; nominal: number; min: number; max: number; unit: string; lastValue: number }[];
}

export interface CalibrationInstrument {
  id: string;
  tag: string;
  description: string;
  model: string;
  tolerance: string;
  lastCalibration: string;
  nextCalibration: string;
  status: 'VALID' | 'WARNING' | 'EXPIRED';
  certificateNumber: string;
}

// -------------------------------------------------------------
// MODULE 7: CONFIABILIDADE (MTBF, MTTR, FMEA)
// -------------------------------------------------------------
export interface FMEARow {
  id: string;
  component: string;
  failureMode: string;
  failureEffect: string;
  severity: number; // 1-10
  failureCause: string;
  occurrence: number; // 1-10
  currentControl: string;
  detection: number; // 1-10
  rpn: number; // S * O * D
  recommendedAction: string;
}

export interface ReliabilityMetrics {
  mtbfHours: number; // Mean Time Between Failures
  mttrHours: number; // Mean Time To Repair
  mttaMinutes: number; // Mean Time To Acknowledge
  availabilityPercent: number;
  plannedMaintenanceRatio: number;
  chronicFailuresCount: number;
}

// -------------------------------------------------------------
// MODULE 8: IOT & TELEMETRIA PREDITIVA
// -------------------------------------------------------------
export interface IoTTelemetrySensor {
  id: string;
  assetTag: string;
  sensorType: 'VIBRATION' | 'TEMPERATURE' | 'ULTRASOUND' | 'PRESSURE' | 'CURRENT';
  currentValue: number;
  unit: string;
  warningThreshold: number;
  criticalThreshold: number;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  historicalSeries: { timestamp: string; value: number }[];
  aiAnomalyScore: number; // 0-100%
  predictedFailureDays?: number;
}

// -------------------------------------------------------------
// MODULE 9: ESTOQUE & MRO
// -------------------------------------------------------------
export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  category: string;
  binLocation: string; // Corredor A, Prateleira 2
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  unitPrice: number;
  unit: string;
  supplier: string;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
}

// -------------------------------------------------------------
// MODULE 10: COMPRAS & CONTRATOS
// -------------------------------------------------------------
export interface PurchaseOrder {
  id: string;
  number: string;
  vendor: string;
  description: string;
  totalValue: number;
  status: 'QUOTATION' | 'PENDING_APPROVAL' | 'APPROVED' | 'IN_TRANSIT' | 'DELIVERED';
  requestedDate: string;
  deliveryDate: string;
}

export interface VendorContract {
  id: string;
  vendor: string;
  serviceType: string;
  valuePerMonth: number;
  slaResponseHours: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'NEAR_EXPIRATION' | 'EXPIRED';
}

// -------------------------------------------------------------
// MODULE 11: EQUIPE & MÃO DE OBRA
// -------------------------------------------------------------
export interface Technician {
  id: string;
  name: string;
  specialty: 'Mecânica' | 'Elétrica' | 'Instrumentação' | 'Automação' | 'Predial';
  shift: string;
  status: 'AVAILABLE' | 'BUSY' | 'ON_LEAVE';
  assignedOrdersCount: number;
  certifications: { name: string; expiry: string; valid: boolean }[];
  hourlyRate: number;
}

// -------------------------------------------------------------
// MODULE 12: SEGURANÇA, LOTO & RISCOS
// -------------------------------------------------------------
export interface LotoPermit {
  id: string;
  code: string;
  assetTag: string;
  type: 'LOTO' | 'ALTURA' | 'ESPACO_CONFINADO' | 'QUENTE';
  description: string;
  isolationPoints: string[];
  issuedTo: string;
  approvedBy: string;
  validUntil: string;
  status: 'AUTHORIZED' | 'ACTIVE_LOCKED' | 'CLOSED';
}

// -------------------------------------------------------------
// MODULE 13: PARADAS INDUSTRIAIS (TURNAROUND)
// -------------------------------------------------------------
export interface IndustrialShutdown {
  id: string;
  name: string;
  targetPlant: string;
  startDate: string;
  endDate: string;
  totalWorkOrders: number;
  completedWorkOrders: number;
  progressPercent: number;
  budgetEstimated: number;
  budgetSpent: number;
  status: 'PLANNING' | 'EXECUTION' | 'COMMISSIONING' | 'CLOSED';
}

// -------------------------------------------------------------
// MODULE 20: OEE & PRODUÇÃO
// -------------------------------------------------------------
export interface ProductionLineOEE {
  lineId: string;
  lineName: string;
  availability: number; // %
  performance: number; // %
  quality: number; // %
  oee: number; // A * P * Q
  currentShift: string;
  stopsCount: number;
  totalDowntimeMinutes: number;
}

// -------------------------------------------------------------
// MODULE 22: ENERGIA & SUSTENTABILIDADE
// -------------------------------------------------------------
export interface EnergyMetric {
  assetTag: string;
  kwhConsumedToday: number;
  specificConsumptionKwhTon: number;
  co2EquivalentKg: number;
  anomalyDetected: boolean;
}

// -------------------------------------------------------------
// MODULE 23: HELPDESK & SLA
// -------------------------------------------------------------
export interface ServiceTicket {
  id: string;
  ticketNumber: string;
  requester: string;
  department: string;
  location: string;
  subject: string;
  priority: 'URGENT' | 'HIGH' | 'NORMAL';
  slaDeadline: string;
  status: 'OPEN' | 'IN_TRIAGE' | 'RESOLVED';
  csatRating?: number; // 1 to 5
}
