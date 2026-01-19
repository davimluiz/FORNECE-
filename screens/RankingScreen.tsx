
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { MOCK_SUPPLIERS } from '../constants';
import { Supplier } from '../types';
import { 
  Search, Star, Trophy, AlertTriangle,
  ChevronRight, Download, X, Send, Bot, Sparkles, Zap, ShieldCheck, Plus
} from 'lucide-react';

interface RankingScreenProps {
  onOpenDetails: (supplier: Supplier) => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const RankingScreen: React.FC<RankingScreenProps> = ({ onOpenDetails }) => {
  const [filterText, setFilterText] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('Todos');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  // Chatbot State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! Sou o assistente **FORNECE+**. Posso analisar os dados reais do nosso ranking para você. \n\nPergunte sobre um fornecedor específico, peça recomendações por segmento ou compare empresas!',
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const segments = ['Todos', ...Array.from(new Set(MOCK_SUPPLIERS.map(s => s.segment)))];

  const filteredSuppliers = useMemo(() => {
    return MOCK_SUPPLIERS.filter(s => {
      const matchText = s.name.toLowerCase().includes(filterText.toLowerCase()) || s.cnpj.includes(filterText);
      const matchSegment = selectedSegment === 'Todos' || s.segment === selectedSegment;
      return matchText && matchSegment;
    });
  }, [filterText, selectedSegment]);

  const getStatus = (score: number) => {
    if (score >= 4.0) return { label: 'ÓTIMO', color: '#2E7D32', bg: '#E8F5E9', border: '#C8E6C9', icon: Trophy, recommended: true };
    if (score >= 2.0) return { label: 'BOM', color: '#F9A825', bg: '#FFFDE7', border: '#FFF9C4', icon: Star, recommended: false };
    return { label: 'RUIM', color: '#E53935', bg: '#FFEBEE', border: '#FFCDD2', icon: AlertTriangle, recommended: false };
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Motor de Inteligência Local (Simulado)
  const processSimulatedAI = (input: string) => {
    const text = input.toLowerCase();
    
    // 1. Busca por Fornecedor Específico
    const mentionedSupplier = MOCK_SUPPLIERS.find(s => text.includes(s.name.toLowerCase()) || text.includes(s.cnpj));
    if (mentionedSupplier) {
      const status = mentionedSupplier.isBlocked ? "🚨 **BLOQUEADO**" : "✅ **ATIVO**";
      return `Analisei a **${mentionedSupplier.name}**. \n\nStatus: ${status}\nNota Geral: **${mentionedSupplier.averageScore.toFixed(1)}/5.0**\nSegmento: ${mentionedSupplier.segment}\n\nO desempenho em qualidade é de **${mentionedSupplier.criteria.quality}**. Deseja ver o histórico de ocorrências desta empresa?`;
    }

    // 2. Recomendação por Segmento
    const mentionedSegment = segments.find(seg => seg !== 'Todos' && text.includes(seg.toLowerCase()));
    if (mentionedSegment) {
      const topInSegment = MOCK_SUPPLIERS.filter(s => s.segment === mentionedSegment).sort((a, b) => b.averageScore - a.averageScore)[0];
      return `Para o segmento de **${mentionedSegment}**, o fornecedor com melhor performance é a **${topInSegment.name}**, com nota **${topInSegment.averageScore.toFixed(1)}**. \n\nEla possui um volume de ${topInSegment.volume} itens entregues com apenas ${topInSegment.occurrences} ocorrências.`;
    }

    // 3. Melhor Fornecedor Geral
    if (text.includes('melhor') || text.includes('ranking') || text.includes('campeão')) {
      const best = [...MOCK_SUPPLIERS].sort((a, b) => b.averageScore - a.averageScore)[0];
      return `O líder absoluto do ranking hoje é a **${best.name}**. \n\nCom uma nota de **${best.averageScore.toFixed(1)}**, ela é a nossa principal recomendaação para contratos de alta criticidade em ${best.segment}.`;
    }

    // 4. Alertas de Risco
    if (text.includes('risco') || text.includes('perigoso') || text.includes('alerta') || text.includes('bloqueado')) {
      const blocked = MOCK_SUPPLIERS.filter(s => s.isBlocked);
      const warnings = MOCK_SUPPLIERS.filter(s => s.warnings > 0 && !s.isBlocked);
      return `Atenção aos indicadores: \n\n- **${blocked.length}** empresas estão bloqueadas (ex: ${blocked[0].name}).\n- **${warnings.length}** empresas possuem advertências ativas.\n\nRecomendo evitar novas OCs para a **${blocked[0].name}** até que o plano de ação seja concluído.`;
    }

    // 5. Comparação
    if (text.includes('compara') || text.includes('versus') || text.includes(' vs ')) {
      const s1 = MOCK_SUPPLIERS[0];
      const s2 = MOCK_SUPPLIERS[1];
      return `Comparativo Técnico:\n\n**${s1.name}** (${s1.averageScore}) vs **${s2.name}** (${s2.averageScore})\n\nA ${s1.name} vence em **Qualidade** (${s1.criteria.quality}), enquanto a ${s2.name} é superior em **Volume de Entrega**. Qual critério é mais importante para sua OC atual?`;
    }

    return "Desculpe, não entendi. Posso ajudar você a:\n1. **Comparar** dois fornecedores.\n2. Identificar alertas de **risco**.\n3. Encontrar o **melhor** de um segmento.\n\nQual empresa você gostaria que eu analisasse agora?";
  };

  const handleSendMessage = (textOverride?: string) => {
    const messageContent = textOverride || chatInput;
    if (!messageContent.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = processSimulatedAI(messageContent);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-fadeIn relative min-h-[80vh]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#003366]">Ranking de Fornecedores</h1>
          <p className="text-gray-500 mt-2">Dados atualizados da base interna FINDES.</p>
        </div>
        <button className="flex items-center gap-2 bg-[#003366] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md hover:bg-[#002244] transition-all">
          <Download size={18} /> Exportar Planilha
        </button>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white p-6 rounded-2xl findes-shadow border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Buscar por nome ou CNPJ..."
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#003366] text-sm font-medium"
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

      {/* Tabela de Ranking */}
      <div className="bg-white rounded-2xl findes-shadow border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-5 text-[10px] font-bold text-[#666666] uppercase tracking-wider w-16 text-center">Pos</th>
                <th className="p-5 text-[10px] font-bold text-[#666666] uppercase tracking-wider">Fornecedor</th>
                <th className="p-5 text-[10px] font-bold text-[#666666] uppercase tracking-wider">Avaliação</th>
                <th className="p-5 text-[10px] font-bold text-[#666666] uppercase tracking-wider text-center">Volume</th>
                <th className="p-5 text-[10px] font-bold text-[#666666] uppercase tracking-wider text-center">Status</th>
                <th className="p-5 text-[10px] font-bold text-[#666666] uppercase tracking-wider text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredSuppliers.map((s, idx) => {
                const status = getStatus(s.averageScore);
                return (
                  <tr key={s.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="p-5 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-black text-xs ${idx === 0 ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-400' : 'bg-gray-50 text-gray-400'}`}>{idx + 1}</span>
                    </td>
                    <td className="p-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-[#003366] text-sm group-hover:underline cursor-pointer" onClick={() => setSelectedSupplier(s)}>{s.name}</span>
                        <span className="text-[10px] text-gray-400 font-medium">{s.cnpj}</span>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-2">
                        <Star size={14} fill="#FACC15" className="text-yellow-400" />
                        <span className="font-bold text-[#003366]">{s.averageScore.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="p-5 text-center">
                      <span className="text-xs font-bold text-gray-600 bg-gray-50 px-3 py-1 rounded-full">{s.volume}</span>
                    </td>
                    <td className="p-5 text-center">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${s.isBlocked ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-600 border-green-200'}`}>
                        {s.isBlocked ? 'BLOQUEADO' : 'ATIVO'}
                      </span>
                    </td>
                    <td className="p-5 text-center">
                      <button onClick={() => setSelectedSupplier(s)} className="p-2 hover:bg-blue-50 text-[#003366] rounded-xl transition-all">
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

      {/* Floating Chatbot Assistant */}
      <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end">
        {isChatOpen && (
          <div className="mb-4 w-[350px] sm:w-[400px] h-[540px] bg-white rounded-[32px] shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-slideUp">
            {/* Chat Header */}
            <div className="p-6 bg-[#003366] text-white flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles size={80} />
              </div>
              <div className="flex items-center gap-3 relative z-10">
                <div className="p-2 bg-white/10 rounded-xl relative">
                  <Bot size={24} className="text-blue-300" />
                  <div className="absolute -top-1 -right-1 bg-white text-[#003366] rounded-full p-0.5 shadow-sm">
                    <Plus size={8} strokeWidth={4} />
                  </div>
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase tracking-widest">FORNECE+ AI</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">Simulação de IA Local</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white relative z-10">
                <X size={20} />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50 scrollbar-hide">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`
                    max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed
                    ${msg.role === 'user' 
                      ? 'bg-[#003366] text-white rounded-tr-none shadow-md' 
                      : 'bg-white text-gray-700 rounded-tl-none border border-gray-100 findes-shadow'}
                  `}>
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-2 text-[10px] font-black uppercase text-blue-400 tracking-widest border-b border-gray-100 pb-1">
                        <Zap size={10} /> Insights Inteligentes
                      </div>
                    )}
                    <div className="whitespace-pre-wrap">
                      {msg.content.split('**').map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white p-4 rounded-3xl rounded-tl-none border border-gray-100 shadow-sm flex gap-1">
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input & Hints */}
            <div className="p-4 bg-white border-t border-gray-100">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-4 pb-1">
                 {[
                   { label: 'O melhor?', icon: Trophy },
                   { label: 'Empresas em Risco', icon: AlertTriangle },
                   { label: 'Compare top 2', icon: Zap },
                   { label: 'Melhor em TI', icon: ShieldCheck }
                 ].map((hint, i) => (
                   <button 
                    key={i}
                    onClick={() => handleSendMessage(hint.label)}
                    className="flex items-center gap-1.5 whitespace-nowrap text-[9px] font-black text-gray-400 uppercase tracking-widest bg-gray-100 px-3 py-2 rounded-full hover:bg-blue-50 hover:text-[#003366] transition-all border border-gray-200"
                   >
                     <hint.icon size={10} />
                     {hint.label}
                   </button>
                 ))}
              </div>
              <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                <input 
                  type="text"
                  placeholder="Pergunte sobre um fornecedor..."
                  className="flex-1 bg-transparent border-none outline-none px-2 py-2 text-sm font-medium text-[#003366]"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button 
                  onClick={() => handleSendMessage()}
                  className="p-3 bg-[#003366] text-white rounded-xl hover:bg-[#002244] transition-all shadow-md active:scale-95"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Small Round Chatbot Button (Robot + Plus) */}
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`
            w-14 h-14 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center relative group
            ${isChatOpen ? 'bg-red-500 rotate-90 scale-90' : 'bg-[#003366] hover:scale-110 active:scale-95'}
            text-white
          `}
          aria-label="Assistente Fornece+"
        >
          {isChatOpen ? <X size={24} /> : (
            <div className="relative">
              <Bot size={28} className="group-hover:animate-pulse" />
              <div className="absolute -top-1 -right-1 bg-white text-[#003366] rounded-full p-0.5 shadow-md flex items-center justify-center w-4 h-4">
                <Plus size={10} strokeWidth={4} />
              </div>
            </div>
          )}
          {!isChatOpen && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-pulse"></div>
          )}
          
          {!isChatOpen && (
             <div className="absolute right-full mr-4 bg-white px-3 py-1.5 rounded-lg shadow-xl border border-gray-100 text-[9px] font-black text-[#003366] uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                Assistente Virtual
             </div>
          )}
        </button>
      </div>

      {/* Modal Resumido de Fornecedor */}
      {selectedSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedSupplier(null)} />
          <div className="relative w-full max-w-2xl h-full bg-white shadow-2xl flex flex-col animate-slideInRight">
            <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-[#003366] tracking-tight">{selectedSupplier.name}</h2>
                <p className="text-sm text-gray-400 font-medium">{selectedSupplier.cnpj}</p>
              </div>
              <button onClick={() => setSelectedSupplier(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400">
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 p-8 space-y-6">
                <div className="bg-[#003366] p-6 rounded-2xl text-white shadow-lg">
                   <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Média Performance</p>
                   <div className="flex items-center gap-2">
                     <Star size={24} fill="#FACC15" className="text-yellow-400" />
                     <span className="text-4xl font-black">{selectedSupplier.averageScore.toFixed(1)}</span>
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Segmento</p>
                      <p className="font-bold text-[#003366]">{selectedSupplier.segment}</p>
                   </div>
                   <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Volume Total</p>
                      <p className="font-bold text-[#003366]">{selectedSupplier.volume} entregas</p>
                   </div>
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-[#003366] uppercase tracking-widest mb-4">Critérios Detalhados</h4>
                  <div className="space-y-4">
                    {Object.entries(selectedSupplier.criteria).map(([key, val]) => (
                      <div key={key}>
                        <div className="flex justify-between text-xs font-bold text-gray-600 mb-2 uppercase">
                          <span>{key === 'quality' ? 'Qualidade' : key === 'delivery' ? 'Entrega' : 'Suporte'}</span>
                          {/* Fixed: Cast val to number to resolve Property 'toFixed' does not exist on type 'unknown' */}
                          <span className="text-[#003366]">{(val as number).toFixed(1)}</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full">
                          {/* Fixed: Cast val to number to resolve arithmetic operation on type 'unknown' */}
                          <div className="h-full bg-[#003366] rounded-full" style={{ width: `${((val as number)/5)*100}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
            </div>
            <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
              <button onClick={() => setSelectedSupplier(null)} className="px-6 py-3 text-gray-400 font-bold uppercase text-[10px]">Fechar</button>
              <button className="px-6 py-3 bg-[#003366] text-white rounded-xl font-black uppercase text-[10px] shadow-md">Ver Perfil Completo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RankingScreen;
