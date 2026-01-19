
import React, { useState, useMemo } from 'react';
import { MOCK_SUPPLIERS, COLORS } from '../constants';
import { Supplier, ITEM_RELATED_TYPES } from '../types';
import { Search, Star, AlertTriangle, FileText, CheckCircle2, ChevronRight, Package, Info, Upload, Trash2 } from 'lucide-react';
import IssueModal from '../components/IssueModal';

const EvaluationScreen: React.FC = () => {
  const [search, setSearch] = useState('');
  const [foundSupplier, setFoundSupplier] = useState<Supplier | null>(null);
  const [searchError, setSearchError] = useState('');
  const [scores, setScores] = useState<{ quality: number; delivery: number; support: number }>({
    quality: 0,
    delivery: 0,
    support: 0,
  });
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const averageScore = useMemo(() => {
    if (scores.quality > 0 && scores.delivery > 0 && scores.support > 0) {
      return ((scores.quality + scores.delivery + scores.support) / 3).toFixed(1);
    }
    return null;
  }, [scores]);

  const handleSearch = () => {
    setSearchError('');
    setIsSuccess(false);
    // Simulation: OC-2025-001 or FLUIG-123456 matches Supplier 1, OC-2025-002 matches Supplier 2
    const normalized = search.toUpperCase();
    if (normalized === 'OC-2025-001' || normalized === 'FLUIG-123456') {
      setFoundSupplier(MOCK_SUPPLIERS.find(s => s.id === '1') || null);
    } else if (normalized === 'OC-2025-002' || normalized === 'FLUIG-987654') {
      setFoundSupplier(MOCK_SUPPLIERS.find(s => s.id === '2') || null);
    } else {
      setFoundSupplier(null);
      setSearchError('Nenhuma OC/Processo encontrada(o). Tente outro número.');
    }
  };

  const handleScore = (criterion: keyof typeof scores, value: number) => {
    setScores(prev => ({ ...prev, [criterion]: value }));
  };

  const handleSend = () => {
    setIsSuccess(true);
    setTimeout(() => {
      setFoundSupplier(null);
      setScores({ quality: 0, delivery: 0, support: 0 });
      setSearch('');
    }, 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#003366]">Avaliação de Fornecedores</h1>
        <p className="text-gray-500 mt-2">Use o número exato da OC ou do processo para preenchimento automático.</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-6 rounded-2xl findes-shadow border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-[#003366] mb-2 uppercase tracking-wide">
              Fornecedor / CNPJ / Nº da OC ou Processo
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Ex.: OC-2025-001 ou FLUIG-123456"
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#003366] focus:border-[#003366] transition-all"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>
          <button 
            onClick={handleSearch}
            className="bg-[#003366] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#002244] transition-colors flex items-center justify-center gap-2 h-[50px]"
          >
            Buscar
          </button>
        </div>
        {searchError && (
          <p className="mt-3 text-[#E53935] text-sm flex items-center gap-1 font-medium">
            <AlertTriangle size={14} /> {searchError}
          </p>
        )}
      </div>

      {foundSupplier && (
        <div className="grid md:grid-cols-2 gap-6 animate-slideUp">
          {/* Supplier Info */}
          <div className="bg-white p-6 rounded-2xl findes-shadow border border-gray-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-50 rounded-full text-[#003366]">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#003366]">{foundSupplier.name}</h3>
                  <p className="text-gray-500 text-sm">{foundSupplier.cnpj}</p>
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <p className="text-sm flex items-center gap-2 text-gray-600">
                  <Info size={14} /> <strong>Contato:</strong> {foundSupplier.contact}
                </p>
              </div>
            </div>
          </div>

          {/* OC Items */}
          <div className="bg-white p-6 rounded-2xl findes-shadow border border-gray-100">
            <h3 className="font-bold text-lg text-[#003366] mb-4 flex items-center gap-2">
              <Package size={20} /> Itens da OC
            </h3>
            <div className="space-y-3">
              {foundSupplier.items.map(item => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="text-xs bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
                    {item.quantity} {item.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Evaluation Blocks */}
          <div className="md:col-span-2 bg-white p-8 rounded-2xl findes-shadow border border-gray-100 space-y-8">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { key: 'quality' as const, label: 'Qualidade do Produto' },
                { key: 'delivery' as const, label: 'Prazo de Entrega' },
                { key: 'support' as const, label: 'Atendimento ao Cliente' }
              ].map(crit => (
                <div key={crit.key} className="flex flex-col items-center">
                  <span className="text-sm font-semibold text-[#003366] mb-3 text-center uppercase tracking-wider">{crit.label}</span>
                  <div className="flex gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button 
                        key={star}
                        onClick={() => handleScore(crit.key, star)}
                        className={`transition-all duration-300 hover:scale-110 ${scores[crit.key] >= star ? 'text-yellow-400' : 'text-gray-200'}`}
                        aria-label={`${star} de 5 estrelas em ${crit.label}`}
                      >
                        <Star size={32} fill={scores[crit.key] >= star ? 'currentColor' : 'none'} strokeWidth={1.5} />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs text-gray-400 font-medium">
                    {scores[crit.key] > 0 ? `${scores[crit.key]} de 5 estrelas` : 'Avalie para prosseguir'}
                  </span>
                </div>
              ))}
            </div>

            {averageScore && (
              <div className="mt-8 pt-8 border-t border-gray-100 text-center animate-bounceIn">
                <div className="inline-flex flex-col items-center">
                  <span className="text-sm font-medium text-gray-500 uppercase tracking-widest mb-1">Média Geral do Fornecedor</span>
                  <div className="flex items-center gap-2 text-4xl font-black text-[#003366]">
                    <Star size={36} fill="#FACC15" className="text-yellow-400" />
                    {averageScore}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Calculada com base nos 3 critérios avaliados acima.</p>
                </div>
              </div>
            )}

            <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-8">
              <button 
                onClick={handleSend}
                disabled={!averageScore || isSuccess}
                className={`
                  px-10 py-4 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg
                  ${!averageScore ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#003366] text-white hover:bg-[#002244] hover:-translate-y-1'}
                `}
              >
                {isSuccess ? <><CheckCircle2 size={20}/> Enviado!</> : 'Enviar Avaliação'}
              </button>
              <button 
                onClick={() => setIsIssueModalOpen(true)}
                className="text-[#E53935] font-semibold hover:bg-red-50 px-6 py-4 rounded-xl transition-colors flex items-center gap-2"
              >
                <AlertTriangle size={18} /> Tive um problema com este fornecedor
              </button>
            </div>
            {isSuccess && (
              <p className="text-center text-[#2E7D32] font-bold mt-4 flex items-center justify-center gap-2 animate-pulse">
                 Avaliação registrada com sucesso!
              </p>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!foundSupplier && !searchError && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-300">
          <FileText size={80} strokeWidth={1} />
          <p className="mt-4 font-medium text-lg text-gray-400">Aguardando busca de OC ou Processo...</p>
        </div>
      )}

      {isIssueModalOpen && foundSupplier && (
        <IssueModal 
          supplier={foundSupplier}
          ocId={search}
          onClose={() => setIsIssueModalOpen(false)}
          onSuccess={() => {
            setIsIssueModalOpen(false);
            // In a real app, toast success
          }}
        />
      )}
    </div>
  );
};

export default EvaluationScreen;
