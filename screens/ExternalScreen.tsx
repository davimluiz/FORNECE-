
import React, { useState, useMemo, useEffect } from 'react';
import { Search, Globe, ShieldCheck, TrendingUp, AlertCircle, FileText, CheckCircle2, Info, ArrowUpRight, BarChart3, Clock, MessageCircle, Star, ExternalLink, ShieldAlert, Building2, ChevronRight } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { MOCK_SUPPLIERS } from '../constants';
import { Supplier } from '../types';

const ExternalScreen: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [sources, setSources] = useState<{title: string, uri: string}[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Filter suggestions based on internal MOCK_SUPPLIERS
  const suggestions = useMemo(() => {
    if (!query || query.length < 2) return [];
    const lowerQuery = query.toLowerCase();
    return MOCK_SUPPLIERS.filter(s => 
      s.name.toLowerCase().includes(lowerQuery) || 
      s.cnpj.includes(query)
    ).slice(0, 5);
  }, [query]);

  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery) return;
    setQuery(searchQuery);
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    setSources([]);
    setShowSuggestions(false);

    // Check if it's an internal supplier to provide context to AI
    const internalMatch = MOCK_SUPPLIERS.find(s => 
      s.name.toLowerCase() === searchQuery.toLowerCase() || 
      s.cnpj === searchQuery
    );

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      const prompt = internalMatch 
        ? `Realize uma auditoria de reputação EXTERNA simulada para a empresa "${internalMatch.name}" (CNPJ: ${internalMatch.cnpj}). 
           Considere que esta empresa já é nossa parceira mas precisamos de um dossiê de mercado.
           Gere dados fictícios mas realistas e fundamentados para as seguintes bases:
           1. RECLAME AQUI: Índice de solução e principais motivos de queixas.
           2. GOOGLE REVIEWS: Tom predominante dos comentários recentes.
           3. TRUSTPILOT: Score de confiança.
           4. PROCON: Histórico de reclamações fundamentadas.
           5. DADOS PÚBLICOS: Capital social e situação cadastral.
           6. PARECER FINAL: Risco de compliance (Baixo, Médio ou Alto).
           Apresente um relatório Markdown profissional.`
        : `Realize uma investigação profunda e consolidada sobre a empresa ou CNPJ "${searchQuery}". Sua pesquisa deve abranger e citar dados de fontes reais via Google Search:
           1. RECLAME AQUI: Reputação e nota.
           2. GOOGLE REVIEWS: Sentimento geral.
           3. TRUSTPILOT: Confiança global.
           4. PROCON: Reclamações públicas.
           5. DADOS CADASTRAIS: CNPJ e tempo de mercado.
           6. VEREDITO: Risco para a FINDES.
           Responda em Português (Brasil) com formatação Markdown profissional.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text;
      setAnalysis(text || "Não foi possível consolidar uma análise detalhada.");

      // Extração de fontes
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const extractedSources = chunks
        .filter((chunk: any) => chunk.web)
        .map((chunk: any) => ({
          title: chunk.web.title,
          uri: chunk.web.uri
        }));
      
      // Remove duplicates
      const uniqueSources = Array.from(new Set(extractedSources.map(s => s.uri)))
        .map(uri => extractedSources.find(s => s.uri === uri)!);
      
      setSources(uniqueSources);

    } catch (err: any) {
      console.error("Erro na busca:", err);
      setError("Ocorreu um erro ao processar a auditoria. Verifique sua conexão ou tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const selectSuggestion = (s: Supplier) => {
    setQuery(s.name);
    handleSearch(s.name);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-[#003366] uppercase tracking-tighter">Consulta Externa Pro</h1>
        <p className="text-gray-500 mt-2">Investigação de reputação em múltiplas bases de dados e auditoria preditiva.</p>
      </div>

      {/* Input de Busca com Sugestões */}
      <div className="bg-white p-8 rounded-3xl findes-shadow border border-gray-100 relative">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full relative">
            <label className="block text-[10px] font-black text-[#003366] mb-2 uppercase tracking-widest ml-1">CNPJ ou Razão Social para Auditoria</label>
            <div className="relative">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text"
                placeholder="Pesquise por nome da empresa interna ou CNPJ..."
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

            {/* Sugestões Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-fadeIn">
                <div className="p-3 bg-gray-50 border-b border-gray-100">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Empresas na Base Interna</span>
                </div>
                {suggestions.map(s => (
                  <button 
                    key={s.id}
                    onClick={() => selectSuggestion(s)}
                    className="w-full p-4 flex items-center justify-between hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0 group"
                  >
                    <div className="text-left">
                      <p className="text-sm font-black text-[#003366] uppercase">{s.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold">{s.cnpj}</p>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 group-hover:text-[#003366] group-hover:translate-x-1 transition-all" />
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
            {isLoading ? 'Auditando...' : 'Iniciar Auditoria'}
          </button>
        </div>
        
        {/* Indicadores de Fontes */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap items-center gap-3">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">Integrações de Dados:</span>
          {[
            { label: 'Reclame Aqui', color: 'bg-red-50 text-red-600 border-red-100' },
            { label: 'Google Reviews', color: 'bg-blue-50 text-blue-600 border-blue-100' },
            { label: 'Trustpilot', color: 'bg-green-50 text-green-600 border-green-100' },
            { label: 'Procon Digital', color: 'bg-orange-50 text-orange-600 border-orange-100' },
            { label: 'Receita Federal', color: 'bg-purple-50 text-purple-600 border-purple-100' },
          ].map((src, i) => (
            <div key={i} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase ${src.color}`}>
              <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
              {src.label}
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
          <p className="text-[#003366] font-black uppercase tracking-[0.2em] text-[10px]">Varrendo bases de mercado e consolidando dossiê...</p>
        </div>
      )}

      {error && (
        <div className="p-8 bg-red-50 border border-red-100 rounded-[32px] flex items-center gap-6 text-red-600 animate-fadeIn">
          <div className="p-4 bg-white rounded-2xl shadow-sm">
            <ShieldAlert size={32} />
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-tight">{error}</p>
            <p className="text-[10px] mt-1 font-bold opacity-70 uppercase tracking-widest">Tente usar o CNPJ completo da empresa para melhores resultados.</p>
          </div>
        </div>
      )}

      {analysis && !isLoading && (
        <div className="space-y-8 animate-slideUp">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-10 rounded-[40px] findes-shadow border border-gray-100">
              <div className="flex justify-between items-center mb-10 pb-6 border-b border-gray-100">
                <div>
                  <h3 className="font-black text-[#003366] uppercase tracking-tighter text-xl flex items-center gap-3">
                    <ShieldCheck size={28} className="text-green-600" /> Dossiê de Inteligência Reputacional
                  </h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Gerado para: {query}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-2xl text-[#003366]">
                  <Building2 size={24} />
                </div>
              </div>
              
              <div className="prose prose-blue max-w-none text-gray-700 leading-relaxed text-sm">
                <div className="whitespace-pre-wrap font-medium font-sans">
                  {analysis}
                </div>
              </div>

              <div className="mt-12 flex flex-col sm:flex-row gap-4 border-t border-gray-100 pt-8">
                 <button 
                   onClick={() => window.print()}
                   className="flex-1 px-8 py-4 bg-[#003366] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg flex items-center justify-center gap-3 hover:bg-[#002244] transition-all"
                 >
                    <FileText size={18} /> Exportar Auditoria PDF
                 </button>
                 <button 
                   className="flex-1 px-8 py-4 bg-white border-2 border-[#003366] text-[#003366] rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-gray-50 transition-all"
                 >
                    <Star size={18} /> Salvar nos Favoritos
                 </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-8 rounded-[40px] findes-shadow border border-gray-100">
                <h3 className="font-black text-[#003366] uppercase tracking-tighter text-lg mb-8 flex items-center gap-3">
                  <ExternalLink size={20} className="text-blue-500" /> Referências de Mercado
                </h3>
                <div className="space-y-4">
                  {sources.length > 0 ? sources.map((source, i) => (
                    <a 
                      key={i} 
                      href={source.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex flex-col p-5 bg-gray-50 rounded-3xl border border-gray-100 hover:border-[#003366] hover:bg-blue-50 transition-all group relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-20 transition-opacity">
                         <Globe size={48} />
                      </div>
                      <span className="text-[9px] font-black text-gray-400 uppercase mb-2 tracking-widest truncate pr-8">{source.title}</span>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-[#003366]">Verificar Registro</span>
                        <ArrowUpRight size={16} className="text-gray-400 group-hover:text-[#003366] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                      </div>
                    </a>
                  )) : (
                    <div className="p-10 text-center border-2 border-dashed border-gray-100 rounded-3xl">
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-relaxed">Dossiê baseado em <br/> simulação de auditoria <br/> para dados internos.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-[#003366] p-8 rounded-[40px] text-white shadow-xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-6 opacity-10">
                   <ShieldCheck size={100} />
                 </div>
                 <div className="flex items-center gap-3 mb-4">
                    <ShieldCheck size={24} className="text-blue-300" />
                    <h4 className="font-black uppercase text-sm tracking-widest">Compliance FINDES</h4>
                 </div>
                 <p className="text-[10px] text-blue-100 leading-relaxed font-medium relative z-10">
                   Esta consulta utiliza inteligência artificial para cruzar dados de reputação. O veredito é uma sugestão de risco e não substitui a análise jurídica formal da gerência de suprimentos.
                 </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!analysis && !isLoading && !error && (
        <div className="flex flex-col items-center justify-center py-24 text-gray-300 group">
          <div className="relative mb-8 transition-transform group-hover:scale-110 duration-500">
            <BarChart3 size={120} strokeWidth={1} className="text-gray-200" />
            <div className="absolute -bottom-4 -right-4 bg-white p-4 rounded-full shadow-lg border border-gray-50 text-[#003366]">
              <Search size={32} />
            </div>
          </div>
          <div className="text-center max-w-sm">
            <p className="font-black uppercase tracking-[0.3em] text-gray-400 text-xs leading-loose">
              Pesquise qualquer empresa da base FINDES para uma auditoria completa de mercado.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2 opacity-50">
               {MOCK_SUPPLIERS.slice(0, 3).map(s => (
                 <button 
                  key={s.id} 
                  onClick={() => { setQuery(s.name); setShowSuggestions(true); }}
                  className="text-[9px] font-black border border-gray-200 px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors uppercase"
                 >
                   {s.name}
                 </button>
               ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExternalScreen;
