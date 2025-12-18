
import ccxt from 'ccxt';
import { WalletBalance, MarketType, FuturesPosition, OrderBook, LiquidityPool, ExchangePlatform, MarketDataPoint } from '../types';

interface Keys {
  BINANCE_API_KEY?: string;
  BINANCE_API_SECRET?: string;
  CTRADER_ID?: string;
  CTRADER_SECRET?: string;
}

let keys: Keys = {
  BINANCE_API_KEY: localStorage.getItem('LEX_BINANCE_KEY') || '',
  BINANCE_API_SECRET: localStorage.getItem('LEX_BINANCE_SECRET') || '',
  CTRADER_ID: localStorage.getItem('LEX_CTRADER_ID') || '',
  CTRADER_SECRET: localStorage.getItem('LEX_CTRADER_TOKEN') || ''
};

let exchange: ccxt.binance | null = null;
let currentMarketType: MarketType = 'spot';
let currentPlatform: ExchangePlatform = 'BINANCE';
let ws: WebSocket | null = null;

export type OnPriceUpdate = (candle: {
    time: string; 
    timestamp: number; 
    price: number;
    open: number;
    high: number;
    low: number;
    volume: number;
    isFinal: boolean;
}) => void;

export interface ArbitrageOpportunity {
    symbol: string;
    binancePrice: number;
    ctraderPrice: number;
    spread: number;
    spreadPct: number;
    direction: 'BINANCE_TO_CTRADER' | 'CTRADER_TO_BINANCE';
}

/**
 * Sets API credentials dynamically from the UI
 */
export function setCredentials(apiKey: string, apiSecret: string) {
  if (currentPlatform === 'BINANCE') {
      keys.BINANCE_API_KEY = apiKey;
      keys.BINANCE_API_SECRET = apiSecret;
  } else {
      keys.CTRADER_ID = apiKey; 
      keys.CTRADER_SECRET = apiSecret;
  }
  exchange = null; // Force recreation
  console.log(`🔐 Credentials updated for ${currentPlatform}.`);
}

/**
 * Validates the connection using current keys
 */
export async function validateConnection(platform: ExchangePlatform): Promise<boolean> {
    if (platform === 'BINANCE') {
        const ex = ensureExchange();
        if (!ex || !keys.BINANCE_API_KEY) return false;
        try {
            await ex.fetchBalance(); // Try a private call
            return true;
        } catch (e) {
            console.error("Binance Validation Failed:", e);
            return false;
        }
    } else {
        // Mock cTrader validation (since we don't have a real backend proxy for OAuth)
        // Checks if ID is present and formatted reasonably
        if (keys.CTRADER_ID && keys.CTRADER_SECRET && keys.CTRADER_ID.length > 3) {
            return true;
        }
        return false;
    }
}

/**
 * Switch Platform (Binance / cTrader)
 */
export function setPlatform(platform: ExchangePlatform) {
    if (platform !== currentPlatform) {
        currentPlatform = platform;
        exchange = null; // Reset ccxt instance if needed
        console.log(`🌐 Switched Platform Context to: ${platform}`);
    }
}

/**
 * Sets the Market Type (Spot or Future) and recreates the exchange instance
 */
export function setMarketType(type: MarketType) {
    if (type !== currentMarketType) {
        currentMarketType = type;
        exchange = null; // Force recreation with new options
        console.log(`🔀 Market Context Switched to: ${type.toUpperCase()}`);
    }
}

function ensureExchange(): ccxt.binance | null {
  if (currentPlatform === 'CTRADER') return null; 

  if (exchange) {
    return exchange;
  }

  if (!ccxt) {
    throw new Error('ccxt library failed to load');
  }

  try {
    const options: any = {
        'defaultType': currentMarketType, 
    };
    
    if (currentMarketType === 'future') {
        options['adjustForTimeDifference'] = true;
    }

    // Check if we have keys to enable private endpoints
    const hasKeys = keys.BINANCE_API_KEY && keys.BINANCE_API_SECRET && !keys.BINANCE_API_KEY.includes('*');

    exchange = new ccxt.binance({
      apiKey: hasKeys ? keys.BINANCE_API_KEY : undefined,
      secret: hasKeys ? keys.BINANCE_API_SECRET : undefined,
      enableRateLimit: true,
      options: options
    });
  } catch (error) {
    console.error("Failed to initialize CCXT:", error);
    return null;
  }

  return exchange;
}

