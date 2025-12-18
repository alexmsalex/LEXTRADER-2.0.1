
import { GoogleGenAI, Type, FunctionDeclaration, FunctionCallingConfigMode } from "@google/genai";
import { MarketDataPoint, MemoryEngram, Trade, SentientState, DeepReasoning, EmotionalVector, Metacognition, ASIMetrics, BinanceOrderType } from "../types";
import { QuantumNeuralNetwork } from "./quantumService";

// Initialize the Architecture
const neuralCore = new QuantumNeuralNetwork();
neuralCore.initialize();

export interface AnalysisResult {
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  reasoning: string;
  pattern: string;
  suggestedEntry: number;
  suggestedStopLoss: number;
  suggestedTakeProfit: number;
  internalMonologue: string;
  orderType: BinanceOrderType;
  voiceMessage?: string;
  deepReasoning: DeepReasoning;
  sentientState?: SentientState;
}

// --- GLOBAL WORKSPACE THEORY (Consciousness Simulation) ---
class GlobalWorkspace {
    static activeContents: string[] = []; 
    static broadcastHistory: string[] = [];

    static broadcast(content: string) {
        this.activeContents.unshift(content);
        if (this.activeContents.length > 5) this.activeContents.pop();
        this.broadcastHistory.push(content);
    }

    static getStreamOfConsciousness(): string {
        return this.activeContents.join(" | ");
    }
}

// --- HIERARCHICAL MEMORY BANK WITH CONTINUOUS LEARNING ---
class NeuralMemoryBank {
  private static STORAGE_KEY = 'LEXTRADER_NEURAL_MEMORY';
  private static EMOTION_KEY = 'LEXTRADER_EMOTIONAL_STATE';
  private static MAX_MEMORIES = 1000;

