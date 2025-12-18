
import React, { useState, useEffect } from 'react';
import { TradingSignal, TradingAction } from '../services/learningService';
import { microScalper } from '../AI_Geral/microScalper'; 
import { Activity, Radio, AlertTriangle, Target, Sliders, Zap, Clock, Cpu } from './Icons';

interface OpportunityScannerProps {
  signals: TradingSignal[];
}

const OpportunityScanner: React.FC<OpportunityScannerProps> = ({ signals: propSignals }) => {
  const [minConfidence, setMinConfidence] = useState(0.60);
  const [mode, setMode] = useState<'STANDARD' | 'HFT_MICRO'>('STANDARD');
  const [microSignals, setMicroSignals] = useState<TradingSignal[]>([]);
  const [processingLoad, setProcessingLoad] = useState(0);

  // Poll Micro Scalper when in HFT mode
  useEffect(() => {
    let interval: any;
    if (mode === 'HFT_MICRO') {
        const scanMicro = async () => {
            setProcessingLoad(Math.floor(Math.random() * 20) + 70); // Simulate high load visualization
            // Simulate fetching current price/vol from a global state or prop (mocked here for the component)
            const currentPrice = 64200 + (Math.random() * 100);
            const vol = 1.5 + (Math.random() * 2);
            
            const newMicros = await microScalper.scan(currentPrice, vol);
            setMicroSignals(prev => [...newMicros, ...prev].slice(0, 20)); // Keep last 20
            setProcessingLoad(Math.floor(Math.random() * 10) + 10); // Cool down
        };

        scanMicro();
        interval = setInterval(scanMicro, 2000); // 2 second rapid scan
    }
    return () => clearInterval(interval);
  }, [mode]);

  const activeSignals = mode === 'STANDARD' ? propSignals : microSignals;
  const filteredSignals = activeSignals.filter(s => s.confidence >= minConfidence);

  return (
    <div className="bg-matrix-panel border border-matrix-border rounded-lg p-4 h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 right-0 p-3 opacity-10">
        <Radio size={64} className="animate-ping" />
      </div>
      
      <div className="flex justify-between items-start mb-4 z-10 relative">
        <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
            <Target size={16} className={mode === 'HFT_MICRO' ? "text-purple-500 animate-pulse" : "text-quantum-500"} />
            SCANNER {mode === 'HFT_MICRO' ? 'HFT / MICRO' : 'PADRÃO'}
            </h3>
            
            {/* Mode Toggle */}
            <div className="flex bg-black/40 rounded p-0.5 border border-gray-800">
                <button 
                    onClick={() => setMode('STANDARD')}
                    className={`px-2 py-0.5 text-[9px] font-bold rounded transition-colors ${mode === 'STANDARD' ? 'bg-quantum-900/50 text-quantum-400' : 'text-gray-600 hover:text-gray-400'}`}
                >
                    MACRO
                </button>
                <button 
                    onClick={() => setMode('HFT_MICRO')}
                    className={`px-2 py-0.5 text-[9px] font-bold rounded transition-colors ${mode === 'HFT_MICRO' ? 'bg-purple-900/50 text-purple-400 animate-pulse' : 'text-gray-600 hover:text-gray-400'}`}
                >
                    MICRO (1-5m)
                </button>
            </div>
        </div>
        
        <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2 bg-black/40 border border-gray-800 rounded px-2 py-1">
                <Sliders size={10} className="text-quantum-400" />
                <input 
                    type="range" 
                    min="0" 
                    max="0.99" 
                    step="0.01" 
                    value={minConfidence}
                    onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
                    className="w-16 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-quantum-500"
                />
                <span className="text-[10px] font-mono text-quantum-400 min-w-[24px] text-right">
                    {(minConfidence * 100).toFixed(0)}%
                </span>
            </div>
        </div>
      </div>

      {mode === 'HFT_MICRO' && (
          <div className="mb-2 flex items-center gap-2 text-[9px] font-mono text-gray-500 border-b border-gray-800 pb-2">
              <Cpu size={10} className={processingLoad > 80 ? 'text-red-500 animate-spin' : 'text-green-500'} />
              <span>CARGA DE CPU:</span>
              <div className="flex-1 h-1.5 bg-gray-900 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${processingLoad > 80 ? 'bg-red-500' : 'bg-purple-500'}`} 
                    style={{ width: `${processingLoad}%` }}
                  ></div>
              </div>
              <span>{processingLoad}%</span>
          </div>
      )}

      <div className="flex-1 overflow-y-auto pr-1 space-y-2 relative z-10 scrollbar-thin">
        {filteredSignals.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-3">
             <Activity size={32} className="animate-pulse opacity-50" />
             <div className="text-xs text-center font-mono">
                {activeSignals.length > 0 
                    ? `NENHUM SINAL ACIMA DE ${(minConfidence * 100).toFixed(0)}%` 
                    : <>ESCANEANDO {mode === 'HFT_MICRO' ? 'MICRO-ESTRUTURA...' : 'MULTIVERSO...'}<br/>CALCULANDO PROBABILIDADES</>
                }
             </div>
          </div>
        ) : (
          filteredSignals.map((signal, idx) => (
            <div key={idx} className={`group bg-black/40 border p-3 rounded hover:border-opacity-100 transition-all cursor-pointer relative overflow-hidden animate-in fade-in slide-in-from-bottom-2 ${
                mode === 'HFT_MICRO' ? 'border-purple-900/30 hover:border-purple-500' : 'border-gray-800 hover:border-quantum-500/50'
            }`}>
               <div className={`absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity ${
                   mode === 'HFT_MICRO' ? 'via-purple-500' : 'via-quantum-500'
               }`}></div>
               
               <div className="flex justify-between items-start mb-2">
                  <div>
                     <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{signal.symbol}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                           signal.action === TradingAction.BUY ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
                        }`}>
                           {signal.action}
                        </span>
                        
                        {/* HFT Timeframe Badge */}
                        {mode === 'HFT_MICRO' && (
                            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-gray-800 text-gray-300 border border-gray-600">
                                <Clock size={8} />
                                {signal.confidence > 0.84 ? '1M FLASH' : (signal.confidence > 0.74 ? '3M REV' : '5M TREND')}
                            </span>
                        )}
                     </div>
                     <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                        Alvo: <span className="text-gray-300">{signal.priceTarget.toFixed(2)}</span>
                     </div>
                  </div>
                  <div className="text-right">
                     <div className={`text-xl font-bold font-mono ${mode === 'HFT_MICRO' ? 'text-purple-300' : 'text-white'}`}>
                        {(signal.confidence * 100).toFixed(0)}%
                     </div>
                     <div className="text-[9px] text-gray-500 uppercase">
                        {mode === 'HFT_MICRO' ? 'Entropia Baixa' : 'Confiança'}
                     </div>
                  </div>
               </div>

               <div className="flex items-center gap-4 text-[10px] border-t border-gray-800 pt-2 mt-2">
                  <div className="flex items-center gap-1 text-gray-400">
                     <Activity size={10} />
                     {mode === 'HFT_MICRO' 
                        ? `Micro-Score: ${(signal.quantumMetrics?.microStructureScore || 0).toFixed(2)}` 
                        : `Emaranhamento: ${(signal.quantumMetrics?.entanglement || 0).toFixed(2)}`
                     }
                  </div>
                  <div className={`flex items-center gap-1 ${
                     signal.riskLevel === 'EXTREME' ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                     <AlertTriangle size={10} />
                     {signal.riskLevel}
                  </div>
               </div>
            </div>
          ))
        )}
      </div>
      
      <div className="mt-4 pt-2 border-t border-matrix-border text-[9px] text-gray-500 font-mono flex justify-between">
         <span>TOTAL: {activeSignals.length} | FILTRADOS: {filteredSignals.length}</span>
         <span className={`animate-pulse ${mode === 'HFT_MICRO' ? 'text-purple-400' : 'text-quantum-400'}`}>
             {mode === 'HFT_MICRO' ? 'HFT ONLINE' : 'AO VIVO'}
         </span>
      </div>
    </div>
  );
};

export default OpportunityScanner;
