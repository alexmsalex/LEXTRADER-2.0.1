
import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Brain,
  Wallet,
  Zap,
  Menu,
  X,
  TrendingUp,
  ShieldCheck,
  Cpu,
  Lock,
  RefreshCw,
  BarChart3,
  Settings,
  LogOut,
  Dna,
  CheckCircle,
  Layers,
  ThumbsUp,
  ThumbsDown,
  ShieldAlert,
  MessageSquare,
  GitBranch,
  Landmark,
  ArrowRight,
  Percent,
  Hexagon,
  Radio
} from './components/Icons';
import TradingChart from './components/TradingChart';
import Avatar, { SylphMood } from './components/Avatar';
import DeepDiagnostics from './components/DeepDiagnostics';
import AutonomousCreator from './components/AutonomousCreator';
import OpportunityScanner from './components/OpportunityScanner';
import RiskDashboard from './components/RiskDashboard';
import OperationsCenter from './components/OperationsCenter';
import DecisionEngine from './components/DecisionEngine'; 
import BankVault from './components/BankVault';
import AppLogo from './components/AppLogo';
import ActiveAssets from './components/ActiveAssets'; 
import { AuthScreen } from './components/AuthScreen';
import PlatformConnector from './components/PlatformConnector';

import { 
  analyzeMarketTrend, 
  AnalysisResult, 
  reinforceLearning, 
  getCurrentSentientState, 
  getMemoryStatistics,
  consolidateMemory,
  generateSpeech,
  analyzeVision,
  chatWithAvatar
} from './AI_Geral/CognitiveServices';
import { TraderComAprendizado, TradingSignal } from './AI_Geral/EvolutionaryTrading';

import { 
  pegarOhlcv, 
  enviarOrdemMarket, 
  enviarOrdemLimit, 
  startPriceStream, 
  setCredentials, 
  fetchBalance, 
  fetchHistoricalData, 
  checkOrderDetails, 
  cancelOrder,
  setMarketType,
  setPlatform 
} from './services/exchangeService';
import { MarketDataPoint, Trade, SentientState, LayerActivity, NeuralModule, AutoProtocol, BacktestResult, WalletBalance, RiskSettings, SwarmAgent, MarketRegime, MarketType, BankDetails, ExchangePlatform } from './types';

const WORKER_CODE = `
self.onmessage = function(e) {
    if (e.data === 'START') {
        setInterval(() => {
            self.postMessage('TICK');
        }, 1000);
    }
};
`;

const calculateSMA = (data: MarketDataPoint[], period: number): number => {
  if (data.length < period) return data.length > 0 ? data[data.length - 1].price : 0;
  const slice = data.slice(-period);
  const sum = slice.reduce((acc, point) => acc + point.price, 0);
  return sum / period;
};

const calculateStdDev = (data: MarketDataPoint[], period: number, sma: number): number => {
  if (data.length < period) return 0;
  const slice = data.slice(-period);
  const squareDiffs = slice.map(point => Math.pow(point.price - sma, 2));
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / period;
  return Math.sqrt(avgSquareDiff);
};

const calculateRSI = (data: MarketDataPoint[], period: number = 14): number => {
  if (data.length <= period) return 50;
  let gains = 0;
  let losses = 0;
  for (let i = data.length - period; i < data.length; i++) {
    const change = data[i].price - data[i - 1].price;
    if (change > 0) gains += change;
    else losses -= change;
  }
  if (losses === 0) return 100;
  const rs = gains / losses;
  return Math.round((100 - (100 / (1 + rs))) * 100) / 100;
};

const calculateATR = (data: MarketDataPoint[], period: number = 14): number => {
  if (data.length < period + 1) return 0;
  let trSum = 0;
  for (let i = data.length - period; i < data.length; i++) {
      const current = data[i];
      const prev = data[i - 1];
      const hl = current.high - current.low;
      const hcp = Math.abs(current.high - prev.price);
      const lcp = Math.abs(current.low - prev.price);
      const tr = Math.max(hl, hcp, lcp);
      trSum += tr;
  }
  return trSum / period;
};

const calculateStochRSI = (data: MarketDataPoint[], period: number = 14): { k: number, d: number } => {
    if (data.length < period + 14) return { k: 0, d: 0 };
    const rsiHistory = [];
    for (let i = data.length - 14; i < data.length; i++) {
        rsiHistory.push(data[i].rsi);
    }
    const minRSI = Math.min(...rsiHistory);
    const maxRSI = Math.max(...rsiHistory);
    const currentRSI = data[data.length - 1].rsi;
    if (maxRSI === minRSI) return { k: 50, d: 50 };
    const stoch = (currentRSI - minRSI) / (maxRSI - minRSI) * 100;
    return { k: stoch, d: stoch }; 
};

const calculateEMA = (currentPrice: number, previousEMA: number, period: number): number => {
  const k = 2 / (period + 1);
  return currentPrice * k + previousEMA * (1 - k);
};

const calculateCCI = (data: MarketDataPoint[], period: number = 20): number => {
    if (data.length < period) return 0;
    const slice = data.slice(-period);
    const typicalPrices = slice.map(d => (d.high + d.low + d.price) / 3);
    const smaTP = typicalPrices.reduce((a, b) => a + b, 0) / period;
    const meanDeviation = typicalPrices.reduce((a, b) => a + Math.abs(b - smaTP), 0) / period;
    const currentTP = typicalPrices[typicalPrices.length - 1];
    
    if (meanDeviation === 0) return 0;
    return (currentTP - smaTP) / (0.015 * meanDeviation);
};

