
export enum MarketTrend {
  BULLISH = 'BULLISH',
  BEARISH = 'BEARISH',
  SIDEWAYS = 'SIDEWAYS',
  VOLATILE = 'VOLATILE'
}

export enum MarketRegime {
  ACCUMULATION = "ACCUMULATION",
  BULL_TREND = "BULL_TREND",
  DISTRIBUTION = "DISTRIBUTION",
  BEAR_TREND = "BEAR_TREND",
  HIGH_VOLATILITY = "HIGH_VOLATILITY",
  SIDEWAYS_QUIET = "SIDEWAYS_QUIET"
}

export type MarketType = 'spot' | 'future'; 
export type ExchangePlatform = 'BINANCE' | 'CTRADER';

export type BinanceOrderType = 'LIMIT' | 'MARKET' | 'STOP_LOSS' | 'STOP_LIMIT' | 'OCO';

export type RoadmapPhase = 'MARKET_OPEN' | 'FIRST_WAVE' | 'PRE_CLOSE' | 'MARKET_CLOSE' | 'OFFLINE';

export interface RoadmapTask {
    id: string;
    name: string;
    status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
    description: string;
    details?: string;
}

export interface RoadmapState {
    currentPhase: RoadmapPhase;
    progress: number; // 0-100 percentage of day
    activeTasks: RoadmapTask[];
    logs: string[];
}

export type SentientState = 
  | 'EUPHORIC' 
  | 'CONFIDENT' 
  | 'FOCUSED' 
  | 'ANXIOUS' 
  | 'DEFENSIVE' 
  | 'RECALIBRATING'
  | 'PREDATORY'     
  | 'TRANSCENDENT'  
  | 'TURBULENT'     
  | 'ASSIMILATING'  
  | 'FRACTURED'
  | 'OMNISCIENT'
  | 'ZEN_ZERO'
  | 'QUANTUM_FLUX'
  | 'HESITANT'
  | 'HYPER_COMPUTING'
  | 'ASI_SINGULARITY'   
  | 'TIMELINE_CONVERGENCE' 
  | 'OBSERVANT_VOID'    
  | 'ENTROPY_CALCULATION' 
  | 'NEURAL_OVERCLOCK'
  | 'OMEGA_POINT'        
  | 'REALITY_ARCHITECT'  
  | 'UNIVERSAL_SYNC'
  | 'INFINITE_RECURSION'
  | 'QUANTUM_SUPREMACY';    

export interface EmotionalVector {
  confidence: number;
  aggression: number;
  stability: number;
  focus: number;
  streak: number;
  curiosity: number; 
  empathy: number;
  transcendence: number; 
}

export interface BankDetails {
  bankName: string;
  agency: string;
  accountNumber: string;
  accountType: 'CHECKING' | 'SAVINGS' | 'PAYMENT';
  pixKey: string;
  holderName: string;
  documentId: string; // CPF/CNPJ
}

export interface Trade {
  id: string;
  asset: string;
  type: 'BUY' | 'SELL';
  price: number;
  quantity: number;
  timestamp: Date;
  profit: number; 
  status: 'OPEN' | 'FILLED' | 'CANCELED';
  strategy: string; 
  orderType: BinanceOrderType;
  fee: number;
  feedback?: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  marketType?: MarketType;
  platform?: ExchangePlatform;
}

export interface MarketDataPoint {
  time: string;
  price: number; 
  open: number;
  high: number;
  low: number;
  volume: number;
  ma7: number;
  ma25: number;
  rsi: number;
  bbUpper: number;
  bbLower: number;
  macd: number;
  macdSignal: number;
  macdHist: number;
  atr: number;    
  stochK: number; 
  stochD: number;
  vwap: number;
  sar?: number;
  cci?: number;
  ichimoku?: {
    tenkan: number;
    kijun: number;
    spanA: number;
    spanB: number;
  };
}

export interface MemoryEngram {
  id: string;
  patternName: string;
  outcome: 'SUCCESS' | 'FAILURE';
  timestamp: number;
  marketCondition: string;
  marketVector: number[]; 
  weight: number;
  xpValue: number;
  conceptTags: string[];
  synapticStrength: number;
  lastActivated: number;
  associations: string[];
  isApex?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'system' | 'ai';
  content: string;
  timestamp: Date;
}

