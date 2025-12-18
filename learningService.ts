
import { MarketDataPoint, Trade, BacktestResult, SwarmAgent, MarketRegime, OracleConsensus } from '../types';
import { QuantumNeuralNetwork, PredictionOutput } from './quantumService';
import { reinforceLearning } from './geminiService';
import { oracleService } from './oracleService';

// --- ENUMS & INTERFACES ---

export enum TradingAction {
  BUY = "BUY",
  SELL = "SELL",
  HOLD = "HOLD",
  HEDGE = "HEDGE"
}

export enum RiskLevel {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  EXTREME = "EXTREME"
}

export enum TimeHorizon {
    SCALP = "SCALP",
    INTRADAY = "INTRADAY",
    SWING = "SWING",
    LONG_TERM = "LONG_TERM"
}

export enum StrategyType {
    SCALPING = "SCALPING",
    DAY_TRADING = "DAY_TRADING",
    SWING_TRADING = "SWING_TRADING",
    POSITION_TRADING = "POSITION_TRADING"
}

export interface TradingSignal {
  symbol: string;
  action: TradingAction;
  confidence: number;
  priceTarget: number;
  stopLoss: number;
  takeProfit: number;
  quantity: number;
  timeHorizon: TimeHorizon;
  riskLevel: RiskLevel;
  quantumMetrics: Record<string, number>;
  timestamp: Date;
  strategyType?: StrategyType;
}

export interface PortfolioAllocation {
  symbol: string;
  allocation: number;
  expectedReturn: number;
  risk: number;
  quantumScore: number;
  rebalancePriority: number;
}

export interface TradingResult {
  signalId: string;
  symbol: string;
  action: TradingAction;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  duration: number;
  success: boolean;
  quantumAdvantage: number;
  timestamp: Date;
  // Compatibility
  learningWeight?: number;
}

// --- STRATEGY DEFINITIONS ---

interface TradingStrategy {
    name: string;
    type: StrategyType;
    timeHorizon: TimeHorizon;
    analyze(data: any, oracle?: OracleConsensus): Promise<TradingSignal | null>;
}

// 1. Short Term (Scalp) Strategy
class ShortTermScalperStrategy implements TradingStrategy {
    name = "Quantum Micro-Scalper";
    type = StrategyType.SCALPING;
    timeHorizon = TimeHorizon.SCALP;

    async analyze(data: { price: number, volatility: number, rsi?: number }, oracle?: OracleConsensus): Promise<TradingSignal | null> {
        // Mock logic: High volatility + RSI extreme = Scalp
        const rsi = data.rsi || 50;
        
        if (data.volatility > 0.02) {
            if (rsi < 30) {
                return {
                    symbol: "BTC/USDT",
                    action: TradingAction.BUY,
                    confidence: 0.85,
                    priceTarget: data.price * 1.005, // 0.5% gain
                    stopLoss: data.price * 0.998, // 0.2% loss
                    takeProfit: data.price * 1.005,
                    quantity: 0.5, // High leverage position
                    timeHorizon: this.timeHorizon,
                    riskLevel: RiskLevel.HIGH,
                    quantumMetrics: { entanglement: 0.9 },
                    timestamp: new Date(),
                    strategyType: this.type
                };
            } else if (rsi > 70) {
                return {
                    symbol: "BTC/USDT",
                    action: TradingAction.SELL,
                    confidence: 0.82,
                    priceTarget: data.price * 0.995,
                    stopLoss: data.price * 1.002,
                    takeProfit: data.price * 0.995,
                    quantity: 0.5,
                    timeHorizon: this.timeHorizon,
                    riskLevel: RiskLevel.HIGH,
                    quantumMetrics: { entanglement: 0.88 },
                    timestamp: new Date(),
                    strategyType: this.type
                };
            }
        }
        return null;
    }
}

