import {
  Asset,
  WorkOrder,
  MaintenancePlan,
  InspectionRoute,
  CalibrationInstrument,
  FMEARow,
  ReliabilityMetrics,
  IoTTelemetrySensor,
  InventoryItem,
  PurchaseOrder,
  VendorContract,
  Technician,
  LotoPermit,
  IndustrialShutdown,
  ProductionLineOEE,
  EnergyMetric,
  ServiceTicket
} from '../types';

export const INITIAL_ASSETS: Asset[] = [
  {
    id: 'ast-01',
    tag: 'TURB-01',
    name: 'Turbogerador a Vapor 15MW',
    category: 'Geração de Energia',
    plant: 'Unidade Industrial 01',
    area: 'Casa de Força',
    line: 'Linha Principal de Vapor',
    criticality: 'A',
    status: 'OPERATIONAL',
    manufacturer: 'Siemens Energy',
    model: 'SST-300 Multi-Stage',
    serialNumber: 'SN-2021-8849-B',
    installDate: '2021-03-15',
    powerKw: 15000,
    voltageV: 13800,
    healthScore: 92,
    totalMaintenanceCost: 48500,
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=ASSET-TURB-01',
    specs: {
      'Pressão de Entrada': '42 bar',
      'Temperatura Vapor': '410 °C',
      'Rotação Nominal': '5400 RPM',
      'Vazão Vapor': '65 t/h'
    },
    documentsCount: 14,
    warrantyExpiry: '2024-03-15'
  },
  {
    id: 'ast-02',
    tag: 'COMP-04',
    name: 'Compressor de Ar Parafuso Rotativo 250HP',
    category: 'Utilidades',
    plant: 'Unidade Industrial 01',
    area: 'Central de Ar Comprimido',
    line: 'Rede Geral 8 bar',
    criticality: 'A',
    status: 'IN_MAINTENANCE',
    manufacturer: 'Atlas Copco',
    model: 'GA-160 VSD+ FF',
    serialNumber: 'AC-992384-BR',
    installDate: '2022-08-10',
    powerKw: 160,
    voltageV: 440,
    healthScore: 68,
    totalMaintenanceCost: 19400,
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=ASSET-COMP-04',
    specs: {
      'Pressão de Trabalho': '8.5 bar',
      'Vazão Efetiva': '28.4 m³/min',
      'Tipo de Lubrificação': 'Injeção de Óleo Sintético Roto-Xtend',
      'Horas Acumuladas': '14,820 hrs'
    },
    documentsCount: 8,
    warrantyExpiry: '2024-08-10'
  },
  {
    id: 'ast-03',
    tag: 'PREN-02',
    name: 'Prensa Hidráulica Automática 600 Toneladas',
    category: 'Estampagem & Conformação',
    plant: 'Unidade Industrial 01',
    area: 'Estamparia Pesada',
    line: 'Linha de Chassis',
    criticality: 'A',
    status: 'OPERATIONAL',
    manufacturer: 'Schuler do Brasil',
    model: 'H-Frame HP-600',
    serialNumber: 'SCH-600-0914',
    installDate: '2019-11-20',
    powerKw: 110,
    voltageV: 440,
    healthScore: 88,
    totalMaintenanceCost: 34100,
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=ASSET-PREN-02',
    specs: {
      'Capacidade Nominal': '6000 kN',
      'Curso do Martelo': '800 mm',
      'Pressão do Sistema Hidráulico': '280 bar',
      'Volume Reservatório': '1800 Litros ISO VG 68'
    },
    documentsCount: 11,
    warrantyExpiry: '2021-11-20'
  },
  {
    id: 'ast-04',
    tag: 'CNC-05',
    name: 'Centro de Usinagem 5 Eixos Alta Precisão',
    category: 'Usinagem de Peças',
    plant: 'Unidade Industrial 01',
    area: 'Usinagem CNC',
    line: 'Célula Flexível de Fabricação',
    criticality: 'B',
    status: 'OPERATIONAL',
    manufacturer: 'Mazak',
    model: 'Variaxis i-700 Neo',
    serialNumber: 'MZK-700-4491',
    installDate: '2023-01-18',
    powerKw: 45,
    voltageV: 380,
    healthScore: 95,
    totalMaintenanceCost: 8200,
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=ASSET-CNC-05',
    specs: {
      'Spindle Máximo': '18,000 RPM',
      'Magazine de Ferramentas': '60 posições HSK-A63',
      'Comando Numérico': 'SmoothAi Mazatrol',
      'Acurácia de Posicionamento': '±0.002 mm'
    },
    documentsCount: 16,
    warrantyExpiry: '2026-01-18'
  },
  {
    id: 'ast-05',
    tag: 'BOM-12',
    name: 'Bomba Centrífuga Multiestágio de Alimentação',
    category: 'Sistemas Hidráulicos & Bombeamento',
    plant: 'Unidade Industrial 01',
    area: 'Casa de Força',
    line: 'Alimentação de Caldeiras',
    criticality: 'B',
    status: 'OPERATIONAL',
    manufacturer: 'KSB Bombas',
    model: 'Multitec 100/6',
    serialNumber: 'KSB-MT-8812',
    installDate: '2020-05-10',
    powerKw: 75,
    voltageV: 440,
    healthScore: 84,
    totalMaintenanceCost: 12500,
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=ASSET-BOM-12',
    specs: {
      'Vazão Nominal': '120 m³/h',
      'Altura Manométrica (AMT)': '260 mca',
      'Selo Mecânico': 'Cartucho Duplo Balanceado John Crane',
      'Acoplamento': 'Elástico Flexível com Espaçador'
    },
    documentsCount: 6,
    warrantyExpiry: '2022-05-10'
  },
  {
    id: 'ast-06',
    tag: 'FROTA-03',
    name: 'Caminhão Cavalo Mecânico 6x4 540CV',
    category: 'Frota de Transporte & Logística',
    plant: 'Unidade Industrial 01',
    area: 'Pátio de Expedição',
    line: 'Logística Rodoviária',
    criticality: 'C',
    status: 'OPERATIONAL',
    manufacturer: 'Scania',
    model: 'R540 Super V8',
    serialNumber: '9BS-R540-2023-019',
    installDate: '2023-04-05',
    powerKw: 397,
    voltageV: 24,
    healthScore: 96,
    totalMaintenanceCost: 6400,
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=ASSET-FROTA-03',
    specs: {
      'Quilometragem Atual': '128,450 km',
      'Capacidade de Carga (PBTC)': '74 Toneladas',
      'Consumo Médio': '2.1 km/L',
      'Próxima Revisão': '135,000 km'
    },
    documentsCount: 9,
    warrantyExpiry: '2026-04-05'
  }
];