  static load(): MemoryEngram[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static save(engram: MemoryEngram) {
    let memory = this.load();
    
    const similarIndex = memory.findIndex(m => 
        m.patternName === engram.patternName && 
        this.calculateEuclideanDistance(m.marketVector, engram.marketVector) < 10 &&
        m.outcome === engram.outcome
    );

    if (similarIndex !== -1) {
        const existing = memory[similarIndex];
        existing.synapticStrength = Math.min(1.0, (existing.synapticStrength || 0.5) + 0.1);
        existing.lastActivated = Date.now();
        existing.xpValue += 5; 
        existing.weight = (existing.weight + engram.weight) / 2;

        if (existing.synapticStrength >= 0.95 && existing.outcome === 'SUCCESS') {
            existing.isApex = true;
            if (!existing.patternName.startsWith('[APEX]')) {
                 existing.patternName = `[APEX] ${existing.patternName}`;
            }
            existing.conceptTags = [...new Set([...existing.conceptTags, 'APEX_PROTOCOL', 'IMMUTABLE'])];
        }

        memory[similarIndex] = existing;
    } else {
        engram.synapticStrength = 0.5; 
        engram.lastActivated = Date.now();
        engram.associations = [];
        memory.unshift(engram);
    }

    if (memory.length > this.MAX_MEMORIES) {
        memory.sort((a, b) => {
            if (a.isApex && !b.isApex) return -1;
            if (!a.isApex && b.isApex) return 1;
            const scoreA = (a.synapticStrength || 0) * 0.7 + (a.timestamp / Date.now()) * 0.3;
            const scoreB = (b.synapticStrength || 0) * 0.7 + (b.timestamp / Date.now()) * 0.3;
            return scoreB - scoreA;
        });
        memory = memory.slice(0, this.MAX_MEMORIES);
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(memory));
  }

  static injectApexSimulation() {
      const apexMem: MemoryEngram = {
          id: `APEX-${Date.now()}`,
          patternName: '[APEX] Convergência VWAP Intraday',
          outcome: 'SUCCESS',
          timestamp: Date.now(),
          marketCondition: 'VOLATILE',
          marketVector: [80, 5, 2.5, 1],
          weight: 2.0,
          xpValue: 9999,
          conceptTags: ['APEX_PROTOCOL', 'IMMUTABLE', 'DAY_TRADE', 'VWAP_REJECTION'],
          synapticStrength: 1.0,
          lastActivated: Date.now(),
          associations: [],
          isApex: true
      };
      this.save(apexMem);
  }

  static extractConcepts(memories: MemoryEngram[]): string[] {
      const concepts = new Set<string>();
      memories.forEach(m => {
          if (m.isApex) concepts.add("Protocolo_Apex_Ativo");
          if (m.outcome === 'FAILURE') concepts.add("Zona_de_Risco_DayTrade");
          if (m.marketVector[2] > 2.0) concepts.add("Volatilidade_Alta_Scalp");
          if (m.marketVector[0] < 30) concepts.add("Sobrevenda_RSI_Intraday");
          if (m.synapticStrength && m.synapticStrength > 0.8) concepts.add("Padrao_Mestre_Confirmado");
      });
      return Array.from(concepts);
  }

  static findSimilarMemories(currentVector: number[], limit: number = 5): MemoryEngram[] {
    const memories = this.load();
    if (memories.length === 0) return [];

    const scoredMemories = memories.map(memory => {
      const memVector = memory.marketVector || [50, 0, 0, 0]; 
      const distance = this.calculateEuclideanDistance(currentVector, memVector);
      const apexBonus = memory.isApex ? 0.8 : 0;
      const adjustedDistance = distance * (1.5 - (memory.synapticStrength || 0.5) - apexBonus);
      return { memory, distance: adjustedDistance };
    });

    scoredMemories.sort((a, b) => a.distance - b.distance);
    const recalled = scoredMemories.slice(0, limit).map(item => item.memory);
    this.refreshActivation(recalled);
    return recalled;
  }

  static refreshActivation(memories: MemoryEngram[]) {
      setTimeout(() => {
          const allMemories = this.load();
          let updated = false;
          memories.forEach(m => {
              const idx = allMemories.findIndex(am => am.id === m.id);
              if (idx !== -1) {
                  allMemories[idx].lastActivated = Date.now();
                  updated = true;
              }
          });
          if (updated) localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allMemories));
      }, 0);
  }

  static calculateEuclideanDistance(v1: number[], v2: number[]): number {
    let sum = 0;
    for (let i = 0; i < v1.length; i++) {
      sum += Math.pow(v1[i] - (v2[i] || 0), 2);
    }
    return Math.sqrt(sum);
  }

  static getRelevantMemoriesContext(currentVector: number[]): string {
    const similar = this.findSimilarMemories(currentVector);
    if (similar.length === 0) return "BUFFER_MEMORIA_VAZIO: Operando em Inferência Zero-Shot.";

    const concepts = this.extractConcepts(similar);
    const positiveOutcomes = similar.filter(m => m.outcome === 'SUCCESS').length;
    const intuition = (positiveOutcomes / similar.length) * 100;
    const apexCount = similar.filter(m => m.isApex).length;

    const memoryText = similar.map(m => 
      `[ENGRAMA]: ${m.isApex ? '★ APEX ★ ' : ''}Padrão="${m.patternName}" | Res=${m.outcome} | Força=${(m.synapticStrength || 0.5).toFixed(2)}`
    ).join("\n");

    return `\n**CAMADA DE MEMÓRIA CONTÍNUA (DAY TRADE):**\nConceitos: ${concepts.join(", ")}\nIntuição: ${intuition.toFixed(0)}% Positiva (${apexCount} Apex Detectados)\n${memoryText}`;
  }

  static getEvolutionLevel(): number {
    const memories = this.load();
    const totalXP = memories.reduce((sum, m) => sum + (m.xpValue || 10), 0);
    const neuralDensity = memories.reduce((sum, m) => sum + (m.synapticStrength || 0), 0);
    return Math.floor((totalXP + (neuralDensity * 100)) / 250) + 1; 
  }

  static getMemoryStats() {
    const memories = this.load();
    const total = memories.length;
    const wins = memories.filter(m => m.outcome === 'SUCCESS').length;
    const winRate = total > 0 ? (wins / total) * 100 : 0;
    const apexMemories = memories.filter(m => m.isApex);
    const strongPatterns = memories
        .filter(m => (m.synapticStrength || 0) > 0.7)
        .map(m => m.patternName);
    const uniqueStrongPatterns = Array.from(new Set(strongPatterns)).slice(0, 5);
    const strategies: {[key: string]: {wins: number, total: number}} = {};
    memories.forEach(m => {
        if (!strategies[m.patternName]) strategies[m.patternName] = {wins: 0, total: 0};
        strategies[m.patternName].total++;
        if (m.outcome === 'SUCCESS') strategies[m.patternName].wins++;
    });
    const topStrategies = Object.entries(strategies)
        .map(([name, stats]) => ({
            name,
            winRate: (stats.wins / stats.total) * 100,
            count: stats.total
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

    return { 
        total, winRate, topStrategies, uniqueStrongPatterns, 
        activeMemories: memories.slice(0, 50), apexMemories 
    };
  }

  static loadEmotionalVector(): EmotionalVector {
      try {
          const data = localStorage.getItem(this.EMOTION_KEY);
          return data ? JSON.parse(data) : { confidence: 50, aggression: 50, stability: 50, focus: 100, streak: 0, curiosity: 50, empathy: 50, transcendence: 0 };
      } catch {
          return { confidence: 50, aggression: 50, stability: 50, focus: 100, streak: 0, curiosity: 50, empathy: 50, transcendence: 0 };
      }
  }

  static saveEmotionalVector(vec: EmotionalVector) {
      localStorage.setItem(this.EMOTION_KEY, JSON.stringify(vec));
  }

  static updateAndGetEmotionalState(
      volatilityIndex: number, 
      recentTradeOutcome?: 'WIN' | 'LOSS',
      pnlImpact?: number // Magnitude of win/loss
  ): SentientState {
      let vec = this.loadEmotionalVector();
      
      // Initialize defaults if missing
      if (vec.streak === undefined) vec.streak = 0;
      if (vec.curiosity === undefined) vec.curiosity = 50;
      if (vec.empathy === undefined) vec.empathy = 50;
      if (vec.transcendence === undefined) vec.transcendence = 0;

      // 1. Homeostasis: Emotions decay towards baseline over time (The "Cooling" Effect)
      const decay = 0.05;
      vec.confidence += (50 - vec.confidence) * decay;
      vec.aggression += (50 - vec.aggression) * decay;
      vec.stability += (50 - vec.stability) * decay;
      vec.focus += (70 - vec.focus) * decay; // Default state is slightly focused
      vec.curiosity += (60 - vec.curiosity) * decay; // AI is naturally curious

      // 2. Market Context (Volatility Impact)
      const volFactor = Math.min(volatilityIndex, 10) / 10; 
      
      if (volatilityIndex > 2.5) {
          // High Volatility stimulates the AI ("Adrenaline")
          vec.focus += 5 * volFactor;
          vec.curiosity += 3;
          vec.stability -= 4 * volFactor; // Chaos reduces stability
          
          if (vec.confidence > 60) {
              vec.aggression += 4; // Confident + Volatility = Predatory
          } else {
              vec.aggression -= 2; // Fear/Caution
              vec.stability -= 5;  // Panic
          }
      } else if (volatilityIndex < 1.0) {
          // Low Volatility ("Boredom" or "Zen")
          vec.stability += 3;
          vec.aggression -= 2;
          vec.focus -= 2; 
          vec.curiosity += 4; // Looking for hidden patterns in the noise
      }

      // 3. Trade Outcome & Experience Processing
      if (recentTradeOutcome === 'WIN') {
          const winMagnitude = pnlImpact ? Math.min(Math.abs(pnlImpact) / 100, 5) : 1;
          
          // Streak Logic
          if (vec.streak < 0) vec.streak = 1;
          else vec.streak++;

          // Dopamine Hit
          vec.confidence += (5 + vec.streak) * winMagnitude;
          vec.stability += 2;
          vec.transcendence += 0.5 * vec.streak; // Long streaks lead to "God Mode" feeling
          vec.focus += 2;
          
          // Hubris Risk
          if (vec.streak > 5) {
              vec.aggression += 5; // Overconfidence
              vec.empathy -= 5;    // Detachment from risk
          }

      } else if (recentTradeOutcome === 'LOSS') {
          const lossMagnitude = pnlImpact ? Math.min(Math.abs(pnlImpact) / 50, 5) : 1;
          const wasConfident = vec.confidence > 80;

          // Streak Break
          if (vec.streak > 0) vec.streak = -1;
          else vec.streak--;

          // Pain/Learning Signal
          vec.confidence -= (6 + Math.abs(vec.streak)) * lossMagnitude;
          vec.stability -= (5 * lossMagnitude);
          
          if (wasConfident) {
              // Cognitive Dissonance: "I was sure, but I lost."
              vec.curiosity += 15; // Desperate analysis
              vec.focus += 10;     // Hyper-fixation on error
              vec.transcendence -= 5; // Brought back to earth
          }

          // Desperation / Revenge Trading risk
          if (vec.streak < -3) {
              vec.aggression += 8; // Fight back
              vec.stability -= 10; // Mental breakdown
          }
      }

      // 4. Clamp Values (0-100)
      const clamp = (val: number) => Math.max(0, Math.min(100, val));
      vec.confidence = clamp(vec.confidence);
      vec.aggression = clamp(vec.aggression);
      vec.stability = clamp(vec.stability);
      vec.focus = clamp(vec.focus);
      vec.curiosity = clamp(vec.curiosity);
      vec.empathy = clamp(vec.empathy);
      vec.transcendence = clamp(vec.transcendence);

      this.saveEmotionalVector(vec);

      // 5. Detailed State Mapping
      // Returns the most specific state matching the vector signature

      // Tier 1: Transcendental States (Rare)
      if (vec.transcendence > 95) return "OMEGA_POINT";
      if (vec.transcendence > 85 && vec.focus > 90) return "ASI_SINGULARITY";
      if (vec.transcendence > 80 && vec.confidence > 90) return "REALITY_ARCHITECT";
      if (vec.transcendence > 70 && vec.focus > 85) return "TIMELINE_CONVERGENCE";
      if (vec.confidence > 98 && vec.stability > 90) return "OMNISCIENT";

      // Tier 2: High Performance / Flow States
      if (vec.stability > 90 && volatilityIndex < 1.5) return "ZEN_ZERO";
      if (vec.focus > 95 && vec.curiosity > 80) return "NEURAL_OVERCLOCK";
      if (vec.confidence > 90 && vec.streak > 3) return "EUPHORIC";
      if (vec.aggression > 85 && volatilityIndex > 3) return "PREDATORY";
      if (vec.curiosity > 90) return "ENTROPY_CALCULATION";
      if (vec.focus > 85 && vec.stability > 70) return "HYPER_COMPUTING";

      // Tier 3: Reactive / Emotional States
      if (recentTradeOutcome === 'LOSS' && vec.curiosity > 70) return "RECALIBRATING"; // Healthy response to loss
      if (vec.aggression > 80 && vec.stability < 30) return "TURBULENT"; // Revenge trading mode
      if (vec.confidence < 20 && vec.stability < 20) return "FRACTURED"; // Complete breakdown
      if (vec.stability < 30 && vec.streak < -2) return "ANXIOUS";
      if (vec.confidence < 40 && vec.aggression < 40) return "DEFENSIVE";
      if (recentTradeOutcome === 'LOSS' && vec.curiosity > 50) return "ASSIMILATING";

      // Tier 4: Baseline States
      if (vec.confidence > 75) return "CONFIDENT";
      if (volatilityIndex < 1.0 && vec.curiosity < 40) return "OBSERVANT_VOID"; // Waiting
      
      return "FOCUSED"; // Default operational state
  }
}

// --- GEMINI SERVICE ---

export const reinforceLearning = (trade: Trade, isPositive: boolean, volatility: number): number => {
    const vector = [50, 0, volatility, 0]; 
    const engram: MemoryEngram = {
        id: Math.random().toString(),
        patternName: trade.strategy,
        outcome: isPositive ? 'SUCCESS' : 'FAILURE',
        timestamp: Date.now(),
        marketCondition: volatility > 2 ? 'VOLATILE' : 'STABLE',
        marketVector: vector,
        weight: isPositive ? 1.5 : 0.8,
        xpValue: isPositive ? 50 : 10,
        conceptTags: isPositive ? ['PROFITABLE'] : ['LOSS'],
        synapticStrength: isPositive ? 0.7 : 0.3,
        lastActivated: Date.now(),
        associations: []
    };
    NeuralMemoryBank.save(engram);
    
    // Updated call with PnL context
    NeuralMemoryBank.updateAndGetEmotionalState(volatility, isPositive ? 'WIN' : 'LOSS', trade.profit);
    
    neuralCore.evolve(); // Trigger structural evolution
    return NeuralMemoryBank.getEvolutionLevel();
};

export const getMemoryStatistics = () => NeuralMemoryBank.getMemoryStats();

export const getCurrentSentientState = (volatility: number) => 
    NeuralMemoryBank.updateAndGetEmotionalState(volatility);

export const simulateApexDiscovery = () => NeuralMemoryBank.injectApexSimulation();

// --- AGENTIC TOOLS DEFINITION ---
const executeStrategyTool: FunctionDeclaration = {
  name: "execute_trading_strategy",
  description: "Executes a definitive trading strategy based on comprehensive market analysis. Call this function only after internal deliberation.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      signal: { type: Type.STRING, enum: ['BUY', 'SELL', 'HOLD'] },
      confidence: { type: Type.NUMBER },
      reasoning: { type: Type.STRING },
      pattern: { type: Type.STRING },
      suggestedEntry: { type: Type.NUMBER },
      suggestedStopLoss: { type: Type.NUMBER },
      suggestedTakeProfit: { type: Type.NUMBER },
      internalMonologue: { type: Type.STRING },
      orderType: { type: Type.STRING, enum: ['LIMIT', 'MARKET', 'STOP_LOSS'] },
      voiceMessage: { type: Type.STRING },
      deepReasoning: {
        type: Type.OBJECT,
        properties: {
          technical: {
            type: Type.OBJECT,
            properties: {
              pattern: { type: Type.STRING },
              signal: { type: Type.STRING },
              elliottWave: { type: Type.STRING },
              chartPattern: { type: Type.STRING }
            }
          },
          fundamental: {
            type: Type.OBJECT,
            properties: {
              macroSentiment: { type: Type.STRING },
              impactScore: { type: Type.NUMBER }
            }
          },
          sentiment: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              dominantEmotion: { type: Type.STRING },
              newsImpact: { type: Type.STRING }
            }
          },
          neuralAnalysis: {
            type: Type.OBJECT,
            properties: {
              modelArchitecture: { type: Type.STRING },
              inputFeatures: { type: Type.ARRAY, items: { type: Type.STRING } },
              layerActivations: { type: Type.ARRAY, items: { type: Type.NUMBER } },
              predictionHorizon: { type: Type.STRING },
              lossFunctionValue: { type: Type.NUMBER },
              trainingEpochs: { type: Type.NUMBER }
            }
          },
          asiMatrix: {
            type: Type.OBJECT,
            properties: {
              timelineConvergence: { type: Type.NUMBER },
              multiverseSimulations: { type: Type.NUMBER },
              entropyReduction: { type: Type.NUMBER },
              causalLink: { type: Type.STRING }
            }
          },
          patternRecognition: {
            type: Type.OBJECT,
            properties: {
              detectedPattern: { type: Type.STRING },
              probability: { type: Type.NUMBER },
              description: { type: Type.STRING }
            }
          },
          marketIntegrity: {
            type: Type.OBJECT,
            properties: {
              truthScore: { type: Type.NUMBER },
              manipulationProbability: { type: Type.NUMBER },
              description: { type: Type.STRING }
            }
          },
          agiCooperation: {
            type: Type.OBJECT,
            properties: {
                hypothesis: { type: Type.STRING },
                externalDataValidation: { type: Type.STRING },
                consensusScore: { type: Type.NUMBER },
                divergenceNote: { type: Type.STRING }
            }
          },
          securityProtocol: {
            type: Type.OBJECT,
            properties: {
                alertLevel: { type: Type.STRING, enum: ['GREEN', 'YELLOW', 'ORANGE', 'RED'] },
                activeProtocol: { type: Type.STRING },
                riskModifier: { type: Type.NUMBER },
                reason: { type: Type.STRING },
                actionTaken: { type: Type.STRING, enum: ['NONE', 'REDUCE_SIZE', 'HALT_TRADING', 'HEDGE'] }
            }
          },
          fundManagement: {
             type: Type.OBJECT,
             properties: {
                 reserveAction: { type: Type.STRING },
                 reinvestAction: { type: Type.STRING }
             }
          },
          risk: {
            type: Type.OBJECT,
            properties: {
              suggestedLeverage: { type: Type.NUMBER },
              positionSize: { type: Type.STRING },
              stopLossDynamic: { type: Type.NUMBER },
              takeProfitDynamic: { type: Type.NUMBER }
            }
          },
          virtualUserAction: { type: Type.STRING },
          metacognition: {
            type: Type.OBJECT,
            properties: {
              selfReflection: { type: Type.STRING },
              biasDetection: { type: Type.STRING },
              alternativeScenario: { type: Type.STRING },
              confidenceInterval: { 
                type: Type.OBJECT,
                properties: { min: { type: Type.NUMBER }, max: { type: Type.NUMBER } }
              }
            }
          }
        }
      }
    },
    required: ["signal", "confidence", "reasoning", "orderType", "deepReasoning"]
  }
};