// 2. Medium Term (Swing) Strategy
class MediumTermSwingStrategy implements TradingStrategy {
    name = "Neural Trend Surfer";
    type = StrategyType.SWING_TRADING;
    timeHorizon = TimeHorizon.SWING;

    async analyze(data: { price: number, volatility: number, trend?: string }, oracle?: OracleConsensus): Promise<TradingSignal | null> {
        // Use Oracle consensus for trend confirmation
        const oracleSentiment = oracle ? oracle.overallScore : 50;
        
        if (oracleSentiment > 65) {
             return {
                symbol: "ETH/USDT", // Example of diversifying
                action: TradingAction.BUY,
                confidence: 0.75,
                priceTarget: data.price * 1.05, // 5% gain
                stopLoss: data.price * 0.97, // 3% loss
                takeProfit: data.price * 1.05,
                quantity: 0.2,
                timeHorizon: this.timeHorizon,
                riskLevel: RiskLevel.MEDIUM,
                quantumMetrics: { entanglement: 0.6 },
                timestamp: new Date(),
                strategyType: this.type
            };
        }
        return null;
    }
}

// 3. Long Term (Position) Strategy
class LongTermHodlStrategy implements TradingStrategy {
    name = "Deep Value Accumulator";
    type = StrategyType.POSITION_TRADING;
    timeHorizon = TimeHorizon.LONG_TERM;

    async analyze(data: { price: number, volatility: number }, oracle?: OracleConsensus): Promise<TradingSignal | null> {
        // Relies heavily on fundamental oracle data
        const oracleSentiment = oracle ? oracle.overallScore : 50;
        const fundamentalScore = oracle?.signals.find(s => s.source === 'GLASSNODE')?.score || 50;

        if (oracleSentiment > 80 && fundamentalScore < 30) { // High sentiment + Low NUPL (Undervalued)
             return {
                symbol: "BTC/USDT",
                action: TradingAction.BUY,
                confidence: 0.95,
                priceTarget: data.price * 1.5, // 50% gain
                stopLoss: data.price * 0.8, // Wide stop
                takeProfit: data.price * 2.0,
                quantity: 1.0, // Large position
                timeHorizon: this.timeHorizon,
                riskLevel: RiskLevel.LOW, // Long term risk is lower volatility-wise
                quantumMetrics: { entanglement: 0.99 },
                timestamp: new Date(),
                strategyType: this.type
            };
        }
        return null;
    }
}

// --- MOCKED DEPENDENCIES (Simulating External Modules) ---

export interface QuantumConfig {
    mode: 'high_performance' | 'balanced' | 'safe';
    qubits: number;
}

export function createHighPerformanceConfig(): QuantumConfig {
    return { mode: 'high_performance', qubits: 50 };
}

class QuantumPriceAnalysis {
    async analyzePriceQuantum(symbol: string, history: number[]): Promise<{ trend: string, probability: number }> {
        // Simulation
        return { trend: 'BULLISH', probability: 0.85 + (Math.random() * 0.1) };
    }
}

class QuantumArbitrage {
    async detectQuantumArbitrage(): Promise<any[]> {
        // Simulation
        if (Math.random() > 0.9) return [{ pair: "BTC/ETH", profit: 0.02 }];
        return [];
    }
}

class SimuladorQuantum {
    async analyzeMarketQuantum(data: any): Promise<any> {
        return { volatility: 'LOW', regime: 'NORMAL', entropy: Math.random() };
    }
}

// --- DEEP LEARNING MODULE ---

class DeepQuantumLearning {
    private network: QuantumNeuralNetwork;
    private memoryBank: any[] = []; // Cache for rapid access
    private currentEpoch: number = 0;
    private currentLoss: number = 0.5;
    
    constructor() {
        this.network = new QuantumNeuralNetwork();
    }

    async initialize() {
        await this.network.initialize();
        this.syncMemory();
        this.currentEpoch = 0;
    }

