import React, { useState, useEffect } from 'react';
import { 
  Landmark, 
  Lock, 
  CreditCard, 
  User, 
  Hash, 
  Save, 
  ShieldCheck, 
  X,
  CheckCircle,
  Zap
} from './Icons';
import { BankDetails } from '../types';

interface BankVaultProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (details: BankDetails) => void;
  existingDetails: BankDetails | null;
}

const BankVault: React.FC<BankVaultProps> = ({ isOpen, onClose, onSave, existingDetails }) => {
  const [formData, setFormData] = useState<BankDetails>({
    bankName: '',
    agency: '',
    accountNumber: '',
    accountType: 'CHECKING',
    pixKey: '',
    holderName: '',
    documentId: ''
  });
  
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (existingDetails) {
      setFormData(existingDetails);
    }
  }, [existingDetails]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setIsSaved(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setIsSaved(true);
    setTimeout(() => {
        setIsSaved(false);
        onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-matrix-panel border border-matrix-border rounded-xl shadow-[0_0_50px_rgba(234,179,8,0.15)] relative overflow-hidden">
        
        {/* Header Decoration */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-700 via-yellow-500 to-yellow-700"></div>
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-yellow-500/10 rounded-full blur-xl"></div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
                <Landmark size={24} className="text-yellow-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-wide">COFRE BANCÁRIO</h2>
                <p className="text-[10px] text-yellow-500/80 font-mono uppercase tracking-widest">Canal de Liquidez Segura</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-500 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 uppercase font-mono flex items-center gap-1"><CreditCard size={10} /> Instituição</label>
                    <input 
                        name="bankName"
                        value={formData.bankName}
                        onChange={handleChange}
                        placeholder="Ex: Nubank, Inter"
                        className="w-full bg-black/40 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:border-yellow-500 focus:outline-none transition-colors"
                        required
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 uppercase font-mono flex items-center gap-1"><User size={10} /> Titular</label>
                    <input 
                        name="holderName"
                        value={formData.holderName}
                        onChange={handleChange}
                        placeholder="Nome Completo"
                        className="w-full bg-black/40 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:border-yellow-500 focus:outline-none transition-colors"
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 uppercase font-mono">Agência</label>
                    <input 
                        name="agency"
                        value={formData.agency}
                        onChange={handleChange}
                        placeholder="0001"
                        className="w-full bg-black/40 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:border-yellow-500 focus:outline-none transition-colors"
                        required
                    />
                </div>
                <div className="space-y-1 col-span-2">
                    <label className="text-[10px] text-gray-400 uppercase font-mono">Conta</label>
                    <input 
                        name="accountNumber"
                        value={formData.accountNumber}
                        onChange={handleChange}
                        placeholder="123456-7"
                        className="w-full bg-black/40 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:border-yellow-500 focus:outline-none transition-colors"
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 uppercase font-mono">Tipo</label>
                    <select 
                        name="accountType"
                        value={formData.accountType}
                        onChange={handleChange}
                        className="w-full bg-black/40 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:border-yellow-500 focus:outline-none transition-colors appearance-none"
                    >
                        <option value="CHECKING">Corrente</option>
                        <option value="SAVINGS">Poupança</option>
                        <option value="PAYMENT">Pagamentos</option>
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 uppercase font-mono flex items-center gap-1"><Hash size={10} /> CPF/CNPJ</label>
                    <input 
                        name="documentId"
                        value={formData.documentId}
                        onChange={handleChange}
                        placeholder="000.000.000-00"
                        className="w-full bg-black/40 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:border-yellow-500 focus:outline-none transition-colors"
                        required
                    />
                </div>
            </div>

            <div className="space-y-1 pt-2">
                <label className="text-[10px] text-yellow-500 font-bold uppercase font-mono flex items-center gap-1"><Zap size={10} /> Chave PIX (Principal)</label>
                <div className="relative">
                    <input 
                        name="pixKey"
                        value={formData.pixKey}
                        onChange={handleChange}
                        placeholder="Email, CPF ou Chave Aleatória"
                        className="w-full bg-yellow-900/10 border border-yellow-700/50 rounded px-3 py-3 text-sm text-yellow-100 focus:border-yellow-500 focus:outline-none transition-colors pl-10"
                        required
                    />
                    <div className="absolute left-3 top-3 text-yellow-600">
                        <Lock size={16} />
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] text-gray-500">
                    <ShieldCheck size={12} className="text-green-500" />
                    <span>Criptografia Ponta-a-Ponta</span>
                </div>
                <button 
                    type="submit"
                    className={`flex items-center gap-2 px-6 py-2 rounded text-xs font-bold transition-all ${isSaved ? 'bg-green-600 text-white' : 'bg-yellow-600 hover:bg-yellow-500 text-black'}`}
                >
                    {isSaved ? <CheckCircle size={14} /> : <Save size={14} />}
                    {isSaved ? 'DADOS SEGUROS' : 'SALVAR NO COFRE'}
                </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default BankVault;