export const INITIAL_WORK_ORDERS: WorkOrder[] = [
  {
    id: 'wo-101',
    code: 'OS-2026-0481',
    title: 'Substituição de Rolamento Dianteiro e Selo Mecânico por Vibração Anômala',
    description: 'Sistema IoT acusou espectro de vibração em 7.2 mm/s RMS (frequência de defeito de pista externa BPFI). Efetuar desmontagem, inspeção do eixo e substituição do conjunto com alinhamento a laser.',
    assetId: 'ast-02',
    assetTag: 'COMP-04',
    assetName: 'Compressor de Ar Parafuso Rotativo 250HP',
    type: 'CORRECTIVE',
    priority: 'CRITICAL',
    status: 'IN_PROGRESS',
    requestedBy: 'Sistema Preditivo IoT / IA Anomalias',
    assignedTechnician: 'Carlos Eduardo Mendes (Mecânico Especialista)',
    scheduledDate: '2026-10-24',
    deadlineDate: '2026-10-25',
    estimatedHours: 6,
    realHours: 3.5,
    costLabor: 420.0,
    costMaterials: 1850.0,
    totalCost: 2270.0,
    failureMode: 'Desgaste severo na pista externa do rolamento',
    rootCause: 'Fadiga por contaminação de partículas no lubrificante',
    solution: 'Substituição por rolamento blindado SKF Explorer e purga do óleo',
    checklists: [
      { text: 'Efetuar bloqueio elétrico e pneumático LOTO (Chave Geral QG-04 e Válvula V-02)', done: true },
      { text: 'Despressurizar vaso separador de ar/óleo e drenar condensado residual', done: true },
      { text: 'Desacoplar motor e unidade compressora com sacador hidráulico', done: true },
      { text: 'Montar rolamento novo com aquecedor por indução térmica (110°C máx)', done: false },
      { text: 'Realizar alinhamento a laser dos eixos (tolerância < 0.05 mm)', done: false },
      { text: 'Medição pós-reparo de vibração e entrega formal para operação', done: false }
    ],
    requiresLoto: true,
    createdAt: '2026-10-24 08:30'
  },
  {
    id: 'wo-102',
    code: 'OS-2026-0482',
    title: 'Manutenção Preventiva Trimestral - Rota de Lubrificação e Termografia',
    description: 'Executar rota preventiva padrão: coleta de amostra de óleo para laboratório, inspeção termográfica nos terminais elétricos da chave de partida e limpeza dos filtros de admissão.',
    assetId: 'ast-01',
    assetTag: 'TURB-01',
    assetName: 'Turbogerador a Vapor 15MW',
    type: 'PREVENTIVE',
    priority: 'HIGH',
    status: 'SCHEDULED',
    requestedBy: 'PCM - Planejamento Centralizado',
    assignedTechnician: 'Juliana Vasconcelos (Termografista N2 / Elétrica)',
    scheduledDate: '2026-10-26',
    deadlineDate: '2026-10-27',
    estimatedHours: 4,
    realHours: 0,
    costLabor: 280.0,
    costMaterials: 350.0,
    totalCost: 630.0,
    checklists: [
      { text: 'Inspeção termográfica de disjuntores da subestação auxiliar', done: false },
      { text: 'Coleta de óleo lubrificante da turbina para análise de viscosidade e água Karl Fischer', done: false },
      { text: 'Verificação da pressão diferencial dos filtros duplex de óleo', done: false },
      { text: 'Teste funcional do trip de sobrevelocidade eletrônico', done: false }
    ],
    requiresLoto: false,
    createdAt: '2026-10-23 14:00'
  },
  {
    id: 'wo-103',
    code: 'OS-2026-0479',
    title: 'Inspeção e Calibração dos Sensores de Pressão da Prensa 600t',
    description: 'Calibração metrológica semestral dos transdutores de pressão de 0-350 bar com padrão rastreável RBC.',
    assetId: 'ast-03',
    assetTag: 'PREN-02',
    assetName: 'Prensa Hidráulica Automática 600 Toneladas',
    type: 'PREVENTIVE',
    priority: 'MEDIUM',
    status: 'COMPLETED',
    requestedBy: 'Garantia da Qualidade ISO 9001',
    assignedTechnician: 'Renato Faria (Instrumentista)',
    scheduledDate: '2026-10-22',
    deadlineDate: '2026-10-23',
    estimatedHours: 3,
    realHours: 2.8,
    costLabor: 210.0,
    costMaterials: 90.0,
    totalCost: 300.0,
    failureMode: 'Nenhuma anomalia - calibração periódica',
    rootCause: 'Atendimento à conformidade metrológica',
    solution: 'Transdutor aprovado com incerteza de medição dentro da tolerância de ±0.25%',
    checklists: [
      { text: 'Conectar manômetro padrão de referência certificado RBC', done: true },
      { text: 'Aferir pontos em 0%, 25%, 50%, 75% e 100% da escala de subida e descida', done: true },
      { text: 'Emitir certificado de calibração eletrônico no módulo metrológico', done: true }
    ],
    requiresLoto: true,
    electronicSignature: 'Renato Faria - Registro CREA-SP 506.129 - Assinado digitalmente em 22/10/2026 16:45',
    createdAt: '2026-10-20 09:15'
  },
  {
    id: 'wo-104',
    code: 'OS-2026-0480',
    title: 'Calibração de Tolerância Spindle e Troca de Filtros Óleo de Refrigeração',
    description: 'Aferição de batimento radial (Runout) do fuso com micrômetro digital e substituição do elemento filtrante do fluído de corte.',
    assetId: 'ast-04',
    assetTag: 'CNC-05',
    assetName: 'Centro de Usinagem 5 Eixos Alta Precisão',
    type: 'IMPROVEMENT',
    priority: 'LOW',
    status: 'WAITING_PARTS',
    requestedBy: 'Engenharia de Manufatura',
    assignedTechnician: 'Carlos Eduardo Mendes',
    scheduledDate: '2026-10-27',
    deadlineDate: '2026-10-29',
    estimatedHours: 5,
    realHours: 1,
    costLabor: 350.0,
    costMaterials: 890.0,
    totalCost: 1240.0,
    checklists: [
      { text: 'Medição do batimento dinâmico no cone HSK-A63 com relógio apalpador', done: true },
      { text: 'Aguardar chegada dos filtros de malha 5 micras do almoxarifado', done: false }
    ],
    requiresLoto: false,
    createdAt: '2026-10-22 11:20'
  }
];