    syncMemory() {
        try {
            const data = localStorage.getItem('LEXTRADER_NEURAL_MEMORY');
            if (data) this.memoryBank = JSON.parse(data);
        } catch (e) { console.warn("Memory Sync Failed"); }
    }

    async runDeepLearningEpoch(experience: { tradeResult: TradingResult }) {
        this.currentEpoch++;
        const outcome = experience.tradeResult.pnl > 0 ? "POSITIVE" : "NEGATIVE";
        
        // Simulate Backpropagation and Loss Reduction
        const learningRate = 0.01;
        if (outcome === "POSITIVE") {
            this.currentLoss = Math.max(0.001, this.currentLoss - (learningRate * 0.1));
        } else {
            this.currentLoss = Math.min(1.0, this.currentLoss + (learningRate * 0.2));
        }

        console.log(`[DeepLearner] Epoch ${this.currentEpoch} | Loss: ${this.currentLoss.toFixed(5)} | Assimilating: ${experience.tradeResult.signalId}`);
        this.syncMemory(); // Refresh local cache
    }

    async learnFromExperience(experience: { tradeResult: TradingResult }) {
        await this.runDeepLearningEpoch(experience);
    }

    /**
     * EXPANDED PREDICTION EFFICIENCY
     * Includes ATR and ROC calculations for better volatility handling.
     */
    async predictWithKnowledge(marketData: MarketDataPoint[], oracleConsensus?: OracleConsensus): Promise<number> {
        if (!marketData || marketData.length === 0) return 0.5;
        
        const lastPoint = marketData[marketData.length - 1];
        
        // 1. Current State Vector (must match format in geminiService)
        const ma20 = lastPoint.ma25 || lastPoint.price; 
        const volatilityIndex = ((lastPoint.bbUpper - lastPoint.bbLower) / ma20) * 100;
        
        const currentVector = [
            lastPoint.rsi,                  
            lastPoint.macdHist * 10,        
            volatilityIndex,                
            (lastPoint.price - ma20) / ma20 * 100 
        ];

        // 2. Quantum Prediction (The "Intuition")
        // Feed expanded feature set (multi-timeframe flattened)
        const lookback = 5;
        const recentData = marketData.slice(-lookback);
        const features = recentData.flatMap((point, idx) => {
            const prev = recentData[idx - 1];
            // ROC: Rate of Change
            const roc = prev ? (point.price - prev.price) / prev.price : 0;
            // ATR Proxy (High - Low)
            const atr = point.bbUpper - point.bbLower; 

            return [
                (point.rsi || 50) / 100, 
                ((point.macd || 0) + 50) / 100, 
                Math.min((point.volume || 0) / 10000, 1), 
                roc * 100, // Normalized ROC
                Math.min(atr / point.price * 100, 1) // Normalized ATR
            ];
        });

        const quantumResult = await this.network.predict(features);
        let prediction = quantumResult.prediction;

        // 3. Associative Memory Recall (The "Wisdom")
        const similarMemories = this.findNearestNeighbors(currentVector);
        if (similarMemories.length > 0) {
            const successCount = similarMemories.filter(m => m.outcome === 'SUCCESS').length;
            const historicalProb = successCount / similarMemories.length;
            const memoryWeight = Math.min(similarMemories.length * 0.1, 0.5); 
            prediction = (prediction * (1 - memoryWeight)) + (historicalProb * memoryWeight);
        }

        // 4. Oracle Fusion (The "Omniscience")
        if (oracleConsensus) {
            // Normalize Oracle Score (0-100) to 0-1
            const oracleProb = oracleConsensus.overallScore / 100;
            // Weight external data heavily (30%)
            const oracleWeight = 0.3;
            prediction = (prediction * (1 - oracleWeight)) + (oracleProb * oracleWeight);
        }

        return prediction;
    }