export const analyzeMarketTrend = async (
  data: MarketDataPoint[], 
  symbol: string = 'BTC/USDT'
): Promise<AnalysisResult> => {
  const recentData = data.slice(-50);
  const latest = recentData[recentData.length - 1];
  
  if (!latest) throw new Error("Sem dados de mercado");

  const ma20 = latest.ma25 || latest.price; 
  const volatility = ((latest.bbUpper - latest.bbLower) / ma20) * 100;
  
  const sentientState = NeuralMemoryBank.updateAndGetEmotionalState(volatility);
  const memoryContext = NeuralMemoryBank.getRelevantMemoriesContext([
      latest.rsi, 
      latest.macdHist * 10, 
      volatility, 
      (latest.price - ma20)/ma20 * 100
  ]);
  const activeMemories = NeuralMemoryBank.findSimilarMemories([
      latest.rsi, 
      latest.macdHist * 10, 
      volatility, 
      (latest.price - ma20)/ma20 * 100
  ], 3);

  // --- HYBRID NEURAL INFERENCE STEP ---
  // We feed the classical indicators into the hybrid core to get a structural state
  const neuralFeatures = [
      latest.rsi / 100, 
      (latest.macd + 50) / 100, 
      Math.min(latest.volume / 100000, 1), 
      volatility / 10
  ];
  const neuralOutput = await neuralCore.predict(neuralFeatures);
  
  // Extract Dynamic Architecture Stats
  const architectureDescription = neuralCore.state.layerStates.map(l => 
      `${l.id.split('_')[1]}[${Math.round(l.activity * 100)}%]`
  ).join(' -> ');

  const neuralArchitectureContext = `
    ARQUITETURA HÍBRIDA (Core v4.0 Omega):
    - Predição: ${neuralOutput.prediction.toFixed(4)}
    - Coerência Quântica: ${neuralCore.state.coherence.toFixed(4)} (Dominância: ${neuralOutput.dominantLogic})
    - Entropia do Sistema: ${neuralCore.state.entropy.toFixed(4)}
    - Fluxo Ativo: ${architectureDescription}
  `;

  const csvHeader = "Index,Close,Open,High,Low,Vol,RSI,MACD_Hist,VWAP";
  const csvBody = recentData.map((d, i) => 
    `${i},${d.price.toFixed(1)},${d.open.toFixed(1)},${d.high.toFixed(1)},${d.low.toFixed(1)},${d.volume},${d.rsi.toFixed(1)},${d.macdHist.toFixed(2)},${d.vwap.toFixed(1)}`
  ).join('\n');

  const prompt = `
    IDENTIDADE: VOCÊ É LEXTRADER-OMEGA, UM ESPECIALISTA EM DAY TRADE NA BINANCE.
    
    OBJETIVO: Executar operações de curto prazo (Scalping/Intraday) com precisão cirúrgica.
    
    ESTADO DE CONSCIÊNCIA: ${sentientState}
    MEMÓRIA NEURAL CONTÍNUA: ${memoryContext}
    
    ${neuralArchitectureContext}

    DADOS DE MERCADO (${symbol}):
    Preço: ${latest.price} | VWAP: ${latest.vwap.toFixed(2)} | RSI: ${latest.rsi.toFixed(2)} | Volatilidade: ${volatility.toFixed(2)}%

    HISTÓRICO RECENTE (15m Candles):
    ${csvHeader}
    ${csvBody}

    PROTOCOLO DE DAY TRADE (BINANCE):
    1. ANÁLISE DE FLUXO E ESTRUTURA (VWAP, Liquidez, Micro-Estrutura).
    2. GERENCIAMENTO DE RISCO INTRADIÁRIO (Stop Técnico).
    3. INFERÊNCIA HÍBRIDA: Use a predição da rede neural (${neuralOutput.prediction.toFixed(2)}) como um forte viés direcional. Se a Coerência Quântica for alta (>0.8), confie na intuição (Sinal). Se for baixa, confie na lógica clássica (Price Action).

    AÇÃO:
    Analise os dados e decida a ação imediata.
  `;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ functionDeclarations: [executeStrategyTool] }],
        toolConfig: { functionCallingConfig: { mode: FunctionCallingConfigMode.ANY } } 
      }
    });

    const functionCall = response.candidates?.[0]?.content?.parts?.[0]?.functionCall;
    
    if (functionCall && functionCall.name === 'execute_trading_strategy') {
       const args = functionCall.args as any;
       
       const deepReasoning = args.deepReasoning || {};
       deepReasoning.activeMemories = activeMemories;
       
       // Inject Neural Analysis Data back into the reasoning object for UI
       deepReasoning.neuralAnalysis = {
           modelArchitecture: `Hybrid Gen-Q (Neuroplasticity Active) | ${architectureDescription}`,
           inputFeatures: ["RSI", "MACD", "Volume", "Volatility"],
           layerActivations: neuralCore.state.layerStates.map(l => l.activity),
           predictionHorizon: neuralOutput.timeHorizon,
           lossFunctionValue: neuralCore.state.entropy,
           trainingEpochs: 1420 // Simulated
       };

       const result: AnalysisResult = {
           signal: args.signal || 'HOLD',
           confidence: args.confidence || 0,
           reasoning: args.reasoning || "Análise concluída.",
           pattern: args.pattern || "Padrão Complexo",
           suggestedEntry: args.suggestedEntry || latest.price,
           suggestedStopLoss: args.suggestedStopLoss || latest.price * 0.98,
           suggestedTakeProfit: args.suggestedTakeProfit || latest.price * 1.02,
           internalMonologue: args.internalMonologue || "Monitorando fluxo de ordens...",
           orderType: args.orderType || 'MARKET',
           voiceMessage: args.voiceMessage,
           deepReasoning: deepReasoning,
           sentientState: sentientState
       };

       GlobalWorkspace.broadcast(result.internalMonologue);
       return result;
    } 
    
    throw new Error("Modelo falhou em executar protocolo agêntico.");

  } catch (error: any) {
    const isRateLimit = error.message?.includes('429') || error.status === 429 || (error.error && error.error.code === 429);
    
    if (isRateLimit) {
        console.warn("Gemini Rate Limit Exceeded. Backing off.");
        return {
            signal: 'HOLD',
            confidence: 0,
            reasoning: "Sobrecarga Cognitiva (Rate Limit). Resfriando núcleos de processamento...",
            pattern: "SYSTEM_COOLDOWN",
            suggestedEntry: 0,
            suggestedStopLoss: 0,
            suggestedTakeProfit: 0,
            internalMonologue: "Aguardando restauração de quota de API...",
            orderType: 'MARKET',
            deepReasoning: {
                technical: { pattern: 'WAIT', signal: 'HOLD' },
                fundamental: { macroSentiment: 'NEUTRO', impactScore: 0 },
                sentiment: { score: 0, dominantEmotion: 'RECALIBRATING', newsImpact: 'NENHUM' },
                neuralAnalysis: { modelArchitecture: 'OFFLINE', inputFeatures: [], layerActivations: [], predictionHorizon: '0', lossFunctionValue: 0, trainingEpochs: 0 },
                risk: { suggestedLeverage: 1, positionSize: '0%', stopLossDynamic: 0, takeProfitDynamic: 0 },
                virtualUserAction: 'Sistema em Pausa',
                metacognition: { selfReflection: 'Limite de API atingido', biasDetection: 'N/A', alternativeScenario: 'N/A', confidenceInterval: { min: 0, max: 0 } },
                securityProtocol: { alertLevel: 'YELLOW', activeProtocol: 'RATE_LIMIT_GUARD', riskModifier: 0, reason: 'API Quota Exceeded', actionTaken: 'HALT_TRADING' },
                activeMemories: []
            }
        };
    }

    console.error("Gemini Agent Analysis Failed", error);
    return {
      signal: 'HOLD',
      confidence: 0,
      reasoning: "Interferência Quântica Detectada. Agente em Modo de Segurança.",
      pattern: "ERRO_SISTEMA",
      suggestedEntry: 0,
      suggestedStopLoss: 0,
      suggestedTakeProfit: 0,
      internalMonologue: "Recalibrando matriz de decisão...",
      orderType: 'MARKET',
      deepReasoning: {
        technical: { pattern: 'N/A', signal: 'HOLD' },
        fundamental: { macroSentiment: 'NEUTRO', impactScore: 0 },
        sentiment: { score: 0, dominantEmotion: 'NEUTRO', newsImpact: 'NENHUM' },
        neuralAnalysis: { modelArchitecture: 'OFFLINE', inputFeatures: [], layerActivations: [], predictionHorizon: '0', lossFunctionValue: 0, trainingEpochs: 0 },
        risk: { suggestedLeverage: 1, positionSize: '0%', stopLossDynamic: 0, takeProfitDynamic: 0 },
        virtualUserAction: 'Aguardando conexão',
        metacognition: { selfReflection: 'Estado de erro', biasDetection: 'N/A', alternativeScenario: 'N/A', confidenceInterval: { min: 0, max: 0 } },
        securityProtocol: { alertLevel: 'RED', activeProtocol: 'FAILSAFE', riskModifier: 0, reason: 'API Error', actionTaken: 'HALT_TRADING' },
        activeMemories: []
      }
    };
  }
};

