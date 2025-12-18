
import React, { useMemo, useState } from 'react';
import { MemoryEngram } from '../types';
import { Brain, Zap, Clock, Star, Share2, Activity, Database, Layers, Hash } from './Icons';

interface MemoryCoreProps {
  activeMemories?: MemoryEngram[];
  totalMemories: number;
}

const MemoryCore: React.FC<MemoryCoreProps> = ({ activeMemories = [], totalMemories }) => {
  const [selectedMemory, setSelectedMemory] = useState<string | null>(null);

  // Generate a visualization grid for memory density
  const gridCells = useMemo(() => {
    const cells = [];
    for (let i = 0; i < 120; i++) { // Increased density
        cells.push({
            id: i,
            active: Math.random() > 0.7, 
            intensity: Math.random(),
            pulseSpeed: Math.random() * 2 + 1
        });
    }
    return cells;
  }, []);

  // Extract unique concepts from active memories for the Concept Cloud
  const activeConcepts = useMemo(() => {
      const allTags = activeMemories.flatMap(m => m.conceptTags || []);
      const counts: Record<string, number> = {};
      allTags.forEach(tag => { counts[tag] = (counts[tag] || 0) + 1; });
      return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 12); // Top 12 concepts
  }, [activeMemories]);

  // Get details of selected memory
  const selectedEngram = activeMemories.find(m => m.id === selectedMemory) || activeMemories[0];

  return (
    <div className="bg-matrix-panel border border-matrix-border rounded-lg p-4 relative overflow-hidden flex flex-col gap-4">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent pointer-events-none"></div>
      
      {/* HEADER */}
      <div className="flex justify-between items-center border-b border-gray-800 pb-2">
        <div>
            <h3 className="text-sm font-bold text-indigo-400 flex items-center gap-2">
            <Brain size={16} className="animate-pulse" />
            CÓRTEX DE MEMÓRIA EXPANDIDO
            </h3>
            <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                Plasticidade: {(0.8 + Math.random() * 0.2).toFixed(2)} | Entropia: Baixa
            </p>
        </div>
        <div className="text-right">
           <div className="text-[10px] text-gray-500 font-mono">CAPACIDADE TOTAL</div>
           <div className="text-lg font-mono text-white leading-none">{totalMemories.toLocaleString()} <span className="text-xs text-gray-600">engramas</span></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
         
         {/* COL 1: SYNAPTIC LATTICE (The Grid) */}
         <div className="space-y-3">
            <div className="flex justify-between items-center">
                <div className="text-[10px] text-gray-500 uppercase font-mono flex items-center gap-1">
                    <Activity size={10} /> Densidade Sináptica
                </div>
                <span className="text-[9px] text-green-500 animate-pulse">ONLINE</span>
            </div>
            
            <div className="grid grid-cols-10 gap-0.5 h-32 bg-black/20 p-1 rounded border border-gray-800">
                {gridCells.map(cell => (
                    <div 
                        key={cell.id} 
                        className={`rounded-[1px] transition-all duration-1000 ${
                            cell.active ? 'bg-indigo-500' : 'bg-gray-900'
                        }`}
                        style={{ 
                            opacity: cell.active ? cell.intensity : 0.1,
                            animation: cell.active ? `pulse ${cell.pulseSpeed}s cubic-bezier(0.4, 0, 0.6, 1) infinite` : 'none'
                        }}
                    ></div>
                ))}
            </div>

            {/* CONCEPT CLOUD */}
            <div className="bg-indigo-900/10 rounded p-2 border border-indigo-900/30">
                <div className="text-[10px] text-indigo-300 mb-2 font-bold flex items-center gap-1">
                    <Share2 size={10} /> CONCEITOS ATIVOS (Nuvem Semântica)
                </div>
                <div className="flex flex-wrap gap-1.5">
                    {activeConcepts.map(([tag, count], idx) => (
                        <span key={idx} className={`text-[9px] px-1.5 py-0.5 rounded border flex items-center gap-1 ${
                            tag.startsWith('CONCEPT:') 
                            ? 'bg-purple-900/40 text-purple-300 border-purple-700' 
                            : 'bg-gray-800 text-gray-400 border-gray-700'
                        }`}>
                            {tag.replace('CONCEPT:', '')}
                            <span className="opacity-50 text-[8px]">x{count}</span>
                        </span>
                    ))}
                    {activeConcepts.length === 0 && <span className="text-[9px] text-gray-600 italic">Nenhum conceito abstrato formado ainda.</span>}
                </div>
            </div>
         </div>

         {/* COL 2: ACTIVE STREAM (Interactive List) */}
         <div className="flex flex-col h-full bg-black/20 rounded border border-gray-800 overflow-hidden">
            <div className="p-2 border-b border-gray-800 bg-gray-900/50 flex justify-between items-center">
                <div className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1">
                    <Layers size={10} /> Fluxo de Memória
                </div>
                <span className="text-[9px] text-indigo-400">{activeMemories.length} ativos</span>
            </div>
            
            <div className="flex-1 overflow-y-auto scrollbar-thin p-1 space-y-1">
                {activeMemories.length > 0 ? (
                    activeMemories.map((mem) => (
                        <button 
                            key={mem.id} 
                            onClick={() => setSelectedMemory(mem.id)}
                            className={`w-full p-2 rounded flex justify-between items-center text-left transition-all ${
                                selectedMemory === mem.id 
                                ? 'bg-indigo-900/30 border border-indigo-500/50' 
                                : 'bg-transparent hover:bg-white/5 border border-transparent'
                            }`}
                        >
                            <div className="w-full">
                                <div className={`text-[10px] font-bold flex items-center gap-1 truncate ${mem.isApex ? 'text-yellow-400' : 'text-gray-300'}`}>
                                    {mem.isApex && <Star size={8} fill="currentColor" />}
                                    {mem.patternName.replace('[APEX] ', '')}
                                </div>
                                <div className="flex justify-between mt-1">
                                    <span className={`text-[8px] px-1 rounded ${mem.outcome === 'SUCCESS' ? 'bg-green-900/30 text-green-500' : 'bg-red-900/30 text-red-500'}`}>
                                        {mem.outcome}
                                    </span>
                                    <span className="text-[8px] text-gray-600 font-mono">
                                        {(mem.synapticStrength || 0.5).toFixed(2)} STR
                                    </span>
                                </div>
                            </div>
                        </button>
                    ))
                ) : (
                    <div className="text-[10px] text-gray-600 italic text-center py-10">
                        Buffer vazio. Aguardando input de mercado.
                    </div>
                )}
            </div>
         </div>

         {/* COL 3: INSPECTOR (Vector Visualization) */}
         <div className="flex flex-col h-full bg-gray-900/30 rounded border border-gray-800 p-3 relative">
            <div className="text-[10px] text-gray-400 font-bold uppercase mb-3 flex items-center gap-1">
                <Database size={10} /> Inspetor de Engrama
            </div>

            {selectedEngram ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-2">
                    <div>
                        <div className="text-xs text-white font-bold mb-1 truncate">{selectedEngram.patternName}</div>
                        <div className="flex items-center gap-2 text-[9px] text-gray-500">
                            <Clock size={8} /> {new Date(selectedEngram.timestamp).toLocaleTimeString()}
                            <span className="text-indigo-400">ID: {selectedEngram.id.substring(0,6)}</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="text-[9px] text-gray-500 font-mono">ASSINATURA VETORIAL</div>
                        {/* Vector Visualization Bars */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[9px]">
                                <span className="text-purple-400">RSI</span>
                                <span className="text-white">{selectedEngram.marketVector[0].toFixed(1)}</span>
                            </div>
                            <div className="w-full bg-gray-800 h-1 rounded overflow-hidden">
                                <div className="h-full bg-purple-500" style={{ width: `${Math.min(100, selectedEngram.marketVector[0])}%` }}></div>
                            </div>

                            <div className="flex items-center justify-between text-[9px]">
                                <span className="text-blue-400">Volatilidade</span>
                                <span className="text-white">{selectedEngram.marketVector[2].toFixed(1)}</span>
                            </div>
                            <div className="w-full bg-gray-800 h-1 rounded overflow-hidden">
                                <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, selectedEngram.marketVector[2] * 20)}%` }}></div>
                            </div>

                            <div className="flex items-center justify-between text-[9px]">
                                <span className="text-emerald-400">Tendência</span>
                                <span className="text-white">{selectedEngram.marketVector[1].toFixed(1)}</span>
                            </div>
                            <div className="w-full bg-gray-800 h-1 rounded overflow-hidden">
                                <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, Math.abs(selectedEngram.marketVector[1] * 10))}%` }}></div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-2 border-t border-gray-800">
                        <div className="text-[9px] text-gray-500 font-mono mb-1">XP GERADO</div>
                        <div className="flex items-center gap-1 text-yellow-400 font-mono text-sm">
                            <Hash size={12} /> +{selectedEngram.xpValue || 10}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center text-[10px] text-gray-600 text-center">
                    Selecione um engrama para decodificar o vetor.
                </div>
            )}
         </div>

      </div>
    </div>
  );
};

export default MemoryCore;
