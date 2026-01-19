
export enum SupplierStatus {
  OTIMO = 'ÓTIMO',
  BOM = 'BOM',
  RUIM = 'RUIM'
}

export interface OCItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface WarningLog {
  date: string;
  reason: string;
  manager: string;
}

export interface Supplier {
  id: string;
  name: string;
  cnpj: string;
  contact: string;
  averageScore: number;
  criteria: {
    quality: number;
    delivery: number;
    support: number;
  };
  volume: number;
  occurrences: number;
  segment: string;
  items: OCItem[];
  warnings: number;
  isBlocked: boolean;
  lastAuditDate?: string;
  warningLogs?: WarningLog[]; // Histórico detalhado de strikes
}

export interface IssueRecord {
  id: string;
  date: string;
  ocId: string;
  segment: string;
  type: string;
  affectedItemsCount: number;
  affectedItemsDetail?: { name: string; qty: number; note: string }[];
  attachmentsCount: number;
  status: 'Aberto' | 'Em análise' | 'Fechado';
  description: string;
  author: string;
  attachmentsList?: string[];
}

export type ViewType = 'Avaliacao' | 'Ranking' | 'Consulta' | 'Gestao';

export const ITEM_RELATED_TYPES = ['Atraso na entrega', 'Produto com defeito', 'Divergência no pedido'];