export const INITIAL_PREVENTIVE_PLANS: MaintenancePlan[] = [
  {
    id: 'plan-01',
    code: 'PLN-PREV-TURB-01',
    name: 'Plano Preventivo Mestre - Turbinas a Vapor',
    assetCategory: 'Geração de Energia',
    frequencyType: 'CALENDAR_DAYS',
    frequencyValue: 90,
    estimatedDurationHours: 8,
    standardProcedures: [
      'Análise cromatográfica e físico-química do óleo lubrificante',
      'Termografia infravermelha em painéis auxiliares e barramentos',
      'Inspeção boroscópica do primeiro estágio de palhetas seletivas',
      'Aferição das folgas axiais dos mancais hidrodinâmicos'
    ],
    requiredSkills: ['Termografia Nível 2', 'Mecânica Turbomáquinas', 'Instrumentação'],
    requiredMaterials: [
      { partCode: 'OLEO-ISO-46', name: 'Óleo Turbina Mobil DTE 746', quantity: 200 },
      { partCode: 'FILT-DPX-01', name: 'Elemento Filtrante Duplex 10µm', quantity: 2 }
    ],
    lastExecuted: '2026-07-28',
    nextScheduled: '2026-10-26'
  },
  {
    id: 'plan-02',
    code: 'PLN-PREV-COMP-HRS',
    name: 'Plano Preventivo por Horas de Operação - Compressores Parafuso',
    assetCategory: 'Utilidades',
    frequencyType: 'RUN_HOURS',
    frequencyValue: 4000,
    estimatedDurationHours: 6,
    standardProcedures: [
      'Troca do filtro de ar de admissão para evitar cavitação de fluxo',
      'Troca do elemento separador ar/óleo',
      'Substituição do cartucho de filtro de óleo lubrificante',
      'Limpeza química e desincrustação dos radiadores pós-resfriador'
    ],
    requiredSkills: ['Mecânica de Compressores'],
    requiredMaterials: [
      { partCode: 'KIT-SEP-4000H', name: 'Kit Manutenção 4000h Atlas Copco', quantity: 1 }
    ],
    lastExecuted: '2026-06-10',
    nextScheduled: '2026-11-15'
  },
  {
    id: 'plan-03',
    code: 'PLN-PREV-FROTA-KM',
    name: 'Plano Preventivo por Quilometragem - Frota Pesada Scania',
    assetCategory: 'Frota de Transporte & Logística',
    frequencyType: 'ODOMETER_KM',
    frequencyValue: 30000,
    estimatedDurationHours: 4,
    standardProcedures: [
      'Troca de óleo de motor 15W40 e filtro de combustível sedimentador',
      'Regulagem de folga de válvulas e freios pneumáticos',
      'Alinhamento e balanceamento computadorizado dos eixos',
      'Inspeção do sistema de pós-tratamento de emissões Arla 32'
    ],
    requiredSkills: ['Mecânica Pesada Diesel', 'Eletrônica Embarcada'],
    requiredMaterials: [
      { partCode: 'OLEO-15W40', name: 'Óleo Motor Diesel Sintético Scania', quantity: 38 },
      { partCode: 'FILT-COMB-SC', name: 'Filtro Combustível Primário', quantity: 1 }
    ],
    lastExecuted: '2026-08-12',
    nextScheduled: '2026-11-02'
  }
];

