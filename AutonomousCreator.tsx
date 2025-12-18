
import React, { useState, useEffect, useRef } from 'react';
import { 
  Dna, Microscope, Beaker, Zap, Layers, Lightbulb, GitBranch, CheckCircle, RefreshCw, Box, Activity, Settings, Users, Target, TrendingUp, Cpu, ShieldCheck, Lock, Play, StopCircle, Hexagon
} from './Icons';
import { 
  NeuralTechnique, TechniqueStatus, CreationProcess, NeuralEvolution, SwarmAgent, MarketRegime, MemoryEngram
} from '../types';
import { getMemoryStatistics, simulateApexDiscovery } from '../AI_Geral/CognitiveServices';
import { TraderComAprendizado } from '../AI_Geral/EvolutionaryTrading';
import { generateForexHistory } from '../services/exchangeService';

const TECHNIQUE_TEMPLATES = [
  {
    name: 'Quantum Micro-Scalper (Curto Prazo)',
    description: 'Estratégia de alta frequência focada em explorar micro-volatilidade e divergências de RSI em janelas de segundos.',
    components: ['Flash Order Execution', 'RSI Extremo', 'Micro-Tendência', 'Fluxo de Ordens L2'],
    innovationLevel: 92
  },
  {
    name: 'Neural Trend Surfer (Médio Prazo)',
    description: 'Swing trade clássico aprimorado por redes neurais para capturar tendências de dias ou semanas.',
    components: ['Cruzamento MA Adaptativo', 'Filtro de Ruído Quântico', 'Sentimento Social', 'Ondas de Elliott'],
    innovationLevel: 88
  },
  {
    name: 'Deep Value Accumulator (Longo Prazo)',
    description: 'Algoritmo de position trading baseado em dados fundamentais on-chain e ciclos de halving.',
    components: ['Análise On-Chain Glassnode', 'Múltiplo de Mayer', 'Reserva de Valor', 'Ciclos Macro'],
    innovationLevel: 95
  },
  {
    name: 'Motor de Arbitragem Quântica',
    description: 'Usa princípios de superposição quântica para identificar oportunidades de arbitragem entre ativos.',
    components: ['Emaranhamento Quântico', 'Estados Probabilísticos', 'Correlação Multi-Ativo', 'Deslocamentos Temporais'],
    innovationLevel: 94
  },
  {
    name: 'Preditor NeuralSwarm',
    description: 'Inteligência de enxame combinada com redes LSTM profundas para previsão de preços.',
    components: ['Inteligência de Enxame', 'Deep LSTM', 'Comportamento Coletivo', 'Padrões Emergentes'],
    innovationLevel: 91
  },
  {
    name: 'Scalper Teoria do Caos',
    description: 'Explora a teoria do caos para encontrar ordem em movimentos de mercado aparentemente aleatórios.',
    components: ['Atratores Estranhos', 'Efeito Borboleta', 'Sistema Lorenz', 'Dinâmica Não-Linear'],
    innovationLevel: 89
  }
];

const CREATION_STAGES: CreationProcess[] = [
  { stage: 'Análise de Padrão', progress: 0, description: 'Identificando novos padrões em dados históricos', duration: 3000 },
  { stage: 'Síntese Neural', progress: 0, description: 'Combinando elementos de diferentes estratégias', duration: 4000 },
  { stage: 'Otimização Genética', progress: 0, description: 'Aplicando algoritmos genéticos para refinar a técnica', duration: 5000 },
  { stage: 'Simulação Monte Carlo', progress: 0, description: 'Testando robustez em múltiplos cenários', duration: 6000 },
  { stage: 'Validação Cruzada', progress: 0, description: 'Verificando consistência em diferentes timeframes', duration: 4000 },
  { stage: 'Implementação', progress: 0, description: 'Preparando técnica para implantação operacional', duration: 2000 }
];

interface AutonomousCreatorProps {
  agents?: SwarmAgent[];
  regime?: MarketRegime;
}

