import {
  Boxes, Wrench, CalendarDays, Smartphone, Gauge, Activity, ClipboardCheck, Package,
  ShoppingCart, Users, ShieldAlert, Flame, DollarSign, BarChart3, Bot, Zap, Cpu, FileText,
  HelpCircle, Truck, Leaf, Layers, KeyRound, LayoutDashboard,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ModuleCategory } from '../types';

export interface NavItem {
  id: ModuleCategory;
  label: string;
  title: string; // título exibido no cabeçalho
  icon: LucideIcon;
}
export interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

// Fonte única da navegação: usada pela Sidebar e pelo Header
export const NAV_GROUPS: NavGroup[] = [
  {
    id: 'operacoes',
    label: 'Operações',
    items: [
      { id: 'dashboards', label: 'Cockpit', title: 'Cockpit de Manutenção', icon: LayoutDashboard },
      { id: 'operations-oee', label: 'Produção & OEE', title: 'Operações, Paradas e OEE', icon: Layers },
      { id: 'safety', label: 'Segurança & LOTO', title: 'Segurança do Trabalho e LOTO', icon: ShieldAlert },
      { id: 'team', label: 'Equipes', title: 'Equipes e Mão de Obra', icon: Users },
      { id: 'turnaround', label: 'Paradas de Fábrica', title: 'Paradas Industriais e Projetos', icon: Flame },
      { id: 'specialized', label: 'Frotas & Facilities', title: 'Frotas, Facilities e Ferramentaria', icon: Truck },
      { id: 'energy', label: 'Energia', title: 'Energia e Sustentabilidade', icon: Leaf },
    ],
  },
  {
    id: 'os',
    label: 'Ordens de Serviço',
    items: [
      { id: 'work-orders', label: 'Ordens de Serviço', title: 'Solicitações e Ordens de Serviço', icon: Wrench },
      { id: 'planning', label: 'Planos & RCM', title: 'Planejamento de Manutenção (RCM)', icon: CalendarDays },
      { id: 'scheduling', label: 'Programação', title: 'Programação e Gantt', icon: BarChart3 },
      { id: 'inspections', label: 'Inspeções', title: 'Inspeções e Calibração', icon: ClipboardCheck },
      { id: 'mobile', label: 'Técnico Móvel', title: 'Execução Móvel (Técnico)', icon: Smartphone },
    ],
  },
  {
    id: 'ativos',
    label: 'Ativos & Confiabilidade',
    items: [
      { id: 'assets', label: 'Ativos', title: 'Cadastro e Hierarquia de Ativos', icon: Boxes },
      { id: 'reliability', label: 'Falhas & FMEA', title: 'Confiabilidade: MTBF, MTTR e FMEA', icon: Gauge },
      { id: 'iot-condition', label: 'Telemetria IoT', title: 'Monitoramento Preditivo e Telemetria', icon: Activity },
    ],
  },
  {
    id: 'suprimentos',
    label: 'Suprimentos & Custos',
    items: [
      { id: 'inventory', label: 'Almoxarifado', title: 'Estoque e Peças MRO', icon: Package },
      { id: 'purchasing', label: 'Compras & Contratos', title: 'Compras, Fornecedores e Contratos', icon: ShoppingCart },
      { id: 'costs', label: 'Custos & TCO', title: 'Custos e TCO do Ciclo de Vida', icon: DollarSign },
    ],
  },
  {
    id: 'plataforma',
    label: 'Plataforma',
    items: [
      { id: 'ai-copilot', label: 'Copilot IA', title: 'Assistente de IA Industrial', icon: Bot },
      { id: 'automations', label: 'Automações', title: 'Automações e Workflows', icon: Zap },
      { id: 'integrations', label: 'Integrações', title: 'Integrações com ERP, SCADA e APIs', icon: Cpu },
      { id: 'documents', label: 'Documentos', title: 'Manuais, POPs e Desenhos', icon: FileText },
      { id: 'helpdesk', label: 'Chamados', title: 'Portal de Chamados com SLA', icon: HelpCircle },
      { id: 'commercial-licensing', label: 'Licenças', title: 'Licenciamento e Segurança', icon: KeyRound },
    ],
  },
];

export const findNav = (id: ModuleCategory) => {
  for (const g of NAV_GROUPS) {
    const item = g.items.find((i) => i.id === id);
    if (item) return { group: g, item };
  }
  return null;
};