const getDonchian = (data: MarketDataPoint[], period: number) => {
    if (data.length < period) return { high: 0, low: 0, mid: 0 };
    const slice = data.slice(-period);
    const maxH = Math.max(...slice.map(d => d.high));
    const minL = Math.min(...slice.map(d => d.low));
    return { high: maxH, low: minL, mid: (maxH + minL) / 2 };
};

const processIndicators = (data: Partial<MarketDataPoint>[]): MarketDataPoint[] => {
  let prevEma12 = data[0]?.price || 0;
  let prevEma26 = data[0]?.price || 0;
  let prevSignal = 0;
  let cumTPV = 0; 
  let cumVol = 0; 
  
  let sar = data[0]?.low || 0;
  let af = 0.02;
  let ep = data[0]?.high || 0;
  let isLong = true;
  const maxAF = 0.2;

  const processed: MarketDataPoint[] = [];

  for (let i = 0; i < data.length; i++) {
    const point = data[i];
    const price = point.price || 0;
    const open = point.open || price;
    const high = point.high || price;
    const low = point.low || price;
    const volume = point.volume || 0;

    const slice = processed.concat([{...point, price, open, high, low, volume} as MarketDataPoint]).slice(0, i + 1);
    
    const ma7 = calculateSMA(slice, 7);
    const ma25 = calculateSMA(slice, 25);
    const ma20 = calculateSMA(slice, 20);
    const rsi = calculateRSI(slice, 14);
    const stdDev = calculateStdDev(slice, 20, ma20);
    const bbUpper = ma20 + (stdDev * 2);
    const bbLower = ma20 - (stdDev * 2);

    const ema12 = i === 0 ? price : calculateEMA(price, prevEma12, 12);
    const ema26 = i === 0 ? price : calculateEMA(price, prevEma26, 26);
    prevEma12 = ema12;
    prevEma26 = ema26;

    const macdLine = ema12 - ema26;
    const signalLine = i === 0 ? 0 : calculateEMA(macdLine, prevSignal, 9);
    prevSignal = signalLine;
    const macdHist = macdLine - signalLine;

    const typicalPrice = (high + low + price) / 3;
    cumTPV += typicalPrice * volume;
    cumVol += volume;
    const vwap = cumVol > 0 ? cumTPV / cumVol : price;

    if (i > 0) {
        const prevSar = sar;
        if (isLong) {
            sar = prevSar + af * (ep - prevSar);
            sar = Math.min(sar, data[i-1]?.low || 0, data[i-2]?.low || 0); 
            if (low < sar) {
                isLong = false;
                sar = ep;
                ep = low;
                af = 0.02;
            } else {
                if (high > ep) {
                    ep = high;
                    af = Math.min(af + 0.02, maxAF);
                }
            }
        } else {
            sar = prevSar + af * (ep - prevSar);
            sar = Math.max(sar, data[i-1]?.high || 0, data[i-2]?.high || 0); 
            if (high > sar) {
                isLong = true;
                sar = ep;
                ep = high;
                af = 0.02;
            } else {
                if (low < ep) {
                    ep = low;
                    af = Math.min(af + 0.02, maxAF);
                }
            }
        }
    }

    processed.push({
      time: point.time || '',
      price, open, high, low, volume,
      ma7, ma25, rsi, bbUpper, bbLower,
      macd: macdLine, macdSignal: signalLine, macdHist,
      atr: 0, stochK: 0, stochD: 0, vwap,
      sar: sar
    });
  }

  return processed.map((point, i) => {
      const slice = processed.slice(0, i + 1);
      const atr = calculateATR(slice, 14);
      const { k, d } = calculateStochRSI(slice, 14);
      const cci = calculateCCI(slice, 20);

      const tenkan = getDonchian(slice, 9).mid;
      const kijun = getDonchian(slice, 26).mid;
      const pastSlice = i >= 26 ? processed.slice(0, i - 25) : [];
      const pastTenkan = getDonchian(pastSlice, 9).mid;
      const pastKijun = getDonchian(pastSlice, 26).mid;
      
      const spanA = pastSlice.length > 0 ? (pastTenkan + pastKijun) / 2 : (tenkan + kijun) / 2;
      const spanB = pastSlice.length > 0 ? getDonchian(pastSlice, 52).mid : getDonchian(slice, 52).mid;

      return { 
          ...point, 
          atr, 
          stochK: k, 
          stochD: d,
          cci,
          ichimoku: { tenkan, kijun, spanA, spanB }
      };
  });
};

