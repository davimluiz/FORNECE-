
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Globe, ShieldCheck, TrendingUp, AlertCircle, FileText, CheckCircle2, Info, ArrowUpRight, BarChart3, Clock, MessageCircle, Star, ExternalLink, ShieldAlert, Building2, ChevronRight, Sparkles } from 'lucide-react';
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
  const [isSimulated, setIsSimulated] = useState(false);
  
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
    if (!lowerQuery) return MOCK_SUPPLIERS.slice(0, 5); // Mostra as 5 primeiras quando vazio
    
    return MOCK_SUPPLIERS.filter(s => 
      s.name.toLowerCase().includes(lowerQuery) || 
      s.cnpj.replace(/\D/g, '').includes(lowerQuery.replace(/\D/g, ''))
    ).slice(0, 8);
  }, [query]);

  const handleSearch = async (searchQuery: string = query) => {
    const finalQuery = searchQuery.trim();
    if (!finalQuery) return;
    
    setQuery(finalQuery);
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    setSources([]);
    setShowSuggestions(false);

    // Identifica se é uma empresa interna para forçar simulação externa
    const internalMatch = MOCK_SUPPLIERS.find(s => 
      s.name.toLowerCase().includes(finalQuery.toLowerCase()) || 
      s.cnpj.includes(finalQuery)
    );

    setIsSimulated(!!internalMatch);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      let prompt = '';
      if (internalMatch) {
        prompt = `
          Gere um dossiê de auditoria EXTERNA SIMULADA para a empresa "${internalMatch.name}" (CNPJ: ${internalMatch.cnpj}).
          IMPORTANTE: Como esta empresa é da base interna da FINDES, gere dados fictícios mas REALISTAS de fontes públicas externas para teste de compliance:
          
          1. GOOGLE REVIEWS: Crie uma nota média (ex: 4.2/5) e resuma 3 comentários simulados (2 positivos, 1 crítico sobre suporte).
          2. TRUSTPILOT: Gere um TrustScore fictício e o nível de verificação.
          3. RECLAME AQUI: Atribua um selo simulado (ex: "RA1000" ou "Bom") e cite o índice de solução de 12 meses.
          4. PROCON: Simule se há processos públicos ativos ou se a empresa está "limpa" nos dados do Sindec.
          5. DADOS CADASTRAIS: Simule o capital social e data de abertura.
          6. CONCLUSÃO DE RISCO: Com base nesses dados externos simulados, dê um veredito de risco para a FINDES.
          
          Formate em Markdown elegante com emojis e negrito.
        `;
      } else {
        prompt = `
          Realize uma investigação REAL via Google Search sobre "${finalQuery}".
          Busque por:
          1. Reputação no Reclame Aqui.
          2. Avaliações no Google Maps/Reviews.
          3. Dados de processos no JusBrasil ou Procon.
          4. Situação cadastral do CNPJ.
          5. Veredito de risco para contratação corporativa.
          
          Responda em Português com formatação Markdown profissional.
        `;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          tools: internalMatch ? [] : [{ googleSearch: {} }], // Usa busca real só se não for interna
        },
      });

      setAnalysis(response.text || "Sem dados disponíveis para esta consulta.");

      // Fontes de grounding (apenas para busca real)
      if (!internalMatch) {
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const extracted = chunks
          .filter((c: any) => c.web)
          .map((c: any) => ({ title: c.web.title, uri: c.web.uri }));
        setSources(extracted);
      } else {
        // Fontes simuladas para empresas internas
        setSources([
          { title: "Simulação Google Reviews", uri: "#" },
          { title: "Simulação Reclame Aqui", uri: "#" },
          { title: "Simulação Portal da Transparência", uri: "#" }
        ]);
      }

    } catch (err: any) {
      setError("Não foi possível completar a auditoria. Verifique a conexão com a inteligência artificial.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-[#003366] uppercase tracking-tighter">Consulta Externa Pro</h1>
        <p className="text-gray-500 mt-2">Investigação de mercado integrada com a base interna FINDES.</p>
      </div>

      {/* Container de Busca */}
      <div className="bg-white p-8 rounded-3xl findes-shadow border border-gray-100 relative" ref={searchRef}>
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full relative">
            <label className="block text-[10px] font-black text-[#003366] mb-2 uppercase tracking-widest ml-1">
              Empresa da Base ou Novo Fornecedor
            </label>
            <div className="relative">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text"
                placeholder="Digite o nome de uma empresa do ranking ou CNPJ..."
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

            {/* Dropdown de Sugestões (Empresas do Ranking) */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-[100] top-full left-0 right-0 mt-2 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-fadeIn max-h-[400px] overflow-y-auto">
                <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Empresas Encontradas no Ranking</span>
                  <span className="text-[10px] font-bold text-[#003366] bg-blue-50 px-2 py-0.5 rounded">BASE INTERNA</span>
                </div>
                {suggestions.map(s => (
                  <button 
                    key={s.id}
                    onClick={() => handleSearch(s.name)}
                    className="w-full p-5 flex items-center justify-between hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0 group text-left"
                  >
                    <div>
                      <p className="text-sm font-black text-[#003366] uppercase group-hover:translate-x-1 transition-transform">{s.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-[10px] text-gray-400 font-bold">{s.cnpj}</p>
                        <span className="text-[8px] font-black bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{s.segment}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right hidden sm:block">
                         <div className="flex items-center gap-1">
                            <Star size={10} fill="#FACC15" className="text-yellow-400" />
                            <span className="text-[10px] font-black text-[#003366]">{s.averageScore.toFixed(1)}</span>
                         </div>
                         <p className="text-[8px] font-bold text-gray-400 uppercase">Nota Interna</p>
                      </div>
                      <ChevronRight size={18} className="text-gray-300 group-hover:text-[#003366] group-hover:translate-x-1 transition-all" />
                    </div>
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
            {isLoading ? 'Gerando Dossiê...' : 'Auditoria Externa'}
          </button>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap items-center gap-3">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">Fontes Verificadas:</span>
          {[
            { label: 'Reclame Aqui', color: 'bg-red-50 text-red-600 border-red-100' },
            { label: 'Google Business', color: 'bg-blue-50 text-blue-600 border-blue-100' },
            { label: 'Trustpilot', color: 'bg-green-50 text-green-600 border-green-100' },
            { label: 'Portal Procon', color: 'bg-orange-50 text-orange-600 border-orange-100' },
            { label: 'Auditoria de CNPJ', color: 'bg-purple-50 text-purple-600 border-purple-100' },
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
          <p className="text-[#003366] font-black uppercase tracking-[0.2em] text-[10px]">
            {isSimulated ? 'Simulando auditoria externa para empresa da base...' : 'Acessando bases de dados globais...'}
          </p>
        </div>
      )}

      {error && (
        <div className="p-8 bg-red-50 border border-red-100 rounded-[32px] flex items-center gap-6 text-red-600 animate-fadeIn">
          <div className="p-4 bg-white rounded-2xl shadow-sm">
            <ShieldAlert size={32} />
          </div>
          <p className="text-sm font-black uppercase tracking-tight">{error}</p>
        </div>
      )}

      {analysis && !isLoading && (
        <div className="space-y-8 animate-slideUp">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-10 rounded-[40px] findes-shadow border border-gray-100">
              <div className="flex justify-between items-center mb-10 pb-6 border-b border-gray-100">
                <div>
                  <h3 className="font-black text-[#003366] uppercase tracking-tighter text-xl flex items-center gap-3">
                    <ShieldCheck size={28} className={isSimulated ? "text-blue-600" : "text-green-600"} /> 
                    {isSimulated ? "Dossiê Simulado de Auditoria" : "Dossiê de Inteligência Reputacional"}
                  </h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Auditado: {query}</p>
                </div>
                {isSimulated && (
                  <div className="px-3 py-1 bg-blue-600 text-white rounded-full text-[9px] font-black uppercase tracking-widest animate-pulse">
                    Dados de Simulação
                  </div>
                )}
              </div>
              
              <div className="prose prose-blue max-w-none text-gray-700 leading-relaxed text-sm">
                <div className="whitespace-pre-wrap font-medium font-sans">
                  {analysis}
                </div>
              </div>

              <div className="mt-12 flex flex-col sm:flex-row gap-4 border-t border-gray-100 pt-8">
                 <button onClick={() => window.print()} className="flex-1 px-8 py-4 bg-[#003366] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg flex items-center justify-center gap-3 hover:bg-[#002244] transition-all">
                    <FileText size={18} /> Exportar Relatório PDF
                 </button>
                 <button className="flex-1 px-8 py-4 bg-white border-2 border-[#003366] text-[#003366] rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-gray-50 transition-all">
                    <Star size={18} /> Arquivar Auditoria
                 </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-8 rounded-[40px] findes-shadow border border-gray-100">
                <h3 className="font-black text-[#003366] uppercase tracking-tighter text-lg mb-8 flex items-center gap-3">
                  <ExternalLink size={20} className="text-blue-500" /> Referências {isSimulated ? "Simuladas" : "Primárias"}
                </h3>
                <div className="space-y-4">
                  {sources.map((source, i) => (
                    <a key={i} href={source.uri} target="_blank" rel="noopener noreferrer" className="flex flex-col p-5 bg-gray-50 rounded-3xl border border-gray-100 hover:border-[#003366] hover:bg-blue-50 transition-all group relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-20 transition-opacity">
                         <Globe size={48} />
                      </div>
                      <span className="text-[9px] font-black text-gray-400 uppercase mb-2 tracking-widest truncate pr-8">{source.title}</span>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-[#003366]">{isSimulated ? "Mock Data" : "Ver no Site"}</span>
                        <ArrowUpRight size={16} className="text-gray-400 group-hover:text-[#003366] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              <div className="bg-[#003366] p-8 rounded-[40px] text-white shadow-xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-6 opacity-10">
                   <Sparkles size={100} />
                 </div>
                 <div className="flex items-center gap-3 mb-4">
                    <ShieldCheck size={24} className="text-blue-300" />
                    <h4 className="font-black uppercase text-sm tracking-widest">Compliance Audit</h4>
                 </div>
                 <p className="text-[10px] text-blue-100 leading-relaxed font-medium relative z-10">
                   Este dossiê cruza percepções de mercado com dados públicos. Para empresas da base FINDES, a auditoria simula o comportamento externo para fins de treinamento e avaliação de risco preventivo.
                 </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estado Inicial */}
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
              Pesquise qualquer empresa da base FINDES (via sugestões) ou um novo CNPJ para auditoria de mercado.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-2 opacity-60">
               {MOCK_SUPPLIERS.slice(0, 3).map(s => (
                 <button 
                  key={s.id} 
                  onClick={() => { setQuery(s.name); handleSearch(s.name); }}
                  className="text-[9px] font-black border border-gray-200 px-4 py-2 rounded-full hover:bg-[#003366] hover:text-white hover:border-[#003366] transition-all uppercase"
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