export const INITIAL_INSPECTIONS: InspectionRoute[] = [
  {
    id: 'insp-01',
    title: 'Rota Diária de Inspeção Sensitiva - Utilidades & Casa de Força',
    assetCount: 8,
    assignedTo: 'Carlos Eduardo Mendes',
    interval: 'Diária (Turno Manhã)',
    lastRun: '2026-10-24 07:15',
    status: 'DEFECTS_FOUND',
    points: [
      { pointName: 'Pressão Óleo Turbina Mancal 1', nominal: 2.2, min: 1.8, max: 2.8, unit: 'bar', lastValue: 2.3 },
      { pointName: 'Vibração Geral Mancal Compressor 04', nominal: 2.5, min: 0.5, max: 4.5, unit: 'mm/s', lastValue: 7.2 },
      { pointName: 'Temperatura Radiador de Ar', nominal: 68, min: 50, max: 85, unit: '°C', lastValue: 72 }
    ]
  },
  {
    id: 'insp-02',
    title: 'Rota Semanal de Inspeção de Segurança & Extintores',
    assetCount: 24,
    assignedTo: 'Juliana Vasconcelos',
    interval: 'Semanal',
    lastRun: '2026-10-21 10:00',
    status: 'COMPLETED_OK',
    points: [
      { pointName: 'Pressão Manômetros Extintores CO2', nominal: 150, min: 140, max: 160, unit: 'bar', lastValue: 152 },
      { pointName: 'Chuveiros de Emergência & Lava-olhos', nominal: 1, min: 1, max: 1, unit: 'OK', lastValue: 1 }
    ]
  }
];

