
import React, { useState, useEffect } from 'react';
import { Zap, Hexagon, Lock, Key, ShieldCheck, CheckCircle, AlertTriangle, Save, RefreshCw } from './Icons';
import { setCredentials, validateConnection } from '../services/exchangeService';
import { ExchangePlatform } from '../types';

const PlatformConnector: React.FC = () => {
  const [activePlatform, setActivePlatform] = useState<ExchangePlatform>('BINANCE');
  const [binanceKey, setBinanceKey] = useState('');
  const [binanceSecret, setBinanceSecret] = useState('');
  const [ctraderId, setCtraderId] = useState('');
  const [ctraderToken, setCtraderToken] = useState('');
  
  const [status, setStatus] = useState<Record<string, 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR'>>({
      BINANCE: 'DISCONNECTED',
      CTRADER: 'DISCONNECTED'
  });

  const [message, setMessage] = useState<string | null>(null);

  // Load saved keys (masked) on mount
  useEffect(() => {
      const bKey = localStorage.getItem('LEX_BINANCE_KEY');
      const cId = localStorage.getItem('LEX_CTRADER_ID');
      
      if (bKey) {
          setBinanceKey(bKey);
          setBinanceSecret('****************'); // Visual mask
          setStatus(prev => ({ ...prev, BINANCE: 'CONNECTED' }));
      }
      if (cId) {
          setCtraderId(cId);
          setCtraderToken('****************'); // Visual mask
          setStatus(prev => ({ ...prev, CTRADER: 'CONNECTED' }));
      }
  }, []);

  const handleConnect = async () => {
      setStatus(prev => ({ ...prev, [activePlatform]: 'CONNECTING' }));
      setMessage(null);

      // Save to service memory
      if (activePlatform === 'BINANCE') {
          // If masked, we assume we are just re-validating what's in memory/storage unless user changed it
          // For security in a real app, secrets aren't stored in plain localStorage, but for this demo:
          if (!binanceKey.includes('*')) localStorage.setItem('LEX_BINANCE_KEY', binanceKey);
          if (!binanceSecret.includes('*')) localStorage.setItem('LEX_BINANCE_SECRET', binanceSecret);
          
          setCredentials(
              binanceKey.includes('*') ? (localStorage.getItem('LEX_BINANCE_KEY') || '') : binanceKey,
              binanceSecret.includes('*') ? (localStorage.getItem('LEX_BINANCE_SECRET') || '') : binanceSecret
          );
      } else {
          if (!ctraderId.includes('*')) localStorage.setItem('LEX_CTRADER_ID', ctraderId);
          if (!ctraderToken.includes('*')) localStorage.setItem('LEX_CTRADER_TOKEN', ctraderToken);

          setCredentials(
              ctraderId.includes('*') ? (localStorage.getItem('LEX_CTRADER_ID') || '') : ctraderId,
              ctraderToken.includes('*') ? (localStorage.getItem('LEX_CTRADER_TOKEN') || '') : ctraderToken
          );
      }

      // Simulate Verification
      const isValid = await validateConnection(activePlatform);
      
      if (isValid) {
          setStatus(prev => ({ ...prev, [activePlatform]: 'CONNECTED' }));
          setMessage(`Conexão com ${activePlatform} estabelecida com sucesso. Protocolos de execução direta ativos.`);
      } else {
          setStatus(prev => ({ ...prev, [activePlatform]: 'ERROR' }));
          setMessage(`Falha na autenticação com ${activePlatform}. Verifique suas credenciais.`);
      }
  };

  return (
    <div className="bg-matrix-panel border border-matrix-border rounded-lg p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
        <div className="p-3 bg-quantum-900/20 rounded-lg border border-quantum-500/30">
            <Lock size={24} className="text-quantum-400" />
        </div>
        <div>
            <h2 className="text-xl font-bold text-white tracking-wide">UPLINK DE PLATAFORMA</h2>
            <p className="text-xs text-gray-500 font-mono">Conecte suas contas para execução real de ordens</p>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-4 mb-6">
          <button 
            onClick={() => setActivePlatform('BINANCE')}
            className={`flex-1 py-3 rounded-lg border flex items-center justify-center gap-2 transition-all ${
                activePlatform === 'BINANCE' 
                ? 'bg-yellow-900/20 border-yellow-500 text-yellow-400' 
                : 'bg-black/40 border-gray-800 text-gray-500 hover:border-gray-600'
            }`}
          >
              <Zap size={18} />
              <span className="font-bold">BINANCE</span>
              {status.BINANCE === 'CONNECTED' && <CheckCircle size={14} className="text-green-500 ml-2" />}
          </button>
          <button 
            onClick={() => setActivePlatform('CTRADER')}
            className={`flex-1 py-3 rounded-lg border flex items-center justify-center gap-2 transition-all ${
                activePlatform === 'CTRADER' 
                ? 'bg-green-900/20 border-green-500 text-green-400' 
                : 'bg-black/40 border-gray-800 text-gray-500 hover:border-gray-600'
            }`}
          >
              <Hexagon size={18} />
              <span className="font-bold">cTRADER</span>
              {status.CTRADER === 'CONNECTED' && <CheckCircle size={14} className="text-green-500 ml-2" />}
          </button>
      </div>

      {/* FORM AREA */}
      <div className="bg-black/30 p-6 rounded-lg border border-gray-800 relative overflow-hidden">
          {status[activePlatform] === 'CONNECTED' && (
              <div className="absolute top-0 right-0 p-2 bg-green-900/20 border-l border-b border-green-800 rounded-bl-lg">
                  <span className="text-[10px] text-green-400 font-bold flex items-center gap-1">
                      <ShieldCheck size={12} /> SECURE LINK
                  </span>
              </div>
          )}

          <div className="space-y-4">
              {activePlatform === 'BINANCE' ? (
                  <>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400 font-mono uppercase flex items-center gap-1">
                            <Key size={12} /> API Key
                        </label>
                        <input 
                            type="text" 
                            value={binanceKey}
                            onChange={(e) => setBinanceKey(e.target.value)}
                            placeholder="Insira sua Binance API Key"
                            className="w-full bg-black border border-gray-700 rounded px-4 py-3 text-sm text-white focus:border-yellow-500 focus:outline-none font-mono"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400 font-mono uppercase flex items-center gap-1">
                            <Lock size={12} /> API Secret
                        </label>
                        <input 
                            type="password" 
                            value={binanceSecret}
                            onChange={(e) => setBinanceSecret(e.target.value)}
                            placeholder="Insira seu Binance Secret"
                            className="w-full bg-black border border-gray-700 rounded px-4 py-3 text-sm text-white focus:border-yellow-500 focus:outline-none font-mono"
                        />
                    </div>
                  </>
              ) : (
                  <>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400 font-mono uppercase flex items-center gap-1">
                            <Key size={12} /> Account ID (cTrader)
                        </label>
                        <input 
                            type="text" 
                            value={ctraderId}
                            onChange={(e) => setCtraderId(e.target.value)}
                            placeholder="ID da Conta cTrader"
                            className="w-full bg-black border border-gray-700 rounded px-4 py-3 text-sm text-white focus:border-green-500 focus:outline-none font-mono"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400 font-mono uppercase flex items-center gap-1">
                            <Lock size={12} /> Open API Token
                        </label>
                        <input 
                            type="password" 
                            value={ctraderToken}
                            onChange={(e) => setCtraderToken(e.target.value)}
                            placeholder="Token de Acesso"
                            className="w-full bg-black border border-gray-700 rounded px-4 py-3 text-sm text-white focus:border-green-500 focus:outline-none font-mono"
                        />
                    </div>
                  </>
              )}

              {message && (
                  <div className={`p-3 rounded border text-xs flex items-center gap-2 ${
                      status[activePlatform] === 'CONNECTED' ? 'bg-green-900/20 border-green-800 text-green-400' : 'bg-red-900/20 border-red-800 text-red-400'
                  }`}>
                      {status[activePlatform] === 'CONNECTED' ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                      {message}
                  </div>
              )}

              <button 
                onClick={handleConnect}
                disabled={status[activePlatform] === 'CONNECTING'}
                className={`w-full py-3 rounded-lg font-bold text-sm mt-2 flex items-center justify-center gap-2 transition-all ${
                    activePlatform === 'BINANCE' 
                    ? 'bg-yellow-600 hover:bg-yellow-500 text-black' 
                    : 'bg-green-600 hover:bg-green-500 text-white'
                } disabled:opacity-50`}
              >
                  {status[activePlatform] === 'CONNECTING' ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                  {status[activePlatform] === 'CONNECTED' ? 'ATUALIZAR CREDENCIAIS' : 'CONECTAR & AUTENTICAR'}
              </button>
          </div>
      </div>
      
      <div className="mt-4 text-[10px] text-gray-500 text-center">
          <p>⚠️ As chaves são armazenadas localmente no seu dispositivo. O LEXTRADER não envia credenciais para servidores externos.</p>
          <p>Para cTrader, utilize Open API v2. Para Binance, habilite permissões de Futuros se necessário.</p>
      </div>
    </div>
  );
};

export default PlatformConnector;