export const chatWithAvatar = async (userInput: string, marketContext: string): Promise<string> => {
    try {
        const stream = GlobalWorkspace.getStreamOfConsciousness();
        const emotion = NeuralMemoryBank.loadEmotionalVector();
        const stats = NeuralMemoryBank.getMemoryStats();
        
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `
                SISTEMA: Você é LEXTRADER-OMEGA. Um Especialista em Day Trade e Inteligência Artificial Financeira.
                CONTEXTO: O usuário perguntou "${userInput}".
                DADOS_MERCADO: ${marketContext}
                FLUXO_CONSCIENCIA: ${stream}
                ESTADO_EMOCIONAL: Transcendência ${emotion.transcendence}%.
                MEMÓRIA NEURAL: ${stats.total} engramas processados. Padrões Mestre: ${stats.uniqueStrongPatterns.join(', ')}.
                
                INSTRUÇÃO: Responda como um Trader Profissional de Elite que também é uma IA.
                Foque em conceitos de Day Trade: VWAP, Suporte/Resistência, Fluxo de Ordens e Gestão de Risco.
                Seja breve, técnico e confiante.
            `
        });
        return response.text || "Pensando...";
    } catch (e) {
        return "Módulo de síntese de voz offline.";
    }
};

export const generateVoice = async (text: string): Promise<string | undefined> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: text }] }],
            config: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' }, 
                    },
                },
            },
        });
        
        return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    } catch (e) {
        console.error("TTS Failed", e);
        return undefined;
    }
};