    private findNearestNeighbors(currentVector: number[], k: number = 5): any[] {
        if (this.memoryBank.length === 0) return [];
        
        const scored = this.memoryBank.map(mem => {
            const memVector = mem.marketVector || [50, 0, 0, 0]; // Fallback
            const dist = Math.sqrt(currentVector.reduce((sum, val, i) => sum + Math.pow(val - (memVector[i] || 0), 2), 0));
            return { mem, dist };
        });

        // Sort by distance (asc)
        scored.sort((a, b) => a.dist - b.dist);
        return scored.slice(0, k).map(s => s.mem);
    }
}

// --- QUANTUM ALGORITHMS TRADER (BASE CLASS) ---

export class QuantumAlgorithmsTrader {
  protected config: QuantumConfig;
  protected quantumNN: QuantumNeuralNetwork;
  protected priceAnalyzer: QuantumPriceAnalysis;
  protected arbitrageDetector: QuantumArbitrage;
  protected quantumSimulator: SimuladorQuantum;
  
  // Strategy Modules
  protected strategies: TradingStrategy[] = [];

  public portfolio: Record<string, any> = {};
  public tradingSignals: TradingSignal[] = [];
  public executionHistory: TradingResult[] = [];
  public riskMetrics: Record<string, any> = {};
  public marketData: Record<string, any> = {};
  public tradingParams = {
    maxPositionSize: 0.1,
    dailyLossLimit: 0.02,
    maxDrawdown: 0.05,
    riskFreeRate: 0.02
  };

  // Swarm Intelligence State
  public activeAgents: SwarmAgent[] = [];
  public currentRegime: MarketRegime = MarketRegime.SIDEWAYS_QUIET;
  public lastOracleConsensus: OracleConsensus | undefined;

  public isRunning = false;
  public capital = 100000.0;

  constructor(config?: QuantumConfig) {
    this.config = config || createHighPerformanceConfig();
    this.quantumNN = new QuantumNeuralNetwork();
    this.priceAnalyzer = new QuantumPriceAnalysis();
    this.arbitrageDetector = new QuantumArbitrage();
    this.quantumSimulator = new SimuladorQuantum();
    
    // Initialize default swarm
    this.initializeSwarm();
    // Initialize Strategies
    this.strategies = [
        new ShortTermScalperStrategy(),
        new MediumTermSwingStrategy(),
        new LongTermHodlStrategy()
    ];
    
    console.info("🚀 Quantum Algorithms Trader Inicializado");
  }

  initializeSwarm() {
      this.activeAgents = [
          { id: 'alpha-1', name: 'Momentum Prime', type: 'MOMENTUM', status: 'ACTIVE', confidence: 0.85, dailyPnL: 120, tradesExecuted: 5, marketFit: 0.9 },
          { id: 'beta-2', name: 'MeanRev Scout', type: 'MEAN_REVERSION', status: 'IDLE', confidence: 0.60, dailyPnL: 0, tradesExecuted: 0, marketFit: 0.4 },
          { id: 'gamma-3', name: 'Arb Hunter', type: 'ARBITRAGE', status: 'HUNTING', confidence: 0.92, dailyPnL: 45, tradesExecuted: 2, marketFit: 0.7 },
      ];
  }

  async initialize(): Promise<void> {
    console.info("🔄 Inicializando módulos quânticos...");
    await Promise.all([
      this.quantumNN.initialize(),
      this.priceAnalyzer.analyzePriceQuantum("BTC/USD", [45000]),
      this.arbitrageDetector.detectQuantumArbitrage(),
      this.quantumSimulator.analyzeMarketQuantum({})
    ]);
    this.isRunning = true;
    console.info("✅ Todos os módulos quânticos inicializados");
  }

