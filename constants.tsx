
import React from 'react';
import { Supplier, IssueRecord } from './types';

export const COLORS = {
  primary: '#003366',
  background: '#FFFFFF',
  surface: '#F5F5F5',
  secondaryText: '#666666',
  error: '#E53935',
  success: '#2E7D32',
  warning: '#FBC02D',
  lightBlue: '#EFF5FF',
  border: '#E5E7EB'
};

export const MOCK_SUPPLIERS: Supplier[] = [
  { 
    id: '1', 
    name: 'Fornecedor Exemplo LTDA', 
    cnpj: '12.345.678/0001-90', 
    contact: 'compras@fornecedor.com.br', 
    averageScore: 4.8, 
    criteria: { quality: 5, delivery: 4.5, support: 5 }, 
    volume: 150, 
    occurrences: 2, 
    segment: 'Logística', 
    items: [{ id: 'i1', name: 'Cabo de alimentação 2m', quantity: 50, unit: 'un' }, { id: 'i2', name: 'Chave de fenda Phillips', quantity: 20, unit: 'un' }, { id: 'i3', name: 'Parafuso M6', quantity: 200, unit: 'un' }], 
    warnings: 0, 
    isBlocked: false,
    warningLogs: []
  },
  { 
    id: '2', 
    name: 'Indústria & Cia ME', 
    cnpj: '98.765.432/0001-10', 
    contact: 'contato@industriacia.com.br', 
    averageScore: 4.2, 
    criteria: { quality: 4, delivery: 4.5, support: 4 }, 
    volume: 85, 
    occurrences: 1, 
    segment: 'Periféricos', 
    items: [{ id: 'i4', name: 'Luvas de proteção (M)', quantity: 100, unit: 'par' }, { id: 'i5', name: 'Máscara PFF2', quantity: 300, unit: 'un' }], 
    warnings: 1, 
    isBlocked: false,
    warningLogs: [
      { date: '2025-05-10', reason: 'Atraso crítico na entrega de EPIs para a unidade SESI.', manager: 'Carlos Gestor' }
    ]
  },
  { id: '3', name: 'TecnoGlobal S.A.', cnpj: '11.222.333/0001-44', averageScore: 4.9, criteria: { quality: 5, delivery: 5, support: 4.8 }, volume: 210, occurrences: 0, segment: 'TI', contact: 'ti@tecno.com', items: [], warnings: 0, isBlocked: false, warningLogs: [] },
  { 
    id: '4', 
    name: 'Madeiras Brasil', 
    cnpj: '22.333.444/0001-55', 
    averageScore: 3.5, 
    criteria: { quality: 3.5, delivery: 3, support: 4 }, 
    volume: 45, 
    occurrences: 3, 
    segment: 'Construção', 
    contact: 'vendas@madeiras.com', 
    items: [], 
    warnings: 2, 
    isBlocked: false,
    warningLogs: [
      { date: '2025-02-15', reason: 'Divergência recorrente de nota fiscal e carga física.', manager: 'Ana Auditoria' },
      { date: '2025-06-20', reason: 'Madeira entregue sem certificação ambiental exigida em contrato.', manager: 'João Silva' }
    ]
  },
  { 
    id: '5', 
    name: 'Metalúrgica Ferro Forte', 
    cnpj: '33.444.555/0001-66', 
    averageScore: 1.8, 
    criteria: { quality: 2, delivery: 1.5, support: 2 }, 
    volume: 30, 
    occurrences: 8, 
    segment: 'Metalurgia', 
    contact: 'contato@ferroforte.com', 
    items: [], 
    warnings: 3, 
    isBlocked: true,
    warningLogs: [
      { date: '2024-12-01', reason: 'Material com oxidação severa em 40% do lote.', manager: 'Marcos Qualidade' },
      { date: '2025-03-12', reason: 'Interrupção de linha de produção por falta de insumos programados.', manager: 'Marcos Qualidade' },
      { date: '2025-08-01', reason: 'Recusa sistemática em atender chamados de garantia.', manager: 'Diretoria FINDES' }
    ]
  },
  { id: '9', name: 'Auto Peças Vale', cnpj: '77.888.999/0001-00', averageScore: 1.2, criteria: { quality: 1, delivery: 1.5, support: 1 }, volume: 20, occurrences: 12, segment: 'Automotiva', contact: 'vendas@valepartes.com', items: [], warnings: 3, isBlocked: true, warningLogs: [
    { date: '2025-01-10', reason: 'Peças falsificadas identificadas em auditoria.', manager: 'Compliance' },
    { date: '2025-02-20', reason: 'Uso indevido da marca FINDES em material promocional.', manager: 'Jurídico' },
    { date: '2025-03-30', reason: 'Acúmulo de 10 reclamações não resolvidas em 30 dias.', manager: 'Operações' }
  ]},
].sort((a, b) => b.averageScore - a.averageScore);

export const MOCK_ISSUES: IssueRecord[] = [
  {
    id: 'RP-2025-0043',
    date: '2025-10-12',
    ocId: 'OC-2025-001',
    segment: 'Logística',
    type: 'Atraso na entrega',
    affectedItemsCount: 1,
    affectedItemsDetail: [{ name: 'Cabo 2m', qty: 50, note: 'Parcial entregue com 7 dias de atraso' }],
    attachmentsCount: 2,
    status: 'Fechado',
    description: 'Previsto 05/10, recebido 12/10; sem aviso prévio do fornecedor. Impacto severo na linha de produção.',
    author: 'João Silva',
    attachmentsList: ['Comprovante_OC001.pdf', 'Print_Rastreamento.png']
  }
];
