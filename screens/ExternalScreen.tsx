
import React, { useState } from 'react';
import { Search, Globe, ShieldCheck, TrendingUp, AlertCircle, FileText, CheckCircle2, Info, ArrowUpRight, BarChart3, Clock, MessageCircle, Star, ExternalLink } from 'lucide-react';
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
        contents: `Analise detalhadamente a reputação da empresa "${query}" nos sites Reclame Aqui e Google Avaliações. 
        Forneça um resumo objetivo da pontuação, principais tipos de reclamações e se a empresa é considerada confiável para parcerias B2B. 
        Formate a resposta em tópicos claros.`,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text;
      setAnalysis(text || "Não foi possível obter uma análise detalhada no momento.");

      // Extract grounding sources
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const extractedSources = chunks
        .filter((chunk: any) => chunk.web)
        .map((chunk: any) => ({
          title: chunk.web.title,
          uri: chunk.web.uri
        }));
      
      setSources(extractedSources);

    } catch (err) {
      console.error("Erro na busca:", err);
      setError("Ocorreu um erro ao consultar as bases externas. Verifique o nome da empresa e tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#003366]">Consulta Externa</h1>
        <p className="text-gray-500 mt-2">Consulta externamente o CNPJ do seu fornecedor</p>
      </div>

      {/* Input de Busca */}
      <div className="bg-white p-8 rounded-2xl findes-shadow border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-bold text-[#003366] mb-2 uppercase tracking-wider">CNPJ ou Razão Social do Fornecedor</label>
            <div className="relative">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text"
                placeholder="Ex.: Nome da Empresa ou 00.000.000/0001-00"
                className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#003366] text-sm"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>
          <button 
            onClick={handleSearch}
            disabled={isLoading}
            className="bg-[#003366] text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-[#002244] transition-all h-[58px] shadow-lg flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? 'Consultando...' : 'Verificar'}
          </button>
        </div>
        
        {/* Indicadores de Fontes */}
        <div className="mt-6 pt-6 border-t border-gray-100 flex flex-wrap items-center gap-6">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Busca inteligente em:</span>
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
            <div className="w-2 h-2 rounded-full bg-[#E63946]"></div>
            <span className="text-[10px] font-bold text-gray-600">Reclame Aqui</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
            <div className="w-2 h-2 rounded-full bg-[#4285F4]"></div>
            <span className="text-[10px] font-bold text-gray-600">Google Avaliações</span>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="py-20 flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[#003366]/20 border-t-[#003366] rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400 font-black uppercase tracking-widest text-xs animate-pulse">Cruzando dados de reputação...</p>
        </div>
      )}

      {error && (
        <div className="p-6 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-4 text-red-600 animate-fadeIn">
          <AlertCircle size={24} />
          <p className="text-sm font-bold">{error}</p>
        </div>
      )}

      {analysis && !isLoading && (
        <div className="space-y-6 animate-slideUp">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Resumo Gerado por IA */}
            <div className="md:col-span-2 bg-white p-8 rounded-3xl findes-shadow border border-gray-100">
              <h3 className="font-black text-[#003366] uppercase tracking-tighter text-lg mb-6 flex items-center gap-2">
                <ShieldCheck size={20} className="text-green-600" /> Relatório de Reputação
              </h3>
              <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                {analysis}
              </div>
            </div>

            {/* Fontes Encontradas */}
            <div className="bg-white p-8 rounded-3xl findes-shadow border border-gray-100">
              <h3 className="font-black text-[#003366] uppercase tracking-tighter text-lg mb-6 flex items-center gap-2">
                <ExternalLink size={20} /> Fontes Oficiais
              </h3>
              <div className="space-y-3">
                {sources.length > 0 ? sources.map((source, i) => (
                  <a 
                    key={i} 
                    href={source.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex flex-col p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-[#003366] hover:bg-blue-50 transition-all group"
                  >
                    <span className="text-[10px] font-black text-gray-400 uppercase mb-1 truncate">{source.title}</span>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#003366] truncate max-w-[180px]">Acessar Link</span>
                      <ExternalLink size={14} className="text-gray-400 group-hover:text-[#003366]" />
                    </div>
                  </a>
                )) : (
                  <p className="text-xs text-gray-400 italic">Nenhuma fonte direta encontrada para listagem.</p>
                )}
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-[10px] text-[#003366] font-medium leading-relaxed">
                    <strong>Importante:</strong> Estas informações são coletadas em tempo real de fontes públicas. Recomendamos sempre validar as certidões negativas nos órgãos oficiais.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 justify-end pt-4">
             <button 
               onClick={() => window.print()}
               className="px-8 py-4 bg-[#003366] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg flex items-center gap-2 hover:bg-[#002244] transition-all"
             >
                <FileText size={16} /> Exportar Relatório PDF
             </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!analysis && !isLoading && !error && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-300">
          <div className="relative mb-6">
            <BarChart3 size={100} strokeWidth={1} />
            <Search className="absolute -bottom-2 -right-2 text-[#003366]" size={32} />
          </div>
          <p className="font-bold uppercase tracking-widest text-gray-400 text-center">
            Insira o nome de uma empresa para iniciar a <br/> varredura no Reclame Aqui e Google.
          </p>
        </div>
      )}
    </div>
  );
};

export default ExternalScreen;