  async executeTradingCycle(): Promise<void> {
    if (!this.isRunning) return;
    const startTime = Date.now();
    const marketData = await this.collectMarketData();
    
    // 1. Fetch Oracle Data
    this.lastOracleConsensus = await oracleService.getMarketConsensus("BTC/USDT");

    // 2. Detect Regime
    this.detectMarketRegime(marketData);
    
    // 3. Evolve Swarm based on Regime
    this.adaptSwarmToRegime();

    // 4. GENERATE MULTI-TIMEFRAME SIGNALS
    const strategySignals = await this.runStrategies(marketData);
    
    const pricePredictions = await this.analyzePricesQuantum(marketData);
    const arbitrageOps = await this.detectArbitrageOpportunities(marketData);
    
    // Merge standard quantum signals with specific strategy signals
    const stdSignals = await this.generateTradingSignals(pricePredictions, arbitrageOps);
    this.tradingSignals = [...stdSignals, ...strategySignals].slice(0, 20); // Keep buffer manageable

    const portfolioAllocation = await this.optimizePortfolioQuantum(this.tradingSignals);
    const executionResults = await this.executeTrades(portfolioAllocation);
    await this.learnFromExecution(executionResults);
    
    // Update Agent Stats based on execution
    this.updateAgentStats(executionResults);

    const cycleDuration = (Date.now() - startTime) / 1000;
    await this.updateTradingMetrics(executionResults, cycleDuration);
  }

  async runStrategies(marketData: Record<string, any>): Promise<TradingSignal[]> {
      const signals: TradingSignal[] = [];
      const btcData = marketData['BTC/USD'];
      if (!btcData) return [];

      // Add a simulated RSI for the strategy logic
      btcData.rsi = 50 + (Math.random() - 0.5) * 40; 

      for (const strategy of this.strategies) {
          // If in high volatility, skip long term
          if (this.currentRegime === MarketRegime.HIGH_VOLATILITY && strategy.timeHorizon === TimeHorizon.LONG_TERM) continue;
          
          const signal = await strategy.analyze(btcData, this.lastOracleConsensus);
          if (signal) signals.push(signal);
      }
      return signals;
  }

  // --- REGIME & SWARM LOGIC ---

  private detectMarketRegime(marketData: Record<string, any>) {
      // Simplified detection based on BTC
      const btc = marketData["BTC/USD"];
      if (!btc) return;

      const volatility = btc.volatility;
      const trend = btc.price > 64000 ? 1 : -1; // Mock threshold

      if (volatility > 0.03) {
          this.currentRegime = MarketRegime.HIGH_VOLATILITY;
      } else if (trend > 0) {
          this.currentRegime = MarketRegime.BULL_TREND;
      } else if (trend < 0) {
          this.currentRegime = MarketRegime.BEAR_TREND;
      } else {
          this.currentRegime = MarketRegime.ACCUMULATION;
      }
  }

  private adaptSwarmToRegime() {
      // Logic to spawn/kill agents based on regime
      // e.g., Bull Trend -> Add Momentum, Hibernate Mean Reversion
      
      this.activeAgents = this.activeAgents.map(agent => {
          let newStatus = agent.status;
          let fit = agent.marketFit;

          if (this.currentRegime === MarketRegime.BULL_TREND) {
              if (agent.type === 'MOMENTUM') {
                  newStatus = 'EXECUTING';
                  fit = Math.min(1, fit + 0.05);
              } else if (agent.type === 'MEAN_REVERSION') {
                  newStatus = 'IDLE';
                  fit = Math.max(0, fit - 0.05);
              }
          } else if (this.currentRegime === MarketRegime.HIGH_VOLATILITY) {
              if (agent.type === 'ARBITRAGE' || agent.type === 'HFT_SCALP') {
                  newStatus = 'HUNTING';
                  fit = Math.min(1, fit + 0.1);
              } else {
                  newStatus = 'IDLE'; // Too risky for standard trend following
              }
          }

          return { ...agent, status: newStatus as any, marketFit: fit };
      });

      // Spawn new agent if needed
      if (this.activeAgents.length < 5 && Math.random() > 0.8) {
          const types: SwarmAgent['type'][] = ['MOMENTUM', 'MEAN_REVERSION', 'ARBITRAGE', 'HFT_SCALP', 'SENTIMENT_HUNTER'];
          const type = types[Math.floor(Math.random() * types.length)];
          this.activeAgents.push({
              id: `agent-${Date.now().toString().slice(-4)}`,
              name: `Auto-${type.substring(0,4)}-${Math.floor(Math.random()*100)}`,
              type,
              status: 'LEARNING',
              confidence: 0.5,
              dailyPnL: 0,
              tradesExecuted: 0,
              marketFit: 0.5
          });
      }
  }