/**
 * Fetches Wallet Balance (Handles Spot and Future via current context)
 */
export async function fetchBalance(): Promise<WalletBalance | null> {
    // --- CTRADER SIMULATION (FOREX/CFD) ---
    if (currentPlatform === 'CTRADER') {
        // cTrader typically uses one main currency (USD, EUR) for margin
        const baseBalance = keys.CTRADER_ID ? 75000 : 50000;
        const equity = baseBalance + (Math.random() * 500 - 250);
        return {
            totalUsdt: equity,
            freeUsdt: equity * 0.8, // Margin used simulation
            totalBtc: 0,
            freeBtc: 0,
            estimatedTotalValue: equity,
            currency: 'USD'
        };
    }

    // --- BINANCE REAL/SIMULATED ---
    const ex = ensureExchange();
    if (!ex) return null;

    try {
        if (!ex.apiKey) throw new Error("No API Key"); // Jump to catch for simulation fallback if needed, or return null

        const balance = await ex.fetchBalance();
        
        // Structure differs slightly between spot and future in CCXT
        const usdt = balance['USDT'] || { total: 0, free: 0 };
        const btc = balance['BTC'] || { total: 0, free: 0 };
        
        let estimatedValue = 0;
        
        if (currentMarketType === 'spot') {
             const ticker = await ex.fetchTicker('BTC/USDT');
             const btcPrice = ticker.last || 0;
             estimatedValue = (usdt.total || 0) + ((btc.total || 0) * btcPrice);
        } else {
             estimatedValue = balance['total'] ? balance['total']['USDT'] : (usdt.total || 0);
        }

        return {
            totalUsdt: usdt.total || 0,
            freeUsdt: usdt.free || 0,
            totalBtc: btc.total || 0,
            freeBtc: btc.free || 0,
            estimatedTotalValue: estimatedValue
        };
    } catch (e) {
        // Fallback for demo if no keys or error
        console.warn("Using simulated balance (No Keys or Error):", e);
        return {
            totalUsdt: 15000, 
            freeUsdt: 12000, 
            totalBtc: 0.15, 
            freeBtc: 0.15, 
            estimatedTotalValue: 24500
        };
    }
}

/**
 * Fetch Open Futures Positions
 */
export async function fetchFuturesPositions(symbol?: string): Promise<FuturesPosition[]> {
    if (currentPlatform === 'CTRADER') {
        // cTrader Positions (Forex Pairs, Gold, etc)
        // Simulating open positions typical in Forex
        return [
            {
                symbol: 'EURUSD',
                amount: 100000, // 1 Standard Lot
                entryPrice: 1.0850,
                markPrice: 1.0855,
                pnl: 50, 
                roe: 5,
                leverage: 100,
                marginType: 'cross',
                liquidationPrice: 1.0750
            },
            {
                symbol: 'XAUUSD',
                amount: 10, // 10 Oz
                entryPrice: 2350.00,
                markPrice: 2355.50,
                pnl: 55,
                roe: 8.5,
                leverage: 200,
                marginType: 'cross',
                liquidationPrice: 2300.00
            }
        ];
    }

    const ex = ensureExchange();
    if (!ex || currentMarketType !== 'future' || !ex.apiKey) return [];

    try {
        const positions = await ex.fetchPositions(symbol ? [symbol] : undefined);
        
        return positions.map((p: any) => ({
            symbol: p.symbol,
            amount: p.contracts || p.amount,
            entryPrice: p.entryPrice,
            markPrice: p.markPrice,
            pnl: p.unrealizedPnl,
            roe: p.percentage, 
            leverage: p.leverage,
            marginType: p.marginType,
            liquidationPrice: p.liquidationPrice
        }));
    } catch (e) {
        console.error("Failed to fetch positions:", e);
        return []; 
    }
}

/**
 * Fetch Order Book (Level 2 Data)
 */