export const INITIAL_CALIBRATIONS: CalibrationInstrument[] = [
  {
    id: 'cal-01',
    tag: 'PADR-TORQ-01',
    description: 'Torquímetro Eletrônico Digital 10-200 N.m',
    model: 'Stahlwille 730D',
    tolerance: '±1.0%',
    lastCalibration: '2026-04-10',
    nextCalibration: '2027-04-10',
    status: 'VALID',
    certificateNumber: 'CERT-RBC-2026-9041'
  },
  {
    id: 'cal-02',
    tag: 'PADR-TERM-02',
    description: 'Câmera Termográfica Infravermelha Alta Resolução',
    model: 'Fluke Ti480 PRO 60Hz',
    tolerance: '±2.0 °C',
    lastCalibration: '2025-11-05',
    nextCalibration: '2026-11-05',
    status: 'WARNING',
    certificateNumber: 'CERT-INMETRO-8841-B'
  },
  {
    id: 'cal-03',
    tag: 'PADR-MANO-03',
    description: 'Manômetro Padrão Classe 0.1 de Referência',
    model: 'WIKA CPG1500 Digital',
    tolerance: '±0.05% F.E.',
    lastCalibration: '2025-08-15',
    nextCalibration: '2026-08-15',
    status: 'EXPIRED',
    certificateNumber: 'CERT-RBC-2025-4122'
  }
];

export const INITIAL_FMEA: FMEARow[] = [
  {
    id: 'fmea-01',
    component: 'Rolamento do Eixo Principal (Turbogerador)',
    failureMode: 'Desgaste e pitting por fadiga mecânica',
    failureEffect: 'Parada catastrófica com perda de geração de vapor e energia elétrica na fábrica',
    severity: 9,
    failureCause: 'Desalinhamento residual ou lubrificante com micropartículas',
    occurrence: 3,
    currentControl: 'Monitoramento contínuo de vibração online e espectro FFT',
    detection: 2,
    rpn: 54, // 9 * 3 * 2
    recommendedAction: 'Manter limites estritos de alarme e trocar óleo a cada 1000h'
  },
  {
    id: 'fmea-02',
    component: 'Válvula Reguladora de Pressão Hidráulica (Prensa 600t)',
    failureMode: 'Travamento por cavitação ou impurezas no fluido',
    failureEffect: 'Variação na força de estampagem, retrabalho em lote de 500 peças',
    severity: 8,
    failureCause: 'Contaminação com água ou partículas metálicas > 5µm',
    occurrence: 5,
    currentControl: 'Inspeção diária de manômetro e troca semestral de filtros',
    detection: 4,
    rpn: 160, // 8 * 5 * 4
    recommendedAction: 'Instalar sistema de filtragem contínua offline dialisador microfiltragem'
  },
  {
    id: 'fmea-03',
    component: 'Elemento Separador Ar/Óleo (Compressor)',
    failureMode: 'Saturação precoce / ruptura do papel filtrante',
    failureEffect: 'Arrasto de óleo lubrificante para a linha de produção, contaminando bicos pneumáticos',
    severity: 7,
    failureCause: 'Operação em temperatura excessiva (> 95°C)',
    occurrence: 4,
    currentControl: 'Sensor de pressão diferencial com alarme sonoro',
    detection: 3,
    rpn: 84, // 7 * 4 * 3
    recommendedAction: 'Limpar colmeia do pós-resfriador a cada 2000 horas'
  }
];

