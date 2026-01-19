
import React, { useState } from 'react';
import { Supplier, ITEM_RELATED_TYPES } from '../types';
import { 
  X, AlertCircle, Clock, Package, AlertTriangle, 
  PhoneOff, HelpCircle, MailQuestion, Search, 
  Check, Upload, Trash2, Send, ChevronLeft
} from 'lucide-react';

interface IssueModalProps {
  supplier: Supplier;
  ocId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const ISSUE_TYPES = [
  { label: 'Atraso na entrega', icon: Clock, color: 'orange' },
  { label: 'Produto com defeito', icon: AlertTriangle, color: 'red' },
  { label: 'Divergência no pedido', icon: Package, color: 'blue' },
  { label: 'Atendimento insatisfatório', icon: PhoneOff, color: 'purple' },
  { label: 'Falta de retorno', icon: MailQuestion, color: 'gray' },
  { label: 'Outro', icon: HelpCircle, color: 'slate' },
];

const IssueModal: React.FC<IssueModalProps> = ({ supplier, ocId, onClose, onSuccess }) => {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [selectedItems, setSelectedItems] = useState<{ id: string; note: string }[]>([]);
  const [itemSearch, setItemSearch] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const isItemRelated = selectedType && ITEM_RELATED_TYPES.includes(selectedType);

  const toggleItem = (itemId: string) => {
    setSelectedItems(prev => {
      const exists = prev.find(i => i.id === itemId);
      if (exists) return prev.filter(i => i.id !== itemId);
      return [...prev, { id: itemId, note: '' }];
    });
  };

  const updateItemNote = (itemId: string, note: string) => {
    setSelectedItems(prev => prev.map(i => i.id === itemId ? { ...i, note } : i));
  };

  const filteredItems = supplier.items.filter(i => 
    i.name.toLowerCase().includes(itemSearch.toLowerCase())
  );

  const handleSubmit = () => {
    const newErrors: string[] = [];
    if (!selectedType) newErrors.push('Selecione o tipo de problema.');
    if (!description.trim()) newErrors.push('Descreva o problema detalhadamente.');
    if (isItemRelated && selectedItems.length === 0) {
      newErrors.push('Selecione ao menos um item da OC que teve problema.');
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    // Success simulation
    alert('Relato enviado com sucesso!');
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#003366]/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col relative animate-scaleIn">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-[#003366]">Relatar Problema com o Fornecedor</h2>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-xs bg-[#EFF5FF] text-[#003366] px-3 py-1 rounded-full font-semibold border border-blue-100">
                {supplier.name} • {supplier.cnpj}
              </span>
              <span className="text-xs bg-gray-200 text-gray-700 px-3 py-1 rounded-full font-semibold">
                {ocId}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
          
          {/* Issue Type Grid */}
          <section>
            <label className="block text-sm font-bold text-[#003366] mb-3 uppercase tracking-wider">
              Tipo de Problema <span className="text-[#E53935]">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-4">Selecione o tipo que melhor descreve o problema ocorrido.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {ISSUE_TYPES.map(type => (
                <button
                  key={type.label}
                  onClick={() => {
                    setSelectedType(type.label);
                    if (!ITEM_RELATED_TYPES.includes(type.label)) setSelectedItems([]);
                    setErrors([]);
                  }}
                  className={`
                    flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all group
                    ${selectedType === type.label 
                      ? 'border-[#003366] bg-[#EFF5FF] shadow-md scale-105' 
                      : 'border-gray-100 bg-white hover:border-gray-200'}
                  `}
                >
                  <type.icon size={28} className={selectedType === type.label ? 'text-[#003366]' : 'text-gray-400 group-hover:text-gray-600'} />
                  <span className={`text-[11px] font-bold mt-2 text-center uppercase ${selectedType === type.label ? 'text-[#003366]' : 'text-gray-500'}`}>
                    {type.label}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Conditional Items List */}
          {isItemRelated && (
            <section className="bg-gray-50 p-5 rounded-2xl border border-blue-50 animate-fadeIn">
              <div className="flex justify-between items-center mb-4">
                <label className="text-sm font-bold text-[#003366] uppercase tracking-wider flex items-center gap-2">
                  <Package size={16} /> Itens da OC afetados <span className="text-[#E53935]">*</span>
                </label>
                <div className="flex gap-2">
                  <button onClick={() => setSelectedItems(supplier.items.map(i => ({ id: i.id, note: '' })))} className="text-[10px] text-[#003366] font-bold uppercase hover:underline">Todos</button>
                  <button onClick={() => setSelectedItems([])} className="text-[10px] text-gray-400 font-bold uppercase hover:underline">Limpar</button>
                </div>
              </div>

              <div className="relative mb-3">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Filtrar itens por nome..."
                  className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#003366]"
                  value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
                />
              </div>

              <div className="max-h-48 overflow-y-auto pr-1 space-y-2">
                {filteredItems.map(item => {
                  const isChecked = !!selectedItems.find(i => i.id === item.id);
                  return (
                    <div key={item.id} className="bg-white border border-gray-100 rounded-xl p-3">
                      <div className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          id={item.id}
                          checked={isChecked}
                          onChange={() => toggleItem(item.id)}
                          className="w-4 h-4 rounded text-[#003366] focus:ring-[#003366] border-gray-300"
                        />
                        <label htmlFor={item.id} className="flex-1 flex justify-between text-xs cursor-pointer">
                          <span className="font-semibold text-gray-700">{item.name}</span>
                          <span className="text-gray-400">Qtd: {item.quantity}</span>
                        </label>
                      </div>
                      {isChecked && (
                        <textarea 
                          placeholder="Observação específica para este item..."
                          className="mt-2 w-full p-2 text-xs bg-gray-50 border border-gray-100 rounded-lg focus:ring-1 focus:ring-[#003366] h-12"
                          value={selectedItems.find(i => i.id === item.id)?.note || ''}
                          onChange={(e) => updateItemNote(item.id, e.target.value)}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Description */}
          <section>
            <label className="block text-sm font-bold text-[#003366] mb-2 uppercase tracking-wider">
              Descrição do Ocorrido <span className="text-[#E53935]">*</span>
            </label>
            <textarea 
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#003366] min-h-[120px] text-sm"
              placeholder="Descreva com detalhes o que aconteceu, datas, nomes de contatos e impactos..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <p className="text-[10px] text-gray-400 mt-2">Dica: Seja objetivo e anexe evidências para agilizar a tratativa.</p>
          </section>

          {/* Attachments */}
          <section>
            <label className="block text-sm font-bold text-[#003366] mb-3 uppercase tracking-wider">
              Anexos (PDF, JPG, PNG)
            </label>
            <div className="flex flex-wrap gap-2">
              <label className="cursor-pointer flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors">
                <Upload size={20} className="text-gray-400" />
                <span className="text-[10px] text-gray-500 font-bold mt-1 uppercase">Subir</span>
                <input 
                  type="file" 
                  className="hidden" 
                  multiple 
                  onChange={(e) => {
                    if (e.target.files) setAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
                  }}
                />
              </label>
              {attachments.map((file, idx) => (
                <div key={idx} className="relative w-24 h-24 bg-gray-100 border border-gray-200 rounded-2xl flex items-center justify-center p-2 group">
                  <span className="text-[10px] text-gray-600 font-medium break-all line-clamp-2 text-center">{file.name}</span>
                  <button 
                    onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}
                    className="absolute -top-2 -right-2 bg-[#E53935] text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Error messages */}
          {errors.length > 0 && (
            <div className="p-4 bg-red-50 rounded-xl border border-red-100">
              {errors.map((err, i) => (
                <p key={i} className="text-xs text-[#E53935] font-semibold flex items-center gap-1">
                  <AlertCircle size={12} /> {err}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex justify-between gap-4 bg-gray-50/50">
          <button 
            onClick={onClose}
            className="px-6 py-3 text-[#666666] font-bold uppercase tracking-wider text-xs hover:bg-gray-100 rounded-xl flex items-center gap-2"
          >
            <ChevronLeft size={16} /> Voltar
          </button>
          <button 
            onClick={handleSubmit}
            className="px-8 py-3 bg-[#003366] text-white rounded-xl font-bold uppercase tracking-wider text-xs flex items-center gap-2 shadow-lg hover:bg-[#002244] hover:-translate-y-1 transition-all"
          >
            <Send size={16} /> Enviar Relato
          </button>
        </div>
      </div>
    </div>
  );
};

export default IssueModal;
