
import React, { useEffect, useState } from 'react';
import { 
  Cpu, Globe, ShieldCheck, Zap, Activity, Brain, Layers, ScanEye, Lock, Network, Wallet, Database, Share2, GitBranch, Lightbulb, Dna, Server, Sparkles, Scale, BookOpen, Target, FileText, Monitor
} from 'lucide-react';
import { DeepReasoning, LayerActivity, OracleSignal, SystemSpecs } from '../types';
import MemoryCore from './MemoryCore';
import { getMemoryStatistics } from '../AI_Geral/CognitiveServices';
import { ASI } from '../AI_Geral/ASI_Core'; 
import { systemBridge } from '../AI_Geral/SystemBridge';

interface DeepDiagnosticsProps {
  layers: LayerActivity[];
  reasoning: DeepReasoning | null;
}

const OracleBadge: React.FC<{ signal: OracleSignal }> = ({ signal }) => {
    let color = 'text-gray-400';
    let borderColor = 'border-gray-700';
    let bgColor = 'bg-gray-900';

    if (signal.signal === 'BUY') {
        color = 'text-green-400';
        borderColor = 'border-green-800';
        bgColor = 'bg-green-900/20';
    } else if (signal.signal === 'SELL') {
        color = 'text-red-400';
        borderColor = 'border-red-800';
        bgColor = 'bg-red-900/20';
    } else {
        color = 'text-yellow-400';
        borderColor = 'border-yellow-800';
        bgColor = 'bg-yellow-900/20';
    }

    return (
        <div className={`p-2 rounded border ${borderColor} ${bgColor} flex flex-col gap-1`}>
            <div className="flex justify-between items-center">
                <span className={`text-[9px] font-bold ${color}`}>{signal.source}</span>
                <span className={`text-[8px] px-1 rounded ${signal.signal === 'BUY' ? 'bg-green-500 text-black' : signal.signal === 'SELL' ? 'bg-red-500 text-black' : 'bg-yellow-500 text-black'}`}>
                    {signal.signal}
                </span>
            </div>
            <div className="text-[8px] text-gray-400 font-mono truncate">{signal.metadata}</div>
            <div className="w-full bg-gray-800 h-0.5 rounded-full mt-1">
                <div className={`h-full ${color === 'text-green-400' ? 'bg-green-500' : color === 'text-red-400' ? 'bg-red-500' : 'bg-yellow-500'}`} style={{ width: `${signal.score}%` }}></div>
            </div>
        </div>
    );
};