export const INITIAL_RELIABILITY_METRICS: ReliabilityMetrics = {
  mtbfHours: 428.5,
  mttrHours: 2.4,
  mttaMinutes: 18,
  availabilityPercent: 96.8,
  plannedMaintenanceRatio: 84.5, // 84.5% preventivo / 15.5% corretivo
  chronicFailuresCount: 2
};

export const INITIAL_IOT_SENSORS: IoTTelemetrySensor[] = [
  {
    id: 'sens-01',
    assetTag: 'COMP-04',
    sensorType: 'VIBRATION',
    currentValue: 7.2,
    unit: 'mm/s RMS',
    warningThreshold: 4.5,
    criticalThreshold: 6.0,
    status: 'CRITICAL',
    historicalSeries: [
      { timestamp: '10:00', value: 3.8 },
      { timestamp: '11:00', value: 4.1 },
      { timestamp: '12:00', value: 4.9 },
      { timestamp: '13:00', value: 5.6 },
      { timestamp: '14:00', value: 6.4 },
      { timestamp: '15:00', value: 7.2 }
    ],
    aiAnomalyScore: 94,
    predictedFailureDays: 1.5
  },
  {
    id: 'sens-02',
    assetTag: 'TURB-01',
    sensorType: 'TEMPERATURE',
    currentValue: 64.8,
    unit: '°C',
    warningThreshold: 75.0,
    criticalThreshold: 85.0,
    status: 'NORMAL',
    historicalSeries: [
      { timestamp: '10:00', value: 62.1 },
      { timestamp: '11:00', value: 63.4 },
      { timestamp: '12:00', value: 64.0 },
      { timestamp: '13:00', value: 64.5 },
      { timestamp: '14:00', value: 64.8 },
      { timestamp: '15:00', value: 64.8 }
    ],
    aiAnomalyScore: 8
  },
  {
    id: 'sens-03',
    assetTag: 'PREN-02',
    sensorType: 'PRESSURE',
    currentValue: 278,
    unit: 'bar',
    warningThreshold: 290,
    criticalThreshold: 310,
    status: 'NORMAL',
    historicalSeries: [
      { timestamp: '10:00', value: 275 },
      { timestamp: '11:00', value: 276 },
      { timestamp: '12:00', value: 277 },
      { timestamp: '13:00', value: 279 },
      { timestamp: '14:00', value: 278 },
      { timestamp: '15:00', value: 278 }
    ],
    aiAnomalyScore: 12
  },
  {
    id: 'sens-04',
    assetTag: 'BOM-12',
    sensorType: 'CURRENT',
    currentValue: 118,
    unit: 'Amperes',
    warningThreshold: 125,
    criticalThreshold: 135,
    status: 'NORMAL',
    historicalSeries: [
      { timestamp: '10:00', value: 112 },
      { timestamp: '11:00', value: 114 },
      { timestamp: '12:00', value: 115 },
      { timestamp: '13:00', value: 117 },
      { timestamp: '14:00', value: 118 },
      { timestamp: '15:00', value: 118 }
    ],
    aiAnomalyScore: 15
  }
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'item-01',
    code: 'ROL-SKF-6314-2Z',
    name: 'Rolamento Rígido de Esferas SKF 6314-2Z/C3',
    category: 'Mecânica / Rolamentos',
    binLocation: 'Corredor M02 - Prateleira D4',
    currentStock: 8,
    reservedStock: 2,
    availableStock: 6,
    minStock: 4,
    maxStock: 20,
    reorderPoint: 5,
    unitPrice: 385.0,
    unit: 'UN',
    supplier: 'Distribuidora Rolamentos Brasil',
    status: 'IN_STOCK'
  },
  {
    id: 'item-02',
    code: 'OLEO-ISO-68-SINT',
    name: 'Óleo Hidráulico Sintético Alta Performance ISO VG 68',
    category: 'Lubrificantes',
    binLocation: 'Galpão Inflamáveis - Tambor T08',
    currentStock: 120,
    reservedStock: 40,
    availableStock: 80,
    minStock: 100,
    maxStock: 600,
    reorderPoint: 150,
    unitPrice: 32.5,
    unit: 'Litros',
    supplier: 'Shell Lubrificantes Industriais',
    status: 'LOW_STOCK'
  },
  {
    id: 'item-03',
    code: 'SELO-JC-5610-65',
    name: 'Selo Mecânico Balanceado Cartucho John Crane 65mm',
    category: 'Vedações Industriais',
    binLocation: 'Corredor V01 - Gaveta 12',
    currentStock: 2,
    reservedStock: 1,
    availableStock: 1,
    minStock: 2,
    maxStock: 6,
    reorderPoint: 2,
    unitPrice: 1450.0,
    unit: 'UN',
    supplier: 'John Crane Brasil',
    status: 'LOW_STOCK'
  },
  {
    id: 'item-04',
    code: 'DISJ-SIEM-3VL-250',
    name: 'Disjuntor Caixa Moldada Siemens 3VL 250A Tripolar',
    category: 'Elétrica & Automação',
    binLocation: 'Corredor E03 - Prateleira A1',
    currentStock: 4,
    reservedStock: 0,
    availableStock: 4,
    minStock: 2,
    maxStock: 8,
    reorderPoint: 3,
    unitPrice: 2280.0,
    unit: 'UN',
    supplier: 'Siemens Automação e Energia',
    status: 'IN_STOCK'
  }
];

