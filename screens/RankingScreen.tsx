
import React, { useState, useMemo } from 'react';
import { MOCK_SUPPLIERS, MOCK_ISSUES } from '../constants';
import { Supplier, SupplierStatus, IssueRecord } from '../types';
// Fixed: Added AlertCircle to imports
import { 
  Search, Filter, Star, Trophy, AlertTriangle, AlertCircle,
  ChevronRight, ExternalLink, Download, ArrowUpDown,
  History, Info, FileText, CheckCircle2, X
} from 'lucide-react';

interface RankingScreenProps {
  onOpenDetails: (supplier: Supplier) => void;
}

const RankingScreen: React.FC<RankingScreenProps> = ({ onOpenDetails }) => {
  const [filterText, setFilterText] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('Todos');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [activeTab, setActiveTab] = useState<'geral' | 'problemas' | 'avaliacoes'>('geral');
  const [selectedIssueDetail, setSelectedIssueDetail] = useState<IssueRecord | null>(null);

  const segments = ['Todos', ...Array.from(new Set(MOCK_SUPPLIERS.map(s => s.segment)))];

  const filteredSuppliers = useMemo(() => {
    return MOCK_SUPPLIERS.filter(s => {
      const matchText = s.name.toLowerCase().includes(filterText.toLowerCase()) || s.cnpj.includes(filterText);
      const matchSegment = selectedSegment === 'Todos' || s.segment === selectedSegment;
      return matchText && matchSegment;
    });
  }, [filterText, selectedSegment]);

  const getStatus = (score: number): { label: string; color: string; bg: string; border: string; icon: any; recommended: boolean } => {
    if (score >= 4.0) return { label: 'ÓTIMO', color: '#2E7D32', bg: '#E8F5E9', border: '#C8E6C9', icon: Trophy, recommended: true };
    if (score >= 2.0) return { label: 'BOM', color: '#F9A825', bg: '#FFFDE7', border: '#FFF9C4', icon: CheckCircle2, recommended: false };
    return { label: 'RUIM', color: '#E53935', bg: '#FFEBEE', border: '#FFCDD2', icon: AlertTriangle, recommended: false };
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#003366]">Ranking de Fornecedores</h1>
          <p className="text-gray-500 mt-2">Visualize os melhores fornecedores baseados nas avaliações internas.</p>
        </div>
        <button className="flex items-center gap-2 bg-[#003366] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md hover:bg-[#002244] transition-all">
          <Download size={18} /> Exportar Ranking
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-2xl findes-shadow border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Buscar por nome ou CNPJ..."
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#003366] text-sm"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {segments.map(seg => (
            <button
              key={seg}
              onClick={() => setSelectedSegment(seg)}
              className={`
                whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all border
                ${selectedSegment === seg 
                  ? 'bg-[#003366] text-white border-[#003366] shadow-sm' 
                  : 'bg-white text-[#666666] border-gray-200 hover:border-gray-300'}
              `}
            >
              {seg}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="bg-white rounded-2xl findes-shadow border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-5 text-[10px] font-bold text-[#666666] uppercase tracking-wider w-16 text-center">Pos</th>
                <th className="p-5 text-[10px] font-bold text-[#666666] uppercase tracking-wider">Fornecedor</th>
                <th className="p-5 text-[10px] font-bold text-[#666666] uppercase tracking-wider">Avaliação</th>
                <th className="p-5 text-[10px] font-bold text-[#666666] uppercase tracking-wider">Mini-Notas</th>
                <th className="p-5 text-[10px] font-bold text-[#666666] uppercase tracking-wider text-center">Volume</th>
                <th className="p-5 text-[10px] font-bold text-[#666666] uppercase tracking-wider text-center">Ocorrências</th>
                <th className="p-5 text-[10px] font-bold text-[#666666] uppercase tracking-wider text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredSuppliers.map((s, idx) => {
                const status = getStatus(s.averageScore);
                const Icon = status.icon;
                return (
                  <tr key={s.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="p-5 text-center">
                      <span className={`
                        inline-flex items-center justify-center w-8 h-8 rounded-full font-black text-xs
                        ${idx === 0 ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-400 shadow-sm' : 
                          idx === 1 ? 'bg-gray-100 text-gray-700 ring-2 ring-gray-300 shadow-sm' :
                          idx === 2 ? 'bg-orange-100 text-orange-700 ring-2 ring-orange-300 shadow-sm' :
                          'bg-gray-50 text-gray-400'}
                      `}>
                        {idx + 1}
                      </span>
                    </td>
                    <td className="p-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-[#003366] text-sm group-hover:underline cursor-pointer" onClick={() => setSelectedSupplier(s)}>{s.name}</span>
                        <span className="text-[10px] text-gray-400 font-medium">{s.cnpj}</span>
                        {status.recommended && (
                          <span className="mt-1 flex items-center gap-1 text-[9px] font-black text-green-600 bg-green-50 w-fit px-2 py-0.5 rounded-full border border-green-100">
                            <Trophy size={8} /> RECOMENDADO
                          </span>
                        )}
                        {!status.recommended && s.averageScore < 2 && (
                          <span className="mt-1 flex items-center gap-1 text-[9px] font-black text-red-600 bg-red-50 w-fit px-2 py-0.5 rounded-full border border-red-100">
                            <AlertTriangle size={8} /> NÃO RECOMENDADO
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          <Star size={14} fill="#FACC15" className="text-yellow-400" />
                          <span className="font-bold text-[#003366]">{s.averageScore.toFixed(1)}</span>
                          <span className={`text-[9px] px-2 py-0.5 rounded-md font-black border tracking-tighter`} style={{ color: status.color, backgroundColor: status.bg, borderColor: status.border }}>
                            {status.label}
                          </span>
                        </div>
                        <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${(s.averageScore/5)*100}%`, backgroundColor: status.color }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex gap-2">
                        <div className="flex flex-col items-center">
                          <span className="text-[9px] text-gray-400 font-bold uppercase">Qual</span>
                          <span className="text-xs font-bold text-[#003366]">{s.criteria.quality}</span>
                        </div>
                        <div className="flex flex-col items-center border-x border-gray-100 px-2">
                          <span className="text-[9px] text-gray-400 font-bold uppercase">Entr</span>
                          <span className="text-xs font-bold text-[#003366]">{s.criteria.delivery}</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-[9px] text-gray-400 font-bold uppercase">Atend</span>
                          <span className="text-xs font-bold text-[#003366]">{s.criteria.support}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 text-center">
                      <span className="text-xs font-bold text-gray-600 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">{s.volume}</span>
                    </td>
                    <td className="p-5 text-center">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${s.occurrences > 5 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-gray-50 text-gray-600 border-gray-100'}`}>
                        {s.occurrences}
                      </span>
                    </td>
                    <td className="p-5 text-center">
                      <button 
                        onClick={() => setSelectedSupplier(s)}
                        className="p-2 hover:bg-blue-50 text-[#003366] rounded-xl transition-all"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Supplier Summary Modal/Drawer */}
      {selectedSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedSupplier(null)} />
          <div className="relative w-full max-w-2xl h-full bg-white shadow-2xl flex flex-col animate-slideInRight">
            
            {/* Header */}
            <div className="p-8 border-b border-gray-100 bg-gray-50/50">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-black text-[#003366] tracking-tight">{selectedSupplier.name}</h2>
                  <p className="text-sm text-gray-400 font-medium">{selectedSupplier.cnpj}</p>
                </div>
                <button onClick={() => setSelectedSupplier(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400">
                  <X size={24} />
                </button>
              </div>

              <div className="flex items-end gap-6">
                <div className="bg-white p-4 rounded-2xl border border-gray-100 findes-shadow">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Média Interna</span>
                  <div className="flex items-center gap-2">
                    <Star size={24} fill="#FACC15" className="text-yellow-400" />
                    <span className="text-3xl font-black text-[#003366]">{selectedSupplier.averageScore.toFixed(1)}</span>
                  </div>
                </div>
                <div className={`px-6 py-4 rounded-2xl border flex items-center gap-3 findes-shadow`} 
                  style={{ 
                    backgroundColor: getStatus(selectedSupplier.averageScore).bg, 
                    borderColor: getStatus(selectedSupplier.averageScore).border,
                    color: getStatus(selectedSupplier.averageScore).color
                  }}>
                  {React.createElement(getStatus(selectedSupplier.averageScore).icon, { size: 28 })}
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Status de Rede</span>
                    <span className="text-xl font-black uppercase">{getStatus(selectedSupplier.averageScore).label}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 bg-white sticky top-0">
              {[
                { id: 'geral', label: 'Visão Geral', count: null },
                { id: 'problemas', label: 'Problemas', count: MOCK_ISSUES.length },
                { id: 'avaliacoes', label: 'Avaliações', count: 42 },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all relative
                    ${activeTab === tab.id ? 'text-[#003366]' : 'text-gray-400 hover:text-gray-600'}
                  `}
                >
                  {tab.label} {tab.count !== null && `(${tab.count})`}
                  {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#003366] rounded-t-full"></div>}
                </button>
              ))}
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-8 bg-white scrollbar-hide">
              {activeTab === 'geral' && (
                <div className="space-y-8 animate-fadeIn">
                  {selectedSupplier.averageScore < 2 && (
                    <div className="bg-red-50 p-6 rounded-2xl border border-red-100 flex items-start gap-4">
                      <div className="p-3 bg-white rounded-xl text-red-600 shadow-sm">
                        <AlertTriangle size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-red-700 text-sm">Por que é RUIM?</h4>
                        <p className="text-xs text-red-600/80 mt-1 leading-relaxed">
                          Fornecedor apresenta baixas notas recorrentes em <strong>Prazo de Entrega</strong> e 
                          diversas ocorrências de <strong>Atraso na entrega</strong> sem aviso prévio nos últimos 6 meses.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Segmento</span>
                      <p className="font-bold text-[#003366] mt-1">{selectedSupplier.segment}</p>
                    </div>
                    <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Volume de Pedidos</span>
                      <p className="font-bold text-[#003366] mt-1">{selectedSupplier.volume} itens</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-black text-[#003366] uppercase tracking-widest mb-4">Critérios Detalhados</h4>
                    <div className="space-y-4">
                      {Object.entries(selectedSupplier.criteria).map(([key, val]) => (
                        <div key={key}>
                          <div className="flex justify-between text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
                            <span>{key === 'quality' ? 'Qualidade' : key === 'delivery' ? 'Entrega' : 'Atendimento'}</span>
                            {/* Fixed: Cast val to number for type safety */}
                            <span className="text-[#003366]">{(val as number).toFixed(1)} / 5.0</span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 rounded-full">
                            {/* Fixed: Cast val to number for calculation */}
                            <div className="h-full bg-[#003366] rounded-full transition-all duration-1000" style={{ width: `${((val as number)/5)*100}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'problemas' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="text-[10px] font-black text-[#003366] uppercase tracking-widest">Histórico de Ocorrências</h4>
                    <div className="flex gap-2">
                       <button className="text-[9px] font-black bg-blue-50 text-[#003366] px-3 py-1 rounded-full">TODOS</button>
                       <button className="text-[9px] font-black bg-gray-50 text-gray-400 px-3 py-1 rounded-full">LOGÍSTICA</button>
                    </div>
                  </div>

                  <div className="overflow-x-auto -mx-8 px-8">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-gray-50">
                          <th className="py-3 text-[9px] font-bold text-gray-400 uppercase">Data</th>
                          <th className="py-3 text-[9px] font-bold text-gray-400 uppercase">Tipo / OC</th>
                          <th className="py-3 text-[9px] font-bold text-gray-400 uppercase">Status</th>
                          <th className="py-3 text-[9px] font-bold text-gray-400 uppercase text-right">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {MOCK_ISSUES.map(issue => (
                          <tr key={issue.id} className="hover:bg-gray-50/50">
                            <td className="py-4 text-[11px] font-medium text-gray-500 whitespace-nowrap">{issue.date}</td>
                            <td className="py-4">
                              <div className="flex flex-col">
                                <span className="text-[11px] font-bold text-[#003366]">{issue.type}</span>
                                <span className="text-[9px] bg-gray-100 text-gray-500 w-fit px-1.5 py-0.5 rounded mt-0.5 font-bold uppercase tracking-tighter">
                                  {issue.ocId}
                                </span>
                              </div>
                            </td>
                            <td className="py-4">
                              <span className={`
                                text-[9px] font-black px-2 py-0.5 rounded-full border tracking-tighter uppercase
                                ${issue.status === 'Fechado' ? 'bg-green-50 text-green-600 border-green-100' : 
                                  issue.status === 'Em análise' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                                  'bg-red-50 text-red-600 border-red-100'}
                              `}>
                                {issue.status}
                              </span>
                            </td>
                            <td className="py-4 text-right">
                              <button 
                                onClick={() => setSelectedIssueDetail(issue)}
                                className="text-[10px] font-black text-[#003366] underline hover:text-[#002244] uppercase tracking-tighter"
                              >
                                Causa reportada
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {MOCK_ISSUES.length === 0 && (
                    <div className="py-20 text-center text-gray-300">
                      <History size={48} className="mx-auto mb-3 opacity-30" />
                      <p className="text-xs font-bold uppercase tracking-widest">Nenhum problema registrado</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'avaliacoes' && (
                <div className="py-20 text-center text-gray-300">
                  <Star size={48} className="mx-auto mb-3 opacity-30" />
                  <p className="text-xs font-bold uppercase tracking-widest">Feedbacks em breve...</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-4">
              <button 
                onClick={() => setSelectedSupplier(null)}
                className="px-8 py-3 text-gray-400 font-bold uppercase tracking-widest text-xs hover:text-gray-600"
              >
                Fechar
              </button>
              <button className="px-8 py-3 bg-[#003366] text-white rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg hover:bg-[#002244] transition-all">
                Ir para Auditoria
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Causa Reportada Overlay (Second Level Modal) */}
      {selectedIssueDetail && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#003366]/60 backdrop-blur-md" onClick={() => setSelectedIssueDetail(null)} />
          <div className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl animate-scaleIn">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-black text-[#003366] uppercase tracking-tighter flex items-center gap-2">
                {/* Fixed: AlertCircle is now imported */}
                <AlertCircle size={18} /> Detalhes da Ocorrência {selectedIssueDetail.id}
              </h3>
              <button onClick={() => setSelectedIssueDetail(null)} className="p-1.5 hover:bg-gray-200 rounded-full">
                <X size={18} />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex gap-4 items-center">
                 <div className="flex-1 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <span className="text-[9px] font-black text-gray-400 uppercase block mb-1">Data do Relato</span>
                    <span className="text-sm font-bold text-[#003366]">{selectedIssueDetail.date}</span>
                 </div>
                 <div className="flex-1 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <span className="text-[9px] font-black text-gray-400 uppercase block mb-1">Autor</span>
                    <span className="text-sm font-bold text-[#003366]">{selectedIssueDetail.author}</span>
                 </div>
              </div>

              <div>
                <span className="text-[9px] font-black text-gray-400 uppercase block mb-2">Descrição Técnica</span>
                <p className="text-sm text-gray-700 leading-relaxed p-4 bg-blue-50/30 border border-blue-50 rounded-2xl">
                  {selectedIssueDetail.description}
                </p>
              </div>

              {selectedIssueDetail.affectedItemsDetail && selectedIssueDetail.affectedItemsDetail.length > 0 && (
                <div>
                  <span className="text-[9px] font-black text-gray-400 uppercase block mb-2">Itens Afetados</span>
                  <div className="space-y-2">
                    {selectedIssueDetail.affectedItemsDetail.map((item, idx) => (
                      <div key={idx} className="p-3 bg-white border border-gray-100 rounded-xl flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                           <span className="text-xs font-bold text-[#003366]">{item.name}</span>
                           <span className="text-[10px] font-medium text-gray-400">Qtd: {item.qty}</span>
                        </div>
                        <p className="text-[10px] text-gray-500 italic">"{item.note}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedIssueDetail.attachmentsList && selectedIssueDetail.attachmentsList.length > 0 && (
                <div>
                   <span className="text-[9px] font-black text-gray-400 uppercase block mb-2">Documentos Anexos ({selectedIssueDetail.attachmentsCount})</span>
                   <div className="flex flex-wrap gap-2">
                     {selectedIssueDetail.attachmentsList.map((file, i) => (
                       <div key={i} className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-xs font-bold text-gray-600 border border-gray-200 cursor-pointer hover:bg-gray-200">
                         <FileText size={14} /> {file}
                       </div>
                     ))}
                   </div>
                </div>
              )}
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
               <button onClick={() => setSelectedIssueDetail(null)} className="px-6 py-2 bg-[#003366] text-white rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg">Entendido</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RankingScreen;