  private updateAgentStats(results: TradingResult[]) {
      // Simulate agent attribution (assign results to active agents randomly for this demo)
      results.forEach(res => {
          if (this.activeAgents.length > 0) {
              const agent = this.activeAgents[Math.floor(Math.random() * this.activeAgents.length)];
              if (agent.status !== 'IDLE') {
                  agent.tradesExecuted++;
                  agent.dailyPnL += res.pnl;
                  agent.confidence = Math.min(1, Math.max(0, agent.confidence + (res.success ? 0.05 : -0.05)));
              }
          }
      });
  }

  // --- INTERNAL SIMULATION METHODS ---

  private simulatePrice(symbol: string): number {
    const basePrices: Record<string, number> = {
      "BTC/USD": 64000,
      "ETH/USD": 3400,
      "ADA/USD": 0.45,
      "DOT/USD": 7.2,
      "LINK/USD": 14.5
    };
    const base = basePrices[symbol] || 100;
    return base * (1 + (Math.random() * 0.04 - 0.02));
  }

  async collectMarketData(): Promise<Record<string, any>> {
    const symbols = ["BTC/USD", "ETH/USD", "ADA/USD", "DOT/USD", "LINK/USD"];
    const marketData: Record<string, any> = {};
    for (const symbol of symbols) {
      marketData[symbol] = {
        price: this.simulatePrice(symbol),
        volume: Math.random() * (5000000 - 1000000) + 1000000,
        volatility: Math.random() * (0.05 - 0.01) + 0.01,
        timestamp: new Date(),
        orderBook: {
          bids: [[this.simulatePrice(symbol) * 0.99, 10]],
          asks: [[this.simulatePrice(symbol) * 1.01, 10]]
        }
      };
    }
    return marketData;
  }

  async analyzePricesQuantum(marketData: Record<string, any>): Promise<any[]> {
      const predictions = [];
      for(const symbol in marketData) {
          // Using random features for simulation
          const prediction = await this.quantumNN.predict([Math.random(), Math.random(), Math.random(), Math.random()]);
          predictions.push({ symbol, prediction });
      }
      return predictions;
  }

  async detectArbitrageOpportunities(marketData: Record<string, any>): Promise<any[]> {
      return this.arbitrageDetector.detectQuantumArbitrage();
  }

  async generateTradingSignals(predictions: any[], arbitrageOps: any[]): Promise<TradingSignal[]> {
      const signals: TradingSignal[] = [];
      for(const p of predictions) {
          if (p.prediction.prediction > 0.7) {
              signals.push({
                  symbol: p.symbol,
                  action: TradingAction.BUY,
                  confidence: p.prediction.confidence,
                  priceTarget: 0,
                  stopLoss: 0,
                  takeProfit: 0,
                  quantity: 0.1,
                  timeHorizon: TimeHorizon.INTRADAY,
                  riskLevel: RiskLevel.MEDIUM,
                  quantumMetrics: { entanglement: p.prediction.confidence }, // Use confidence as mock entanglement
                  timestamp: new Date(),
                  strategyType: StrategyType.DAY_TRADING
              });
          }
      }
      return signals;
  }

  async optimizePortfolioQuantum(signals: TradingSignal[]): Promise<PortfolioAllocation[]> {
      return signals.map(s => ({
          symbol: s.symbol,
          allocation: 0.05,
          expectedReturn: 0.02,
          risk: 0.01,
          quantumScore: 0.9,
          rebalancePriority: 1
      }));
  }