export async function fetchOrderBook(symbol: string, limit: number = 10): Promise<OrderBook | null> {
    if (currentPlatform === 'CTRADER') {
        // cTrader L2 simulation
        // Forex usually has tighter spreads and massive liquidity
        const basePrice = symbol === 'EURUSD' ? 1.0850 : (symbol === 'XAUUSD' ? 2350 : 100);
        const spread = basePrice * 0.00005; // Tight Forex Spread
        const bids = [];
        const asks = [];
        for(let i=0; i<limit; i++) {
            // Millions of units in liquidity
            bids.push([basePrice - (spread * (i+1)), Math.floor(Math.random() * 5000000) + 1000000]);
            asks.push([basePrice + (spread * (i+1)), Math.floor(Math.random() * 5000000) + 1000000]);
        }
        
        const process = (items: number[][]) => {
            let total = 0;
            return items.map(item => {
                total += item[1];
                return { price: item[0], amount: item[1], total };
            });
        };

        return {
            bids: process(bids),
            asks: process(asks),
            timestamp: Date.now()
        };
    }

    const ex = ensureExchange();
    if (!ex) return null;

    try {
        const book = await ex.fetchOrderBook(symbol, limit);
        
        const process = (items: number[][]) => {
            let total = 0;
            return items.map(item => {
                total += item[1];
                return { price: item[0], amount: item[1], total };
            });
        };

        return {
            bids: process(book.bids),
            asks: process(book.asks),
            timestamp: book.timestamp || Date.now()
        };
    } catch (e) {
        // Fallback simulation
        return null;
    }
}

export async function fetchLiquidityMiningPools(): Promise<LiquidityPool[]> {
    if (currentPlatform === 'CTRADER') {
        // cTrader Copy (Strategy Providers)
        return [
            { id: 'c1', pair: 'Forex King Strategy', apy: 45.2, tvl: 8500000, userShare: 0 },
            { id: 'c2', pair: 'Gold Scalper Bot', apy: 22.1, tvl: 3200000, userShare: 0 },
            { id: 'c3', pair: 'Indices Swing', apy: 18.5, tvl: 5400000, userShare: 0 },
            { id: 'c4', pair: 'EURUSD HFT Alpha', apy: 12.4, tvl: 9100000, userShare: 0 }
        ];
    }

    return [
        { id: '1', pair: 'BTC/USDT', apy: 3.45, tvl: 125000000, userShare: 0 },
        { id: '2', pair: 'ETH/USDT', apy: 4.12, tvl: 89000000, userShare: 0 },
        { id: '3', pair: 'BNB/USDT', apy: 2.89, tvl: 45000000, userShare: 0 },
        { id: '4', pair: 'SOL/USDT', apy: 12.5, tvl: 32000000, userShare: 0 },
        { id: '5', pair: 'USDT/DAI', apy: 1.2, tvl: 250000000, userShare: 0 },
    ];
}

export async function checkCrossPlatformGap(): Promise<ArbitrageOpportunity[]> {
    const assets = [
        { binance: 'BTC/USDT', ctrader: 'BTC/USD', base: 64200 },
        { binance: 'ETH/USDT', ctrader: 'ETH/USD', base: 3450 },
        { binance: 'SOL/USDT', ctrader: 'SOL/USD', base: 145 },
        { binance: 'XRP/USDT', ctrader: 'XRP/USD', base: 0.62 }
    ];

    const opportunities: ArbitrageOpportunity[] = [];

    for (const asset of assets) {
        const devBinance = (Math.random() - 0.5) * 0.005;
        const devCtrader = (Math.random() - 0.5) * 0.005;
        
        const pBinance = asset.base * (1 + devBinance);
        const pCtrader = asset.base * (1 + devCtrader);
        
        const spread = Math.abs(pBinance - pCtrader);
        const spreadPct = (spread / pBinance) * 100;

        if (spreadPct > 0.1) { 
            opportunities.push({
                symbol: asset.binance.split('/')[0],
                binancePrice: pBinance,
                ctraderPrice: pCtrader,
                spread: spread,
                spreadPct: spreadPct,
                direction: pBinance < pCtrader ? 'BINANCE_TO_CTRADER' : 'CTRADER_TO_BINANCE'
            });
        }
    }

    return opportunities.sort((a, b) => b.spreadPct - a.spreadPct);
}

