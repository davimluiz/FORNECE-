
import React, { useState, useMemo, useRef } from 'react';
import { MOCK_SUPPLIERS, MOCK_ISSUES, COLORS } from '../constants';
import { Supplier, IssueRecord, WarningLog } from '../types';
import { 
  ShieldAlert, Users, Ban, AlertCircle, TrendingDown, 
  TrendingUp, FileDown, Upload, Search, Lock,
  ChevronRight, Sparkles, CheckCircle2, History, Database,
  MessageSquare, Send, Mail, X, AlertTriangle, Eye,
  Printer, BarChart3, Star, Download, Globe, ChevronLeft,
  Calendar, User
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface PendingIssue {
  id: string;
  supplierName: string;
  supplierEmail: string;
  date: string;
  type: string;
  description: string;
  status: 'Pendente' | 'Respondido';
}

const ManagementScreen: React.FC = () => {
  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ user: '', pass: '' });
  const [loginError, setLoginError] = useState('');

  // Data State
  const [suppliers, setSuppliers] = useState<Supplier[]>(MOCK_SUPPLIERS);
  const [isImporting, setIsImporting] = useState(false);
  const [iaAnalysis, setIaAnalysis] = useState<{ [id: string]: string }>({});
  const [isAnalyzing, setIsAnalyzing] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Selection States
  const [selectedIssue, setSelectedIssue] = useState<PendingIssue | null>(null);
  const [selectedSupplierDetails, setSelectedSupplierDetails] = useState<Supplier | null>(null);
  
  // Sub-detail states (inside supplier modal)
  const [activeSubView, setActiveSubView] = useState<'dashboard' | 'penalties' | 'occurrences'>('dashboard');

  // Interaction States
  const [responseEmail, setResponseEmail] = useState('');
  const [responseText, setResponseText] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Complaints State (Mock)
  const [pendingIssues, setPendingIssues] = useState<PendingIssue[]>([
    { id: 'REC-001', supplierName: 'Fornecedor Exemplo LTDA', supplierEmail: 'compras@fornecedor.com.br', date: '2025-10-24', type: 'Atraso na entrega', description: 'A carga de cabos de alimentação não chegou no prazo estipulado de 48h.', status: 'Pendente' },
    { id: 'REC-002', supplierName: 'Indústria & Cia ME', supplierEmail: 'contato@industriacia.com.br', date: '2025-10-25', type: 'Produto com defeito', description: 'Lote de luvas de proteção apresenta costuras frágeis.', status: 'Pendente' },
    { id: 'REC-003', supplierName: 'Madeiras Brasil', supplierEmail: 'vendas@madeiras.com', date: '2025-10-26', type: 'Divergência no pedido', description: 'Recebemos pinus em vez de eucalipto tratado.', status: 'Pendente' },
  ]);

  // Dash Metrics
  const metrics = useMemo(() => {
    const total = suppliers.length;
    const blocked = suppliers.filter(s => s.isBlocked).length;
    const lowScore = suppliers.filter(s => s.averageScore < 2.5).length;
    const pendingCount = pendingIssues.filter(i => i.status === 'Pendente').length;
    
    return { total, blocked, lowScore, pendingCount };
  }, [suppliers, pendingIssues]);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.cnpj.includes(searchTerm)
    );
  }, [suppliers, searchTerm]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.user === 'gestor' && loginForm.pass === '1234') {
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('Usuário ou senha inválidos.');
    }
  };

  const applyWarning = (supplierId: string) => {
    setSuppliers(prev => prev.map(s => {
      if (s.id === supplierId) {
        const newWarnings = s.warnings + 1;
        const shouldBlock = newWarnings >= 3;
        const newLog: WarningLog = {
          date: new Date().toISOString().split('T')[0],
          reason: 'Penalidade aplicada manualmente pelo gestor via Central.',
          manager: 'Gestor Logado'
        };
        return { 
          ...s, 
          warnings: newWarnings, 
          isBlocked: shouldBlock || s.isBlocked,
          warningLogs: [...(s.warningLogs || []), newLog]
        };
      }
      return s;
    }));
  };

  const resetWarnings = (supplierId: string) => {
    setSuppliers(prev => prev.map(s => 
      s.id === supplierId ? { ...s, warnings: 0, isBlocked: false, warningLogs: [] } : s
    ));
  };

  const handleImport = () => {
    setIsImporting(true);
    setTimeout(() => {
      setIsImporting(false);
      alert('Simulação: 15 novos fornecedores importados via planilha FINDES_SUPPLIERS.csv');
    }, 2000);
  };

  const handleSendResponse = () => {
    if (!responseText || !responseEmail) return;
    setIsSending(true);
    setTimeout(() => {
      setPendingIssues(prev => prev.map(i => i.id === selectedIssue?.id ? { ...i, status: 'Respondido' } : i));
      alert(`Resposta enviada para ${responseEmail} via sistema Paradigma.`);
      setIsSending(false);
      setSelectedIssue(null);
      setResponseText('');
    }, 1500);
  };

  const handlePrintReport = () => {
    window.print();
  };

  const analyzeWithAI = async (supplier: Supplier) => {
    setIsAnalyzing(supplier.id);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analise o risco de compliance deste fornecedor:
        Nome: ${supplier.name}
        Nota: ${supplier.averageScore}
        Ocorrências: ${supplier.occurrences}
        Advertências Atuais: ${supplier.warnings}
        Forneça um parecer curtíssimo (máximo 2 frases) sobre o risco de BLOQUEIO no sistema Paradigma.`,
      });
      setIaAnalysis(prev => ({ ...prev, [supplier.id]: response.text || 'Sem análise disponível.' }));
    } catch (e) {
      setIaAnalysis(prev => ({ ...prev, [supplier.id]: 'Erro ao processar análise preditiva.' }));
    } finally {
      setIsAnalyzing(null);
    }
  };

  const openSupplierDetail = (supplier: Supplier) => {
    setSelectedSupplierDetails(supplier);
    setActiveSubView('dashboard');
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center animate-fadeIn">
        <div className="bg-white p-10 rounded-3xl findes-shadow border border-gray-100 w-full max-w-md">
          <div className="flex flex-col items-center mb-8">
            <div className="p-4 bg-blue-50 text-[#003366] rounded-2xl mb-4">
              <Lock size={32} />
            </div>
            <h2 className="text-2xl font-black text-[#003366] uppercase tracking-tighter">Acesso Restrito</h2>
            <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-widest text-center">Somente Gestores FINDES</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Usuário</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#003366] outline-none text-sm"
                placeholder="Ex: gestor"
                value={loginForm.user}
                onChange={e => setLoginForm({...loginForm, user: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Senha</label>
              <input 
                type="password" 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#003366] outline-none text-sm"
                placeholder="••••••••"
                value={loginForm.pass}
                onChange={e => setLoginForm({...loginForm, pass: e.target.value})}
              />
            </div>
            {loginError && <p className="text-red-500 text-[10px] font-bold uppercase text-center animate-pulse">{loginError}</p>}
            <button 
              type="submit"
              className="w-full bg-[#003366] text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg hover:bg-[#002244] transition-all transform active:scale-95"
            >
              Entrar na Central
            </button>
          </form>
          <p className="mt-6 text-[10px] text-gray-300 text-center uppercase">Dica: gestor / 1234</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn print:m-0 print:p-0">
      {/* Header Gestor - Hidden on Print */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-black text-[#003366] tracking-tighter uppercase">Central do Gestor</h1>
          <p className="text-gray-500 mt-1">Governança, Penalidades e Compliance de Fornecedores.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleImport}
            className="flex items-center gap-2 bg-white text-[#003366] border-2 border-[#003366] px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-gray-50 transition-all shadow-sm"
          >
            <Upload size={16} /> Importar Base
          </button>
          <button onClick={() => setIsLoggedIn(false)} className="px-5 py-2.5 text-gray-400 font-bold text-xs uppercase hover:text-red-600 transition-colors">
            Sair do Painel
          </button>
        </div>
      </div>

      {/* Dashboard Stats - Hidden on Print */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:hidden">
        {[
          { label: 'Total Base', value: metrics.total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Bloqueados', value: metrics.blocked, icon: Ban, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Reclamações Ativas', value: metrics.pendingCount, icon: MessageSquare, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Auditorias Pendentes', value: metrics.lowScore, icon: ShieldAlert, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl findes-shadow border border-gray-100 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
              <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8 print:hidden">
        {/* Gestão de Reclamações Pendentes */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
             <h3 className="font-black text-[#003366] uppercase tracking-tighter flex items-center gap-2">
               <MessageSquare size={20} className="text-orange-500" /> Reclamações Pendentes
             </h3>
             <span className="text-[10px] font-black bg-orange-100 text-orange-600 px-3 py-1 rounded-full uppercase">3 em espera</span>
          </div>

          <div className="grid gap-4">
            {pendingIssues.filter(i => i.status === 'Pendente').map(issue => (
              <div key={issue.id} className="bg-white p-6 rounded-3xl findes-shadow border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:border-[#003366] transition-all">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black bg-gray-100 text-gray-500 px-2 py-0.5 rounded uppercase">{issue.id}</span>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{issue.date}</span>
                  </div>
                  <h4 className="font-black text-[#003366] uppercase text-sm tracking-tight">{issue.supplierName}</h4>
                  <p className="text-xs text-gray-600 font-bold">{issue.type}</p>
                  <p className="text-xs text-gray-400 line-clamp-1 italic">"{issue.description}"</p>
                </div>
                <button 
                  onClick={() => {
                    setSelectedIssue(issue);
                    setResponseEmail(issue.supplierEmail);
                  }}
                  className="bg-[#003366] text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-md hover:bg-[#002244] transition-all flex items-center gap-2"
                >
                  <Eye size={14} /> Analisar & Responder
                </button>
              </div>
            ))}
          </div>

          {/* Monitor de Penalidades */}
          <div className="space-y-4 pt-6">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-[#003366] uppercase tracking-tighter flex items-center gap-2">
                 <ShieldAlert size={20} /> Controle de Penalidades (Paradigma)
              </h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input 
                  type="text" 
                  placeholder="Pesquisar empresa..."
                  className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-full text-xs focus:ring-1 focus:ring-[#003366] outline-none w-48"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="bg-white rounded-3xl findes-shadow border border-gray-100 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase">Fornecedor</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase text-center">Strikes</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase text-center">Status</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredSuppliers.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="p-4">
                        <div 
                          className="flex flex-col cursor-pointer hover:translate-x-1 transition-transform"
                          onClick={() => openSupplierDetail(s)}
                        >
                          <span className="text-sm font-bold text-[#003366] group-hover:underline">{s.name}</span>
                          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">{s.cnpj}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-1.5">
                          {[1, 2, 3].map(i => (
                            <div key={i} className={`w-3 h-3 rounded-full border-2 ${i <= s.warnings ? 'bg-red-500 border-red-600 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 'bg-gray-100 border-gray-200'}`}></div>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`text-[9px] font-black px-3 py-1 rounded-full border tracking-tighter uppercase
                          ${s.isBlocked ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}
                        `}>
                          {s.isBlocked ? 'BLOQUEADO' : 'ATIVO'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => openSupplierDetail(s)} 
                            className="p-2 text-gray-400 hover:text-[#003366] hover:bg-blue-50 rounded-lg transition-all"
                            title="Ver Histórico Completo"
                          >
                            <BarChart3 size={18} />
                          </button>
                          <button onClick={() => applyWarning(s.id)} disabled={s.isBlocked} className={`p-2 rounded-lg transition-all ${s.isBlocked ? 'opacity-10' : 'text-red-600 hover:bg-red-50'}`}>
                            <AlertCircle size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Painel Lateral */}
        <div className="space-y-6">
           <div className="bg-[#003366] p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles size={120} />
              </div>
              <h4 className="font-black text-lg uppercase tracking-tighter mb-2 flex items-center gap-2">
                <Sparkles size={20} className="text-blue-300" /> Risco Preditivo (IA)
              </h4>
              <p className="text-xs text-blue-100 leading-relaxed mb-6">Analise comportamentos recorrentes e antecipe falhas críticas de fornecimento.</p>
              <div className="space-y-3">
                 {suppliers.slice(0, 3).map(s => (
                   <div key={s.id} className="bg-white/10 p-4 rounded-2xl border border-white/10 hover:bg-white/20 transition-all group">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold uppercase truncate max-w-[140px]">{s.name}</span>
                        <button onClick={() => analyzeWithAI(s)} disabled={isAnalyzing === s.id} className="bg-blue-400 text-[#003366] p-1.5 rounded-lg hover:bg-white transition-all">
                          {isAnalyzing === s.id ? <div className="w-3 h-3 border-2 border-[#003366] border-t-transparent animate-spin rounded-full"></div> : <TrendingUp size={14} />}
                        </button>
                      </div>
                      {iaAnalysis[s.id] ? <p className="text-[10px] text-blue-100 italic leading-snug">"{iaAnalysis[s.id]}"</p> : <div className="w-full h-1 bg-white/20 rounded-full mt-2"></div>}
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-white p-8 rounded-3xl findes-shadow border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center">
              <div className="p-4 bg-gray-50 rounded-full text-gray-400 mb-4">
                <Database size={32} />
              </div>
              <h5 className="font-bold text-[#003366] text-sm uppercase">Carga em Lote</h5>
              <p className="text-[10px] text-gray-400 mt-1 mb-6 leading-relaxed">Arraste seu .CSV ou .XLSX aqui <br/> para atualizar a base Paradigma.</p>
              <button onClick={handleImport} className={`w-full text-[10px] font-black bg-gray-100 text-gray-600 px-6 py-4 rounded-xl hover:bg-[#003366] hover:text-white transition-all ${isImporting ? 'animate-pulse' : ''}`}>
                {isImporting ? 'PROCESSANDO...' : 'IMPORTAR FORNECEDORES'}
              </button>
           </div>
        </div>
      </div>

      {/* MODAL: DETALHES DO FORNECEDOR */}
      {selectedSupplierDetails && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 print:p-0 print:static print:z-0">
          <div className="absolute inset-0 bg-[#003366]/60 backdrop-blur-md print:hidden" onClick={() => setSelectedSupplierDetails(null)} />
          <div className="relative w-full max-w-4xl bg-white rounded-[40px] overflow-hidden shadow-2xl animate-scaleIn flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:rounded-none print:w-full">
            
            {/* Modal Header */}
            <div className="p-8 border-b border-gray-100 bg-gray-50 flex justify-between items-center print:bg-white">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl ${selectedSupplierDetails.isBlocked ? 'bg-red-600 text-white' : 'bg-[#003366] text-white'}`}>
                   {selectedSupplierDetails.isBlocked ? <Ban size={32} /> : <ShieldAlert size={32} />}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-[#003366] uppercase tracking-tighter">{selectedSupplierDetails.name}</h2>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{selectedSupplierDetails.cnpj}</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border tracking-tighter uppercase
                      ${selectedSupplierDetails.isBlocked ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-600 border-green-200'}
                    `}>
                      {selectedSupplierDetails.isBlocked ? 'STATUS: BLOQUEADO NO PARADIGMA' : 'STATUS: REGULAR NO PARADIGMA'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 print:hidden">
                {activeSubView !== 'dashboard' && (
                  <button 
                    onClick={() => setActiveSubView('dashboard')}
                    className="p-3 bg-white border border-gray-200 text-gray-600 rounded-2xl hover:bg-gray-100 transition-all flex items-center gap-2 font-bold text-xs uppercase"
                  >
                    <ChevronLeft size={18} /> Voltar ao Painel
                  </button>
                )}
                <button 
                  onClick={handlePrintReport}
                  className="p-3 bg-white border border-gray-200 text-gray-600 rounded-2xl hover:bg-gray-100 transition-all flex items-center gap-2 font-bold text-xs uppercase"
                >
                  <Printer size={18} /> Imprimir Relatório
                </button>
                <button onClick={() => setSelectedSupplierDetails(null)} className="p-3 hover:bg-gray-200 rounded-full text-gray-400">
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-hide print:overflow-visible print:p-0">
              
              {activeSubView === 'dashboard' && (
                <div className="space-y-10 animate-fadeIn">
                  {/* Individual Dashboard Section */}
                  <section className="grid md:grid-cols-3 gap-6">
                    {/* Rating Card */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 findes-shadow text-center">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Média de Performance</span>
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Star size={32} fill="#FACC15" className="text-yellow-400" />
                          <span className="text-4xl font-black text-[#003366]">{selectedSupplierDetails.averageScore.toFixed(1)}</span>
                        </div>
                        <p className="text-[10px] font-bold text-gray-400">Com base em {selectedSupplierDetails.volume} pedidos</p>
                    </div>

                    {/* Strikes Card - CLICKABLE */}
                    <button 
                      onClick={() => setActiveSubView('penalties')}
                      className="bg-white p-6 rounded-3xl border border-gray-100 findes-shadow hover:border-[#003366] transition-all text-left group"
                    >
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 block text-center">Histórico de Penalidades</span>
                        <div className="flex justify-center gap-3 mb-4">
                          {[1, 2, 3].map(i => (
                            <div key={i} className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center ${i <= selectedSupplierDetails.warnings ? 'bg-red-500 border-red-600 text-white shadow-lg' : 'bg-gray-50 border-gray-200 text-gray-300'}`}>
                              {i <= selectedSupplierDetails.warnings ? <AlertTriangle size={24} /> : <CheckCircle2 size={24} />}
                            </div>
                          ))}
                        </div>
                        <p className={`text-[10px] font-black text-center uppercase tracking-widest flex items-center justify-center gap-1 ${selectedSupplierDetails.warnings >= 3 ? 'text-red-600' : 'text-gray-400'}`}>
                          {selectedSupplierDetails.warnings} de 3 Strikes Aplicados
                          <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                        </p>
                    </button>

                    {/* Volume Card - CLICKABLE */}
                    <button 
                      onClick={() => setActiveSubView('occurrences')}
                      className="bg-white p-6 rounded-3xl border border-gray-100 findes-shadow flex flex-col justify-center items-center hover:border-[#003366] transition-all group"
                    >
                        <TrendingUp size={32} className="text-blue-500 mb-2" />
                        <span className="text-2xl font-black text-[#003366]">{selectedSupplierDetails.occurrences}</span>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                          Ocorrências Totais
                          <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                    </button>
                  </section>

                  {/* Detalhamento de Critérios */}
                  <section className="bg-[#003366] p-8 rounded-[40px] text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                      <BarChart3 size={200} />
                    </div>
                    <h3 className="font-black uppercase tracking-tighter mb-8 flex items-center gap-2">
                      <BarChart3 size={20} className="text-blue-300" /> Detalhamento de Performance
                    </h3>
                    <div className="grid md:grid-cols-3 gap-10">
                      {[
                        { label: 'Qualidade Técnica', value: selectedSupplierDetails.criteria.quality, color: 'bg-green-400' },
                        { label: 'Pontualidade Entrega', value: selectedSupplierDetails.criteria.delivery, color: 'bg-yellow-400' },
                        { label: 'Suporte Pós-Venda', value: selectedSupplierDetails.criteria.support, color: 'bg-blue-400' },
                      ].map((c, idx) => (
                        <div key={idx} className="space-y-4">
                            <div className="flex justify-between items-end">
                              <span className="text-[10px] font-black uppercase tracking-widest text-blue-100">{c.label}</span>
                              <span className="text-xl font-black">{c.value.toFixed(1)}/5.0</span>
                            </div>
                            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                              <div className={`h-full ${c.color} rounded-full transition-all duration-1000`} style={{ width: `${(c.value/5)*100}%` }}></div>
                            </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              )}

              {/* VIEW: HISTÓRICO DE PENALIDADES (STRIKES) */}
              {activeSubView === 'penalties' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                    <button onClick={() => setActiveSubView('dashboard')} className="p-2 hover:bg-gray-100 rounded-full text-[#003366]">
                      <ChevronLeft size={20} />
                    </button>
                    <h3 className="font-black text-[#003366] uppercase tracking-tighter text-xl">Motivo das Advertências Aplicadas</h3>
                  </div>

                  <div className="space-y-4">
                    {selectedSupplierDetails.warningLogs && selectedSupplierDetails.warningLogs.length > 0 ? (
                      selectedSupplierDetails.warningLogs.map((log, idx) => (
                        <div key={idx} className="bg-red-50/50 border border-red-100 p-6 rounded-[32px] flex gap-5 items-start">
                          <div className="bg-red-500 text-white p-4 rounded-2xl shadow-md">
                            <span className="font-black text-lg">#{idx + 1}</span>
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1 text-[10px] font-black text-gray-400 uppercase">
                                  <Calendar size={12} /> {log.date}
                                </span>
                                <span className="flex items-center gap-1 text-[10px] font-black text-gray-400 uppercase">
                                  <User size={12} /> {log.manager}
                                </span>
                              </div>
                              <span className="text-[9px] font-black bg-red-100 text-red-600 px-3 py-1 rounded-full uppercase">Advertência Formal</span>
                            </div>
                            <p className="text-sm font-bold text-gray-700 leading-relaxed italic">"{log.reason}"</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-20 bg-gray-50 rounded-[40px] border border-dashed border-gray-200">
                        <CheckCircle2 size={48} className="mx-auto text-green-500 mb-4" />
                        <p className="font-bold text-gray-400 uppercase text-xs">Nenhum strike registrado até o momento.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* VIEW: OCORRÊNCIAS TOTAIS */}
              {activeSubView === 'occurrences' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                    <button onClick={() => setActiveSubView('dashboard')} className="p-2 hover:bg-gray-100 rounded-full text-[#003366]">
                      <ChevronLeft size={20} />
                    </button>
                    <h3 className="font-black text-[#003366] uppercase tracking-tighter text-xl">Relatório de Ocorrências e Reclamações</h3>
                  </div>

                  <div className="space-y-4">
                    {MOCK_ISSUES.map(issue => (
                      <div key={issue.id} className="p-8 bg-white rounded-[40px] findes-shadow border border-gray-100 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center group">
                          <div className="flex items-center gap-5">
                            <div className="p-4 bg-gray-50 rounded-2xl text-gray-400 group-hover:bg-[#003366] group-hover:text-white transition-all">
                              <FileDown size={24} />
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{issue.date}</span>
                                  <span className="text-[9px] font-black bg-gray-100 text-gray-500 px-2 py-0.5 rounded border border-gray-200 uppercase">{issue.ocId}</span>
                                </div>
                                <h4 className="font-black text-[#003366] text-base uppercase">{issue.type}</h4>
                                <p className="text-sm text-gray-500 italic mt-1 leading-relaxed">"{issue.description}"</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`text-[10px] font-black px-4 py-1.5 rounded-full border uppercase tracking-widest
                              ${issue.status === 'Fechado' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-orange-50 text-orange-600 border-orange-200'}
                            `}>{issue.status}</span>
                            <button className="p-2 text-gray-300 hover:text-[#003366]"><ChevronRight size={20}/></button>
                          </div>
                      </div>
                    ))}
                    {MOCK_ISSUES.length === 0 && (
                      <div className="text-center py-20 bg-gray-50 rounded-[40px] border border-dashed border-gray-200">
                        <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="font-bold text-gray-400 uppercase text-xs">Nenhuma ocorrência registrada para este fornecedor.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* AI Prediction in Detail (Only on main dashboard) */}
              {activeSubView === 'dashboard' && (
                <section className="bg-purple-50 p-8 rounded-[40px] border border-purple-100 flex items-start gap-6">
                   <div className="p-4 bg-white text-purple-600 rounded-3xl shadow-sm">
                     <Sparkles size={24} />
                   </div>
                   <div className="flex-1">
                      <h4 className="text-purple-900 font-black uppercase text-sm tracking-tighter">Parecer Preditivo do Sistema</h4>
                      <p className="text-xs text-purple-800/70 mt-1 leading-relaxed italic">
                        {iaAnalysis[selectedSupplierDetails.id] || "Clique em 'Análise Preditiva' no menu principal para gerar um parecer estratégico sobre este fornecedor."}
                      </p>
                   </div>
                </section>
              )}
            </div>

            {/* Footer Detail */}
            <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-between gap-4 print:hidden">
               <button onClick={() => setSelectedSupplierDetails(null)} className="px-8 py-4 text-gray-400 font-black uppercase text-xs tracking-widest hover:text-gray-600">Fechar Janela</button>
               <div className="flex gap-3">
                 <button 
                  onClick={handlePrintReport}
                  className="bg-white text-[#003366] border-2 border-[#003366] px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-100 transition-all flex items-center gap-2"
                 >
                   <Printer size={16} /> Imprimir Relatório PDF
                 </button>
                 <button 
                  className="bg-[#003366] text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg hover:bg-[#002244] transition-all flex items-center gap-2"
                 >
                   <Download size={16} /> Exportar Dados XLS
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: RESPOSTA DE RECLAMAÇÃO */}
      {selectedIssue && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 print:hidden">
          <div className="absolute inset-0 bg-[#003366]/60 backdrop-blur-md" onClick={() => setSelectedIssue(null)} />
          <div className="relative w-full max-w-2xl bg-white rounded-[40px] overflow-hidden shadow-2xl animate-scaleIn flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <div>
                <h3 className="font-black text-[#003366] uppercase tracking-tighter flex items-center gap-2 text-xl">
                  <AlertTriangle size={24} className="text-orange-500" /> Analisar Reclamação {selectedIssue.id}
                </h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Gestão de Conflitos FINDES</p>
              </div>
              <button onClick={() => setSelectedIssue(null)} className="p-2 hover:bg-gray-200 rounded-full text-gray-400">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100">
                  <span className="text-[10px] font-black text-gray-400 uppercase block mb-1">Fornecedor</span>
                  <p className="text-sm font-black text-[#003366] uppercase tracking-tight">{selectedIssue.supplierName}</p>
                </div>
                <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100">
                  <span className="text-[10px] font-black text-gray-400 uppercase block mb-1">Tipo de Falha</span>
                  <p className="text-sm font-black text-orange-600 uppercase tracking-tight">{selectedIssue.type}</p>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-black text-gray-400 uppercase block mb-2">Relato do Usuário</span>
                <div className="p-6 bg-blue-50/50 border border-blue-50 rounded-3xl">
                  <p className="text-sm text-gray-700 italic leading-relaxed">"{selectedIssue.description}"</p>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <div className="relative">
                  <label className="text-[10px] font-black text-[#003366] uppercase mb-2 block ml-1">E-mail de Notificação (Fornecedor)</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="email" 
                      className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#003366] outline-none text-sm font-bold text-[#003366]"
                      value={responseEmail}
                      onChange={e => setResponseEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-[#003366] uppercase mb-2 block ml-1">Parecer do Gestor / Advertência Oficial</label>
                  <textarea 
                    className="w-full p-6 bg-gray-50 border border-gray-200 rounded-3xl focus:ring-2 focus:ring-[#003366] outline-none text-sm min-h-[150px]"
                    placeholder="Escreva aqui a resposta que será enviada para o fornecedor..."
                    value={responseText}
                    onChange={e => setResponseText(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-between gap-4">
               <button onClick={() => setSelectedIssue(null)} className="px-8 py-4 text-gray-400 font-black uppercase text-xs tracking-widest hover:text-gray-600">Cancelar</button>
               <button 
                onClick={handleSendResponse}
                disabled={!responseText || isSending}
                className="flex-1 bg-[#003366] text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg hover:bg-[#002244] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
               >
                 {isSending ? (
                   <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                 ) : (
                   <><Send size={16} /> Enviar Advertência</>
                 )}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagementScreen;