export const INITIAL_PURCHASES: PurchaseOrder[] = [
  {
    id: 'po-01',
    number: 'OC-2026-0194',
    vendor: 'Distribuidora Rolamentos Brasil Ltda',
    description: 'Aquisição emergencial de 10 unidades de rolamento SKF 6314-2Z e 2 selos mecânicos cartucho',
    totalValue: 6750.0,
    status: 'IN_TRANSIT',
    requestedDate: '2026-10-22',
    deliveryDate: '2026-10-25'
  },
  {
    id: 'po-02',
    number: 'OC-2026-0195',
    vendor: 'Shell Lubrificantes Industriais',
    description: 'Reposição programada de 2 tambores de 200L óleo sintético ISO VG 68',
    totalValue: 13000.0,
    status: 'APPROVED',
    requestedDate: '2026-10-23',
    deliveryDate: '2026-10-30'
  }
];

export const INITIAL_CONTRACTS: VendorContract[] = [
  {
    id: 'cnt-01',
    vendor: 'Atlas Copco Brasil Serviços',
    serviceType: 'Contrato de Manutenção Preditiva & Peças Genuínas Compressores',
    valuePerMonth: 8900.0,
    slaResponseHours: 4,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    status: 'ACTIVE'
  },
  {
    id: 'cnt-02',
    vendor: 'Metrologia Rápida Calibrações RBC',
    serviceType: 'Calibração Semestral de Instrumentos e Emissão de Laudos RBC',
    valuePerMonth: 3500.0,
    slaResponseHours: 24,
    startDate: '2025-11-01',
    endDate: '2026-10-31',
    status: 'NEAR_EXPIRATION'
  }
];

export const INITIAL_TECHNICIANS: Technician[] = [
  {
    id: 'tech-01',
    name: 'Carlos Eduardo Mendes',
    specialty: 'Mecânica',
    shift: 'Turno A (06:00 - 15:00)',
    status: 'BUSY',
    assignedOrdersCount: 2,
    certifications: [
      { name: 'NR-12 Segurança em Máquinas', expiry: '2027-02-15', valid: true },
      { name: 'NR-35 Trabalho em Altura', expiry: '2027-05-10', valid: true },
      { name: 'Alinhamento a Laser Pruftechnik', expiry: '2028-01-01', valid: true }
    ],
    hourlyRate: 70.0
  },
  {
    id: 'tech-02',
    name: 'Juliana Vasconcelos',
    specialty: 'Elétrica',
    shift: 'Turno Administrativo (08:00 - 17:00)',
    status: 'AVAILABLE',
    assignedOrdersCount: 1,
    certifications: [
      { name: 'NR-10 Segurança em Eletricidade SEP', expiry: '2027-08-20', valid: true },
      { name: 'Termografia Nível 2 ITC Certificada', expiry: '2027-11-12', valid: true },
      { name: 'NR-33 Espaços Confinados', expiry: '2027-03-30', valid: true }
    ],
    hourlyRate: 75.0
  },
  {
    id: 'tech-03',
    name: 'Renato Faria',
    specialty: 'Instrumentação',
    shift: 'Turno B (14:00 - 23:00)',
    status: 'AVAILABLE',
    assignedOrdersCount: 0,
    certifications: [
      { name: 'Calibração Industrial RBC', expiry: '2027-09-05', valid: true },
      { name: 'NR-10 Eletricidade', expiry: '2026-12-01', valid: true }
    ],
    hourlyRate: 65.0
  }
];