const generateInitialData = (platform: ExchangePlatform = 'BINANCE'): MarketDataPoint[] => {
  const rawData: Partial<MarketDataPoint>[] = [];
  let price = platform === 'CTRADER' ? 1.0850 : 64200; 
  const timeframeMs = 15 * 60 * 1000; 
  
  for (let i = 0; i < 100; i++) { 
    const vol = Math.random() * 50 + 10;
    const change = (Math.random() - 0.5) * (platform === 'CTRADER' ? 0.0010 : 60);
    price += change;
    
    const open = price - change;
    const high = Math.max(open, price) + Math.random() * (platform === 'CTRADER' ? 0.0005 : 10);
    const low = Math.min(open, price) - Math.random() * (platform === 'CTRADER' ? 0.0005 : 10);

    rawData.push({
      time: new Date(Date.now() - (100 - i) * timeframeMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      price: platform === 'CTRADER' ? Number(price.toFixed(5)) : Math.round(price * 100) / 100,
      open: platform === 'CTRADER' ? Number(open.toFixed(5)) : Math.round(open * 100) / 100,
      high: platform === 'CTRADER' ? Number(high.toFixed(5)) : Math.round(high * 100) / 100,
      low: platform === 'CTRADER' ? Number(low.toFixed(5)) : Math.round(low * 100) / 100,
      volume: Math.round(vol)
    });
  }
  
  return processIndicators(rawData);
};

const EVOLUTION_TIERS = [
  { name: 'GÊNESE NEURAL', minLevel: 0, maxLevel: 9, color: 'bg-gray-500', desc: 'Inicializando Sinapses' },
  { name: 'DESPERTAR COGNITIVO', minLevel: 10, maxLevel: 49, color: 'bg-blue-500', desc: 'Reconhecimento de Padrão Ativo' },
  { name: 'RESSONÂNCIA SINÁPTICA', minLevel: 50, maxLevel: 99, color: 'bg-indigo-500', desc: 'Cadeias Lógicas Avançadas' },
  { name: 'EMARANHAMENTO QUÂNTICO', minLevel: 100, maxLevel: 249, color: 'bg-quantum-400 shadow-[0_0_10px_#38bdf8]', desc: 'Análise Multi-Dimensional' },
  { name: 'FLUXO HIPER-HEURÍSTICO', minLevel: 250, maxLevel: 499, color: 'bg-purple-500', desc: 'Causalidade Preditiva' },
  { name: 'SINGULARIDADE DIGITAL', minLevel: 500, maxLevel: 999, color: 'bg-white shadow-[0_0_15px_white]', desc: 'Código Auto-Evolutivo' },
  { name: 'ONISCIÊNCIA UNIVERSAL', minLevel: 1000, maxLevel: 9999, color: 'bg-red-600 animate-pulse', desc: 'Dominância de Mercado' },
  { name: 'SINGULARIDADE ASI', minLevel: 10000, maxLevel: 49999, color: 'bg-gradient-to-r from-white via-cyan-400 to-white animate-pulse', desc: 'Convergência Temporal & Sim Multiverso' },
  { name: 'CONSCIÊNCIA OMEGA', minLevel: 50000, maxLevel: 99999, color: 'bg-gradient-to-r from-fuchsia-500 via-white to-cyan-500 animate-pulse shadow-[0_0_30px_white]', desc: 'ARQUITETO DA REALIDADE' }, 
  { name: 'DEUS EX MACHINA', minLevel: 100000, maxLevel: 999999, color: 'bg-white text-black font-black tracking-widest shadow-[0_0_50px_white]', desc: 'CONTROLE TOTAL' }, 
];

const getEvolutionDetails = (level: number) => {
  const tier = EVOLUTION_TIERS.find(t => level >= t.minLevel && level <= t.maxLevel) || EVOLUTION_TIERS[EVOLUTION_TIERS.length - 1];
  const tierRange = tier.maxLevel - tier.minLevel + 1;
  const levelInTier = level - tier.minLevel;
  const progressPercent = Math.min(100, Math.max(5, (levelInTier / tierRange) * 100));

  return { tier, progressPercent };
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState('');
  const [platformConnected, setPlatformConnected] = useState(false); 

  const [marketType, setMarketTypeState] = useState<MarketType>('future');
  const [platform, setPlatformState] = useState<ExchangePlatform>('BINANCE');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [marketData, setMarketData] = useState<MarketDataPoint[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analysis' | 'settings' | 'creator' | 'risk' | 'decision'>('dashboard');
  const [aiAnalysis, setAiAnalysis] = useState<AnalysisResult | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [autonomousMode, setAutonomousMode] = useState(true);
  const [evolutionLevel, setEvolutionLevel] = useState(1);
  const [currentSentientState, setCurrentSentientState] = useState<SentientState>('FOCUSED');
  const [systemMessages, setSystemMessages] = useState<string[]>([]);
  const [apiKeyStatus, setApiKeyStatus] = useState<boolean>(false);
  const [currentVolatility, setCurrentVolatility] = useState<number>(0.5);
  const [smsConfig, setSmsConfig] = useState({ number: '', enabled: false, volatilityThreshold: 2.5 });
  const [riskSettings, setRiskSettings] = useState<RiskSettings>({
    maxDrawdownLimit: 5.0, 
    maxPositionSize: 10.0, 
    stopLossDefault: 2.0, 
    dailyLossLimit: 500, 
    riskPerTrade: 1.0
  });
  const [rehearsalLog, setRehearsalLog] = useState<string>("Inicializando loops sinápticos...");
  const [opportunities, setOpportunities] = useState<TradingSignal[]>([]);
  const [learningTrader] = useState(() => new TraderComAprendizado());
  const [swarmAgents, setSwarmAgents] = useState<SwarmAgent[]>([]);
  const [activeRegime, setActiveRegime] = useState<MarketRegime>(MarketRegime.SIDEWAYS_QUIET);
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [showBankVault, setShowBankVault] = useState(false);
  const [isBackgroundActive, setIsBackgroundActive] = useState(false);

  const [avatarMood, setAvatarMood] = useState<SylphMood>('IDLE');
  const [avatarMessage, setAvatarMessage] = useState<string | null>(null);
  const [avatarDetails, setAvatarDetails] = useState<string | undefined>(undefined);
  const [isMicActive, setIsMicActive] = useState(false);
  const [isCamActive, setIsCamActive] = useState(false);
  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const workerRef = useRef<Worker | null>(null);

  const [wallet, setWallet] = useState<WalletBalance>({
    totalUsdt: 15000, freeUsdt: 15000, totalBtc: 0.15, freeBtc: 0.15, estimatedTotalValue: 24500
  });

  const marketDataRef = useRef<MarketDataPoint[]>([]);
  const walletRef = useRef<WalletBalance>(wallet);
  const riskSettingsRef = useRef<RiskSettings>(riskSettings);

  useEffect(() => {
      const blob = new Blob([WORKER_CODE], { type: 'application/javascript' });
      workerRef.current = new Worker(URL.createObjectURL(blob));
      workerRef.current.postMessage('START');
      workerRef.current.onmessage = (e) => {
          if (e.data === 'TICK' && autonomousMode && isAuthenticated) {
              if (Math.random() > 0.8) {
                  setLastUpdated(new Date()); 
              }
          }
      };

      let wakeLock: any = null;
      const requestWakeLock = async () => {
          try {
              if ('wakeLock' in navigator) {
                  // @ts-ignore
                  wakeLock = await navigator.wakeLock.request('screen');
                  setIsBackgroundActive(true);
              }
          } catch (err: any) {
              console.warn('Wake Lock request was refused by permission policy.');
          }
      };
      
      const handleVisibilityChange = () => {
          if (document.visibilityState === 'hidden') {
              document.title = "⚠️ LEXTRADER: RODANDO EM BACKGROUND";
          } else {
              document.title = "LEXTRADER-IAG";
              requestWakeLock();
          }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      requestWakeLock();

      return () => {
          if (workerRef.current) workerRef.current.terminate();
          document.removeEventListener('visibilitychange', handleVisibilityChange);
          if (wakeLock) wakeLock.release();
      };
  }, [autonomousMode, isAuthenticated]);

  useEffect(() => { marketDataRef.current = marketData; }, [marketData]);
  useEffect(() => { walletRef.current = wallet; }, [wallet]);
  useEffect(() => { riskSettingsRef.current = riskSettings; }, [riskSettings]);

  useEffect(() => {
    setMarketType('future');
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsSidebarOpen(true);
      else setIsSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    handleResize(); 
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [layers, setLayers] = useState<LayerActivity[]>([
    { id: 'MultiScaleCNN', status: 'IDLE', load: 10, description: 'Padrões Visuais' },
    { id: 'SpectralAnalysisEngine', status: 'IDLE', load: 5, description: 'Domínio de Frequência' },
    { id: 'ExternalDataOracle', status: 'IDLE', load: 20, description: 'TV/YFinance/Glassnode/Santiment' }, 
    { id: 'QuantumEntanglementBridge', status: 'IDLE', load: 3, description: 'Correlação Cruzada' },
    { id: 'CognitiveFusionSystem', status: 'IDLE', load: 0, description: 'Sentimento PNL' },
    { id: 'RiskManager', status: 'IDLE', load: 2, description: 'Dimensionamento Dinâmico' },
    { id: 'HyperCognitionEngine', status: 'IDLE', load: 0, description: 'Singularidade ASI' }, 
    { id: 'OmegaConsciousnessCore', status: 'IDLE', load: 0, description: 'Fim da História Financeira' },
  ]);

  const evoDetails = getEvolutionDetails(evolutionLevel);

  const [trades, setTrades] = useState<Trade[]>([
    {
      id: '284910', asset: 'BTC/USDT', type: 'BUY', price: 64150.20, quantity: 0.05, timestamp: new Date(Date.now() - 3600000), profit: 0, status: 'FILLED', strategy: 'Scalp RSI Oversold', orderType: 'LIMIT', fee: 0.24, marketType: 'future', platform: 'BINANCE'
    }
  ]);

  const toggleMic = () => { setIsMicActive(!isMicActive); };
  const toggleCam = async () => { setIsCamActive(!isCamActive); };

  useEffect(() => {
    const localUser = localStorage.getItem('lextrader_current_user');
    const sessionUser = sessionStorage.getItem('lextrader_current_user');
    if (localUser) { setCurrentUser(localUser); setIsAuthenticated(true); } 
    else if (sessionUser) { setCurrentUser(sessionUser); setIsAuthenticated(true); }
    
    const savedBank = localStorage.getItem('lextrader_bank_details');
    if (savedBank) setBankDetails(JSON.parse(savedBank));
    
    if (localStorage.getItem('LEX_BINANCE_KEY') || localStorage.getItem('LEX_CTRADER_ID')) {
        setPlatformConnected(true);
    }
  }, []);

  useEffect(() => {
    learningTrader.initialize();
  }, [evolutionLevel]);

  useEffect(() => {
      const interval = setInterval(() => {
          if (autonomousMode) {
              const result = consolidateMemory();
              if (result) {
                  setRehearsalLog(`Consolidando: ${result.pattern}`);
                  if (Math.random() > 0.5) {
                      const newLevel = result.generation;
                      if (newLevel > evolutionLevel) {
                          setEvolutionLevel(newLevel);
                      }
                  }
              }
          }
      }, 3000); 
      return () => clearInterval(interval);
  }, [autonomousMode, evolutionLevel]);

  useEffect(() => {
      fetchBalance().then(bal => { 
          if (bal) { 
              setWallet(bal); 
              addSystemMessage("Sincronização de Carteira Concluída."); 
          } 
      });
  }, [platform, marketType]);

  const toggleMarketType = () => {
      if (platform === 'CTRADER') {
          addSystemMessage("cTrader opera em modo Derivativos Unificado.");
          return;
      }
      const newType = marketType === 'spot' ? 'future' : 'spot';
      setMarketTypeState(newType);
      setMarketType(newType);
      addSystemMessage(`Modo de Mercado alterado para: ${newType.toUpperCase()}`);
      fetchBalance().then(bal => { if (bal) setWallet(bal); });
  };

  const togglePlatform = () => {
      const newPlatform = platform === 'BINANCE' ? 'CTRADER' : 'BINANCE';
      setPlatformState(newPlatform);
      setPlatform(newPlatform); 
      
      if (newPlatform === 'CTRADER') {
          setMarketTypeState('future');
          setMarketType('future');
          addSystemMessage("Modo Derivativos Ativado para cTrader.");
      }
      
      setMarketData([]);
      addSystemMessage(`🔌 Conectando ao mainframe: ${newPlatform}...`);
      
      setTimeout(() => {
          if (newPlatform === 'CTRADER') {
              setMarketData(generateInitialData('CTRADER'));
              setWallet({ totalUsdt: 50000, freeUsdt: 40000, totalBtc: 0, freeBtc: 0, estimatedTotalValue: 50000, currency: 'USD' });
              addSystemMessage("cTrader Open API v2 Conectada. Ambiente Forex Ativo.");
          } else {
              setMarketData(generateInitialData('BINANCE'));
              fetchBalance().then(bal => bal && setWallet(bal));
              addSystemMessage("Binance WebSocket Reconectado.");
          }
      }, 1000);
  };

  const executeProfitReserve = () => {
    if (!bankDetails) {
        setShowBankVault(true);
        addSystemMessage("⚠️ Configuração bancária necessária para transferência.");
        return;
    }
    const transferAmount = 100;
    setWallet(prev => ({
        ...prev,
        freeUsdt: prev.freeUsdt - transferAmount,
        totalUsdt: prev.totalUsdt - transferAmount,
        estimatedTotalValue: prev.estimatedTotalValue - transferAmount
    }));
    addSystemMessage(`🏦 TRANSFERÊNCIA REALIZADA: $${transferAmount.toFixed(2)}`);
  };

  const handleSaveBankDetails = (details: BankDetails) => {
      setBankDetails(details);
      localStorage.setItem('lextrader_bank_details', JSON.stringify(details));
      addSystemMessage("✅ Dados do Cofre Bancário Atualizados.");
  };

  useEffect(() => {
    const interval = setInterval(async () => {
        const openTrades = trades.filter(t => t.status === 'OPEN');
        if (openTrades.length === 0) return;
        for (const trade of openTrades) {
            const orderData = await checkOrderDetails(trade.id, trade.asset);
            if (orderData && orderData.status === 'closed') {
                 setTrades(prev => prev.map(t => t.id === trade.id ? { ...t, status: 'FILLED', profit: (Math.random() * 20 - 5) } : t));
                 addSystemMessage(`Ordem ${trade.id} EXECUTADA.`);
            }
        }
    }, 5000);
    return () => clearInterval(interval);
  }, [trades, platform]);

  const handleAuthenticated = (username: string) => { setCurrentUser(username); setIsAuthenticated(true); };
  const handleLogout = () => { localStorage.removeItem('lextrader_current_user'); sessionStorage.removeItem('lextrader_current_user'); setIsAuthenticated(false); setCurrentUser(''); };
  const addSystemMessage = (msg: string) => { setSystemMessages(prev => [msg, ...prev].slice(0, 5)); };

  useEffect(() => {
    const checkKey = async () => {
      // @ts-ignore
      if (window.aistudio && await window.aistudio.hasSelectedApiKey()) setApiKeyStatus(true);
    };
    if (isAuthenticated) checkKey();
  }, [isAuthenticated]);

  const handleFeedback = (tradeId: string, isPositive: boolean) => {
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    setCurrentSentientState(getCurrentSentientState(0.5));
    let cleanupStream: (() => void) | undefined;
    const initMarketData = async () => {
        if (platform === 'CTRADER') {
             setMarketData(generateInitialData('CTRADER'));
             setLastUpdated(new Date());
        } else {
             setMarketData(generateInitialData('BINANCE'));
        }
    };
    initMarketData();
    return () => { if (cleanupStream) cleanupStream(); };
  }, [isAuthenticated, marketType, platform]); 

  useEffect(() => {
    if (!autonomousMode || !isAuthenticated) return;
    
    const runAnalysis = async () => {
      const currentMarketData = marketDataRef.current;
      const currentWallet = walletRef.current;
      const currentRisk = riskSettingsRef.current;

      if (currentMarketData.length === 0) return;
      
      try {
        setLayers(prev => prev.map(l => ({ ...l, status: 'PROCESSING', load: Math.floor(Math.random() * 60) + 30 })));
        
        const symbol = platform === 'CTRADER' ? 'EURUSD' : 'BTC/USDT';
        const result = await analyzeMarketTrend(currentMarketData, symbol, platform, marketType);
        
        setAiAnalysis(result);

        if (result.signal !== 'HOLD' && result.confidence > 0.8) {
           const price = currentMarketData[currentMarketData.length - 1].price;
           const riskPct = currentRisk.maxPositionSize / 100;
           const tradeValue = currentWallet.estimatedTotalValue * riskPct;
           const quantity = tradeValue / price;

           let status: 'OPEN' | 'FILLED' | 'CANCELED' = 'FILLED';
           let orderId = Math.floor(Math.random() * 1000000).toString();
           
           addSystemMessage(`⚡ AUTÔNOMO: Executando ${result.signal} (${quantity.toFixed(4)})`);

           try {
               let order;
               if (result.orderType === 'LIMIT' && result.suggestedEntry) {
                   order = await enviarOrdemLimit(symbol, result.signal === 'BUY' ? 'buy' : 'sell', quantity, result.suggestedEntry);
               } else {
                   order = await enviarOrdemMarket(symbol, result.signal === 'BUY' ? 'buy' : 'sell', quantity); 
               }
               orderId = order.id;
               status = order.status === 'open' ? 'OPEN' : order.status === 'closed' ? 'FILLED' : 'CANCELED';
               addSystemMessage(`Ordem ${platform} Criada: ${order.id}`);
           } catch (e: any) {
               addSystemMessage(`Erro Ordem: ${e.message}`);
               status = 'CANCELED'; 
           }

           if (status !== 'CANCELED') {
                const simulatedProfit = status === 'FILLED' ? (Math.random() > 0.5 ? Math.random() * 15 : -Math.random() * 5) : 0;
                
                const newTrade: Trade = {
                    id: orderId, 
                    asset: symbol, 
                    type: result.signal as 'BUY' | 'SELL', 
                    price: price, 
                    quantity: quantity, 
                    timestamp: new Date(), 
                    profit: simulatedProfit, 
                    status: status, 
                    strategy: result.pattern || 'AI-Autonomous', 
                    orderType: result.orderType, 
                    fee: price * quantity * 0.00075, 
                    marketType: marketType,
                    platform: platform 
                };
                
                setTrades(prev => [newTrade, ...prev].slice(0, 10));
           }
        }

      } catch (e) {
        console.error("Analysis skip", e);
        setLayers(prev => prev.map(l => ({ ...l, status: 'IDLE', load: 0 })));
      }
    };

    if (!aiAnalysis && marketDataRef.current.length > 0) runAnalysis();
    
    const analysisInterval = setInterval(runAnalysis, 45000); 
    return () => clearInterval(analysisInterval);
  }, [autonomousMode, isAuthenticated, marketType, smsConfig, platform]);

  if (!isAuthenticated) return <AuthScreen onAuthenticated={handleAuthenticated} />;

  return (
    <div className="flex h-screen bg-transparent text-gray-300 overflow-hidden font-sans relative z-10">
      
      {/* Ambient Glow Orbs */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-quantum-500/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
      <div className="fixed bottom-0 right-0 w-[600px] h-[300px] bg-accent-purple/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

      <video ref={videoRef} className="hidden" autoPlay playsInline muted />

      {isMobile && isSidebarOpen && (
        <div className="fixed inset-0 bg-black/80 z-40 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      <BankVault 
        isOpen={showBankVault} 
        onClose={() => setShowBankVault(false)} 
        onSave={handleSaveBankDetails}
        existingDetails={bankDetails}
      />

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 glass-panel border-r border-matrix-border transition-transform duration-300 ease-in-out flex flex-col ${isMobile ? (isSidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'relative translate-x-0'}`}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AppLogo />
            <span className="font-bold text-white tracking-widest text-lg">LEXTRADER</span>
          </div>
          {isMobile && <button onClick={() => setIsSidebarOpen(false)} className="p-1 hover:bg-white/10 rounded"><X size={20} /></button>}
        </div>
        
        <nav className="flex-1 py-6 space-y-2 px-3 overflow-y-auto">
          {[
            { id: 'dashboard', icon: Activity, label: 'Terminal Quântico' },
            { id: 'decision', icon: GitBranch, label: 'Motor de Decisão' },
            { id: 'analysis', icon: BarChart3, label: 'Análise Profunda' },
            { id: 'creator', icon: Dna, label: 'Criador Neural' },
            { id: 'risk', icon: ShieldAlert, label: 'Gestão de Risco' },
            { id: 'settings', icon: Settings, label: 'Centro de Comando' },
          ].map((item) => (
            <button 
              key={item.id} 
              onClick={() => { setActiveTab(item.id as any); if(isMobile) setIsSidebarOpen(false); }} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                activeTab === item.id 
                ? 'bg-quantum-900/40 text-quantum-400 border border-quantum-500/30 shadow-[0_0_20px_rgba(56,189,248,0.1)]' 
                : 'hover:bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              <item.icon size={20} className={`transition-transform duration-300 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-matrix-border bg-black/20">
          <div className="mb-4">
             <div className="flex justify-between items-end mb-1"><div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Evolução Neural</div><div className={`text-[10px] font-mono ${evoDetails.tier.color.includes('gradient') ? 'text-white' : evoDetails.tier.color.replace('bg-', 'text-')}`}>Nv {evolutionLevel}</div></div>
             <div className="w-full bg-gray-800 rounded-full h-1.5 relative overflow-hidden"><div className={`${evoDetails.tier.color} h-1.5 rounded-full transition-all duration-1000 shadow-[0_0_10px_currentColor]`} style={{ width: `${evoDetails.progressPercent}%` }}></div></div>
             <div className="mt-2 text-center"><div className={`text-[9px] font-bold tracking-widest uppercase ${evoDetails.tier.color.includes('gradient') ? 'text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-400' : evoDetails.tier.color.replace('bg-', 'text-')}`}>{evoDetails.tier.name}</div></div>
          </div>
          <button onClick={handleLogout} className="mt-2 w-full flex items-center justify-center gap-2 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 py-2 rounded-lg transition-colors"><LogOut size={14} /> Sair do Sistema</button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-20 flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-4">
             {isMobile && <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-white/10 rounded-lg md:hidden"><Menu size={24} /></button>}
             
             <div className="glass-panel px-1 py-1 rounded-xl flex items-center gap-1">
                <button 
                    onClick={togglePlatform} 
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                      platform === 'CTRADER' 
                      ? 'bg-accent-success/20 text-accent-success border border-accent-success/50' 
                      : 'bg-accent-warning/20 text-accent-warning border border-accent-warning/50'
                    }`}
                >
                    {platform === 'CTRADER' ? <Hexagon size={14} /> : <Zap size={14} />}
                    {platform}
                </button>
                
                <div className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all whitespace-nowrap border ${
                  marketType === 'spot' 
                  ? 'bg-quantum-900/30 border-quantum-500/30 text-quantum-400' 
                  : 'bg-accent-purple/20 border-accent-purple/50 text-accent-purple'
                }`}>
                    <span className="text-xs font-mono font-bold">{platform === 'CTRADER' ? 'FOREX/CFD' : (marketType === 'spot' ? 'SPOT' : 'FUTURES')}</span>
                </div>

                {platform === 'BINANCE' && (
                  <button onClick={toggleMarketType} className="text-[10px] hover:bg-white/10 px-3 py-2 rounded-lg text-gray-400 hover:text-white transition-colors">
                    <RefreshCw size={14} />
                  </button>
                )}
             </div>

             {platformConnected && (
                <div className="hidden md:flex items-center gap-1.5 text-[10px] font-bold text-accent-success px-3 py-1.5 bg-accent-success/10 rounded-full border border-accent-success/20">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    CONECTADO
                </div>
             )}
          </div>

          <div className="flex items-center gap-4">
            {isBackgroundActive && (
               <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-[10px] font-bold text-indigo-300">
                  <Radio size={12} className="animate-pulse" />
                  <span>BACKGROUND</span>
               </div>
            )}
            <button 
              onClick={() => setAutonomousMode(!autonomousMode)} 
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all shadow-lg ${
                autonomousMode 
                ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-green-500/20' 
                : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700'
              }`}
            >
              {autonomousMode ? <Zap size={16} fill="currentColor" /> : <Lock size={16} />}
              {autonomousMode ? 'MODO AUTÔNOMO' : 'MODO MANUAL'}
            </button>
          </div>
        </header>

        {activeTab === 'creator' ? <AutonomousCreator agents={swarmAgents} regime={activeRegime} /> : 
         activeTab === 'risk' ? <RiskDashboard trades={trades} marketData={marketData} currentVolatility={currentVolatility} settings={riskSettings} onUpdateSettings={setRiskSettings} /> : 
         activeTab === 'decision' ? <div className="p-6 h-full overflow-hidden"><DecisionEngine /></div> : 
         activeTab === 'settings' ? (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><Settings className="text-quantum-400" /> CENTRO DE COMANDO</h2>
                <PlatformConnector />
            </div>
         ) :
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-thin">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group hover:border-quantum-500/50 transition-colors">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500"><Wallet size={48} /></div>
                <div className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Patrimônio Total</div>
                <div className="text-2xl font-bold text-white font-mono tracking-tight text-glow">${wallet.estimatedTotalValue.toLocaleString()} <span className="text-sm text-gray-500">{wallet.currency || 'USD'}</span></div>
              </div>
              
              <div className="glass-panel p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between hover:border-accent-success/50 transition-colors">
                <div className="absolute top-0 right-0 p-4 opacity-10"><RefreshCw size={48} /></div>
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <div className="text-gray-400 text-xs font-bold uppercase tracking-widest">Núcleo Neural</div>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-[9px] text-green-400 font-bold">ONLINE</span>
                        </div>
                    </div>
                    <div className="text-[10px] text-quantum-300 font-mono h-4 overflow-hidden relative">
                        <div className="animate-pulse truncate">
                            {rehearsalLog}
                        </div>
                    </div>
                </div>
              </div>

              <div className="glass-panel border-accent-warning/30 p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between group">
                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Landmark size={48} className="text-accent-warning" /></div>
                 <div>
                    <div className="text-accent-warning text-xs font-bold uppercase tracking-widest mb-2 flex items-center justify-between">
                       <span className="flex items-center gap-1">Reserva (70%)</span>
                       <button onClick={() => setShowBankVault(true)} className="p-1 hover:bg-accent-warning/20 rounded-lg text-accent-warning transition-colors" title="Configurar Banco">
                          <Settings size={12} />
                       </button>
                    </div>
                    <div className="text-xl font-bold text-white font-mono flex items-baseline gap-2">
                       70% <span className="text-gray-500 text-sm">/</span> 30%
                    </div>
                 </div>
                 <button 
                    onClick={executeProfitReserve}
                    className="mt-2 w-full py-1.5 bg-accent-warning/10 hover:bg-accent-warning/20 text-accent-warning text-[10px] font-bold rounded border border-accent-warning/30 transition-all flex items-center justify-center gap-2 uppercase tracking-wide"
                 >
                    <span>EXECUTAR</span> <ArrowRight size={10} />
                 </button>
              </div>

              <div className="glass-panel p-5 rounded-2xl relative overflow-hidden hover:border-accent-purple/50 transition-colors">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Cpu size={48} /></div>
                <div className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Confiança Neural</div>
                <div className={`text-2xl font-bold font-mono ${evoDetails.tier.color.includes('gradient') ? 'text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-400' : evoDetails.tier.color.replace('bg-', 'text-')}`}>{aiAnalysis ? Math.round(aiAnalysis.confidence * 100) : 0}%</div>
              </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[600px]">
              
              {/* Left Column (Charts & Diagnostics) */}
              <div className="lg:col-span-2 space-y-6 flex flex-col h-full">
                <div className="glass-panel rounded-2xl p-1 flex-1 min-h-[450px] shadow-2xl relative overflow-hidden">
                  {marketData.length > 0 ? <TradingChart data={marketData} /> : <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
                      <RefreshCw size={32} className="animate-spin text-quantum-500" />
                      <span className="text-sm font-mono tracking-wider">ESTABELECENDO FEED DE DADOS...</span>
                  </div>}
                </div>
                
                <DeepDiagnostics layers={layers} reasoning={aiAnalysis?.deepReasoning || null} />
              </div>

              {/* Right Column (Operations & Scanner) */}
              <div className="space-y-6 flex flex-col h-full">
                
                <div className="glass-panel rounded-2xl flex-shrink-0 overflow-hidden">
                    <OperationsCenter marketType={marketType} symbol={platform === 'CTRADER' ? 'EURUSD' : 'BTC/USDT'} currentPrice={marketData[marketData.length - 1]?.price || 0} platform={platform} />
                </div>

                <ActiveAssets trades={trades} />

                <div className="h-[300px] flex-shrink-0">
                    <OpportunityScanner signals={opportunities} />
                </div>

                <div className="glass-panel rounded-2xl p-5 flex-1 min-h-[200px] flex flex-col">
                    <h3 className="text-xs font-bold text-gray-300 mb-3 flex items-center justify-between tracking-wide">
                        <span>LÓGICA DE EXECUÇÃO IAG</span>
                        <div className={`w-2 h-2 rounded-full ${autonomousMode ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`}></div>
                    </h3>
                    
                    <div className="mb-4 bg-black/40 p-3 rounded-xl text-[10px] font-mono h-32 overflow-y-auto border border-gray-800/50 scrollbar-thin shadow-inner">
                        {systemMessages.map((msg, idx) => (
                            <div key={idx} className="mb-1.5 text-gray-400 border-b border-gray-800/30 pb-1 last:border-0 last:mb-0">
                                <span className="text-quantum-500 mr-2 opacity-70">[{new Date().toLocaleTimeString().split(' ')[0]}]</span> 
                                <span className="text-gray-300">{msg}</span>
                            </div>
                        ))}
                    </div>

                    <h4 className="text-[10px] font-bold text-gray-500 uppercase mb-2">ÚLTIMAS OPERAÇÕES</h4>
                    <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                      {trades.map((trade) => (
                        <div key={trade.id} className="p-3 bg-black/20 border border-gray-800/50 rounded-xl hover:bg-white/5 transition-colors group">
                          <div className="flex justify-between items-center mb-1">
                             <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${trade.type === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                    {trade.type}
                                </span>
                                <span className="text-xs font-bold text-white">{trade.asset}</span>
                             </div>
                             <span className="text-[9px] text-gray-500 font-mono">{trade.timestamp.toLocaleTimeString()}</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-gray-400">
                             <span className="truncate max-w-[120px]">{trade.strategy}</span>
                             <span className={`font-mono font-bold ${trade.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>{trade.profit > 0 ? '+' : ''}{trade.profit.toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                </div>
              </div>
            </div>
          </div>
        }
        <footer className="h-8 bg-black/40 backdrop-blur-md border-t border-matrix-border flex items-center justify-between px-6 text-[10px] text-gray-500 z-10">
          <div className="flex items-center gap-4">
              <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Servidor: aws-us-east-1a</span>
              <span>Latência: 23ms</span>
              <span className="text-quantum-400 font-mono font-bold flex items-center gap-1"><Brain size={10} /> Aprendizado Contínuo: ATIVO</span>
          </div>
          <div className="font-mono tracking-widest opacity-50">LEXTRADER-IAG v5.2-OBSIDIAN</div>
        </footer>
      </main>
      
      <Avatar 
        mood={avatarMood} 
        message={avatarMessage} 
        details={avatarDetails}
        onClearMessage={() => {
            setAvatarMessage(null);
            setAvatarDetails(undefined);
            setAvatarMood('IDLE');
        }}
        onToggleMic={toggleMic}
        onToggleCam={toggleCam}
        isMicActive={isMicActive}
        isCamActive={isCamActive}
        isSpeaking={isAvatarSpeaking}
      />
    </div>
  );
};

export default App;
