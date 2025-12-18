
import React, { useState, useEffect, useRef } from 'react';
import { 
  Brain, 
  Activity, 
  GitBranch, 
  Layers, 
  Zap, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Play, 
  RotateCcw,
  Target,
  Cpu,
  Sliders,
  Terminal,
  BarChart2,
  Shield,
  Search,
  ThumbsUp,
  ThumbsDown,
  Minus,
  RefreshCw
} from './Icons';

// --- TYPES ---

type AlgorithmType = "ML" | "STATISTICAL" | "HYBRID" | "QUANTUM" | "ENSEMBLE";
type NodeStatus = "IDLE" | "PROCESSING" | "COMPLETED" | "WAITING" | "ERROR";
type DecisionType = "BUY" | "SELL" | "HOLD" | "CLOSE";

interface DecisionAlgorithm {
  id: string;
  name: string;
  type: AlgorithmType;
  description: string;
  accuracy: number;
  weight: number; // Importance in consensus
  lastVote: DecisionType | null;
  isActive: boolean;
  specialization: string[];
}

interface DecisionNode {
  id: string;
  name: string;
  type: 'DATA' | 'PROCESS' | 'DECISION';
  status: NodeStatus;
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'CRITICAL' | 'SUCCESS';
  message: string;
}

interface MarketDecision {
  id: string;
  timestamp: string;
  algorithm: string;
  decision: DecisionType;
  confidence: number;
  reasoning: string;
  factors: string[];
  risk: number;
  expectedReturn: number;
  timeframe: string;
}

// --- INITIAL DATA ---

const INITIAL_ALGORITHMS: DecisionAlgorithm[] = [
  { id: "ensemble", name: "Ensemble Multi-Algoritmo", type: "ENSEMBLE", description: "Meta-voting system", accuracy: 94.7, weight: 1.5, lastVote: null, isActive: true, specialization: ["Consenso", "Meta-Learning"] },
  { id: "quantum_nn", name: "Rede Neural Quântica", type: "QUANTUM", description: "Qubit probability mapping", accuracy: 91.3, weight: 1.3, lastVote: null, isActive: true, specialization: ["Superposição", "Entropia"] },
  { id: "adaptive_lstm", name: "LSTM Adaptativo Profundo", type: "ML", description: "Time-series forecasting", accuracy: 88.9, weight: 1.0, lastVote: null, isActive: true, specialization: ["Tendência", "Memória"] },
  { id: "reinforcement_agent", name: "Agente de Reforço (RL)", type: "ML", description: "Reward maximization", accuracy: 89.7, weight: 1.1, lastVote: null, isActive: true, specialization: ["Q-Learning", "Policy"] },
  { id: "genetic_algo", name: "Algoritmo Genético", type: "HYBRID", description: "Evolutionary optimization", accuracy: 87.1, weight: 0.9, lastVote: null, isActive: false, specialization: ["Mutação", "Seleção"] },
  { id: "stat_arb", name: "Arbitragem Estatística", type: "STATISTICAL", description: "Mean reversion math", accuracy: 86.4, weight: 0.8, lastVote: null, isActive: true, specialization: ["Cointegração"] }
];

const PIPELINE_STEPS: DecisionNode[] = [
  { id: "1", name: "Ingestão de Dados", type: 'DATA', status: 'IDLE' },
  { id: "2", name: "Normalização", type: 'PROCESS', status: 'IDLE' },
  { id: "3", name: "Extração de Features", type: 'PROCESS', status: 'IDLE' },
  { id: "4", name: "Inferência Paralela", type: 'PROCESS', status: 'IDLE' },
  { id: "5", name: "Matriz de Consenso", type: 'DECISION', status: 'IDLE' },
  { id: "6", name: "Validação de Risco", type: 'DECISION', status: 'IDLE' },
  { id: "7", name: "Execução Final", type: 'DECISION', status: 'IDLE' }
];

// --- COMPONENTS ---

const TerminalLog: React.FC<{ logs: LogEntry[] }> = ({ logs }) => {
    const endRef = useRef<HTMLDivElement>(null);
    useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [logs]);

    return (
        <div className="bg-black border border-gray-800 rounded-lg p-3 h-48 overflow-y-auto font-mono text-[10px] space-y-1 shadow-inner">
            {logs.length === 0 && <span className="text-gray-600">Aguardando inicialização do sistema...</span>}
            {logs.map(log => (
                <div key={log.id} className="flex gap-2">
                    <span className="text-gray-600">[{log.timestamp.split(' ')[1]}]</span>
                    <span className={`font-bold ${
                        log.level === 'INFO' ? 'text-blue-400' :
                        log.level === 'WARN' ? 'text-yellow-400' :
                        log.level === 'CRITICAL' ? 'text-red-500' : 'text-green-400'
                    }`}>
                        {log.level}:
                    </span>
                    <span className="text-gray-300">{log.message}</span>
                </div>
            ))}
            <div ref={endRef} />
        </div>
    );
};

