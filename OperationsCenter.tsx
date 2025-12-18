
import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Activity, 
  TrendingDown, 
  TrendingUp, 
  Database,
  Layers,
  Zap,
  Box,
  RefreshCw,
  Lock,
  Hexagon,
  Globe,
  ArrowRight,
  Cpu,
  Eye,
  AlertTriangle,
  Map,
  Play,
  CheckCircle,
  Clock
} from './Icons';
import { FuturesPosition, LiquidityPool, OrderBook, ExchangePlatform, RoadmapPhase } from '../types';
import { fetchFuturesPositions, fetchOrderBook, fetchLiquidityMiningPools, checkCrossPlatformGap, ArbitrageOpportunity } from '../services/exchangeService';
import { ASI } from '../AI_Geral/ASI_Core';

interface OperationsCenterProps {
  marketType: 'spot' | 'future';
  symbol: string;
  currentPrice: number;
  platform?: ExchangePlatform;
}

const OperationsCenter: React.FC<OperationsCenterProps> = ({ marketType, symbol, currentPrice, platform = 'BINANCE' }) => {
  const [activeTab, setActiveTab] = useState<'orderbook' | 'futures' | 'mining' | 'arbitrage' | 'hft' | 'roadmap'>('orderbook');
  const [orderBook, setOrderBook] = useState<OrderBook | null>(null);
  const [positions, setPositions] = useState<FuturesPosition[]>([]);
  const [pools, setPools] = useState<LiquidityPool[]>([]);
  const [arbitrageOps, setArbitrageOps] = useState<ArbitrageOpportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [asiStats, setAsiStats] = useState<any>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Poll Data based on active tab
  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        try {
            // Get ASI real-time stats
            setAsiStats(ASI.getStatus());

            if (activeTab === 'orderbook') {
                const book = await fetchOrderBook(symbol, 15);
                setOrderBook(book);
            } else if (activeTab === 'futures' && (marketType === 'future' || platform === 'CTRADER')) {
                const pos = await fetchFuturesPositions(symbol);
                setPositions(pos);
            } else if (activeTab === 'mining') {
                const miningPools = await fetchLiquidityMiningPools();
                setPools(miningPools);
            } else if (activeTab === 'arbitrage') {
                const ops = await checkCrossPlatformGap();
                setArbitrageOps(ops);
            }
        } catch (e) {
            console.error("Operations data fetch failed", e);
        } finally {
            setLoading(false);
        }
    };

    fetchData();
    const interval = setInterval(fetchData, 1000); 
    return () => clearInterval(interval);
  }, [activeTab, marketType, symbol, platform]);

  // Scroll to bottom of logs
  useEffect(() => {
      if (activeTab === 'roadmap' && logsEndRef.current) {
          logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
  }, [asiStats?.roadmap?.logs?.length, activeTab]);

  const handlePhaseStart = (phase: RoadmapPhase) => {
      ASI.infra.roadmapManager.startPhase(phase);
  };

  const getBorderColor = () => {
      if (activeTab === 'arbitrage') return 'border-blue-500/50';
      if (activeTab === 'hft') return 'border-purple-500/50';
      if (activeTab === 'roadmap') return 'border-orange-500/50';
      if (platform === 'CTRADER') return 'border-green-500/30';
      return 'border-matrix-border';
  };

  return (
    <div className={`bg-matrix-panel border ${getBorderColor()} rounded-lg p-4 h-[400px] flex flex-col transition-colors duration-500`}>
       <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
             {activeTab === 'arbitrage' ? <Globe size={16} className="text-blue-400" /> : 
              activeTab === 'hft' ? <Zap size={16} className="text-purple-400 animate-pulse" /> :
              activeTab === 'roadmap' ? <Map size={16} className="text-orange-400" /> :
              platform === 'CTRADER' ? <Hexagon size={16} className="text-green-400" /> : 
              <Layers size={16} className="text-quantum-400" />}
             {activeTab === 'roadmap' ? 'ROTEIRO SUPER IA DAY TRADE' : (activeTab === 'hft' ? 'EXECUÇÃO INSTANTÂNEA (HFT)' : (activeTab === 'arbitrage' ? 'REDE GLOBAL' : `CENTRO DE OPERAÇÕES ${platform}`))}
          </h3>
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
             <button onClick={() => setActiveTab('orderbook')} className={`px-2 py-1 text-[9px] rounded border whitespace-nowrap ${activeTab === 'orderbook' ? 'bg-quantum-900/30 border-quantum-500 text-white' : 'border-gray-700 text-gray-500'}`}>BOOK</button>
             <button onClick={() => setActiveTab('futures')} className={`px-2 py-1 text-[9px] rounded border whitespace-nowrap ${activeTab === 'futures' ? 'bg-purple-900/30 border-purple-500 text-white' : 'border-gray-700 text-gray-500'}`}>{platform === 'CTRADER' ? 'POS' : 'FUT'}</button>
             <button onClick={() => setActiveTab('roadmap')} className={`px-2 py-1 text-[9px] rounded border whitespace-nowrap ${activeTab === 'roadmap' ? 'bg-orange-900/30 border-orange-500 text-white animate-pulse' : 'border-gray-700 text-gray-500'}`}>ROTEIRO</button>
             <button onClick={() => setActiveTab('mining')} className={`px-2 py-1 text-[9px] rounded border whitespace-nowrap ${activeTab === 'mining' ? 'bg-yellow-900/30 border-yellow-500 text-white' : 'border-gray-700 text-gray-500'}`}>POOLS</button>
             <button onClick={() => setActiveTab('arbitrage')} className={`px-2 py-1 text-[9px] rounded border whitespace-nowrap ${activeTab === 'arbitrage' ? 'bg-blue-900/30 border-blue-500 text-white' : 'border-gray-700 text-gray-500'}`}>ARB</button>
             <button onClick={() => setActiveTab('hft')} className={`px-2 py-1 text-[9px] rounded border whitespace-nowrap ${activeTab === 'hft' ? 'bg-purple-900/30 border-purple-500 text-white animate-pulse' : 'border-gray-700 text-gray-500'}`}>HFT</button>
          </div>
       </div>

       <div className="flex-1 overflow-y-auto scrollbar-thin">
          
          {/* --- ROADMAP TAB --- */}
          {activeTab === 'roadmap' && (
              <div className="flex flex-col h-full">
                  {/* Phase Selector */}
                  <div className="flex justify-between items-center mb-4 bg-black/40 p-2 rounded border border-gray-800">
                      {['MARKET_OPEN', 'FIRST_WAVE', 'PRE_CLOSE', 'MARKET_CLOSE'].map((phase, idx) => {
                          const isActive = asiStats?.roadmap?.currentPhase === phase;
                          const labels: Record<string, string> = { 'MARKET_OPEN': '1. ABERTURA', 'FIRST_WAVE': '2. ONDA OP.', 'PRE_CLOSE': '3. PRÉ-FECH.', 'MARKET_CLOSE': '4. FECHAMENTO' };
                          
                          return (
                              <button 
                                key={phase}
                                onClick={() => handlePhaseStart(phase as RoadmapPhase)}
                                className={`flex flex-col items-center justify-center p-2 rounded transition-all w-1/4 ${isActive ? 'bg-orange-900/30 border border-orange-500 text-orange-400' : 'text-gray-600 hover:text-gray-400'}`}
                              >
                                  <span className="text-xs font-bold">{labels[phase]}</span>
                                  {isActive && <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse mt-1"></div>}
                              </button>
                          )
                      })}
                  </div>

                  {/* Active Tasks & Logs Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
                      
                      {/* Active Tasks List */}
                      <div className="bg-black/30 border border-gray-800 rounded p-3 overflow-y-auto scrollbar-thin">
                          <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-2 flex items-center gap-2">
                              <Activity size={12} /> Tarefas da Fase
                          </h4>
                          <div className="space-y-2">
                              {asiStats?.roadmap?.activeTasks?.length === 0 ? (
                                  <div className="text-center text-gray-600 text-xs py-4">Nenhuma fase iniciada.</div>
                              ) : (
                                  asiStats?.roadmap?.activeTasks?.map((task: any) => (
                                      <div key={task.id} className="flex items-center justify-between p-2 bg-black/40 rounded border border-gray-800">
                                          <div>
                                              <div className="text-xs font-bold text-gray-200">{task.name}</div>
                                              <div className="text-[9px] text-gray-500">{task.description}</div>
                                          </div>
                                          <div className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                                              task.status === 'COMPLETED' ? 'bg-green-900/30 text-green-400 border-green-800' :
                                              task.status === 'RUNNING' ? 'bg-yellow-900/30 text-yellow-400 border-yellow-800 animate-pulse' :
                                              'bg-gray-800 text-gray-500 border-gray-700'
                                          }`}>
                                              {task.status}
                                          </div>
                                      </div>
                                  ))
                              )}
                          </div>
                      </div>

                      {/* System Logs */}
                      <div className="bg-black border border-gray-800 rounded p-3 font-mono text-[10px] overflow-y-auto scrollbar-thin flex flex-col">
                          <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-2 flex items-center gap-2">
                              <Database size={12} /> Log Neural de Execução
                          </h4>
                          <div className="flex-1 space-y-1">
                              {asiStats?.roadmap?.logs?.map((log: string, idx: number) => (
                                  <div key={idx} className="border-b border-gray-900 pb-1 text-gray-400">
                                      <span className="text-orange-500 mr-1">{'>'}</span> {log}
                                  </div>
                              ))}
                              <div ref={logsEndRef} />
                          </div>
                      </div>
                  </div>
              </div>
          )}

          {/* --- HFT TAB --- */}
          {activeTab === 'hft' && (
              <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                      <div className="bg-black/30 p-3 rounded border border-purple-900/30 text-center">
                          <div className="text-[10px] text-gray-500 uppercase flex items-center justify-center gap-1"><Zap size={10} /> Execução</div>
                          <div className="text-xl font-mono text-purple-400 font-bold">{asiStats?.traits?.executionSpeed || '0 µs'}</div>
                          <div className="text-[9px] text-gray-600">Latência Zero</div>
                      </div>
                      <div className="bg-black/30 p-3 rounded border border-purple-900/30 text-center">
                          <div className="text-[10px] text-gray-500 uppercase flex items-center justify-center gap-1"><Cpu size={10} /> Processamento</div>
                          <div className="text-xl font-mono text-white font-bold">{asiStats?.traits?.realTimeProcessing || '0 OPS'}</div>
                          <div className="text-[9px] text-gray-600">Milhões de Dados/s</div>
                      </div>
                  </div>

                  <div className="bg-black/30 p-3 rounded border border-gray-800">
                      <div className="flex justify-between items-center mb-2">
                          <span className="text-xs text-gray-300 font-bold flex items-center gap-2"><ShieldCheck size={12} className="text-green-500" /> Escudo Anti-Manipulação</span>
                          <span className="text-[9px] bg-green-900/20 text-green-400 px-2 py-0.5 rounded border border-green-800">ATIVO</span>
                      </div>
                      <div className="space-y-1 text-[9px] font-mono text-gray-500">
                          <div className="flex justify-between"><span>Detecção de Spoofing</span><span className="text-green-500">MONITORANDO</span></div>
                          <div className="flex justify-between"><span>Wash Trading</span><span className="text-green-500">0 DETECTADO</span></div>
                          <div className="flex justify-between"><span>Flash Crash Protection</span><span className="text-yellow-500">READY</span></div>
                      </div>
                  </div>

                  <div className="bg-purple-900/10 border border-purple-500/20 p-3 rounded">
                      <div className="text-[10px] text-purple-400 font-bold mb-2 flex items-center gap-2">
                          <Eye size={12} /> VISÃO MULTIMODAL EM TEMPO REAL
                      </div>
                      <div className="h-16 flex items-end gap-1">
                          {[...Array(20)].map((_, i) => (
                              <div key={i} className="flex-1 bg-purple-500/50 rounded-t" style={{ height: `${Math.random() * 100}%`, opacity: Math.random() }}></div>
                          ))}
                      </div>
                      <div className="text-[9px] text-center mt-1 text-gray-500">Análise de Vídeo/Áudio/Social (Microssegundos)</div>
                  </div>
              </div>
          )}

          {/* --- ORDER BOOK TAB --- */}
          {activeTab === 'orderbook' && (
             <div className="grid grid-cols-2 gap-4 h-full text-[10px] font-mono">
                <div>
                   <div className="text-red-400 mb-1 border-b border-gray-800 pb-1 flex justify-between">
                      <span>VENDAS (ASKS)</span>
                      <span>QTD</span>
                   </div>
                   {orderBook?.asks.slice(0).reverse().map((ask, i) => (
                      <div key={i} className="flex justify-between relative group">
                         <div className="absolute right-0 top-0 h-full bg-red-900/20" style={{ width: `${Math.min(100, (ask.amount / (orderBook.asks[0]?.total || 1)) * 100)}%` }}></div>
                         <span className="text-red-400 relative z-10">{ask.price.toFixed(platform === 'CTRADER' ? 4 : 2)}</span>
                         <span className="text-gray-400 relative z-10">{ask.amount.toFixed(platform === 'CTRADER' ? 0 : 4)}</span>
                      </div>
                   ))}
                </div>
                <div className="flex flex-col justify-end">
                   <div className="text-green-400 mb-1 border-b border-gray-800 pb-1 flex justify-between">
                      <span>COMPRAS (BIDS)</span>
                      <span>QTD</span>
                   </div>
                   {orderBook?.bids.map((bid, i) => (
                      <div key={i} className="flex justify-between relative">
                         <div className="absolute right-0 top-0 h-full bg-green-900/20" style={{ width: `${Math.min(100, (bid.amount / (orderBook.bids[orderBook.bids.length-1]?.total || 1)) * 100)}%` }}></div>
                         <span className="text-green-400 relative z-10">{bid.price.toFixed(platform === 'CTRADER' ? 4 : 2)}</span>
                         <span className="text-gray-400 relative z-10">{bid.amount.toFixed(platform === 'CTRADER' ? 0 : 4)}</span>
                      </div>
                   ))}
                </div>
                {!orderBook && !loading && <div className="col-span-2 text-center text-gray-500 pt-10">Conectando ao Feed L2...</div>}
             </div>
          )}

          {/* --- FUTURES TAB --- */}
          {activeTab === 'futures' && (
             <div className="space-y-4">
                {marketType === 'spot' && platform !== 'CTRADER' ? (
                   <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-2">
                      <Lock size={24} />
                      <p>Terminal configurado para SPOT.</p>
                      <p className="text-[10px]">Alterne para MODO FUTUROS no cabeçalho para acessar derivativos.</p>
                   </div>
                ) : positions.length === 0 ? (
                   <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <Activity size={24} className="mb-2 opacity-50" />
                      <p>Nenhuma posição aberta.</p>
                   </div>
                ) : (
                   positions.map((pos, i) => (
                      <div key={i} className="bg-black/30 p-3 rounded border border-purple-900/30">
                         <div className="flex justify-between items-center mb-2">
                            <span className="text-white font-bold">{pos.symbol}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded ${pos.pnl >= 0 ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                               {pos.leverage}x {pos.marginType}
                            </span>
                         </div>
                         <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-400">
                            <div>Entrada: <span className="text-white">{platform === 'CTRADER' ? pos.entryPrice.toFixed(4) : pos.entryPrice}</span></div>
                            <div>Mark: <span className="text-white">{platform === 'CTRADER' ? pos.markPrice.toFixed(4) : pos.markPrice}</span></div>
                            <div>Liq: <span className="text-orange-400">{platform === 'CTRADER' ? pos.liquidationPrice.toFixed(4) : pos.liquidationPrice}</span></div>
                            <div>ROE: <span className={pos.roe >= 0 ? 'text-green-400' : 'text-red-400'}>{pos.roe}%</span></div>
                         </div>
                         <div className="mt-2 pt-2 border-t border-gray-800 flex justify-between items-center">
                            <span className="text-[10px]">PnL Não Realizado</span>
                            <span className={`text-sm font-mono font-bold ${pos.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                               {pos.pnl > 0 ? '+' : ''}{pos.pnl} {platform === 'CTRADER' ? 'USD' : 'USDT'}
                            </span>
                         </div>
                      </div>
                   ))
                )}
             </div>
          )}

          {/* --- MINING / EARN TAB --- */}
          {activeTab === 'mining' && (
             <div className="space-y-3">
                <div className="bg-yellow-900/10 border border-yellow-900/30 p-2 rounded text-[10px] text-yellow-500 mb-2 flex items-center gap-2">
                   <Zap size={12} />
                   <span>{platform === 'CTRADER' ? 'cTrader Copy Strategy' : 'Liquidez Neural & Mineração DeFi'}</span>
                </div>
                {pools.map((pool) => (
                   <div key={pool.id} className="flex justify-between items-center bg-black/30 p-3 rounded border border-gray-800 hover:border-yellow-600/50 transition-colors">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-400">
                            {pool.pair.split('/')[0].substring(0,1)}
                         </div>
                         <div>
                            <div className="text-xs font-bold text-white">{pool.pair}</div>
                            <div className="text-[9px] text-gray-500">Liquidez Total: ${(pool.tvl / 1000000).toFixed(1)}M</div>
                         </div>
                      </div>
                      <div className="text-right">
                         <div className="text-sm font-bold text-green-400 font-mono">{pool.apy}% APY</div>
                         <button className="mt-1 text-[9px] bg-yellow-900/20 text-yellow-500 px-2 py-0.5 rounded border border-yellow-900/50 hover:bg-yellow-900/40">
                            {platform === 'CTRADER' ? 'COPIAR' : 'MINERAR'}
                         </button>
                      </div>
                   </div>
                ))}
             </div>
          )}

          {/* --- ARBITRAGE TAB --- */}
          {activeTab === 'arbitrage' && (
             <div className="space-y-3">
                <div className="bg-blue-900/10 border border-blue-900/30 p-2 rounded text-[10px] text-blue-400 mb-2 flex items-center gap-2">
                   <Globe size={12} />
                   <span>Monitoramento de Spread Cross-Chain (Binance vs cTrader)</span>
                </div>
                
                {arbitrageOps.length === 0 && !loading && (
                    <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                        <RefreshCw size={24} className="mb-2 animate-spin" />
                        <p className="text-xs">Escaneando pares globais...</p>
                    </div>
                )}

                {arbitrageOps.map((op, idx) => {
                    const isBinanceBuy = op.direction === 'BINANCE_TO_CTRADER';
                    return (
                        <div key={idx} className="bg-black/30 border border-blue-500/20 p-3 rounded hover:border-blue-500/50 transition-colors group">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-white font-bold">{op.symbol}</span>
                                <span className="text-xs px-2 py-0.5 rounded bg-blue-900/50 text-blue-300 font-mono border border-blue-800">
                                    SPREAD: {op.spreadPct.toFixed(3)}%
                                </span>
                            </div>
                            
                            <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono relative">
                                <div className={`flex flex-col items-start ${isBinanceBuy ? 'text-green-400' : 'text-red-400'}`}>
                                    <div className="flex items-center gap-1 mb-1">
                                        <Zap size={10} /> BINANCE
                                    </div>
                                    <span className="font-bold text-xs">{op.binancePrice.toFixed(2)}</span>
                                </div>

                                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 text-gray-600">
                                    {isBinanceBuy ? <ArrowRight size={12} className="text-blue-500" /> : <ArrowRight size={12} className="text-blue-500 rotate-180" />}
                                </div>

                                <div className={`flex flex-col items-end ${!isBinanceBuy ? 'text-green-400' : 'text-red-400'}`}>
                                    <div className="flex items-center gap-1 mb-1">
                                        <Hexagon size={10} /> cTRADER
                                    </div>
                                    <span className="font-bold text-xs">{op.ctraderPrice.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="mt-2 w-full">
                                <button className="w-full text-[9px] bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 py-1 rounded border border-blue-500/30 transition-colors uppercase tracking-wider">
                                    Executar Arbitragem {op.direction === 'BINANCE_TO_CTRADER' ? '(Compra Spot -> Venda CFD)' : '(Venda Spot -> Compra CFD)'}
                                </button>
                            </div>
                        </div>
                    );
                })}
             </div>
          )}
       </div>
    </div>
  );
};

export default OperationsCenter;