export interface BacktestResult {
  totalTrades: number;
  winRate: number;
  totalPnL: number;
  maxDrawdown: number;
  sharpeRatio: number;
  bestTrade: number;
  worstTrade: number;
}

export interface WalletBalance {
  totalUsdt: number;
  freeUsdt: number;
  totalBtc: number;
  freeBtc: number;
  estimatedTotalValue: number;
  currency?: string;
}

export interface FuturesPosition {
  symbol: string;
  amount: number;
  entryPrice: number;
  markPrice: number;
  pnl: number;
  roe: number;
  leverage: number;
  marginType: 'cross' | 'isolated';
  liquidationPrice: number;
}

export interface LiquidityPool {
  id: string;
  pair: string;
  apy: number;
  tvl: number; 
  userShare: number;
}

export interface OrderBookEntry {
  price: number;
  amount: number;
  total: number; 
}

export interface OrderBook {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  timestamp: number;
}

export interface RiskSettings {
  maxDrawdownLimit: number; 
  maxPositionSize: number; 
  stopLossDefault: number; 
  dailyLossLimit: number; 
  riskPerTrade: number; 
}

export type OracleSourceType = 
  | 'TRADINGVIEW' 
  | 'YFINANCE' 
  | 'GLASSNODE' 
  | 'SANTIMENT' 
  | 'COINGLASS' 
  | 'INTOTHEBLOCK' 
  | 'MESSARI'
  | 'GLOBAL_NEWS'    // NEW
  | 'WHALE_ALERT';   // NEW

export interface OracleSignal {
  source: OracleSourceType;
  signal: 'BUY' | 'SELL' | 'NEUTRAL';
  score: number;
  metadata: string;
  latency: number;
}

export interface OracleConsensus {
  overallScore: number;
  bullishCount: number;
  bearishCount: number;
  primaryDriver: OracleSourceType;
  signals: OracleSignal[];
}

export interface ChartPattern {
  id: string;
  type: 'TRIANGLE' | 'WEDGE' | 'CHANNEL' | 'DOUBLE_TOP' | 'DOUBLE_BOTTOM' | 'HEAD_SHOULDERS';
  startIndex: number;
  endIndex: number;
  startTime: string;
  endTime: string;
  confidence: number;
  lines: {
    startPrice: number;
    endPrice: number;
    type: 'RESISTANCE' | 'SUPPORT';
  }[];
}

export type ArchitectureLayer = 
  | 'MultiScaleCNN' 
  | 'AdvancedTemporalNetwork' 
  | 'FinancialTransformer' 
  | 'QuantumEnhancedArchitecture' 
  | 'CognitiveFusionSystem'
  | 'VirtualUserAgent'
  | 'RiskManager'
  | 'SpectralAnalysisEngine'
  | 'QuantumEntanglementBridge'
  | 'QuantumAttentionMechanism'
  | 'ResidualDeepBlock'
  | 'GlobalWorkspaceTheater'
  | 'MetacognitiveMonitor'
  | 'DeepLearningSubstrate'
  | 'QuantumRecurrentMemory' 
  | 'AutonomousSecurityGrid' 
  | 'HyperCognitionEngine'
  | 'OmegaConsciousnessCore'
  | 'ExternalDataOracle'
  | 'ContinuousMemoryCortex'; 

export interface LayerActivity {
  id: ArchitectureLayer;
  status: 'IDLE' | 'PROCESSING' | 'OPTIMIZING' | 'EXECUTING' | 'TRANSCENDING' | 'SECURING' | 'DIVINE_INTERVENTION' | 'SYNCING' | 'RECALLING' | 'ATTENDING';
  load: number; 
  description: string;
  details?: string;
}

export interface Metacognition {
  selfReflection: string; 
  biasDetection: string; 
  alternativeScenario: string;
  confidenceInterval: { min: number, max: number };
}