const ConsensusMeter: React.FC<{ algorithms: DecisionAlgorithm[] }> = ({ algorithms }) => {
    const activeAlgos = algorithms.filter(a => a.isActive && a.lastVote);
    const totalWeight = activeAlgos.reduce((acc, a) => acc + a.weight, 0);
    
    let bullScore = 0;
    let bearScore = 0;

    activeAlgos.forEach(a => {
        if (a.lastVote === 'BUY') bullScore += a.weight;
        if (a.lastVote === 'SELL') bearScore += a.weight;
    });

    const bullPct = totalWeight > 0 ? (bullScore / totalWeight) * 100 : 0;
    const bearPct = totalWeight > 0 ? (bearScore / totalWeight) * 100 : 0;
    const neutralPct = 100 - bullPct - bearPct;

    return (
        <div className="bg-matrix-panel border border-matrix-border p-4 rounded-lg">
            <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                <Activity size={12} /> Matriz de Consenso Ponderado
            </h4>
            
            <div className="flex h-4 rounded-full overflow-hidden mb-2 bg-gray-800">
                <div className="bg-green-500 transition-all duration-500" style={{ width: `${bullPct}%` }} title="Bullish"></div>
                <div className="bg-gray-600 transition-all duration-500" style={{ width: `${neutralPct}%` }} title="Neutral"></div>
                <div className="bg-red-500 transition-all duration-500" style={{ width: `${bearPct}%` }} title="Bearish"></div>
            </div>
            
            <div className="flex justify-between text-[10px] font-mono font-bold">
                <span className="text-green-400">COMPRA: {bullPct.toFixed(1)}%</span>
                <span className="text-gray-400">NEUTRO</span>
                <span className="text-red-400">VENDA: {bearPct.toFixed(1)}%</span>
            </div>

            <div className="mt-4 space-y-2">
                {activeAlgos.map(algo => (
                    <div key={algo.id} className="flex items-center justify-between text-[10px] border-b border-gray-800 pb-1">
                        <span className="text-gray-300">{algo.name}</span>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-600 text-[8px]">Peso: {algo.weight.toFixed(1)}</span>
                            <span className={`px-1.5 py-0.5 rounded font-bold ${
                                algo.lastVote === 'BUY' ? 'bg-green-900/50 text-green-400' :
                                algo.lastVote === 'SELL' ? 'bg-red-900/50 text-red-400' :
                                'bg-yellow-900/50 text-yellow-400'
                            }`}>
                                {algo.lastVote}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const DecisionEngine: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'CONSOLE' | 'HISTORY'>('CONSOLE');
  const [algorithms, setAlgorithms] = useState<DecisionAlgorithm[]>(INITIAL_ALGORITHMS);
  const [pipeline, setPipeline] = useState<DecisionNode[]>(PIPELINE_STEPS);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [decisions, setDecisions] = useState<MarketDecision[]>([]);
  
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Hyperparameters
  const [aggressiveness, setAggressiveness] = useState(50);
  const [riskTolerance, setRiskTolerance] = useState(30);

  const addLog = (message: string, level: LogEntry['level'] = 'INFO') => {
      setLogs(prev => [...prev, {
          id: Math.random().toString(36),
          timestamp: new Date().toLocaleTimeString(),
          level,
          message
      }].slice(-50)); // Keep last 50 logs
  };

  const runDecisionCycle = async () => {
      if (isRunning) return;
      setIsRunning(true);
      setProgress(0);
      setLogs([]); // Clear previous logs
      
      addLog("Iniciando ciclo de decisão quântica...", 'INFO');

      // Reset Pipeline
      setPipeline(prev => prev.map(n => ({ ...n, status: 'IDLE' })));

      const totalSteps = pipeline.length;
      
      for (let i = 0; i < totalSteps; i++) {
          setPipeline(prev => prev.map((n, idx) => 
              idx === i ? { ...n, status: 'PROCESSING' } : idx < i ? { ...n, status: 'COMPLETED' } : n
          ));
          
          const step = pipeline[i];
          addLog(`Executando: ${step.name}`, 'INFO');
          
          await new Promise(r => setTimeout(r, 600)); // Simulate work

          // Simulate specific step logic
          if (step.id === "4") { // Inferência
              setAlgorithms(prev => prev.map(algo => ({
                  ...algo,
                  lastVote: algo.isActive ? (Math.random() > 0.5 ? 'BUY' : Math.random() > 0.5 ? 'SELL' : 'HOLD') : null
              })));
              addLog("Modelos convergindo em probabilidades...", 'INFO');
          }

          if (step.id === "5") { // Consenso
              addLog("Calculando vetores de consenso ponderado...", 'WARN');
          }

          if (step.id === "6") { // Risco
              if (riskTolerance < 20) addLog("Filtro de risco rigoroso aplicado.", 'WARN');
              else addLog("Parâmetros de risco validados.", 'SUCCESS');
          }

          setProgress(((i + 1) / totalSteps) * 100);
      }

      setPipeline(prev => prev.map(n => ({ ...n, status: 'COMPLETED' })));
      
      // Finalize
      const finalDecision: DecisionType = Math.random() > 0.4 ? 'BUY' : 'SELL';
      addLog(`DECISÃO FINAL: ${finalDecision} CONFIRMADA`, 'SUCCESS');
      
      const newRecord: MarketDecision = {
          id: Date.now().toString(),
          timestamp: new Date().toLocaleString(),
          algorithm: "Consenso IAG v5",
          decision: finalDecision,
          confidence: 85 + Math.random() * 10,
          reasoning: "Convergência de múltiplos modelos com validação de risco aprovada.",
          factors: ["Volume Alto", "RSI Divergente", "Consenso Neural"],
          risk: 2.1,
          expectedReturn: 4.5,
          timeframe: "15m"
      };
      
      setDecisions(prev => [newRecord, ...prev]);
      setIsRunning(false);
  };

  return (
    <div className="flex flex-col h-full bg-transparent overflow-hidden space-y-4 p-4 md:p-0">
        
        {/* TOP BAR: Controls & Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Control Panel */}
            <div className="bg-matrix-panel border border-matrix-border rounded-lg p-4 md:col-span-2">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Sliders size={16} className="text-quantum-400" />
                        PARÂMETROS DO MOTOR
                    </h3>
                    <button 
                        onClick={runDecisionCycle}
                        disabled={isRunning}
                        className={`flex items-center gap-2 px-6 py-2 rounded text-xs font-bold transition-all ${
                            isRunning 
                            ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700' 
                            : 'bg-green-600 hover:bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.3)] border border-green-500'
                        }`}
                    >
                        {isRunning ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
                        {isRunning ? 'PROCESSANDO...' : 'EXECUTAR CICLO'}
                    </button>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                            <span>Agressividade</span>
                            <span>{aggressiveness}%</span>
                        </div>
                        <input 
                            type="range" min="0" max="100" 
                            value={aggressiveness} onChange={(e) => setAggressiveness(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-red-500"
                        />
                    </div>
                    <div>
                        <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                            <span>Tolerância a Risco</span>
                            <span>{riskTolerance}%</span>
                        </div>
                        <input 
                            type="range" min="0" max="100" 
                            value={riskTolerance} onChange={(e) => setRiskTolerance(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                        />
                    </div>
                </div>
            </div>

            {/* System Status */}
            <div className="bg-matrix-panel border border-matrix-border rounded-lg p-4 flex flex-col justify-center items-center relative overflow-hidden">
                <div className="absolute inset-0 bg-quantum-900/10 animate-pulse"></div>
                <div className="relative z-10 text-center">
                    <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Status do Núcleo</div>
                    <div className={`text-2xl font-mono font-bold ${isRunning ? 'text-yellow-400' : 'text-green-400'}`}>
                        {isRunning ? 'COMPUTANDO' : 'ONLINE'}
                    </div>
                    <div className="text-[9px] text-quantum-400 mt-2 flex items-center justify-center gap-2">
                        <Cpu size={10} /> {algorithms.filter(a => a.isActive).length} Algoritmos Ativos
                    </div>
                </div>
            </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
            
            {/* LEFT COL: Pipeline & Console */}
            <div className="lg:col-span-2 flex flex-col gap-4 min-h-0 overflow-hidden">
                
                {/* Visual Pipeline */}
                <div className="bg-matrix-panel border border-matrix-border rounded-lg p-4 overflow-x-auto">
                    <div className="flex items-center justify-between min-w-[600px] relative">
                        {/* Progress Bar Background */}
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-800 -z-0"></div>
                        <div className="absolute top-1/2 left-0 h-0.5 bg-quantum-500 -z-0 transition-all duration-300" style={{ width: `${progress}%` }}></div>

                        {pipeline.map((step, idx) => (
                            <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                    step.status === 'COMPLETED' ? 'bg-black border-green-500 text-green-500' :
                                    step.status === 'PROCESSING' ? 'bg-black border-yellow-500 text-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)] scale-110' :
                                    'bg-gray-900 border-gray-700 text-gray-600'
                                }`}>
                                    {step.status === 'COMPLETED' ? <CheckCircle size={14} /> : 
                                     step.status === 'PROCESSING' ? <Activity size={14} className="animate-spin" /> :
                                     <span className="text-xs font-bold">{idx + 1}</span>}
                                </div>
                                <span className={`text-[9px] font-bold uppercase ${
                                    step.status === 'PROCESSING' ? 'text-white' : 'text-gray-600'
                                }`}>{step.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main View Area */}
                <div className="flex-1 bg-matrix-panel border border-matrix-border rounded-lg flex flex-col overflow-hidden">
                    <div className="flex border-b border-gray-800">
                        <button 
                            onClick={() => setActiveTab('CONSOLE')}
                            className={`px-4 py-2 text-xs font-bold flex items-center gap-2 transition-colors ${
                                activeTab === 'CONSOLE' ? 'bg-gray-800 text-white border-b-2 border-quantum-500' : 'text-gray-500 hover:text-gray-300'
                            }`}
                        >
                            <Terminal size={14} /> TERMINAL LÓGICO
                        </button>
                        <button 
                            onClick={() => setActiveTab('HISTORY')}
                            className={`px-4 py-2 text-xs font-bold flex items-center gap-2 transition-colors ${
                                activeTab === 'HISTORY' ? 'bg-gray-800 text-white border-b-2 border-quantum-500' : 'text-gray-500 hover:text-gray-300'
                            }`}
                        >
                            <Clock size={14} /> HISTÓRICO DE DECISÕES
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
                        {activeTab === 'CONSOLE' ? (
                            <TerminalLog logs={logs} />
                        ) : (
                            <div className="space-y-2">
                                {decisions.map(dec => (
                                    <div key={dec.id} className="bg-black/30 border border-gray-800 p-3 rounded flex justify-between items-center hover:border-gray-600 transition-colors">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-xs font-bold ${dec.decision === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>{dec.decision}</span>
                                                <span className="text-[10px] text-gray-500 font-mono">| {dec.timestamp}</span>
                                            </div>
                                            <div className="text-[10px] text-gray-400 italic">{dec.reasoning}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-mono font-bold text-white">{dec.confidence.toFixed(1)}%</div>
                                            <div className="text-[8px] text-gray-600 uppercase">Confiança</div>
                                        </div>
                                    </div>
                                ))}
                                {decisions.length === 0 && <div className="text-center text-gray-600 py-10 text-xs">Nenhuma decisão registrada nesta sessão.</div>}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* RIGHT COL: Consensus & Algos */}
            <div className="flex flex-col gap-4 overflow-y-auto pr-1 scrollbar-thin">
                <ConsensusMeter algorithms={algorithms} />
                
                <div className="bg-matrix-panel border border-matrix-border rounded-lg p-4 flex-1">
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                        <Brain size={12} /> Algoritmos Ativos
                    </h4>
                    <div className="space-y-3">
                        {algorithms.map(algo => (
                            <div key={algo.id} className={`p-3 rounded border transition-all ${
                                algo.isActive ? 'bg-black/40 border-gray-700 opacity-100' : 'bg-black/20 border-gray-800 opacity-50'
                            }`}>
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-bold text-gray-200">{algo.name}</span>
                                    <div className={`w-2 h-2 rounded-full ${algo.isActive ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.8)]' : 'bg-gray-600'}`}></div>
                                </div>
                                <div className="flex justify-between items-center text-[10px] text-gray-500 mb-1">
                                    <span>Precisão Histórica</span>
                                    <span className="text-quantum-400">{algo.accuracy}%</span>
                                </div>
                                <div className="w-full bg-gray-900 h-1 rounded overflow-hidden">
                                    <div className="h-full bg-quantum-600" style={{ width: `${algo.accuracy}%` }}></div>
                                </div>
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {algo.specialization.map(spec => (
                                        <span key={spec} className="text-[8px] px-1.5 py-0.5 bg-gray-800 text-gray-400 rounded border border-gray-700">{spec}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    </div>
  );
};

export default DecisionEngine;
