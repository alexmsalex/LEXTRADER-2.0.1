
import { OracleConsensus, OracleSignal, OracleSourceType } from "../types";

// Simulation of external API calls to major financial data providers.
// In a production environment, these would be real async fetch calls to their respective backends.

class OracleService {
    
    // 1. TradingView (Technical Analysis Aggregator)
    async getTradingViewSignal(symbol: string): Promise<OracleSignal> {
        // Simulates the "Technical Analysis" widget logic (Oscillators + Moving Averages)
        const score = Math.random() * 100;
        let signal: 'BUY' | 'SELL' | 'NEUTRAL' = 'NEUTRAL';
        if (score > 60) signal = 'BUY';
        if (score < 40) signal = 'SELL';

        return {
            source: 'TRADINGVIEW',
            signal,
            score,
            metadata: `Oscillators: ${signal === 'BUY' ? 'Strong Buy' : signal} | MA: Mixed`,
            latency: 120
        };
    }

    // 2. YFinance (Yahoo Finance - Fundamental & Traditional Market Correlation)
    async getYFinanceData(symbol: string): Promise<OracleSignal> {
        // Simulates fetching correlation with S&P 500 (SPY) and DXY
        const spyCorrelation = Math.random(); // 0 to 1
        const dxyTrend = Math.random() > 0.5 ? 'UP' : 'DOWN';
        
        // If DXY is UP, Crypto usually DOWN. If SPY UP, Crypto usually UP.
        let signal: 'BUY' | 'SELL' | 'NEUTRAL' = 'NEUTRAL';
        if (dxyTrend === 'DOWN' && spyCorrelation > 0.5) signal = 'BUY';
        else if (dxyTrend === 'UP') signal = 'SELL';

        return {
            source: 'YFINANCE',
            signal,
            score: Math.random() * 100,
            metadata: `SP500 Corr: ${(spyCorrelation*100).toFixed(0)}% | DXY: ${dxyTrend}`,
            latency: 450
        };
    }

    // 3. Glassnode (On-Chain Intelligence)
    async getGlassnodeMetrics(symbol: string): Promise<OracleSignal> {
        // Simulates NUPL (Net Unrealized Profit/Loss) and Exchange Flows
        const nupl = Math.random(); // 0 to 1
        const exchangeFlow = Math.random() > 0.5 ? 'OUTFLOW' : 'INFLOW'; // Outflow = Bullish
        
        let signal: 'BUY' | 'SELL' | 'NEUTRAL' = 'NEUTRAL';
        if (nupl < 0.3) signal = 'BUY'; // Capitulation zone
        if (nupl > 0.7) signal = 'SELL'; // Euphoria zone
        if (exchangeFlow === 'OUTFLOW' && signal !== 'SELL') signal = 'BUY';

        return {
            source: 'GLASSNODE',
            signal,
            score: nupl * 100,
            metadata: `NUPL: ${nupl.toFixed(2)} | NetFlow: ${exchangeFlow}`,
            latency: 800
        };
    }

    // 4. Santiment (Social & Sentiment)
    async getSantimentData(symbol: string): Promise<OracleSignal> {
        // Social Volume & Weighted Sentiment
        const socialVolume = Math.floor(Math.random() * 10000);
        const sentimentScore = (Math.random() * 4) - 2; // -2 to +2
        
        let signal: 'BUY' | 'SELL' | 'NEUTRAL' = 'NEUTRAL';
        if (sentimentScore > 1) signal = 'SELL'; // Contrarian sell on extreme hype
        if (sentimentScore < -1) signal = 'BUY'; // Contrarian buy on FUD

        return {
            source: 'SANTIMENT',
            signal,
            score: 50 + (sentimentScore * 25),
            metadata: `Social Vol: ${socialVolume} | Sentiment: ${sentimentScore.toFixed(2)}`,
            latency: 600
        };
    }

    // 5. Coinglass (Derivatives & Liquidation Data)
    async getCoinglassData(symbol: string): Promise<OracleSignal> {
        // Long/Short Ratio & Funding Rates
        const lsRatio = 0.5 + Math.random(); // 0.5 to 1.5
        const fundingRate = (Math.random() * 0.04) - 0.02; // -0.02% to +0.02%
        
        let signal: 'BUY' | 'SELL' | 'NEUTRAL' = 'NEUTRAL';
        if (lsRatio > 1.2) signal = 'SELL'; // Too many longs
        if (fundingRate < -0.01) signal = 'BUY'; // Short squeeze potential

        return {
            source: 'COINGLASS',
            signal,
            score: 50,
            metadata: `L/S Ratio: ${lsRatio.toFixed(2)} | Funding: ${fundingRate.toFixed(4)}%`,
            latency: 300
        };
    }

    // 6. IntoTheBlock (Deep On-Chain Analytics)
    async getIntoTheBlockData(symbol: string): Promise<OracleSignal> {
        // In/Out of the Money
        const inMoney = Math.random() * 100;
        
        let signal: 'BUY' | 'SELL' | 'NEUTRAL' = 'NEUTRAL';
        if (inMoney > 90) signal = 'SELL'; // Profit taking risk
        if (inMoney < 40) signal = 'BUY'; // Undervalued

        return {
            source: 'INTOTHEBLOCK',
            signal,
            score: inMoney,
            metadata: `In Money: ${inMoney.toFixed(0)}% | Whales: Stable`,
            latency: 550
        };
    }

    // 7. Messari (Fundamental Crypto Assets)
    async getMessariData(symbol: string): Promise<OracleSignal> {
        // Real Volume vs Reported Volume / Developer Activity
        const realVolProfile = Math.random();
        
        let signal: 'BUY' | 'SELL' | 'NEUTRAL' = 'NEUTRAL';
        if (realVolProfile > 0.8) signal = 'BUY'; // High quality volume

        return {
            source: 'MESSARI',
            signal,
            score: realVolProfile * 100,
            metadata: `Real Vol: ${(realVolProfile*100).toFixed(0)}% | Dev Activity: High`,
            latency: 700
        };
    }

    // --- AGGREGATOR ---

    async getMarketConsensus(symbol: string = 'BTC/USDT'): Promise<OracleConsensus> {
        const signals = await Promise.all([
            this.getTradingViewSignal(symbol),
            this.getYFinanceData(symbol),
            this.getGlassnodeMetrics(symbol),
            this.getSantimentData(symbol),
            this.getCoinglassData(symbol),
            this.getIntoTheBlockData(symbol),
            this.getMessariData(symbol)
        ]);

        let bullishCount = 0;
        let bearishCount = 0;
        let totalScore = 0;

        signals.forEach(s => {
            if (s.signal === 'BUY') bullishCount++;
            if (s.signal === 'SELL') bearishCount++;
            totalScore += s.signal === 'BUY' ? s.score : s.signal === 'SELL' ? (100 - s.score) : 50;
        });

        const overallScore = totalScore / signals.length;
        
        // Determine Primary Driver (Source with most extreme score)
        const primaryDriver = signals.reduce((prev, current) => {
            const prevDev = Math.abs(prev.score - 50);
            const currDev = Math.abs(current.score - 50);
            return currDev > prevDev ? current : prev;
        }).source;

        return {
            overallScore,
            bullishCount,
            bearishCount,
            primaryDriver,
            signals
        };
    }
}

export const oracleService = new OracleService();
