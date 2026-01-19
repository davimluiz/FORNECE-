
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
  { id: '1', name: 'Fornecedor Exemplo LTDA', cnpj: '12.345.678/0001-90', contact: 'compras@fornecedor.com.br', averageScore: 4.8, criteria: { quality: 5, delivery: 4.5, support: 5 }, volume: 150, occurrences: 2, segment: 'Logística', items: [{ id: 'i1', name: 'Cabo de alimentação 2m', quantity: 50, unit: 'un' }, { id: 'i2', name: 'Chave de fenda Phillips', quantity: 20, unit: 'un' }, { id: 'i3', name: 'Parafuso M6', quantity: 200, unit: 'un' }] },
  { id: '2', name: 'Indústria & Cia ME', cnpj: '98.765.432/0001-10', contact: 'contato@industriacia.com.br', averageScore: 4.2, criteria: { quality: 4, delivery: 4.5, support: 4 }, volume: 85, occurrences: 1, segment: 'Periféricos', items: [{ id: 'i4', name: 'Luvas de proteção (M)', quantity: 100, unit: 'par' }, { id: 'i5', name: 'Máscara PFF2', quantity: 300, unit: 'un' }] },
  { id: '3', name: 'TecnoGlobal S.A.', cnpj: '11.222.333/0001-44', averageScore: 4.9, criteria: { quality: 5, delivery: 5, support: 4.8 }, volume: 210, occurrences: 0, segment: 'TI', contact: 'ti@tecno.com', items: [] },
  { id: '4', name: 'Madeiras Brasil', cnpj: '22.333.444/0001-55', averageScore: 3.5, criteria: { quality: 3.5, delivery: 3, support: 4 }, volume: 45, occurrences: 3, segment: 'Construção', contact: 'vendas@madeiras.com', items: [] },
  { id: '5', name: 'Metalúrgica Ferro Forte', cnpj: '33.444.555/0001-66', averageScore: 1.8, criteria: { quality: 2, delivery: 1.5, support: 2 }, volume: 30, occurrences: 8, segment: 'Metalurgia', contact: 'contato@ferroforte.com', items: [] },
  { id: '6', name: 'Papelaria Central', cnpj: '44.555.666/0001-77', averageScore: 4.0, criteria: { quality: 4, delivery: 4, support: 4 }, volume: 120, occurrences: 1, segment: 'Escritório', contact: 'sac@central.com', items: [] },
  { id: '7', name: 'Transportes Rápidos', cnpj: '55.666.777/0001-88', averageScore: 2.5, criteria: { quality: 3, delivery: 2, support: 2.5 }, volume: 300, occurrences: 15, segment: 'Logística', contact: 'expedicao@rapidos.com', items: [] },
  { id: '8', name: 'Limpeza Total Ltda', cnpj: '66.777.888/0001-99', averageScore: 4.5, criteria: { quality: 4.5, delivery: 4.5, support: 4.5 }, volume: 60, occurrences: 0, segment: 'Serviços', contact: 'operacional@limpezatotal.com', items: [] },
  { id: '9', name: 'Auto Peças Vale', cnpj: '77.888.999/0001-00', averageScore: 1.2, criteria: { quality: 1, delivery: 1.5, support: 1 }, volume: 20, occurrences: 12, segment: 'Automotiva', contact: 'vendas@valepartes.com', items: [] },
  { id: '10', name: 'Construtora Horizonte', cnpj: '88.999.000/0001-11', averageScore: 3.8, criteria: { quality: 4, delivery: 3.5, support: 4 }, volume: 90, occurrences: 2, segment: 'Construção', contact: 'eng@horizonte.com', items: [] },
  { id: '11', name: 'Química Solvente', cnpj: '99.000.111/0001-22', averageScore: 3.2, criteria: { quality: 3.5, delivery: 3, support: 3 }, volume: 55, occurrences: 4, segment: 'Química', contact: 'lab@solvente.com', items: [] },
  { id: '12', name: 'Distribuidora Fênix', cnpj: '00.111.222/0001-33', averageScore: 4.1, criteria: { quality: 4, delivery: 4.2, support: 4.1 }, volume: 180, occurrences: 1, segment: 'Distribuição', contact: 'comercial@fenix.com', items: [] },
  { id: '13', name: 'Segurança Máxima', cnpj: '12.333.555/0001-44', averageScore: 4.7, criteria: { quality: 5, delivery: 4.5, support: 4.6 }, volume: 75, occurrences: 0, segment: 'Segurança', contact: 'contato@maxseg.com', items: [] },
  { id: '14', name: 'Elétrica Volts', cnpj: '23.444.666/0001-55', averageScore: 2.1, criteria: { quality: 2, delivery: 2.5, support: 1.8 }, volume: 40, occurrences: 7, segment: 'Elétrica', contact: 'volts@volts.com', items: [] },
  { id: '15', name: 'Software Solutions', cnpj: '34.555.777/0001-66', averageScore: 4.9, criteria: { quality: 5, delivery: 4.8, support: 5 }, volume: 30, occurrences: 0, segment: 'TI', contact: 'dev@solutions.com', items: [] },
  { id: '16', name: 'Alimentos Saudáveis', cnpj: '45.666.888/0001-77', averageScore: 3.9, criteria: { quality: 4, delivery: 4, support: 3.7 }, volume: 150, occurrences: 3, segment: 'Alimentos', contact: 'sac@saudaveis.com', items: [] },
  { id: '17', name: 'Gráfica Express', cnpj: '56.777.999/0001-88', averageScore: 2.9, criteria: { quality: 3, delivery: 2.5, support: 3.2 }, volume: 80, occurrences: 9, segment: 'Gráfica', contact: 'arte@express.com', items: [] },
  { id: '18', name: 'Móveis Office', cnpj: '67.888.000/0001-99', averageScore: 4.3, criteria: { quality: 4.5, delivery: 4, support: 4.4 }, volume: 45, occurrences: 1, segment: 'Mobiliário', contact: 'vendas@office.com', items: [] },
  { id: '19', name: 'Têxtil Fibras', cnpj: '78.999.111/0001-00', averageScore: 3.4, criteria: { quality: 3.5, delivery: 3.2, support: 3.5 }, volume: 110, occurrences: 5, segment: 'Têxtil', contact: 'fabrica@fibras.com', items: [] },
  { id: '20', name: 'Consultoria Prime', cnpj: '89.000.222/0001-11', averageScore: 4.6, criteria: { quality: 4.7, delivery: 4.5, support: 4.6 }, volume: 25, occurrences: 0, segment: 'Serviços', contact: 'prime@prime.com', items: [] },
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
  },
  {
    id: 'RP-2025-0031',
    date: '2025-09-03',
    ocId: 'OS-2025-044',
    segment: 'Periféricos',
    type: 'Produto com defeito',
    affectedItemsCount: 1,
    affectedItemsDetail: [{ name: 'Impressora X', qty: 1, note: 'Erro de fusor intermitente' }],
    attachmentsCount: 1,
    status: 'Em análise',
    description: 'Falha no fusor após 300 páginas impressas; erro E52 no display.',
    author: 'Maria Oliveira',
    attachmentsList: ['Foto_Erro_Display.jpg']
  },
  {
    id: 'RP-2025-0022',
    date: '2025-07-22',
    ocId: 'FLUIG-123456',
    segment: 'Atendimento',
    type: 'Falta de retorno',
    affectedItemsCount: 0,
    attachmentsCount: 0,
    status: 'Aberto',
    description: 'Fornecedor não responde aos e-mails de cotação complementar há 5 dias úteis.',
    author: 'Carlos Mendes'
  }
];
