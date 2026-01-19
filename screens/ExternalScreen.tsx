
import React, { useState } from 'react';
import { Search, Globe, ShieldCheck, TrendingUp, AlertCircle, FileText, CheckCircle2, Info, ArrowUpRight, BarChart3, Clock, MessageCircle, Star, ExternalLink, ShieldAlert, Building2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const ExternalScreen: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [sources, setSources] = useState<{title: string, uri: string}[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query) return;
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    setSources([]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Realize uma investigação profunda e consolidada sobre a empresa "${query}". Sua pesquisa deve obrigatoriamente abranger e citar dados das seguintes fontes:
        1. RECLAME AQUI: Reputação, nota média e índice de solução.
        2. GOOGLE REVIEWS (AVALIAÇÕES): Sentimento geral dos clientes e nota média.
        3. TRUSTPILOT: Avaliações de satisfação e confiança global.
        4. PROCON (Dados Públicos): Verifique se há menções a reclamações fundamentadas ou processos públicos.
        5. DADOS PÚBLICOS CADASTRAIS: Se possível, identifique situação do CNPJ, tempo de mercado e capital social aproximado.
        6. VEREDITO DE COMPLIANCE: Com base no cruzamento dessas fontes, a empresa é considerada um fornecedor de baixo, médio ou alto risco para a FINDES?
        
        Responda em Português (Brasil) com formatação Markdown profissional, usando negrito para destacar indicadores críticos.`,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text;
      setAnalysis(text || "Não foi possível consolidar uma análise detalhada. Verifique se o nome ou CNPJ está correto.");

      // Extração de fontes para transparência
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
      if (err.message?.includes("API_KEY")) {
        setError("Erro: Chave de API não configurada. Configure a API_KEY nas variáveis de ambiente.");
      } else {
        setError("Erro ao processar consulta externa. Tente novamente em alguns instantes.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-[#003366] uppercase tracking-tighter">Consulta Externa Pro</h1>
        <p className="text-gray-500 mt-2">Investigação de reputação em múltiplas bases de dados e inteligência de mercado.</p>
      </div>

      {/* Input de Busca */}
      <div className="bg-white p-8 rounded-3xl findes-shadow border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-[10px] font-black text-[#003366] mb-2 uppercase tracking-widest ml-1">CNPJ ou Razão Social para Auditoria</label>
            <div className="relative">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text"
                placeholder="Ex.: Nome da Empresa ou 00.000.000/0001-00"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#003366] outline-none text-sm font-bold text-[#003366]"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>
          <button 
            onClick={handleSearch}
            disabled={isLoading}
            className="bg-[#003366] text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#002244] transition-all h-[58px] shadow-lg flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin rounded-full"></div> : <Search size={18} />}
            {isLoading ? 'Pesquisando...' : 'Iniciar Auditoria'}
          </button>
        </div>
        
        {/* Indicadores de Fontes Expandidis */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap items-center gap-3">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">Fontes Integradas:</span>
          {[
            { label: 'Reclame Aqui', color: 'bg-red-50 text-red-600 border-red-100' },
            { label: 'Google Reviews', color: 'bg-blue-50 text-blue-600 border-blue-100' },
            { label: 'Trustpilot', color: 'bg-green-50 text-green-600 border-green-100' },
            { label: 'Procon (Público)', color: 'bg-orange-50 text-orange-600 border-orange-100' },
            { label: 'Dados Públicos (RFB)', color: 'bg-purple-50 text-purple-600 border-purple-100' },
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
          <p className="text-[#003366] font-black uppercase tracking-[0.2em] text-[10px]">Varrendo bases de dados governamentais e privadas...</p>
        </div>
      )}

      {error && (
        <div className="p-8 bg-red-50 border border-red-100 rounded-[32px] flex items-center gap-6 text-red-600 animate-fadeIn">
          <div className="p-4 bg-white rounded-2xl shadow-sm">
            <ShieldAlert size={32} />
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-tight">{error}</p>
            <p className="text-[10px] mt-1 font-bold opacity-70 uppercase tracking-widest">Tente buscar por um nome mais específico ou CNPJ completo.</p>
          </div>
        </div>
      )}

      {analysis && !isLoading && (
        <div className="space-y-8 animate-slideUp">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Relatório Gerado */}
            <div className="lg:col-span-2 bg-white p-10 rounded-[40px] findes-shadow border border-gray-100">
              <div className="flex justify-between items-center mb-10 pb-6 border-b border-gray-100">
                <div>
                  <h3 className="font-black text-[#003366] uppercase tracking-tighter text-xl flex items-center gap-3">
                    <ShieldCheck size={28} className="text-green-600" /> Dossiê de Inteligência Reputacional
                  </h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Gerado via FINDES FORNECE+ IA</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-2xl text-[#003366]">
                  <Building2 size={24} />
                </div>
              </div>
              
              <div className="prose prose-blue max-w-none text-gray-700 leading-relaxed text-sm">
                <div className="whitespace-pre-wrap font-medium">
                  {analysis}
                </div>
              </div>

              <div className="mt-12 flex flex-col sm:flex-row gap-4 border-t border-gray-100 pt-8">
                 <button 
                   onClick={() => window.print()}
                   className="flex-1 px-8 py-4 bg-[#003366] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg flex items-center justify-center gap-3 hover:bg-[#002244] transition-all"
                 >
                    <FileText size={18} /> Exportar Dossiê PDF
                 </button>
                 <button 
                   className="flex-1 px-8 py-4 bg-white border-2 border-[#003366] text-[#003366] rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-gray-50 transition-all"
                 >
                    <Star size={18} /> Salvar Favorito
                 </button>
              </div>
            </div>

            {/* Links de Referência & Dados Rápidos */}
            <div className="space-y-6">
              <div className="bg-white p-8 rounded-[40px] findes-shadow border border-gray-100">
                <h3 className="font-black text-[#003366] uppercase tracking-tighter text-lg mb-8 flex items-center gap-3">
                  <ExternalLink size={20} className="text-blue-500" /> Fontes Primárias
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
                        <span className="text-xs font-black text-[#003366]">Acessar Registro</span>
                        <ArrowUpRight size={16} className="text-gray-400 group-hover:text-[#003366] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                      </div>
                    </a>
                  )) : (
                    <div className="p-10 text-center border-2 border-dashed border-gray-100 rounded-3xl">
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Nenhuma fonte direta <br/> encontrada na varredura.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-[#003366] p-8 rounded-[40px] text-white shadow-xl">
                 <div className="flex items-center gap-3 mb-4">
                    <ShieldCheck size={24} className="text-blue-300" />
                    <h4 className="font-black uppercase text-sm tracking-widest">Aviso de Governança</h4>
                 </div>
                 <p className="text-[10px] text-blue-100 leading-relaxed font-medium">
                   Estes dados foram consolidados por IA a partir de fontes públicas. Recomendamos auditoria direta em casos de contratações críticas acima de R$ 100k ou que envolvam riscos de segurança operacional.
                 </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estado Vazio */}
      {!analysis && !isLoading && !error && (
        <div className="flex flex-col items-center justify-center py-24 text-gray-300 group">
          <div className="relative mb-8 transition-transform group-hover:scale-110 duration-500">
            <BarChart3 size={120} strokeWidth={1} className="text-gray-200" />
            <div className="absolute -bottom-4 -right-4 bg-white p-4 rounded-full shadow-lg border border-gray-50 text-[#003366]">
              <Search size={32} />
            </div>
          </div>
          <p className="font-black uppercase tracking-[0.3em] text-gray-400 text-center text-xs leading-loose">
            Inicie uma investigação unificada. <br/>
            <span className="text-[#003366] opacity-40">Bases: Reclame Aqui • Google • Trustpilot • Procon</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default ExternalScreen;
