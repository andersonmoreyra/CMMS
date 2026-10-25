import { api } from './api';

export type AssetCriticality = 'A' | 'B' | 'C';
export type AssetStatus = 'OPERATIONAL' | 'IN_MAINTENANCE' | 'STANDBY' | 'QUARANTINE' | 'DECOMMISSIONED';

// Ativo como retornado por GET /api/assets
export interface ApiAsset {
  id: string;
  tag: string;
  name: string;
  category: string;
  parentId: string | null;
  plant: string;
  area: string;
  line: string;
  criticality: AssetCriticality;
  status: AssetStatus;
  manufacturer: string;
  model: string;
  serialNumber: string;
  installDate: string | null;
  powerKw: number;
  voltageV: number;
  warrantyExpiry: string | null;
  specs: Record<string, string>;
  openOrders: number;
  totalMaintenanceCost: number;
}

// Payload aceito por POST/PUT (o PUT exige o objeto completo)
export interface AssetInput {
  tag: string;
  name: string;
  category: string;
  parentId: string | null;
  plant: string;
  area: string;
  line: string;
  criticality: AssetCriticality;
  status: AssetStatus;
  manufacturer: string;
  model: string;
  serialNumber: string;
  installDate: string | null;
  powerKw: number;
  voltageV: number;
  warrantyExpiry: string | null;
  specs: Record<string, string>;
}

export const assetsApi = {
  list: () => api<ApiAsset[]>('/assets'),
  create: (a: AssetInput) => api<{ id: string }>('/assets', { method: 'POST', body: JSON.stringify(a) }),
  update: (id: string, a: AssetInput) => api<{ ok: boolean }>(`/assets/${id}`, { method: 'PUT', body: JSON.stringify(a) }),
  remove: (id: string) => api<{ ok: boolean }>(`/assets/${id}`, { method: 'DELETE' }),
};

export const toInput = (a: ApiAsset): AssetInput => ({
  tag: a.tag,
  name: a.name,
  category: a.category,
  parentId: a.parentId,
  plant: a.plant,
  area: a.area,
  line: a.line,
  criticality: a.criticality,
  status: a.status,
  manufacturer: a.manufacturer,
  model: a.model,
  serialNumber: a.serialNumber,
  installDate: a.installDate ? a.installDate.slice(0, 10) : null,
  powerKw: a.powerKw,
  voltageV: a.voltageV,
  warrantyExpiry: a.warrantyExpiry ? a.warrantyExpiry.slice(0, 10) : null,
  specs: a.specs ?? {},
});

export interface TreeNode {
  asset: ApiAsset;
  children: TreeNode[];
  depth: number;
}

/** Monta a floresta de ativos. Ativos cujo pai não existe viram raízes (nunca somem da árvore). */
export function buildTree(assets: ApiAsset[]): TreeNode[] {
  const byId = new Map(assets.map((a) => [a.id, a]));
  const kids = new Map<string, ApiAsset[]>();
  const roots: ApiAsset[] = [];
  for (const a of assets) {
    if (a.parentId && byId.has(a.parentId)) {
      const list = kids.get(a.parentId) ?? [];
      list.push(a);
      kids.set(a.parentId, list);
    } else roots.push(a);
  }
  const make = (a: ApiAsset, depth: number): TreeNode => ({
    asset: a,
    depth,
    children: (kids.get(a.id) ?? []).map((c) => make(c, depth + 1)),
  });
  return roots.map((r) => make(r, 0));
}

/** IDs do ativo e de todos os seus descendentes (para impedir ciclos no seletor de pai). */
export function descendantIds(assets: ApiAsset[], id: string): Set<string> {
  const out = new Set<string>([id]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const a of assets) {
      if (a.parentId && out.has(a.parentId) && !out.has(a.id)) {
        out.add(a.id);
        grew = true;
      }
    }
  }
  return out;
}