// Generate Realistic Forex Data for Training
export function generateForexHistory(count: number = 500): MarketDataPoint[] {
    const data: MarketDataPoint[] = [];
    let price = 1.0850; // Starting EURUSD price
    let trend = 0;
    
    // Helper needed here to ensure we don't import circular dep from App.tsx
    // Simplified calculation inline
    const getSMA = (arr: number[], period: number) => {
        if(arr.length < period) return 0;
        return arr.slice(-period).reduce((a,b)=>a+b,0)/period;
    };

    const prices: number[] = [];

    for(let i=0; i<count; i++) {
        // Simulation of Forex micro-structure
        // Mean reversion + Trend momentum
        trend += (Math.random() - 0.5) * 0.0001; 
        if (Math.abs(trend) > 0.0005) trend *= 0.9; // Dampen trend

        const volatility = 0.0005 + (Math.random() * 0.0005);
        const change = trend + (Math.random() - 0.5) * volatility;
        
        price += change;
        prices.push(price);

        const open = price - (change * 0.5);
        const high = Math.max(open, price) + (Math.random() * 0.0002);
        const low = Math.min(open, price) - (Math.random() * 0.0002);
        
        // Calculate basic indicators for the AI
        const ma7 = getSMA(prices, 7) || price;
        const ma25 = getSMA(prices, 25) || price;
        const rsi = 50 + (Math.random() * 40 - 20); // Simulated RSI for speed

        data.push({
            time: new Date(Date.now() - (count - i) * 60000 * 15).toISOString(),
            price: Number(price.toFixed(5)),
            open: Number(open.toFixed(5)),
            high: Number(high.toFixed(5)),
            low: Number(low.toFixed(5)),
            volume: Math.floor(Math.random() * 5000 + 1000),
            ma7,
            ma25,
            rsi,
            bbUpper: ma25 + (0.0020),
            bbLower: ma25 - (0.0020),
            macd: 0, macdSignal: 0, macdHist: (Math.random()-0.5)*0.0001,
            atr: 0.0010,
            stochK: 50, stochD: 50, vwap: price
        });
    }
    return data;
}

export async function fetchHistoricalData(
    symbol: string = 'BTC/USDT',
    timeframe: string = '1h',
    limit: number = 1000
): Promise<ccxt.OHLCV[]> {
    if (currentPlatform === 'CTRADER') return []; 

    const ex = ensureExchange();
    if (!ex) return [];
    try {
        return await ex.fetchOHLCV(symbol, timeframe, undefined, limit);
    } catch (e) {
        return [];
    }
}

export async function pegarOhlcv(
  symbol: string = 'BTC/USDT',
  timeframe: string = '15m',
  limit: number = 100
): Promise<ccxt.OHLCV[]> {
  if (currentPlatform === 'CTRADER') throw new Error("Trigger cTrader Simulation");

  const ex = ensureExchange();
  if (!ex) throw new Error("Exchange not initialized");
  try {
    return await ex.fetchOHLCV(symbol, timeframe, undefined, limit);
  } catch (error) {
    throw error;
  }
}

export async function checkOrderDetails(orderId: string, symbol: string): Promise<ccxt.Order | null> {
    const ex = ensureExchange();
    if (!ex || !ex.apiKey) return null; 

    try {
        const order = await ex.fetchOrder(orderId, symbol);
        return order;
    } catch (e) {
        return null;
    }
}

export async function cancelOrder(orderId: string, symbol: string): Promise<boolean> {
    const ex = ensureExchange();
    if (!ex || !ex.apiKey) return true; 

    try {
        await ex.cancelOrder(orderId, symbol);
        return true;
    } catch (e) {
        return false;
    }
}