  async executeTrades(allocations: PortfolioAllocation[]): Promise<TradingResult[]> {
      return allocations.map((a, i) => ({
          signalId: `SIG-${Date.now()}-${i}`,
          symbol: a.symbol,
          action: TradingAction.BUY,
          entryPrice: 0,
          exitPrice: 0,
          quantity: a.allocation,
          pnl: Math.random() > 0.5 ? Math.random() * 50 : -Math.random() * 30, // Simulated PnL
          duration: 0,
          success: Math.random() > 0.4,
          quantumAdvantage: 0.1,
          timestamp: new Date()
      }));
  }

  async learnFromExecution(results: TradingResult[]): Promise<void> {
      this.executionHistory.push(...results);
      if(this.executionHistory.length > 50) this.executionHistory.shift();
  }

  async updateTradingMetrics(results: TradingResult[], duration: number): Promise<void> {
      // Metric updates would happen here
  }

  public updateHistory(trade: any) { 
       const tr: TradingResult = {
           signalId: trade.id || 'unknown',
           symbol: trade.asset || 'unknown',
           action: trade.type === 'BUY' ? TradingAction.BUY : TradingAction.SELL,
           entryPrice: trade.price || 0,
           exitPrice: 0,
           quantity: trade.quantity || 0,
           pnl: trade.profit || 0,
           duration: 0,
           success: trade.profit > 0,
           quantumAdvantage: 0,
           timestamp: trade.timestamp || new Date(),
           learningWeight: trade.learningWeight
       };
       this.executionHistory.push(tr);
  }
}

// --- EXTENDED CLASS WITH DEEP LEARNING ---

export class TraderComAprendizado extends QuantumAlgorithmsTrader {
  private deepLearner: DeepQuantumLearning;

  constructor() {
    super();
    this.deepLearner = new DeepQuantumLearning();
  }

  async initialize(): Promise<void> {
    await super.initialize();
    await this.deepLearner.initialize();
    console.log("🧠⚛️ TraderComAprendizado: Deep Learning Module Online");
  }

  async executeTradingCycle(): Promise<void> {
    await super.executeTradingCycle();

    const ultimosTrades: TradingResult[] = this.executionHistory.slice(-10);
    for (const tradeResult of ultimosTrades) {
      const experience = this.createLearningExperience(tradeResult);
      await this.deepLearner.learnFromExperience(experience);
    }
  }

  async getMarketPrediction(marketData: MarketDataPoint[]): Promise<{ signal: string, confidence: number, oracleConsensus?: OracleConsensus }> {
    // Pass the Oracle Consensus (from base class execution) to the learner
    const prediction = await this.deepLearner.predictWithKnowledge(marketData, this.lastOracleConsensus);
    return { ...this.createSignalFromPrediction(prediction), oracleConsensus: this.lastOracleConsensus };
  }