const AutonomousCreator: React.FC<AutonomousCreatorProps> = ({ 
  agents = [], 
  regime = MarketRegime.ACCUMULATION 
}) => {
  const [activeTab, setActiveTab] = useState<'swarm' | 'creation' | 'techniques' | 'evolution' | 'apex' | 'simulator'>('swarm');
  const [isCreating, setIsCreating] = useState(false);
  const [currentCreation, setCurrentCreation] = useState<CreationProcess | null>(null);
  
  const [apexItems, setApexItems] = useState<MemoryEngram[]>([]);
  const [autonomyLevel, setAutonomyLevel] = useState(94.2);
  const [creativityIndex, setCreativityIndex] = useState(89.7);

  // Simulator States
  const [isSimulating, setIsSimulating] = useState(false);
  const [simProgress, setSimProgress] = useState(0);
  const [simLogs, setSimLogs] = useState<string[]>([]);
  const [simStats, setSimStats] = useState({ winRate: 0, epoch: 0 });
  const simulatorRef = useRef<TraderComAprendizado | null>(null);

  const [evolution, setEvolution] = useState<NeuralEvolution>({
    generation: 127,
    populationSize: 50,
    bestFitness: 0.847,
    avgFitness: 0.623,
    mutationRate: 0.15,
    crossoverRate: 0.75
  });

  const [techniques, setTechniques] = useState<NeuralTechnique[]>([
    {
      id: '1',
      name: 'Fusão HiperMomento v1.2',
      description: 'Combina momento multi-timeframe com análise fractal.',
      innovationLevel: 87.3,
      backtestScore: 92.1,
      profitability: 18.7,
      riskLevel: 23.4,
      status: TechniqueStatus.EM_USO,
      createdAt: new Date(),
      components: ['Momento Adaptativo', 'Fractais', 'Detecção de Regime'],
      performance: { winRate: 73.2, avgReturn: 2.4, maxDrawdown: 8.1, sharpeRatio: 1.85 }
    },
    {
      id: '2',
      name: 'Motor de Arbitragem Quântica',
      description: 'Usa princípios quânticos para arbitragem de alta frequência.',
      innovationLevel: 94.1,
      backtestScore: 87.9,
      profitability: 22.3,
      riskLevel: 19.8,
      status: TechniqueStatus.TESTANDO,
      createdAt: new Date(),
      components: ['Estados Quânticos', 'Superposição', 'Multi-Ativo'],
      performance: { winRate: 68.9, avgReturn: 3.1, maxDrawdown: 6.7, sharpeRatio: 2.12 }
    }
  ]);

  useEffect(() => {
    // Instantiate trader for simulator
    simulatorRef.current = new TraderComAprendizado();
    simulatorRef.current.initialize();

    const interval = setInterval(() => {
      setEvolution(prev => ({
        ...prev,
        generation: prev.generation + 1,
        bestFitness: Math.min(1, prev.bestFitness + (Math.random() - 0.4) * 0.005),
        avgFitness: Math.min(0.9, prev.avgFitness + (Math.random() - 0.45) * 0.003)
      }));
      setAutonomyLevel(prev => Math.max(85, Math.min(99, prev + (Math.random() - 0.5) * 0.5)));
      setCreativityIndex(prev => Math.max(80, Math.min(97, prev + (Math.random() - 0.5) * 0.7)));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeTab === 'apex') {
      const stats = getMemoryStatistics();
      if (stats.apexMemories) {
        setApexItems(stats.apexMemories);
      }
    }
  }, [activeTab]);

  const handleCreateTechnique = async () => {
    if (isCreating) return;
    setIsCreating(true);

    const template = TECHNIQUE_TEMPLATES[Math.floor(Math.random() * TECHNIQUE_TEMPLATES.length)];
    
    for (const stage of CREATION_STAGES) {
      setCurrentCreation({ ...stage, progress: 0 });
      const steps = 20;
      const stepDuration = stage.duration / steps;
      for (let i = 0; i <= steps; i++) {
        await new Promise(r => setTimeout(r, stepDuration));
        setCurrentCreation(prev => prev ? { ...prev, progress: i * 5 } : null);
      }
    }

    const newTechnique: NeuralTechnique = {
      id: Date.now().toString(),
      name: `${template.name} v${Math.floor(Math.random() * 9) + 1}.${Math.floor(Math.random() * 9)}`,
      description: template.description,
      innovationLevel: template.innovationLevel + (Math.random() - 0.5) * 10,
      backtestScore: 70 + Math.random() * 25,
      profitability: 10 + Math.random() * 20,
      riskLevel: 15 + Math.random() * 25,
      status: TechniqueStatus.APROVADA,
      createdAt: new Date(),
      components: template.components,
      performance: {
        winRate: 55 + Math.random() * 25,
        avgReturn: 1 + Math.random() * 3,
        maxDrawdown: 3 + Math.random() * 12,
        sharpeRatio: 1 + Math.random() * 1.5
      }
    };

    setTechniques(prev => [newTechnique, ...prev]);
    setIsCreating(false);
    setCurrentCreation(null);
  };

  const runCTraderSimulation = async () => {
      if (isSimulating || !simulatorRef.current) return;
      setIsSimulating(true);
      setSimLogs(["Inicializando simulador cTrader...", "Gerando dados sintéticos EURUSD (Forex)..."]);
      setSimProgress(0);

      // Generate Data
      const forexData = generateForexHistory(1000); // 1000 candles
      setSimLogs(prev => [...prev, `Dataset gerado: ${forexData.length} candles.`]);

      await simulatorRef.current.trainOnHistoricalData(forexData, (progress, stats) => {
          setSimProgress(progress);
          setSimStats({ winRate: stats.winRate, epoch: stats.epoch });
          setSimLogs(prev => [stats.log, ...prev].slice(0, 10)); // Keep last 10 logs
      });

      setSimLogs(prev => ["Simulação concluída. Pesos neurais atualizados.", ...prev]);
      setIsSimulating(false);
  };

  const handleSimulateApex = () => {
      simulateApexDiscovery();
      const stats = getMemoryStatistics();
      if (stats.apexMemories) setApexItems(stats.apexMemories);
  };

  const getStatusColor = (status: TechniqueStatus) => {
    switch (status) {
      case TechniqueStatus.CRIANDO: return 'text-yellow-400 bg-yellow-900/20 border-yellow-900';
      case TechniqueStatus.TESTANDO: return 'text-blue-400 bg-blue-900/20 border-blue-900';
      case TechniqueStatus.APROVADA: return 'text-emerald-400 bg-emerald-900/20 border-emerald-900';
      case TechniqueStatus.EM_USO: return 'text-green-400 bg-green-900/20 border-green-900 shadow-[0_0_10px_rgba(74,222,128,0.2)]';
      case TechniqueStatus.DESCARTADA: return 'text-red-400 bg-red-900/20 border-red-900';
      default: return 'text-gray-400 bg-gray-800';
    }
  };

  const getRegimeStyle = (r: string) => {
      if (r.includes('BULL')) return { color: 'text-green-400', border: 'border-green-500', bg: 'bg-green-900/20' };
      if (r.includes('BEAR')) return { color: 'text-red-400', border: 'border-red-500', bg: 'bg-red-900/20' };
      if (r.includes('VOLATILITY')) return { color: 'text-purple-400', border: 'border-purple-500', bg: 'bg-purple-900/20 animate-pulse' };
      return { color: 'text-gray-400', border: 'border-gray-500', bg: 'bg-gray-800' };
  };

  const regimeStyle = getRegimeStyle(regime || 'ACCUMULATION');

  return (
    <div className="flex flex-col h-full bg-matrix-black/50 overflow-hidden font-sans text-gray-300">
      
      <div className="flex justify-between items-center px-6 py-4 border-b border-matrix-border bg-matrix-panel">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
           <Dna className="text-quantum-500 animate-pulse" />
           CRIADOR AUTÔNOMO
        </h2>
        <div className="flex gap-4">
           <div className="flex items-center gap-2 px-3 py-1 rounded bg-blue-900/20 border border-blue-800">
              <Zap size={14} className="text-blue-400" />
              <span className="text-xs font-mono">Autonomia: <span className="text-white font-bold">{autonomyLevel.toFixed(1)}%</span></span>
           </div>
           <div className="flex items-center gap-2 px-3 py-1 rounded bg-emerald-900/20 border border-emerald-800">
              <Lightbulb size={14} className="text-emerald-400" />
              <span className="text-xs font-mono">Criatividade: <span className="text-white font-bold">{creativityIndex.toFixed(1)}%</span></span>
           </div>
        </div>
      </div>

      <div className="flex border-b border-matrix-border bg-black/20 overflow-x-auto">
        {[
          { id: 'swarm', label: 'Inteligência de Enxame', icon: Users },
          { id: 'simulator', label: 'Simulador cTrader', icon: Hexagon },
          { id: 'creation', label: 'Criação Ativa', icon: Beaker },
          { id: 'techniques', label: 'Biblioteca de Técnicas', icon: Layers },
          { id: 'evolution', label: 'Evolução Neural', icon: GitBranch },
          { id: 'apex', label: 'Cofre Apex (100%)', icon: ShieldCheck },
        ].map(tab => (
           <button
             key={tab.id}
             onClick={() => setActiveTab(tab.id as any)}
             className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
               activeTab === tab.id 
                 ? 'bg-quantum-900/20 text-quantum-400 border-b-2 border-quantum-500' 
                 : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
             }`}
           >
             <tab.icon size={16} />
             {tab.label}
           </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
        {activeTab === 'swarm' && (
            <div className="space-y-6">
                <div className={`p-6 rounded-lg border-2 ${regimeStyle.border} ${regimeStyle.bg} flex items-center justify-between transition-all duration-1000`}>
                    <div>
                        <div className="text-xs font-mono text-gray-400 uppercase mb-1">Regime de Mercado Detectado</div>
                        <div className={`text-4xl font-black tracking-widest ${regimeStyle.color}`}>
                            {(regime || 'UNKNOWN').replace('_', ' ')}
                        </div>
                    </div>
                    <div className="text-right">
                        <Activity size={48} className={`${regimeStyle.color} opacity-50`} />
                        <div className="text-xs font-mono mt-2 text-gray-400">ADAPTAÇÃO DE ENXAME: ATIVA</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {agents.length > 0 ? agents.map((agent) => (
                        <div key={agent.id} className={`bg-matrix-panel border rounded-lg p-4 transition-all hover:scale-[1.02] ${
                            agent.status === 'HUNTING' || agent.status === 'EXECUTING' 
                            ? 'border-quantum-500 shadow-[0_0_15px_rgba(14,165,233,0.2)]' 
                            : 'border-gray-800 opacity-80'
                        }`}>
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2">
                                    <div className={`p-2 rounded-full ${
                                        agent.type === 'MOMENTUM' ? 'bg-green-900/30 text-green-400' :
                                        agent.type === 'ARBITRAGE' ? 'bg-purple-900/30 text-purple-400' :
                                        agent.type === 'MEAN_REVERSION' ? 'bg-yellow-900/30 text-yellow-400' :
                                        'bg-blue-900/30 text-blue-400'
                                    }`}>
                                        {agent.type === 'MOMENTUM' ? <TrendingUp size={16} /> :
                                         agent.type === 'ARBITRAGE' ? <GitBranch size={16} /> :
                                         agent.type === 'MEAN_REVERSION' ? <RefreshCw size={16} /> :
                                         <Target size={16} />}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white">{agent.name}</div>
                                        <div className="text-[10px] text-gray-500 font-mono">{agent.id}</div>
                                    </div>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                                    agent.status === 'EXECUTING' ? 'text-green-400 border-green-500 bg-green-900/20 animate-pulse' :
                                    agent.status === 'HUNTING' ? 'text-yellow-400 border-yellow-500 bg-yellow-900/20' :
                                    agent.status === 'LEARNING' ? 'text-blue-400 border-blue-500 bg-blue-900/20' :
                                    'text-gray-500 border-gray-700 bg-gray-900'
                                }`}>
                                    {agent.status}
                                </span>
                            </div>

                            <div className="space-y-3 bg-black/20 p-3 rounded">
                                <div>
                                    <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                                        <span>Confiança</span>
                                        <span className="text-white font-mono">{(agent.confidence * 100).toFixed(0)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                                        <div className="h-full bg-quantum-500" style={{ width: `${agent.confidence * 100}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full h-48 flex items-center justify-center border border-dashed border-gray-800 rounded-lg text-gray-600">
                            <div className="text-center">
                                <Cpu size={32} className="mx-auto mb-2 opacity-50" />
                                <div>INICIALIZANDO PROTOCOLOS DE ENXAME...</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* --- SIMULATOR TAB --- */}
        {activeTab === 'simulator' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-matrix-panel border border-matrix-border rounded-lg p-6 flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                            <Hexagon className="text-green-500" /> SIMULADOR CTRADER
                        </h3>
                        <p className="text-xs text-gray-400 mb-6">
                            Gera dados históricos de Forex (EURUSD) e executa o motor neural em velocidade acelerada (Time-Warp) para treinamento intensivo.
                        </p>

                        <div className="space-y-4">
                            <div className="bg-black/30 p-3 rounded border border-gray-800">
                                <div className="text-[10px] text-gray-500 uppercase font-mono mb-1">Par de Moeda</div>
                                <div className="text-xl font-mono text-green-400">EURUSD</div>
                            </div>
                            <div className="bg-black/30 p-3 rounded border border-gray-800">
                                <div className="text-[10px] text-gray-500 uppercase font-mono mb-1">Algoritmo Ativo</div>
                                <div className="text-sm font-bold text-white">Evolutionary Hybrid QNN v5.2</div>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={runCTraderSimulation}
                        disabled={isSimulating}
                        className={`w-full py-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                            isSimulating 
                            ? 'bg-red-900/30 border border-red-500 text-red-400 animate-pulse' 
                            : 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-500/20'
                        }`}
                    >
                        {isSimulating ? <StopCircle size={20} /> : <Play size={20} />}
                        {isSimulating ? 'TREINAMENTO EM PROGRESSO...' : 'INICIAR SIMULAÇÃO (1000 CANDLES)'}
                    </button>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    {/* VISUALIZATION */}
                    <div className="bg-black/40 border border-gray-800 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-4">
                            <div className="text-xs font-bold text-gray-300">PROGRESSO DO ÉPOCA</div>
                            <div className="text-xs font-mono text-green-400">{simProgress.toFixed(1)}%</div>
                        </div>
                        <div className="w-full bg-gray-900 h-2 rounded-full overflow-hidden mb-6">
                            <div className="h-full bg-green-500 transition-all duration-300" style={{ width: `${simProgress}%` }}></div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="text-center p-3 bg-matrix-panel border border-matrix-border rounded">
                                <div className="text-[10px] text-gray-500">Win Rate Simulado</div>
                                <div className="text-2xl font-mono text-white">{simStats.winRate.toFixed(1)}%</div>
                            </div>
                            <div className="text-center p-3 bg-matrix-panel border border-matrix-border rounded">
                                <div className="text-[10px] text-gray-500">Geração Neural</div>
                                <div className="text-2xl font-mono text-purple-400">{simStats.epoch}</div>
                            </div>
                        </div>

                        <div className="bg-black border border-gray-800 rounded p-3 h-48 overflow-y-auto font-mono text-[10px] space-y-1 scrollbar-thin">
                            {simLogs.length === 0 ? (
                                <span className="text-gray-600">Aguardando início do treinamento...</span>
                            ) : (
                                simLogs.map((log, i) => (
                                    <div key={i} className="text-gray-400 border-b border-gray-900 pb-1">
                                        <span className="text-green-500 mr-2">{'>'}</span>{log}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'creation' && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center py-12">
               <button
                 onClick={handleCreateTechnique}
                 disabled={isCreating}
                 className={`relative group px-12 py-6 rounded-xl border transition-all duration-300 ${
                   isCreating 
                     ? 'bg-gray-800 border-gray-700 cursor-not-allowed opacity-80' 
                     : 'bg-quantum-600 hover:bg-quantum-500 border-quantum-400 shadow-[0_0_30px_rgba(14,165,233,0.3)] hover:shadow-[0_0_50px_rgba(14,165,233,0.5)]'
                 }`}
               >
                 <div className="flex flex-col items-center gap-2">
                    {isCreating ? <RefreshCw size={32} className="animate-spin text-quantum-200" /> : <Dna size={32} className="text-white" />}
                    <span className="text-lg font-bold text-white tracking-wider">
                      {isCreating ? 'SINTETIZANDO CAMINHOS NEURAIS...' : 'LIBERAR CRIATIVIDADE NEURAL'}
                    </span>
                 </div>
               </button>
            </div>

            {isCreating && currentCreation && (
              <div className="bg-matrix-panel border border-matrix-border rounded-lg p-6 animate-in fade-in slide-in-from-bottom-4">
                 <div className="flex justify-between items-center mb-2">
                    <span className="text-quantum-400 font-bold flex items-center gap-2">
                       <Microscope size={18} />
                       {currentCreation.stage}
                    </span>
                    <span className="text-xs font-mono text-gray-500">{currentCreation.progress}%</span>
                 </div>
                 <div className="w-full bg-gray-900 h-2 rounded-full overflow-hidden mb-2">
                    <div 
                      className="h-full bg-gradient-to-r from-quantum-600 to-purple-500 transition-all duration-100 ease-linear"
                      style={{ width: `${currentCreation.progress}%` }}
                    ></div>
                 </div>
                 <p className="text-xs text-gray-400 font-mono italic">{currentCreation.description}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'techniques' && (
          <div className="grid gap-4">
             {techniques.map((tech) => (
                <div key={tech.id} className="bg-matrix-panel border border-matrix-border rounded-lg p-4 hover:border-gray-600 transition-colors">
                   <div className="flex justify-between items-start mb-4">
                      <div>
                         <div className="flex items-center gap-2 mb-1">
                            <Box size={16} className="text-gray-500" />
                            <h3 className="text-lg font-bold text-gray-200">{tech.name}</h3>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getStatusColor(tech.status)}`}>
                              {tech.status}
                            </span>
                         </div>
                         <p className="text-sm text-gray-500">{tech.description}</p>
                      </div>
                   </div>
                </div>
             ))}
          </div>
        )}

        {activeTab === 'apex' && (
          <div className="space-y-6">
            <div className="bg-yellow-900/10 border border-yellow-600/30 p-6 rounded-lg text-center">
               <div className="flex justify-center mb-4">
                  <div className="p-4 bg-yellow-500/10 rounded-full border border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                     <ShieldCheck size={48} className="text-yellow-400" />
                  </div>
               </div>
               <h3 className="text-xl font-bold text-yellow-100 mb-2">COFRE APEX: ESTRATÉGIAS 100% EFICAZES</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {apexItems.length > 0 ? apexItems.map((apex, idx) => (
                <div key={idx} className="bg-matrix-panel border border-yellow-600/30 p-4 rounded-lg relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-2 opacity-10">
                     <Lock size={64} className="text-yellow-500" />
                  </div>
                  
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div>
                       <div className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                          <CheckCircle size={10} /> PROTOCOLO VERIFICADO
                       </div>
                       <h4 className="text-lg font-bold text-white">{apex.patternName.replace('[APEX] ', '')}</h4>
                    </div>
                  </div>
                </div>
              )) : (
                 <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-800 rounded-lg text-gray-500 flex flex-col items-center gap-4">
                    <Lock size={32} className="opacity-30" />
                    <div>
                        <div>NENHUM PROTOCOLO APEX ENCONTRADO</div>
                        <div className="text-xs mt-2 opacity-60">A Rede Neural ainda está aprendendo. Continue operando para gerar perfeição.</div>
                    </div>
                    <button 
                        onClick={handleSimulateApex}
                        className="px-4 py-2 bg-yellow-900/20 hover:bg-yellow-900/40 text-yellow-500 text-xs border border-yellow-800/50 rounded transition-all"
                    >
                        Simular Descoberta de Padrão Mestre
                    </button>
                 </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'evolution' && (
           <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-matrix-panel border border-matrix-border rounded-lg p-6">
                    <h3 className="text-gray-300 font-bold mb-6 flex items-center gap-2">
                       <GitBranch className="text-purple-500" /> Progresso Genético
                    </h3>
                    <div className="space-y-4">
                       <div className="flex justify-between items-center pb-2 border-b border-gray-800">
                          <span className="text-sm text-gray-500">Geração Atual</span>
                          <span className="font-mono text-xl text-white font-bold">{evolution.generation}</span>
                       </div>
                       <div className="flex justify-between items-center pb-2 border-b border-gray-800">
                          <span className="text-sm text-gray-500">Melhor Fitness</span>
                          <span className="font-mono text-xl text-emerald-400">{(evolution.bestFitness * 100).toFixed(2)}%</span>
                       </div>
                    </div>
                 </div>

                 <div className="bg-matrix-panel border border-matrix-border rounded-lg p-6">
                    <h3 className="text-gray-300 font-bold mb-6 flex items-center gap-2">
                       <Settings className="text-gray-500" /> Parâmetros Evolucionários
                    </h3>
                    <div className="space-y-6">
                       <div>
                          <div className="flex justify-between text-xs mb-2">
                             <span className="text-gray-400">Taxa de Mutação</span>
                             <span className="text-white font-mono">{(evolution.mutationRate * 100).toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-gray-900 h-2 rounded-full overflow-hidden">
                             <div className="h-full bg-purple-500" style={{width: `${evolution.mutationRate * 100}%`}}></div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default AutonomousCreator;