export async function enviarOrdemLimit(
  symbol: string,
  side: 'buy' | 'sell',
  amount: number,
  price: number
): Promise<ccxt.Order> {
  const ex = ensureExchange();
  const sideLower = side.toLowerCase();

  // If we have no API keys, we fallback to Simulation
  if (currentPlatform === 'CTRADER' || !ex || !ex.apiKey) {
     return simulateOrder(symbol, 'limit', sideLower, amount, price);
  }

  try {
      // Real Execution
      return await ex.createLimitOrder(symbol, sideLower as 'buy' | 'sell', amount, price);
  } catch (error) {
      handleExchangeError(error);
      throw error;
  }
}

export async function enviarOrdemMarket(
  symbol: string,
  side: 'buy' | 'sell',
  amount: number
): Promise<ccxt.Order> {
  const ex = ensureExchange();
  const sideLower = side.toLowerCase();

  if (currentPlatform === 'CTRADER' || !ex || !ex.apiKey) {
     return simulateOrder(symbol, 'market', sideLower, amount, 0);
  }

  try {
    // Real Execution
    return await ex.createMarketOrder(symbol, sideLower as 'buy' | 'sell', amount);
  } catch (error) {
    handleExchangeError(error);
    throw error;
  }
}

function simulateOrder(symbol: string, type: string, side: string, amount: number, price: number): ccxt.Order {
    const isForex = currentPlatform === 'CTRADER';
    // Forex cost calculation (Units * Price / Leverage) - simplified here
    // Standard Lot = 100,000 units. Amount passed in UI is usually unit-normalized or lots.
    // If user buys 1 Lot EURUSD at 1.0850: 100,000 * 1.0850 = $108,500 Notional Value.
    const cost = isForex ? (amount * 100000 * price) : amount * price;

    return {
         id: Math.floor(Math.random() * 1000000).toString(),
         symbol: symbol,
         type: type,
         side: side as 'buy' | 'sell',
         amount: amount,
         price: price,
         cost: cost,
         status: type === 'market' ? 'closed' : 'open', 
         timestamp: Date.now(),
         datetime: new Date().toISOString(),
         lastTradeTimestamp: Date.now(),
         filled: type === 'market' ? amount : 0,
         remaining: type === 'market' ? 0 : amount,
         trades: [],
         fee: { currency: isForex ? 'USD' : 'BNB', cost: isForex ? 5.00 : 0.001, rate: 0.1 }, // $5 per lot commission
         info: {}
     } as unknown as ccxt.Order;
}

function handleExchangeError(e: any) {
    let message = "Unknown Exchange Error";
    if (e instanceof ccxt.InsufficientFunds) message = "Saldo Insuficiente na Exchange.";
    else if (e instanceof ccxt.InvalidOrder) message = "Ordem Inválida: Parâmetros rejeitados.";
    else if (e instanceof ccxt.OrderNotFound) message = "Ordem não encontrada.";
    else if (e instanceof ccxt.NetworkError) message = "Erro de Rede (CORS/Proxy necessário).";
    else if (e instanceof ccxt.ExchangeError) message = `Erro da Exchange: ${e.message}`;
    else if (e instanceof Error) message = e.message;

    console.error("Trade Execution Failed:", message);
    throw new Error(message);
}

export function startPriceStream(symbol: string, timeframe: string = '15m', onUpdate: OnPriceUpdate): () => void {
    if (currentPlatform === 'CTRADER') {
        const interval = setInterval(() => {
            // Placeholder: App.tsx handles the actual data generation for simulation mode
        }, 1000);
        return () => clearInterval(interval);
    }

    const wsSymbol = symbol.replace('/', '').toLowerCase();
    const url = `wss://stream.binance.com:9443/ws/${wsSymbol}@kline_${timeframe}`;
    
    if (ws) {
        ws.close();
        ws = null;
    }

    try {
        ws = new WebSocket(url);
        ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                if (message.e === 'kline') {
                    const k = message.k;
                    onUpdate({
                        time: new Date(k.t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        timestamp: k.t,
                        price: parseFloat(k.c),
                        open: parseFloat(k.o),
                        high: parseFloat(k.h),
                        low: parseFloat(k.l),
                        volume: parseFloat(k.v),
                        isFinal: k.x
                    });
                }
            } catch (err) { console.error(err); }
        };
    } catch (e) { console.error(e); }

    return () => { if (ws) ws.close(); };
}