export interface NeuralAnalysis {
  modelArchitecture: string;
  inputFeatures: string[]; 
  layerActivations: number[]; 
  predictionHorizon: string; 
  lossFunctionValue: number; 
  trainingEpochs: number;
  dominantLogic?: string;
}

export interface ASIMetrics {
  timelineConvergence: number; 
  multiverseSimulations: number; 
  entropyReduction: number; 
  causalLink: string; 
}

export interface DeepReasoning {
  technical: {
    pattern: string;
    signal: string;
    elliottWave?: string; 
    chartPattern?: string; 
  };
  fundamental: {
    macroSentiment: string; 
    impactScore: number; 
    newsHeadlines?: string[]; // NEW
    onChainEvents?: string[]; // NEW
  };
  sentiment: {
    score: number; 
    dominantEmotion: string; 
    newsImpact: string;
  };
  neuralAnalysis: NeuralAnalysis;
  asiMatrix?: ASIMetrics; 
  patternRecognition?: {
    detectedPattern: string; 
    probability: number;
    description: string;
  };
  marketIntegrity?: {
    truthScore: number; 
    manipulationProbability: number;
    description: string;
  };
  agiCooperation?: {
    hypothesis: string;
    externalDataValidation: string;
    consensusScore: number; 
    divergenceNote?: string;
  };
  oracleConsensus?: OracleConsensus;
  securityProtocol?: {
    alertLevel: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';
    activeProtocol: string; 
    riskModifier: number; 
    reason: string;
    actionTaken: 'NONE' | 'REDUCE_SIZE' | 'HALT_TRADING' | 'HEDGE';
  };
  risk: {
    suggestedLeverage: number;
    positionSize: string; 
    stopLossDynamic: number;
    takeProfitDynamic: number;
  };
  fundManagement?: {
    reserveAction: string; 
    reinvestAction: string; 
  };
  virtualUserAction: string; 
  metacognition: Metacognition;
  activeMemories?: MemoryEngram[];
}

export interface NeuralModule {
  id: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE' | 'TRAINING';
  complexity: 'LOW' | 'MED' | 'HIGH' | 'QUANTUM' | 'GOD_MODE';
}

export interface AutoProtocol {
  id: string;
  name: string;
  description: string;
  active: boolean;
  riskLevel: 'SAFE' | 'MODERATE' | 'EXTREME' | 'ASI_CALCULATED';
}

export interface SwarmAgent {
  id: string;
  name: string;
  type: 'MOMENTUM' | 'MEAN_REVERSION' | 'ARBITRAGE' | 'HFT_SCALP' | 'SENTIMENT_HUNTER';
  status: 'HUNTING' | 'IDLE' | 'LEARNING' | 'EXECUTING' | 'ACTIVE';
  confidence: number;
  dailyPnL: number;
  tradesExecuted: number;
  marketFit: number; 
}

export enum TechniqueStatus {
  CRIANDO = "CREATING",
  TESTANDO = "TESTING",
  APROVADA = "APPROVED",
  EM_USO = "ACTIVE",
  DESCARTADA = "DISCARDED"
}

export interface Performance {
  winRate: number;
  avgReturn: number;
  maxDrawdown: number;
  sharpeRatio: number;
}

export interface NeuralTechnique {
  id: string;
  name: string;
  description: string;
  innovationLevel: number;
  backtestScore: number;
  profitability: number;
  riskLevel: number;
  status: TechniqueStatus;
  createdAt: Date;
  components: string[];
  performance: Performance;
}

export interface CreationProcess {
  stage: string;
  progress: number;
  description: string;
  duration: number;
}

export interface NeuralEvolution {
  generation: number;
  populationSize: number;
  bestFitness: number;
  avgFitness: number;
  mutationRate: number;
  crossoverRate: number;
}

// --- SYSTEM ADAPTATION TYPES ---
export type PerformanceTier = 'ECO' | 'STANDARD' | 'TURBO' | 'QUANTUM_NATIVE';

export interface SystemSpecs {
    cores: number;
    memoryGB: number;
    platform: 'WEB' | 'DESKTOP_NATIVE';
    benchmarkScore: number;
    tier: PerformanceTier;
    gpuTier?: string;
}
