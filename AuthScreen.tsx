
import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Lock, 
  User, 
  UserPlus, 
  ShieldCheck, 
  Key, 
  Activity,
  CheckCircle 
} from './Icons';

interface AuthScreenProps {
  onAuthenticated: (username: string) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticated }) => {
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKeyStatus, setApiKeyStatus] = useState(false);

  useEffect(() => {
    checkApiKey();
    // Check for remembered user specifically in this component if needed for pre-fill
    // (Main auth check happens in App.tsx)
  }, []);

  const checkApiKey = async () => {
    if (window.aistudio) {
      try {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setApiKeyStatus(hasKey);
      } catch (e) {
        console.error("Error checking API key status", e);
      }
    }
  };

  const handleSelectKey = async () => {
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        await checkApiKey();
      } catch (e) {
        console.error("API Key selection failed or cancelled", e);
      }
    }
  };

  const hashPassword = async (pwd: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(pwd);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!username || !password) {
        throw new Error('Parâmetros de identidade necessários.');
      }

      // Simulate a brief processing delay for effect
      await new Promise(resolve => setTimeout(resolve, 800));

      const hashedPassword = await hashPassword(password);
      const users = JSON.parse(localStorage.getItem('lextrader_users') || '{}');

      if (authMode === 'REGISTER') {
        if (users[username]) {
          throw new Error('Assinatura de identidade já existe.');
        }
        users[username] = hashedPassword;
        localStorage.setItem('lextrader_users', JSON.stringify(users));
        
        if (rememberMe) {
            localStorage.setItem('lextrader_current_user', username);
        }
        onAuthenticated(username);
      } else {
        if (users[username] === hashedPassword) {
          if (rememberMe) {
            localStorage.setItem('lextrader_current_user', username);
          } else {
            sessionStorage.setItem('lextrader_current_user', username); // Session only
          }
          onAuthenticated(username);
        } else {
          throw new Error('Assinatura Quântica Inválida (Credenciais Incorretas).');
        }
      }
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-matrix-black items-center justify-center relative overflow-hidden font-sans">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
         <Brain size={400} className="text-quantum-500 animate-pulse-slow" />
      </div>

      <div className="z-10 bg-matrix-panel border border-matrix-border p-8 rounded-2xl w-full max-w-md shadow-[0_0_40px_rgba(14,165,233,0.1)] relative mx-4">
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-quantum-500 to-transparent"></div>
         
         <div className="text-center mb-8">
           <div className="flex justify-center mb-4">
             <div className="bg-black/50 p-3 rounded-full border border-quantum-500/30">
               <Brain className="text-quantum-400" size={48} />
             </div>
           </div>
           <h1 className="text-2xl font-bold text-white tracking-widest mb-1">LEXTRADER-ASI</h1>
           <p className="text-xs text-quantum-400 font-mono">UPLINK NEURAL SEGURO</p>
         </div>

         <form onSubmit={handleSubmit} className="space-y-6">
           {error && (
             <div className="bg-red-900/20 border border-red-800 text-red-400 text-xs p-3 rounded flex items-center gap-2 animate-pulse">
               <ShieldCheck size={16} />
               {error}
             </div>
           )}

           <div className="space-y-4">
             <div>
               <label className="block text-xs text-gray-500 font-mono mb-1 uppercase">Identidade Neural</label>
               <div className="relative">
                 <User className="absolute left-3 top-3 text-gray-600" size={16} />
                 <input 
                   type="text" 
                   value={username}
                   onChange={(e) => setUsername(e.target.value)}
                   className="w-full bg-black/50 border border-gray-800 rounded px-10 py-2.5 text-sm text-white focus:border-quantum-500 focus:outline-none transition-colors"
                   placeholder="Digite o usuário"
                 />
               </div>
             </div>
             
             <div>
               <label className="block text-xs text-gray-500 font-mono mb-1 uppercase">Senha</label>
               <div className="relative">
                 <Lock className="absolute left-3 top-3 text-gray-600" size={16} />
                 <input 
                   type="password" 
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   className="w-full bg-black/50 border border-gray-800 rounded px-10 py-2.5 text-sm text-white focus:border-quantum-500 focus:outline-none transition-colors"
                   placeholder="Digite a senha"
                 />
               </div>
             </div>

             <div className="flex items-center gap-2 cursor-pointer" onClick={() => setRememberMe(!rememberMe)}>
                <div className={`w-4 h-4 border rounded flex items-center justify-center transition-colors ${rememberMe ? 'bg-quantum-600 border-quantum-500' : 'bg-transparent border-gray-600'}`}>
                    {rememberMe && <CheckCircle size={10} className="text-white" />}
                </div>
                <span className="text-xs text-gray-400 select-none">Manter conexão neural ativa (Lembrar-me)</span>
             </div>
           </div>

           <button 
             type="submit"
             disabled={isLoading}
             className="w-full bg-quantum-600 hover:bg-quantum-500 text-white font-bold py-3 rounded transition-all shadow-lg shadow-quantum-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
           >
             {isLoading ? <Activity size={18} className="animate-spin" /> : (authMode === 'LOGIN' ? <Key size={18} /> : <UserPlus size={18} />)}
             {authMode === 'LOGIN' ? 'ESTABELECER CONEXÃO' : 'GERAR IDENTIDADE'}
           </button>
         </form>

         {/* API Key Management Section on Auth Screen */}
         <div className="mt-6 pt-4 border-t border-matrix-border">
            <button 
              onClick={handleSelectKey}
              className={`w-full py-2 rounded border text-xs font-mono flex items-center justify-center gap-2 transition-all ${
                apiKeyStatus 
                  ? 'bg-green-900/20 text-green-400 border-green-800' 
                  : 'bg-purple-900/20 text-purple-400 border-purple-800 hover:bg-purple-900/40'
              }`}
            >
               <Key size={14} />
               {apiKeyStatus ? 'QUANTUM API KEY: ATIVA' : 'SELECIONAR QUANTUM API KEY'}
            </button>
            <div className="text-[9px] text-gray-600 text-center mt-2">
               * Requer Google AI Studio Key para Processamento Neural
            </div>
         </div>

         <div className="mt-6 text-center">
           <button 
             onClick={() => { setAuthMode(authMode === 'LOGIN' ? 'REGISTER' : 'LOGIN'); setError(''); }}
             className="text-xs text-gray-500 hover:text-quantum-400 transition-colors font-mono"
           >
             {authMode === 'LOGIN' ? '[ MUDAR PARA PROTOCOLO DE REGISTRO ]' : '[ RETORNAR AO PROTOCOLO DE LOGIN ]'}
           </button>
         </div>
      </div>
    </div>
  );
};