  /**
   * DEEP HISTORICAL LEARNING (TRAINING)
   * Iterates over provided historical data to populate associative memory.
   */
  async trainOnHistoricalData(historicalData: MarketDataPoint[]): Promise<number> {
    console.log(`Starting Deep Learning on ${historicalData.length} candles...`);
    let evolutionGains = 0;

    // Iterate through history (skipping first 25 for indicators to settle)
    for (let i = 25; i < historicalData.length - 1; i++) {
        const slice = historicalData.slice(0, i + 1);
        const current = slice[slice.length - 1];
        const next = historicalData[i + 1];

        // 1. Get Prediction based on past knowledge
        const prediction = await this.deepLearner.predictWithKnowledge(slice);
        
        // 2. Evaluate Outcome
        // If prediction was > 0.6 (Buy), did price go up?
        // If prediction was < 0.4 (Sell), did price go down?
        const priceChange = (next.price - current.price) / current.price;
        let success = false;
        let action: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';

        if (prediction > 0.6) {
            action = 'BUY';
            success = priceChange > 0;
        } else if (prediction < 0.4) {
            action = 'SELL';
            success = priceChange < 0;
        }

        // 3. Reinforce Learning (Create Memory Engram)
        if (action !== 'HOLD') {
            const tradeSim: Trade = {
                id: `HIST-${i}`,
                asset: 'BTC/USDT',
                type: action,
                price: current.price,
                quantity: 1,
                timestamp: new Date(current.time),
                profit: success ? Math.abs(priceChange * 100) : -Math.abs(priceChange * 100),
                status: 'FILLED',
                strategy: 'Deep Learning Replay',
                orderType: 'MARKET',
                fee: 0
            };

            // Calculate Volatility for weight
            const vol = current.price > 0 ? ((current.bbUpper - current.bbLower) / current.price) * 100 : 0.5;
            
            // This function creates the persistent memory
            evolutionGains = reinforceLearning(tradeSim, success, vol);
        }
        
        // Yield to event loop every 50 iterations to prevent UI freeze
        if (i % 50 === 0) await new Promise(r => setTimeout(r, 0));
    }
    
    // Refresh learner's memory cache
    await this.deepLearner.initialize();
    return evolutionGains;
  }

  /**
   * STRATEGY SIMULATOR (BACKTEST)
   * Runs strategy on history without modifying memory, returning stats.
   */
  async runBacktest(historicalData: MarketDataPoint[]): Promise<BacktestResult> {
      let trades = 0;
      let wins = 0;
      let pnl = 0;
      let maxDrawdown = 0;
      let peakPnl = 0;
      let bestTrade = -Infinity;
      let worstTrade = Infinity;

      for (let i = 50; i < historicalData.length - 1; i++) {
        const slice = historicalData.slice(0, i + 1);
        const current = slice[slice.length - 1];
        const next = historicalData[i + 1];

        const { signal, confidence } = await this.getMarketPrediction(slice);
        
        if (signal !== 'HOLD' && confidence > 0.7) {
            trades++;
            const change = (next.price - current.price) / current.price;
            const tradePnl = signal === 'BUY' ? change * 1000 : -change * 1000; // Assume $1000 position
            
            pnl += tradePnl;
            if (tradePnl > 0) wins++;
            
            // Update stats
            if (tradePnl > bestTrade) bestTrade = tradePnl;
            if (tradePnl < worstTrade) worstTrade = tradePnl;
            
            // Drawdown logic
            if (pnl > peakPnl) peakPnl = pnl;
            const dd = peakPnl - pnl;
            if (dd > maxDrawdown) maxDrawdown = dd;
        }
        
        if (i % 100 === 0) await new Promise(r => setTimeout(r, 0));
      }

      return {
          totalTrades: trades,
          winRate: trades > 0 ? (wins / trades) * 100 : 0,
          totalPnL: pnl,
          maxDrawdown,
          sharpeRatio: trades > 0 ? (pnl / trades) / (maxDrawdown || 1) : 0, // Simplified Sharpe
          bestTrade: bestTrade === -Infinity ? 0 : bestTrade,
          worstTrade: worstTrade === Infinity ? 0 : worstTrade
      };
  }

  private createLearningExperience(tradeResult: TradingResult): any {
    const weight = tradeResult.learningWeight || (Math.abs(tradeResult.pnl) / 100);
    
    return { 
        tradeResult: { ...tradeResult, learningWeight: weight },
        timestamp: Date.now(),
        context: "MARKET_ADAPTATION"
    };
  }

  private createSignalFromPrediction(prediction: number): { signal: string, confidence: number } {
    let signal = 'HOLD';
    if (prediction > 0.65) signal = 'BUY';
    if (prediction < 0.35) signal = 'SELL';
    
    return { signal, confidence: prediction };
  }
}
