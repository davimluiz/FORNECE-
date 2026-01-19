
import React, { useState } from 'react';
import { Search, Globe, ShieldCheck, TrendingUp, AlertCircle, FileText, CheckCircle2, Info, ArrowUpRight, BarChart3, Clock, MessageCircle, Star } from 'lucide-react';
import { COLORS } from '../constants';

const ExternalScreen: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const handleSearch = () => {
    if (!query) return;
    setIsLoading(true);
    setData(null);
    
    // Simulation
    setTimeout(() => {
      setIsLoading(false);
      setData({
        name: 'Fornecedor Exemplo LTDA',
        cnpj: '12.345.678/0001-90',
        iec: 88,
        onTimeRate: 94.5,
        complaintRate: 0.8,
        avgSla: 3.2,
        status: 'Ativa',
        updatedAt: new Date().toLocaleString(),
        certificates: [
          { label: 'Receita Federal', status: 'OK' },
          { label: 'FGTS', status: 'OK' },
          { label: 'Trabalhista (CNDT)', status: 'OK' },
          { label: 'Estadual', status: 'PENDENTE' },
        ],
        externalSources: [
          { name: 'Reclame Aqui', score: '8.5/10', status: 'Ótimo' },
          { name: 'Google Avaliações', score: '4.7/5', status: 'Excelente' }
        ],
        criticalAlerts: 0
      });
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#003366]">Consulta Externa</h1>
        <p className="text-gray-500 mt-2">Consulta externamente o CNPJ do seu fornecedor</p>
      </div>

      {/* Input */}
      <div className="bg-white p-8 rounded-2xl findes-shadow border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-bold text-[#003366] mb-2 uppercase tracking-wider">CNPJ ou Razão Social</label>
            <div className="relative">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text"
                placeholder="Ex.: 12.345.678/0001-90"
                className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#003366] text-sm"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>
          <button 
            onClick={handleSearch}
            className="bg-[#003366] text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-[#002244] transition-all h-[58px] shadow-lg flex items-center gap-2"
          >
            {isLoading ? 'Consultando...' : 'Verificar'}
          </button>
        </div>
        
        {/* Sources Info */}
        <div className="mt-6 pt-6 border-t border-gray-100 flex flex-wrap items-center gap-6">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Buscando em:</span>
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span className="text-[10px] font-bold text-gray-600">Reclame Aqui</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-[10px] font-bold text-gray-600">Google Avaliações</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-[10px] font-bold text-gray-600">Receita Federal / Certidões</span>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="py-20 flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[#003366]/20 border-t-[#003366] rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Acessando bases externas...</p>
        </div>
      )}

      {data && !isLoading && (
        <div className="space-y-6 animate-slideUp">
          <div className="flex justify-between items-center">
             <div className="flex items-center gap-2 text-[#2E7D32] bg-green-50 px-4 py-1.5 rounded-full border border-green-100">
               <ShieldCheck size={16} />
               <span className="text-[10px] font-black uppercase tracking-wider">Fornecedor Encontrado e Validado</span>
             </div>
             <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Atualizado em {data.updatedAt}</span>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {/* IEC Gauge Simulation */}
            <div className="bg-white p-6 rounded-3xl findes-shadow border border-gray-100 flex flex-col items-center justify-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 via-yellow-400 to-green-500"></div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">IEC (Market Score)</span>
              <div className="text-5xl font-black text-[#003366] flex items-baseline gap-1">
                {data.iec}<span className="text-xl opacity-30">/100</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-2 font-medium text-center">Índice Externo de Confiabilidade</p>
            </div>

            <div className="bg-white p-6 rounded-3xl findes-shadow border border-gray-100 flex flex-col items-center justify-center">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Entregas no Prazo</span>
              <div className="text-4xl font-black text-[#003366]">{data.onTimeRate}%</div>
              <p className="text-[10px] text-gray-400 mt-2 font-medium text-center">Média de mercado (12 meses)</p>
            </div>

            <div className="bg-white p-6 rounded-3xl findes-shadow border border-gray-100 flex flex-col items-center justify-center">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Taxa de Reclamação</span>
              <div className="text-4xl font-black text-[#003366]">{data.complaintRate}%</div>
              <p className="text-[10px] text-gray-400 mt-2 font-medium text-center">Por 100 pedidos externos</p>
            </div>

            <div className="bg-white p-6 rounded-3xl findes-shadow border border-gray-100 flex flex-col items-center justify-center">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">SLA Externo Médio</span>
              <div className="text-4xl font-black text-[#003366]">{data.avgSla}d</div>
              <p className="text-[10px] text-gray-400 mt-2 font-medium text-center">Tempo médio de resposta</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Reputation from specified sources */}
            <div className="bg-white p-8 rounded-3xl findes-shadow border border-gray-100">
              <h3 className="font-black text-[#003366] uppercase tracking-tighter text-lg mb-6 flex items-center gap-2">
                <Star size={20} /> Reputação Online
              </h3>
              <div className="space-y-4">
                {data.externalSources.map((source: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${source.name === 'Reclame Aqui' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                        {source.name === 'Reclame Aqui' ? <MessageCircle size={20} /> : <Star size={20} />}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#003366]">{source.name}</span>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Status: {source.status}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black text-[#003366]">{source.score}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status & Compliance */}
            <div className="bg-white p-8 rounded-3xl findes-shadow border border-gray-100">
              <h3 className="font-black text-[#003366] uppercase tracking-tighter text-lg mb-6 flex items-center gap-2">
                <ShieldCheck size={20} /> Compliance & Certidões
              </h3>
              <div className="flex flex-wrap gap-3">
                {data.certificates.map((cert: any, i: number) => (
                  <div key={i} className={`
                    flex flex-col p-4 rounded-2xl border flex-1 min-w-[140px]
                    ${cert.status === 'OK' ? 'bg-green-50/30 border-green-100' : 'bg-orange-50/30 border-orange-100'}
                  `}>
                    <span className="text-[9px] font-black text-gray-400 uppercase mb-1">{cert.label}</span>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-black ${cert.status === 'OK' ? 'text-green-700' : 'text-orange-700'}`}>
                        {cert.status}
                      </span>
                      {cert.status === 'OK' ? <CheckCircle2 size={14} className="text-green-600" /> : <Clock size={14} className="text-orange-600" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 justify-end pt-4">
             <button className="px-8 py-4 bg-white text-[#003366] rounded-2xl font-black uppercase tracking-widest text-[10px] border border-[#003366] hover:bg-[#003366] hover:text-white transition-all">
                Associar à OC/Processo
             </button>
             <button className="px-8 py-4 bg-[#003366] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg flex items-center gap-2 hover:bg-[#002244] transition-all">
                <FileText size={16} /> Gerar PDF Resumo
             </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!data && !isLoading && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-300">
          <BarChart3 size={100} strokeWidth={1} />
          <p className="mt-4 font-bold uppercase tracking-widest text-gray-400">Aguardando consulta externa...</p>
        </div>
      )}
    </div>
  );
};

export default ExternalScreen;