export const INITIAL_LOTO: LotoPermit[] = [
  {
    id: 'loto-01',
    code: 'PT-LOTO-2026-088',
    assetTag: 'COMP-04',
    type: 'LOTO',
    description: 'Bloqueio físico de disjuntor principal 440V e travamento com cadeado e garra da válvula de ar comprimido',
    isolationPoints: [
      'Painel QG-04 Disjuntor D-160 - Cadeado Amarelo nº 14',
      'Válvula Esfera Saída Reservatório V-02 - Cadeado Vermelho nº 08 com cabo de aço'
    ],
    issuedTo: 'Carlos Eduardo Mendes',
    approvedBy: 'Eng. Segurança Marcos Vinicius',
    validUntil: '2026-10-25 18:00',
    status: 'ACTIVE_LOCKED'
  },
  {
    id: 'loto-02',
    code: 'PT-ALT-2026-042',
    assetTag: 'TURB-01',
    type: 'ALTURA',
    description: 'Permissão de Trabalho em Altura (5.8 metros) para inspeção da tubulação superior de vapor',
    isolationPoints: [
      'Uso obrigatório de cinto tipo paraquedista com duplo talabarte ancorado em linha de vida inspecionada'
    ],
    issuedTo: 'Juliana Vasconcelos',
    approvedBy: 'Supervisor Técnico Rafael Alencar',
    validUntil: '2026-10-26 17:00',
    status: 'AUTHORIZED'
  }
];

export const INITIAL_SHUTDOWNS: IndustrialShutdown[] = [
  {
    id: 'sht-01',
    name: 'Parada Geral Anual de Fábrica 2026 (Turnaround)',
    targetPlant: 'Unidade Industrial 01 - Completa',
    startDate: '2026-12-10',
    endDate: '2026-12-22',
    totalWorkOrders: 184,
    completedWorkOrders: 42,
    progressPercent: 22.8,
    budgetEstimated: 650000.0,
    budgetSpent: 148000.0,
    status: 'PLANNING'
  }
];

export const INITIAL_OEE: ProductionLineOEE[] = [
  {
    lineId: 'line-01',
    lineName: 'Linha 01 - Estamparia Automotiva',
    availability: 92.5,
    performance: 94.0,
    quality: 98.8,
    oee: 85.9,
    currentShift: 'Turno A',
    stopsCount: 3,
    totalDowntimeMinutes: 38
  },
  {
    lineId: 'line-02',
    lineName: 'Linha 02 - Usinagem CNC Célula Flexível',
    availability: 97.2,
    performance: 91.5,
    quality: 99.4,
    oee: 88.4,
    currentShift: 'Turno A',
    stopsCount: 1,
    totalDowntimeMinutes: 14
  }
];

export const INITIAL_ENERGY: EnergyMetric[] = [
  {
    assetTag: 'TURB-01',
    kwhConsumedToday: 18400,
    specificConsumptionKwhTon: 14.2,
    co2EquivalentKg: 1240,
    anomalyDetected: false
  },
  {
    assetTag: 'COMP-04',
    kwhConsumedToday: 2450,
    specificConsumptionKwhTon: 32.8,
    co2EquivalentKg: 310,
    anomalyDetected: true // Desvio de consumo por atrito mecânico elevado
  }
];

export const INITIAL_TICKETS: ServiceTicket[] = [
  {
    id: 'tkt-01',
    ticketNumber: 'CHAM-2026-109',
    requester: 'Márcio Silva (Líder Produção)',
    department: 'Estamparia',
    location: 'Pátio Linha 01',
    subject: 'Ruído incomum e vibração na esteira de saída de retalhos',
    priority: 'HIGH',
    slaDeadline: '2026-10-24 18:00',
    status: 'IN_TRIAGE'
  },
  {
    id: 'tkt-02',
    ticketNumber: 'CHAM-2026-108',
    requester: 'Fabiana Moreira (Facilities)',
    department: 'Administrativo',
    location: 'Prédio Central 2º Andar',
    subject: 'Temperatura elevada no CPD / Falha no ar-condicionado de precisão',
    priority: 'URGENT',
    slaDeadline: '2026-10-24 16:30',
    status: 'RESOLVED',
    csatRating: 5
  }
];
