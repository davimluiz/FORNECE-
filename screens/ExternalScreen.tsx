
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Globe, ShieldCheck, TrendingUp, AlertCircle, FileText, CheckCircle2, Info, ArrowUpRight, BarChart3, Clock, MessageCircle, Star, ExternalLink, ShieldAlert, Building2, ChevronRight, Sparkles } from 'lucide-react';
import { MOCK_SUPPLIERS } from '../constants';
import { Supplier } from '../types';

const ExternalScreen: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [sources, setSources] = useState<{title: string, uri: string}[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);

  // Fecha sugestões ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtra sugestões da base interna (Ranking Geral)
  const suggestions = useMemo(() => {
    const lowerQuery = query.toLowerCase().trim();
    if (!lowerQuery) return MOCK_SUPPLIERS.slice(0, 5);
    
    return MOCK_SUPPLIERS.filter(s => 
      s.name.toLowerCase().includes(lowerQuery) || 
      s.cnpj.replace(/\D/g, '').includes(lowerQuery.replace(/\D/g, ''))
    ).slice(0, 8);
  }, [query]);

  // Função para gerar o dossiê simulado (Simulação de IA Local)
  const generateSimulatedDossier = (companyName: string, cnpj: string, internalData?: Supplier) => {
    const isGood = internalData ? internalData.averageScore >= 3.5 : Math.random() > 0.3;
    const riskLevel = isGood ? "BAIXO RISCO" : "RISCO MODERADO";
    const riskColor = isGood ? "🟢" : "🟡";
    
    return `
# 🛡️ DOSSIÊ DE AUDITORIA: ${companyName.toUpperCase()}
**CNPJ:** ${cnpj}
**DATA DA CONSULTA:** ${new Date().toLocaleDateString('pt-BR')}

---

### 1. 📊 REPUTAÇÃO NO RECLAME AQUI
*   **STATUS:** ${isGood ? "Ótimo (RA1000)" : "Bom"}
*   **NOTA MÉDIA:** ${isGood ? "8.9/10" : "7.2/10"}
*   **ÍNDICE DE SOLUÇÃO:** ${isGood ? "94.5%" : "82.1%"}
*   **PRINCIPAIS QUEIXAS:** ${isGood ? "Dúvidas sobre faturamento pontuais." : "Atrasos logísticos em períodos de alta demanda."}

### 2. ⭐ GOOGLE REVIEWS & MAPS
*   **AVALIAÇÃO GERAL:** ${isGood ? "4.7 estrelas (150+ avaliações)" : "3.9 estrelas (80 avaliações)"}
*   **SENTIMENTO:** ${isGood ? "Majoritariamente positivo, destacando pontualidade." : "Misto, com reclamações sobre tempo de resposta no suporte."}

### 3. 🛡️ TRUSTPILOT (CONFIDENCIALIDADE)
*   **TRUSTSCORE:** ${isGood ? "4.5/5.0" : "3.1/5.0"}
*   **PERFIL:** Verificado e ativo na plataforma há mais de 24 meses.

### 4. ⚖️ PROCON & DADOS JURÍDICOS (públicos)
*   **SITUAÇÃO SINDEC:** ${isGood ? "Nenhuma reclamação fundamentada ativa." : "2 processos administrativos encerrados com acordo."}
*   **RISCO JURÍDICO:** ${isGood ? "Inexistente" : "Baixo impacto"}

### 5. 🏢 DADOS CADASTRAIS (RFB)
*   **SITUAÇÃO:** ATIVA
*   **CAPITAL SOCIAL:** R$ ${isGood ? "2.500.000,00" : "500.000,00"}
*   **TEMPO DE MERCADO:** ${isGood ? "12 anos" : "4 anos"}

---

### 🏁 VEREDITO DE COMPLIANCE (FINDES)
**RISCO ESTIMADO:** ${riskColor} **${riskLevel}**

**RECOMENDAÇÃO:** ${isGood 
  ? "Empresa com excelente saúde reputacional externa. Liberação recomendada para contratos críticos." 
  : "Fornecedor viável, porém recomenda-se cláusulas mais rígidas de SLA de entrega e suporte técnico."}
    `;
  };

  const handleSearch = (searchQuery: string = query) => {
    const finalQuery = searchQuery.trim();
    if (!finalQuery) return;
    
    setQuery(finalQuery);
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    setSources([]);
    setShowSuggestions(false);

    // Identifica se é uma empresa interna ou gera dados para nova empresa
    const internalMatch = MOCK_SUPPLIERS.find(s => 
      s.name.toLowerCase().includes(finalQuery.toLowerCase()) || 
      s.cnpj.includes(finalQuery)
    );

    // Simula tempo de processamento da "IA"
    setTimeout(() => {
      const companyName = internalMatch ? internalMatch.name : finalQuery;
      const cnpj = internalMatch ? internalMatch.cnpj : "00.000.000/0001-00 (Simulado)";
      
      const simulatedResult = generateSimulatedDossier(companyName, cnpj, internalMatch);
      
      setAnalysis(simulatedResult);
      
      // Fontes simuladas
      setSources([
        { title: `Reclame Aqui - ${companyName}`, uri: "#" },
        { title: `Google Reviews Business - ${companyName}`, uri: "#" },
        { title: `Consulta Pública PROCON`, uri: "#" },
        { title: `Transparência FINDES Internal`, uri: "#" }
      ]);
      
      setIsLoading(false);
    }, 2000); // 2 segundos de loading para simular a IA
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-[#003366] uppercase tracking-tighter">Consulta Externa Pro</h1>
        <p className="text-gray-500 mt-2">Investigação de mercado simulada via Inteligência de Dados (Local/Offline Mode).</p>
      </div>

      {/* Container de Busca */}
      <div className="bg-white p-8 rounded-3xl findes-shadow border border-gray-100 relative" ref={searchRef}>
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full relative">
            <label className="block text-[10px] font-black text-[#003366] mb-2 uppercase tracking-widest ml-1">
              Empresa da Base ou Novo CNPJ
            </label>
            <div className="relative">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text"
                placeholder="Pesquise por nome da empresa ou CNPJ..."
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#003366] outline-none text-sm font-bold text-[#003366]"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            {/* Dropdown de Sugestões */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-[100] top-full left-0 right-0 mt-2 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-fadeIn max-h-[400px] overflow-y-auto">
                <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Base Interna do Ranking</span>
                  <span className="text-[10px] font-bold text-[#003366] bg-blue-50 px-2 py-0.5 rounded">AUTO-COMPLETAR</span>
                </div>
                {suggestions.map(s => (
                  <button 
                    key={s.id}
                    onClick={() => handleSearch(s.name)}
                    className="w-full p-5 flex items-center justify-between hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0 group text-left"
                  >
                    <div>
                      <p className="text-sm font-black text-[#003366] uppercase group-hover:translate-x-1 transition-transform">{s.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold">{s.cnpj}</p>
                    </div>
                    <ChevronRight size={18} className="text-gray-300 group-hover:text-[#003366] group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <button 
            onClick={() => handleSearch()}
            disabled={isLoading}
            className="bg-[#003366] text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#002244] transition-all h-[58px] shadow-lg flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin rounded-full"></div> : <Search size={18} />}
            {isLoading ? 'Analizando...' : 'Gerar Dossiê'}
          </button>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap items-center gap-3">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">Integração Simulada:</span>
          {['Google Reviews', 'Reclame Aqui', 'Trustpilot', 'Procon Público', 'Receita Federal'].map((label, i) => (
            <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-100 text-[9px] font-black uppercase text-gray-400">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
              {label}
            </div>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="py-24 flex flex-col items-center animate-pulse">
          <div className="relative mb-6">
            <Globe size={64} className="text-[#003366]/20 animate-spin duration-[3000ms]" />
            <Search size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#003366]" />
          </div>
          <p className="text-[#003366] font-black uppercase tracking-[0.2em] text-[10px]">Consolidando informações de mercado via motor de IA local...</p>
        </div>
      )}

      {analysis && !isLoading && (
        <div className="space-y-8 animate-slideUp">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-10 rounded-[40px] findes-shadow border border-gray-100">
              <div className="flex justify-between items-center mb-10 pb-6 border-b border-gray-100">
                <div>
                  <h3 className="font-black text-[#003366] uppercase tracking-tighter text-xl flex items-center gap-3">
                    <ShieldCheck size={28} className="text-blue-600" /> Dossiê de Auditoria Preditiva
                  </h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Auditado: {query}</p>
                </div>
                <div className="px-3 py-1 bg-[#003366] text-white rounded-full text-[9px] font-black uppercase tracking-widest">
                  Processamento Local
                </div>
              </div>
              
              <div className="prose prose-blue max-w-none text-gray-700 leading-relaxed text-sm">
                <div className="whitespace-pre-wrap font-medium font-sans bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                  {analysis}
                </div>
              </div>

              <div className="mt-12 flex flex-col sm:flex-row gap-4 border-t border-gray-100 pt-8">
                 <button onClick={() => window.print()} className="flex-1 px-8 py-4 bg-[#003366] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg flex items-center justify-center gap-3 hover:bg-[#002244] transition-all">
                    <FileText size={18} /> Exportar Dossiê PDF
                 </button>
                 <button className="flex-1 px-8 py-4 bg-white border-2 border-[#003366] text-[#003366] rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-gray-50 transition-all">
                    <Star size={18} /> Arquivar Consulta
                 </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-8 rounded-[40px] findes-shadow border border-gray-100">
                <h3 className="font-black text-[#003366] uppercase tracking-tighter text-lg mb-8 flex items-center gap-3">
                  <ExternalLink size={20} className="text-blue-500" /> Referências Simuladas
                </h3>
                <div className="space-y-4">
                  {sources.map((source, i) => (
                    <div key={i} className="flex flex-col p-5 bg-gray-50 rounded-3xl border border-gray-100 hover:border-[#003366] hover:bg-blue-50 transition-all group relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-20 transition-opacity">
                         <Globe size={48} />
                      </div>
                      <span className="text-[9px] font-black text-gray-400 uppercase mb-2 tracking-widest truncate pr-8">{source.title}</span>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-[#003366]">Link Indisponível (Demo)</span>
                        <ArrowUpRight size={16} className="text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#003366] p-8 rounded-[40px] text-white shadow-xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-6 opacity-10">
                   <Sparkles size={100} />
                 </div>
                 <div className="flex items-center gap-3 mb-4">
                    <ShieldCheck size={24} className="text-blue-300" />
                    <h4 className="font-black uppercase text-sm tracking-widest">Compliance FINDES</h4>
                 </div>
                 <p className="text-[10px] text-blue-100 leading-relaxed font-medium relative z-10">
                   Este dossiê é gerado localmente pelo motor de simulação FORNECE+. Ideal para validação de fluxos de trabalho e apresentações de governança preventiva.
                 </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {!analysis && !isLoading && !error && (
        <div className="flex flex-col items-center justify-center py-24 text-gray-300 group">
          <div className="relative mb-8 transition-transform group-hover:scale-110 duration-500">
            <BarChart3 size={120} strokeWidth={1} className="text-gray-200" />
            <div className="absolute -bottom-4 -right-4 bg-white p-4 rounded-full shadow-lg border border-gray-50 text-[#003366]">
              <Search size={32} />
            </div>
          </div>
          <div className="text-center max-w-sm px-4">
            <p className="font-black uppercase tracking-[0.3em] text-gray-400 text-xs leading-loose">
              Selecione uma empresa do ranking ou digite um CNPJ para gerar um relatório de mercado simulado.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExternalScreen;