const DeepDiagnostics: React.FC<DeepDiagnosticsProps> = ({ layers, reasoning }) => {
  const memStats = getMemoryStatistics();
  const asiStatus = ASI.getStatus(); 
  const [specs, setSpecs] = useState<SystemSpecs | null>(null);

  useEffect(() => {
      systemBridge.analyzeHardware().then(setSpecs);
  }, []);

  const getTierColor = (tier?: string) => {
      switch(tier) {
          case 'ECO': return 'text-yellow-500';
          case 'TURBO': return 'text-purple-500';
          case 'QUANTUM_NATIVE': return 'text-cyan-400 animate-pulse';
          default: return 'text-blue-400';
      }
  };

  return (
    <div className="space-y-4">
      
      {/* ASI CORE VISUALIZER - 5 PILLARS */}
      <div className="bg-matrix-panel border border-matrix-border rounded-lg p-4 relative overflow-hidden">
         <div className="absolute top-0 right-0 p-4 opacity-10">
            <Brain size={64} className="text-white animate-pulse-slow" />
         </div>
         <div className="flex justify-between items-start mb-4">
             <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap size={16} className="text-quantum-400" />
                ASI: INFRAESTRUTURA GLOBAL (V9.0)
             </h3>
             
             {/* Hardware Badge */}
             {specs && (
                 <div className="flex items-center gap-2 text-[9px] border border-gray-700 bg-black/50 px-2 py-1 rounded">
                     <Monitor size={10} className={getTierColor(specs.tier)} />
                     <span className="text-gray-400 font-mono">
                         {specs.cores} CORES | {specs.tier} MODE
                     </span>
                 </div>
             )}
         </div>
         
         <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <div className="bg-black/30 border border-gray-800 rounded p-2 flex flex-col items-center text-center group hover:border-purple-500/50 transition-colors">
                <Brain size={16} className="text-purple-400 mb-1 group-hover:scale-110 transition-transform" />
                <div className="text-[9px] font-bold text-gray-300">MULTIMODAL</div>
                <div className="text-[8px] text-gray-500">Fusão Total</div>
                <div className="w-full bg-gray-900 h-1 mt-2 rounded-full overflow-hidden"><div className="h-full bg-purple-500 w-[95%]"></div></div>
            </div>
            <div className="bg-black/30 border border-gray-800 rounded p-2 flex flex-col items-center text-center group hover:border-blue-500/50 transition-colors">
                <Dna size={16} className="text-blue-400 mb-1 group-hover:scale-110 transition-transform" />
                <div className="text-[9px] font-bold text-gray-300">EVOLUÇÃO</div>
                <div className="text-[8px] text-gray-500">Contínua</div>
                <div className="w-full bg-gray-900 h-1 mt-2 rounded-full overflow-hidden"><div className="h-full bg-blue-500 w-[88%] animate-pulse"></div></div>
            </div>
            <div className="bg-black/30 border border-gray-800 rounded p-2 flex flex-col items-center text-center group hover:border-yellow-500/50 transition-colors">
                <Globe size={16} className="text-yellow-400 mb-1 group-hover:scale-110 transition-transform" />
                <div className="text-[9px] font-bold text-gray-300">ARBITRAGEM</div>
                <div className="text-[8px] text-gray-500">Global</div>
                <div className="w-full bg-gray-900 h-1 mt-2 rounded-full overflow-hidden"><div className="h-full bg-yellow-500 w-[92%]"></div></div>
            </div>
            
            {/* ENHANCED INFRASTRUCTURE PILLAR */}
            <div className="bg-black/30 border border-cyan-500/30 rounded p-2 flex flex-col items-center text-center group hover:border-cyan-500 transition-colors relative overflow-hidden">
                <div className="absolute inset-0 bg-cyan-900/10 animate-pulse"></div>
                <Server size={16} className="text-cyan-400 mb-1 group-hover:scale-110 transition-transform relative z-10" />
                <div className="text-[9px] font-bold text-gray-300 relative z-10">GRID HFT</div>
                <div className="text-[8px] text-cyan-300 font-mono relative z-10">{asiStatus.infrastructure.activeNodes.toLocaleString()} Nós</div>
                <div className="w-full bg-gray-900 h-1 mt-2 rounded-full overflow-hidden relative z-10"><div className="h-full bg-cyan-500 w-[100%] animate-pulse"></div></div>
            </div>

            <div className="bg-black/30 border border-gray-800 rounded p-2 flex flex-col items-center text-center group hover:border-green-500/50 transition-colors">
                <ShieldCheck size={16} className="text-green-400 mb-1 group-hover:scale-110 transition-transform" />
                <div className="text-[9px] font-bold text-gray-300">COMPLIANCE</div>
                <div className="text-[8px] text-gray-500">Auditável</div>
                <div className="w-full bg-gray-900 h-1 mt-2 rounded-full overflow-hidden"><div className="h-full bg-green-500 w-[100%]"></div></div>
            </div>
         </div>
         
         {/* AGI TRAITS VISUALIZATION */}
         <div className="mt-4 pt-3 border-t border-gray-800 grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="flex items-center gap-1.5" title="Execução Instantânea">
               <Zap size={10} className="text-pink-400" />
               <div className="text-[8px] text-gray-400">EXECUÇÃO ULTRA-RÁPIDA</div>
               <div className="text-[8px] text-pink-400 font-mono ml-auto">{asiStatus.traits.executionSpeed}</div>
            </div>
            <div className="flex items-center gap-1.5" title="Influência Estratégica">
               <Target size={10} className="text-blue-400" />
               <div className="text-[8px] text-gray-400">INFLUÊNCIA ESTRATÉGICA</div>
               <div className="text-[8px] text-blue-400 font-mono ml-auto">Alpha: {asiStatus.traits.strategicInfluence.toFixed(0)}</div>
            </div>
            <div className="flex items-center gap-1.5" title="Conformidade Regulatória">
               <FileText size={10} className="text-green-400" />
               <div className="text-[8px] text-gray-400">COMPLIANCE TOTAL</div>
               <div className="text-[8px] text-green-400 font-mono ml-auto">{asiStatus.traits.complianceStatus}</div>
            </div>
            <div className="flex items-center gap-1.5" title="Previsão de Tendências">
               <ScanEye size={10} className="text-yellow-400" />
               <div className="text-[8px] text-gray-400">PREVISÃO CENÁRIOS</div>
               <div className="text-[8px] text-yellow-400 font-mono ml-auto">{asiStatus.realityEngine.scenariosRun.toLocaleString()}</div>
            </div>
         </div>
      </div>

      {/* NEURAL LAYERS */}
      <div className="bg-matrix-panel border border-matrix-border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
          <Cpu size={14} className="text-quantum-500" />
          ARQUITETURA NEURAL ATIVA
        </h3>
        <div className="space-y-3">
          {layers.map(layer => (
              <div key={layer.id} className="relative group">
                  <div className="flex justify-between text-[10px] text-gray-400 mb-1 font-mono">
                      <span className="flex items-center gap-2">
                        {layer.id}
                      </span>
                      <span className={
                        layer.status === 'OPTIMIZING' ? 'text-green-400' : 
                        layer.status === 'EXECUTING' ? 'text-yellow-400' :
                        layer.status === 'SECURING' ? 'text-red-400 animate-pulse' :
                        layer.status === 'TRANSCENDING' ? 'text-purple-400 animate-pulse' :
                        'text-gray-600'
                      }>
                          {layer.details || layer.status}
                      </span>
                  </div>
                  <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden">
                      <div 
                          className={`h-full transition-all duration-300 ${
                              layer.status === 'OPTIMIZING' ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 
                              layer.status === 'EXECUTING' ? 'bg-yellow-500 shadow-[0_0_10px_#eab308]' :
                              layer.status === 'SECURING' ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' :
                              layer.status === 'TRANSCENDING' ? 'bg-purple-500 shadow-[0_0_15px_#a855f7]' :
                              layer.status === 'PROCESSING' ? 'bg-quantum-500 animate-pulse' : 'bg-gray-700'
                          }`}
                          style={{ width: `${layer.load}%` }}
                      ></div>
                  </div>
              </div>
          ))}
        </div>
      </div>

      <MemoryCore 
        activeMemories={reasoning?.activeMemories} 
        totalMemories={memStats.total} 
      />

      {reasoning && (
        <div className="grid grid-cols-2 gap-4">
          
          {reasoning.oracleConsensus && (
             <div className="col-span-2 bg-matrix-panel border border-blue-900/50 bg-blue-900/5 rounded-lg p-3 relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase text-blue-400">
                        <Database size={12} /> ORÁCULO MULTIDIMENSIONAL
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono">Consenso: {reasoning.oracleConsensus.overallScore.toFixed(0)}/100</div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {reasoning.oracleConsensus.signals.map((signal, idx) => (
                        <OracleBadge key={idx} signal={signal} />
                    ))}
                </div>
             </div>
          )}

          {reasoning.asiMatrix && (
             <div className="col-span-2 bg-matrix-panel border border-purple-900/50 bg-purple-900/5 rounded-lg p-3 relative overflow-hidden">
                <div className="flex items-center gap-2 text-xs font-bold uppercase mb-2 text-purple-400">
                   <Lightbulb size={12} /> SINGULARIDADE & PREVISÃO
                </div>
                <div className="grid grid-cols-2 gap-4 text-[10px] font-mono text-gray-300">
                   <div>
                      <span className="text-gray-500 block">Convergência Temporal</span>
                      <span className="text-white">{reasoning.asiMatrix.timelineConvergence.toFixed(2)}</span>
                   </div>
                   <div>
                      <span className="text-gray-500 block">Política & Clima</span>
                      <span className="text-white">{asiStatus.realityEngine.politicalImpact} / {asiStatus.realityEngine.climateFactor}</span>
                   </div>
                   <div className="col-span-2 text-purple-300 border-t border-purple-800/50 pt-1 mt-1 flex justify-between">
                      <span>Link Causal: {reasoning.asiMatrix.causalLink}</span>
                      <span className="text-xs text-cyan-400">{asiStatus.infrastructure.totalComputePower}</span>
                   </div>
                </div>
             </div>
          )}

          <div className="col-span-2 bg-matrix-panel border border-matrix-border rounded-lg p-3">
             <div className="flex items-center gap-2 text-[10px] text-gray-400 mb-2 uppercase tracking-wider">
               <Layers size={12} /> Análise Neural Profunda
             </div>
             <div className="grid grid-cols-2 gap-4 text-[10px]">
                <div>
                   <span className="text-gray-600 block">Arquitetura</span>
                   <span className="text-quantum-400 font-mono">{reasoning.neuralAnalysis.modelArchitecture}</span>
                </div>
                <div>
                   <span className="text-gray-600 block">Horizonte Preditivo</span>
                   <span className="text-quantum-400 font-mono">{reasoning.neuralAnalysis.predictionHorizon}</span>
                </div>
                <div>
                   <span className="text-gray-600 block">Lógica Dominante</span>
                   <span className="text-gray-300 font-mono">{reasoning.neuralAnalysis.dominantLogic}</span>
                </div>
                <div>
                   <span className="text-gray-600 block">Geração Evolutiva</span>
                   <span className="text-gray-300 font-mono">{reasoning.neuralAnalysis.trainingEpochs}</span>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeepDiagnostics;
