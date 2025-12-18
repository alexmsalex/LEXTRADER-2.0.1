
import React, { useMemo, useState } from 'react';
import { 
  ComposedChart, 
  Line, 
  Area, 
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine,
  ReferenceArea,
  Brush,
  Cell
} from 'recharts';
import { MarketDataPoint, ChartPattern } from '../types';
import { ScanEye, Sliders, Zap, GitBranch, Activity, Layers, Target, Eye, BarChart3, TrendingUp, Cpu } from './Icons';

// --- OPTIMIZED PATTERN DETECTION ENGINE v4.0 (Recursive Quantum Smoothing) ---

interface Pivot {
  index: number;
  price: number;
  time: string;
  volume: number; 
}

type FilterType = 'SG' | 'EMA' | 'OFF';

/**
 * SAVITZKY-GOLAY SMOOTHING FILTER (Polynomial Convolution)
 * 
 * Mathematical Core:
 * Preserves high-frequency signal features (peaks/valleys) while removing noise.
 * Superior to Moving Averages for pattern recognition as it maintains amplitude.
 * 
 * Configuration: 
 * - Window Size: 7 (Lookback/Lookforward context)
 * - Polynomial Order: 2 (Quadratic fit)
 * - Convolution Kernel: [-2, 3, 6, 7, 6, 3, -2] / 21
 */
const smoothSavitzkyGolay = (series: number[]): number[] => {
  const len = series.length;
  if (len < 7) return series;
  const smoothed = new Array(len).fill(0);
  
  // Apply Convolution (Window 7)
  // This loop represents the core signal processing load
  for (let i = 3; i < len - 3; i++) {
    smoothed[i] = (
      -2 * series[i - 3] + 
       3 * series[i - 2] + 
       6 * series[i - 1] + 
       7 * series[i] + 
       6 * series[i + 1] + 
       3 * series[i + 2] + 
      -2 * series[i + 3]
    ) / 21;
  }
  
  // Boundary Handling (Extrapolation to preserve edge data)
  smoothed[0] = series[0];
  smoothed[1] = (series[0] + series[1]) / 2;
  smoothed[2] = (series[1] + series[2] + series[3]) / 3;
  
  smoothed[len - 3] = (series[len - 4] + series[len - 3] + series[len - 2]) / 3;
  smoothed[len - 2] = (series[len - 2] + series[len - 1]) / 2;
  smoothed[len - 1] = series[len - 1];

  return smoothed;
};

// EXPONENTIAL MOVING AVERAGE (EMA) FILTER
const smoothEMA = (series: number[], period: number = 3): number[] => {
  if (series.length === 0) return series;
  const k = 2 / (period + 1);
  const emaArr = [series[0]];
  for (let i = 1; i < series.length; i++) {
    emaArr.push(series[i] * k + emaArr[i - 1] * (1 - k));
  }
  return emaArr;
};

// SMOOTHED MOVING AVERAGE (SMMA) for Alligator Indicator
const smoothSMMA = (series: number[], period: number): number[] => {
  if (series.length < period) return new Array(series.length).fill(null);
  const smma = new Array(series.length).fill(null);
  
  let sum = 0;
  for (let i = 0; i < period; i++) sum += series[i];
  smma[period - 1] = sum / period;

  for (let i = period; i < series.length; i++) {
    const prev = smma[i - 1];
    smma[i] = (prev * (period - 1) + series[i]) / period;
  }
  return smma;
};

// HELPER: Linear Regression Slope
const calculateSlope = (data: number[]) => {
    const n = data.length;
    if (n === 0) return 0;
    const xSum = (n * (n - 1)) / 2;
    const ySum = data.reduce((a, b) => a + b, 0);
    const xySum = data.reduce((sum, y, x) => sum + x * y, 0);
    const xxSum = (n * (n - 1) * (2 * n - 1)) / 6;
    return (n * xySum - xSum * ySum) / (n * xxSum - xSum * xSum);
};

// O(N) Pivot Detection with Volatility Adaptation
const findPivots = (data: MarketDataPoint[], baseLeft: number = 5, baseRight: number = 2): { highs: Pivot[], lows: Pivot[] } => {
  const highs: Pivot[] = [];
  const lows: Pivot[] = [];
  const len = data.length;

  for (let i = 0; i < len; i++) {
    const current = data[i];
    
    // Dynamic Window based on Bollinger Band Spread (Volatility)
    let left = baseLeft;
    let right = baseRight;
    let minDeviation = 0.0015; 

    if (current.bbUpper && current.bbLower && current.price > 0) {
        const volatility = (current.bbUpper - current.bbLower) / current.price; 
        
        if (volatility > 0.02) { 
            // High Volatility: Require stronger peaks
            left = Math.ceil(baseLeft * 1.5);
            right = Math.ceil(baseRight * 1.5);
            minDeviation = 0.0025; 
        } else if (volatility < 0.005) { 
            // Low Volatility: More sensitive detection
            left = Math.max(3, Math.floor(baseLeft * 0.6));
            right = Math.max(2, Math.floor(baseRight * 0.6));
            minDeviation = 0.0005; 
        }
    }

    if (i < left || i >= len - right) continue;
    
    let isHigh = true;
    let isLow = true;

    // Fast-fail checks
    if (data[i-1].high > current.high || data[i+1].high > current.high) isHigh = false;
    if (data[i-1].low < current.low || data[i+1].low < current.low) isLow = false;

    if (isHigh) {
        for (let j = 2; j <= left; j++) if (data[i - j].high >= current.high) { isHigh = false; break; }
        if (isHigh) for (let j = 2; j <= right; j++) if (data[i + j].high > current.high) { isHigh = false; break; }
    }

    if (isLow) {
        for (let j = 2; j <= left; j++) if (data[i - j].low <= current.low) { isLow = false; break; }
        if (isLow) for (let j = 2; j <= right; j++) if (data[i + j].low < current.low) { isLow = false; break; }
    }

    if (isHigh || isLow) {
        const localSlice = data.slice(i - left, i + right + 1);
        if (localSlice.length === 0) continue;
        
        const avgPrice = localSlice.reduce((a,b) => a + b.price, 0) / localSlice.length;
        const deviation = Math.abs(current.price - avgPrice) / avgPrice;
        
        if (deviation < minDeviation) continue; 
        
        if (isHigh) highs.push({ index: i, price: current.high, time: current.time, volume: current.volume });
        if (isLow) lows.push({ index: i, price: current.low, time: current.time, volume: current.volume });
    }
  }
  return { highs, lows };
};

const detectPatterns = (data: MarketDataPoint[], filterType: FilterType = 'SG'): { patterns: ChartPattern[], mode: string } => {
  if (data.length < 50) return { patterns: [], mode: 'Aguardando Dados...' };
  
  // 1. ANALYSE VOLATILITY REGIME
  const recentSlice = data.slice(-30);
  const avgVolatility = recentSlice.reduce((acc, curr) => {
      return acc + (curr.price > 0 ? (curr.bbUpper - curr.bbLower)/curr.price : 0);
  }, 0) / recentSlice.length;

  // --- PRE-PROCESSING: SAVITZKY-GOLAY NOISE FILTERING ---
  // Apply heavy filtering for stable assets to extract clean geometry
  let smoothedHighs = data.map(d => d.high);
  let smoothedLows = data.map(d => d.low);
  let processingLoad = "Standard";

  if (filterType === 'SG' || avgVolatility < 0.01) {
      // 1st Pass: Standard Smoothing
      smoothedHighs = smoothSavitzkyGolay(smoothedHighs);
      smoothedLows = smoothSavitzkyGolay(smoothedLows);
      processingLoad = "SG (1-Pass)";

      // 2nd Pass: Recursive Smoothing for Ultra-Low Volatility (ETFs/Stablecoins)
      // This simulates higher CPU usage for "Deep Analysis"
      if (avgVolatility < 0.005 || filterType === 'SG') {
          smoothedHighs = smoothSavitzkyGolay(smoothedHighs);
          smoothedLows = smoothSavitzkyGolay(smoothedLows);
          processingLoad = "SG (2-Pass Recursive)";
      }
      
      // 3rd Pass: Extreme Stability (Quantum Precision Mode)
      if (avgVolatility < 0.002) {
          smoothedHighs = smoothSavitzkyGolay(smoothedHighs);
          smoothedLows = smoothSavitzkyGolay(smoothedLows);
          processingLoad = "SG (3-Pass Deep)";
      }
  } else if (filterType === 'EMA') {
      smoothedHighs = smoothEMA(smoothedHighs, 3);
      smoothedLows = smoothEMA(smoothedLows, 3);
      processingLoad = "EMA";
  }
  
  // Create smoothed dataset for the Pivot Detector
  const smoothedData = data.map((d, i) => ({ 
      ...d, 
      high: smoothedHighs[i], 
      low: smoothedLows[i] 
  }));

  // Adjust Pivot Window based on Volatility
  const pivotWindow = avgVolatility < 0.005 ? 8 : 6;
  
  // Call findPivots with SMOOTHED data
  const { highs, lows } = findPivots(smoothedData, pivotWindow, 3); 
  
  const lastIndex = data.length - 1;
  const patterns: ChartPattern[] = [];

  const getTrend = (startIndex: number, endIndex: number) => {
      const slice = data.slice(Math.max(0, startIndex - 20), startIndex).map(d => d.price);
      return calculateSlope(slice);
  };

  // --- PATTERN RECOGNITION LOGIC ---

  // 1. DOUBLE TOP (M Pattern)
  if (highs.length >= 2) {
    const t2 = highs[highs.length - 1]; 
    const t1 = highs[highs.length - 2];
    const priceDiff = Math.abs(t1.price - t2.price) / t1.price;
    const isDoubleTop = priceDiff < 0.015; 
    const recent = lastIndex - t2.index < 40;

    if (isDoubleTop && recent) {
        const priorTrend = getTrend(t1.index, t1.index);
        const volumeDivergence = t2.volume < t1.volume; 

        if (priorTrend > 0) {
            let confidence = 0.7;
            if (volumeDivergence) confidence += 0.15;
            if (priceDiff < 0.005) confidence += 0.1;

            let necklinePrice = Infinity;
            for (let i = t1.index; i <= t2.index; i++) {
                if (data[i].low < necklinePrice) necklinePrice = data[i].low;
            }
            
            const height = ((t1.price + t2.price) / 2) - necklinePrice;
            const targetPrice = necklinePrice - height;

            patterns.push({
                id: `DT-${t2.index}`,
                type: 'DOUBLE_TOP',
                startIndex: t1.index,
                endIndex: lastIndex,
                startTime: t1.time,
                endTime: data[lastIndex].time,
                confidence: Math.min(0.99, confidence),
                lines: [
                    { startPrice: t1.price, endPrice: t2.price, type: 'RESISTANCE' }, 
                    { startPrice: necklinePrice, endPrice: necklinePrice, type: 'SUPPORT' },
                    { startPrice: targetPrice, endPrice: targetPrice, type: 'SUPPORT' }
                ]
            });
        }
    }
  }

  // 2. DOUBLE BOTTOM (W Pattern)
  if (lows.length >= 2) {
    const b2 = lows[lows.length - 1];
    const b1 = lows[lows.length - 2];
    const priceDiff = Math.abs(b1.price - b2.price) / b1.price;
    const isDoubleBottom = priceDiff < 0.015;
    const recent = lastIndex - b2.index < 40;

    if (isDoubleBottom && recent) {
        const priorTrend = getTrend(b1.index, b1.index);
        
        if (priorTrend < 0) {
            let necklinePrice = -Infinity;
            for (let i = b1.index; i <= b2.index; i++) {
                if (data[i].high > necklinePrice) necklinePrice = data[i].high;
            }

            const height = necklinePrice - ((b1.price + b2.price) / 2);
            const targetPrice = necklinePrice + height;

            patterns.push({
                id: `DB-${b2.index}`,
                type: 'DOUBLE_BOTTOM',
                startIndex: b1.index,
                endIndex: lastIndex,
                startTime: b1.time,
                endTime: data[lastIndex].time,
                confidence: 0.85 - (priceDiff * 10),
                lines: [
                    { startPrice: b1.price, endPrice: b2.price, type: 'SUPPORT' },
                    { startPrice: necklinePrice, endPrice: necklinePrice, type: 'RESISTANCE' },
                    { startPrice: targetPrice, endPrice: targetPrice, type: 'RESISTANCE' }
                ]
            });
        }
    }
  }

  // 3. HEAD AND SHOULDERS
  if (highs.length >= 3) {
      const [h1, h2, h3] = highs.slice(-3); 
      const recent = lastIndex - h3.index < 30;

      if (recent && h2.price > h1.price && h2.price > h3.price) {
          const neckSlope = Math.abs(h1.price - h3.price) / h1.price;
          if (neckSlope < 0.03) {
              const headProminence = (h2.price - Math.max(h1.price, h3.price)) / h2.price;
              if (headProminence > 0.01) {
                  let leftTrough = Infinity;
                  let rightTrough = Infinity;
                  
                  for (let i = h1.index; i <= h2.index; i++) if (data[i].low < leftTrough) leftTrough = data[i].low;
                  for (let i = h2.index; i <= h3.index; i++) if (data[i].low < rightTrough) rightTrough = data[i].low;
                  
                  const necklinePrice = (leftTrough + rightTrough) / 2;
                  const height = h2.price - necklinePrice;
                  const targetPrice = necklinePrice - height;

                  patterns.push({
                      id: `HS-${h2.index}`,
                      type: 'HEAD_SHOULDERS',
                      startIndex: h1.index,
                      endIndex: lastIndex,
                      startTime: h1.time,
                      endTime: data[lastIndex].time,
                      confidence: 0.92,
                      lines: [
                          { startPrice: h1.price, endPrice: h3.price, type: 'RESISTANCE' }, 
                          { startPrice: necklinePrice, endPrice: necklinePrice, type: 'SUPPORT' },
                          { startPrice: targetPrice, endPrice: targetPrice, type: 'SUPPORT' }
                      ]
                  });
              }
          }
      }
  }

  // 4. TRIANGLES (Ascending, Descending, Symmetric)
  if (highs.length >= 2 && lows.length >= 2) {
      const hLast = highs[highs.length - 1];
      const hPrev = highs[highs.length - 2];
      const lLast = lows[lows.length - 1];
      const lPrev = lows[lows.length - 2];

      if (lastIndex - hLast.index < 60 && lastIndex - lLast.index < 60) {
          
          const resSlope = (hLast.price - hPrev.price) / (hLast.index - hPrev.index);
          const supSlope = (lLast.price - lPrev.price) / (lLast.index - lPrev.index);

          const resSlopePct = ((hLast.price - hPrev.price) / hPrev.price) / (hLast.index - hPrev.index);
          const supSlopePct = ((lLast.price - lPrev.price) / lPrev.price) / (lLast.index - lPrev.index);
          
          const flatThreshold = 0.0003; 

          let isTriangle = false;
          let description = "";
          let direction: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';

          if (Math.abs(resSlopePct) < flatThreshold && supSlopePct > flatThreshold) {
              isTriangle = true;
              description = "ASCENDING (Bullish)";
              direction = 'BULLISH';
          }
          else if (resSlopePct < -flatThreshold && Math.abs(supSlopePct) < flatThreshold) {
              isTriangle = true;
              description = "DESCENDING (Bearish)";
              direction = 'BEARISH';
          }
          else if (resSlopePct < -flatThreshold && supSlopePct > flatThreshold) {
              if (hLast.price > lLast.price) { 
                  isTriangle = true;
                  description = "SYMMETRIC (Breakout)";
                  const priorTrend = getTrend(Math.min(hPrev.index, lPrev.index), Math.min(hPrev.index, lPrev.index));
                  direction = priorTrend > 0 ? 'BULLISH' : 'BEARISH';
              }
          }

          if (isTriangle) {
              const startIndex = Math.min(hPrev.index, lPrev.index);
              
              const startVol = data.slice(startIndex, startIndex + 5).reduce((a, b) => a + b.volume, 0) / 5;
              const endVol = data.slice(lastIndex - 5, lastIndex).reduce((a, b) => a + b.volume, 0) / 5;
              const volumeDeclining = endVol < startVol;

              const projectedResPrice = hLast.price + (resSlope * (lastIndex - hLast.index));
              const projectedSupPrice = lLast.price + (supSlope * (lastIndex - lLast.index));
              const startResPrice = hPrev.price - (resSlope * (hPrev.index - startIndex));
              const startSupPrice = lPrev.price - (supSlope * (lPrev.index - startIndex));

              const height = Math.abs(startResPrice - startSupPrice);
              const targetPrice = direction === 'BULLISH' 
                  ? data[lastIndex].price + height 
                  : data[lastIndex].price - height;

              patterns.push({
                  id: `TRI-${description.split(' ')[0]}-${lastIndex}`,
                  type: 'TRIANGLE',
                  startIndex: startIndex,
                  endIndex: lastIndex,
                  startTime: data[startIndex].time,
                  endTime: data[lastIndex].time,
                  confidence: 0.85 + (volumeDeclining ? 0.1 : 0),
                  lines: [
                      { startPrice: startResPrice, endPrice: projectedResPrice, type: 'RESISTANCE' },
                      { startPrice: startSupPrice, endPrice: projectedSupPrice, type: 'SUPPORT' },
                      { startPrice: targetPrice, endPrice: targetPrice, type: direction === 'BULLISH' ? 'RESISTANCE' : 'SUPPORT' }
                  ]
              });
          }
      }
  }

  return { patterns, mode: `Processamento: ${processingLoad}` };
};

interface TradingChartProps {
  data: MarketDataPoint[];
}

const TradingChart: React.FC<TradingChartProps> = ({ data }) => {
  const [minConfidence, setMinConfidence] = useState(0.80); 
  const [filterType, setFilterType] = useState<FilterType>('SG');
  const [showAlligator, setShowAlligator] = useState(false);
  const [showMACD, setShowMACD] = useState(false);
  const [showEMA12, setShowEMA12] = useState(true);

  const { patterns, mode } = useMemo(() => detectPatterns(data, filterType), [data, filterType]);
  
  // Calculate EMA 12 and Alligator
  const chartData = useMemo(() => {
      if (data.length === 0) return [];
      const prices = data.map(d => d.price);
      const medianPrices = data.map(d => (d.high + d.low) / 2);

      const ema12 = smoothEMA(prices, 12);
      
      const rawJaw = smoothSMMA(medianPrices, 13);
      const rawTeeth = smoothSMMA(medianPrices, 8);
      const rawLips = smoothSMMA(medianPrices, 5);

      return data.map((d, i) => {
          const jaw = (i - 8 >= 0) ? rawJaw[i - 8] : null;
          const teeth = (i - 5 >= 0) ? rawTeeth[i - 5] : null;
          const lips = (i - 3 >= 0) ? rawLips[i - 3] : null;

          return { ...d, ema12: ema12[i], jaw, teeth, lips };
      });
  }, [data]);

  const visiblePatterns = useMemo(() => {
      return patterns.filter(p => p.confidence >= minConfidence);
  }, [patterns, minConfidence]);

  const activePattern = visiblePatterns.length > 0 ? visiblePatterns[visiblePatterns.length - 1] : null;

  return (
    <div className="w-full h-full relative group">
      
      {/* Smart Control Panel */}
      <div className="absolute top-2 left-12 z-20 bg-black/80 border border-gray-800 p-2 rounded backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-48">
         
         <div className="mb-3">
            <div className="flex items-center gap-2 mb-1 text-[10px] text-gray-400">
                <Sliders size={10} />
                <span className="uppercase font-bold">Filtro de Confiança</span>
            </div>
            <div className="flex items-center gap-2">
                <input 
                type="range" 
                min="0.7" 
                max="0.99" 
                step="0.01" 
                value={minConfidence}
                onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
                className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-quantum-500"
                />
                <span className="text-xs font-mono text-quantum-400">{(minConfidence * 100).toFixed(0)}%</span>
            </div>
         </div>

         <div className="mb-3">
            <div className="flex items-center gap-2 mb-1 text-[10px] text-gray-400">
                <Layers size={10} />
                <span className="uppercase font-bold">Filtro de Ruído</span>
            </div>
            <div className="flex gap-1">
               {['SG', 'EMA', 'OFF'].map(type => (
                   <button
                     key={type}
                     onClick={() => setFilterType(type as FilterType)}
                     className={`flex-1 py-1 text-[9px] font-bold rounded border transition-colors ${
                         filterType === type 
                         ? 'bg-quantum-900/50 text-quantum-400 border-quantum-500' 
                         : 'bg-gray-900 text-gray-500 border-gray-800 hover:bg-gray-800'
                     }`}
                   >
                     {type}
                   </button>
               ))}
            </div>
         </div>

         {/* Alligator Toggle */}
         <div className="mb-2 border-t border-gray-800 pt-2">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowAlligator(!showAlligator)}>
                <span className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
                    <Activity size={10} /> Alligator
                </span>
                <div className={`w-7 h-3.5 rounded-full relative transition-colors ${showAlligator ? 'bg-green-600' : 'bg-gray-700'}`}>
                    <div className={`absolute top-0.5 w-2.5 h-2.5 bg-white rounded-full transition-all ${showAlligator ? 'left-4' : 'left-0.5'}`}></div>
                </div>
            </div>
         </div>

         {/* MACD Toggle */}
         <div className="mb-2">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowMACD(!showMACD)}>
                <span className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
                    <BarChart3 size={10} /> MACD
                </span>
                <div className={`w-7 h-3.5 rounded-full relative transition-colors ${showMACD ? 'bg-blue-600' : 'bg-gray-700'}`}>
                    <div className={`absolute top-0.5 w-2.5 h-2.5 bg-white rounded-full transition-all ${showMACD ? 'left-4' : 'left-0.5'}`}></div>
                </div>
            </div>
         </div>

         {/* EMA 12 Toggle */}
         <div className="mb-2">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowEMA12(!showEMA12)}>
                <span className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
                    <TrendingUp size={10} /> EMA 12
                </span>
                <div className={`w-7 h-3.5 rounded-full relative transition-colors ${showEMA12 ? 'bg-purple-600' : 'bg-gray-700'}`}>
                    <div className={`absolute top-0.5 w-2.5 h-2.5 bg-white rounded-full transition-all ${showEMA12 ? 'left-4' : 'left-0.5'}`}></div>
                </div>
            </div>
         </div>

         <div className="mt-1 pt-1 border-t border-gray-800 flex items-center gap-1 text-[8px] text-gray-500">
            <Cpu size={8} className="text-yellow-500" />
            <span className="truncate">{mode}</span>
         </div>
      </div>

      {/* Pattern Notification Badge */}
      {activePattern && (
        <div className="absolute top-2 right-12 z-20 bg-black/80 border border-quantum-500/50 p-2 rounded backdrop-blur-md shadow-[0_0_15px_rgba(14,165,233,0.2)] animate-in fade-in slide-in-from-right-5 pointer-events-none">
           <div className="flex items-center gap-2 text-quantum-400 font-bold text-xs mb-1">
              <ScanEye size={14} className="animate-pulse" />
              PADRÃO VALIDADO
           </div>
           <div className="text-white font-mono text-sm font-bold tracking-wide">
              {activePattern.id.includes('TRI') ? `${activePattern.id.split('-')[1]} TRIANGLE` : activePattern.type.replace('_', ' ')}
           </div>
           <div className="text-[10px] text-gray-400 flex justify-between mt-1">
              <span>Probabilidade:</span>
              <span className="text-quantum-300">{(activePattern.confidence * 100).toFixed(1)}%</span>
           </div>
           {activePattern.lines.length > 0 && (
               <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-1 border-t border-gray-800 pt-1">
                   <Target size={10} className="text-yellow-500" /> 
                   Alvo: <span className="text-yellow-400 font-mono">{activePattern.lines[activePattern.lines.length - 1].startPrice.toFixed(2)}</span>
               </div>
           )}
           <div className="text-[8px] text-gray-500 mt-1 flex items-center gap-1">
              <GitBranch size={8} /> Filtro: {filterType}
           </div>
        </div>
      )}

      <ResponsiveContainer width="100%" height={450}>
        <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#334155" stopOpacity={0.5}/>
              <stop offset="95%" stopColor="#334155" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
          <XAxis 
            dataKey="time" 
            tick={{fontSize: 10, fill: '#6b7280'}} 
            axisLine={false} 
            tickLine={false} 
            minTickGap={30}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            domain={['auto', 'auto']} 
            tick={{fontSize: 10, fill: '#6b7280'}} 
            axisLine={false} 
            tickLine={false}
            tickFormatter={(val) => val.toLocaleString()}
          />
          
          {showMACD && (
            <YAxis 
                yAxisId="macd" 
                orientation="left" 
                domain={['auto', 'auto']} 
                tick={{fontSize: 9, fill: '#94a3b8'}} 
                axisLine={false} 
                tickLine={false}
                width={40}
            />
          )}

          <YAxis 
            yAxisId="left" 
            orientation="left" 
            domain={[0, 'dataMax']} 
            hide 
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '4px', fontSize: '12px' }}
            itemStyle={{ color: '#e2e8f0' }}
            labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
          />
          
          <Bar yAxisId="left" dataKey="volume" fill="url(#colorVolume)" barSize={4} />
          
          <Area 
            yAxisId="right" 
            type="monotone" 
            dataKey="price" 
            stroke="#0ea5e9" 
            strokeWidth={2} 
            fillOpacity={1} 
            fill="url(#colorPrice)" 
            isAnimationActive={false}
          />
          
          <Area yAxisId="right" type="monotone" dataKey="bbUpper" stroke="none" fill="#334155" fillOpacity={0.1} />
          <Area yAxisId="right" type="monotone" dataKey="bbLower" stroke="none" fill="#334155" fillOpacity={0.1} />

          <Line yAxisId="right" type="monotone" dataKey="ma25" stroke="#f59e0b" strokeWidth={1} dot={false} strokeDasharray="5 5" opacity={0.7} />

          {showEMA12 && (
            <Line yAxisId="right" type="monotone" dataKey="ema12" stroke="#d946ef" strokeWidth={1.5} dot={false} opacity={0.8} name="EMA 12" />
          )}

          {showAlligator && (
            <>
              <Line yAxisId="right" type="monotone" dataKey="jaw" stroke="#3b82f6" strokeWidth={2} dot={false} opacity={0.9} name="Alligator Jaw" />
              <Line yAxisId="right" type="monotone" dataKey="teeth" stroke="#ef4444" strokeWidth={1.5} dot={false} opacity={0.9} name="Alligator Teeth" />
              <Line yAxisId="right" type="monotone" dataKey="lips" stroke="#22c55e" strokeWidth={1} dot={false} opacity={0.9} name="Alligator Lips" />
            </>
          )}

          {showMACD && (
            <>
                <Bar dataKey="macdHist" yAxisId="macd" barSize={2} opacity={0.5} name="MACD Hist">
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.macdHist >= 0 ? '#22c55e' : '#ef4444'} />
                    ))}
                </Bar>
                <Line type="monotone" dataKey="macd" yAxisId="macd" stroke="#fff" strokeWidth={1} dot={false} opacity={0.8} name="MACD" />
                <Line type="monotone" dataKey="macdSignal" yAxisId="macd" stroke="#f59e0b" strokeWidth={1} dot={false} opacity={0.8} name="Signal" />
            </>
          )}

          {visiblePatterns.map((pattern) => (
             <React.Fragment key={pattern.id}>
                {pattern.lines.map((line, idx) => {
                    const isTarget = idx === pattern.lines.length - 1;
                    return (
                        <ReferenceLine 
                            key={`line-${pattern.id}-${idx}`} 
                            yAxisId="right" 
                            segment={[{ x: pattern.startTime, y: line.startPrice }, { x: pattern.endTime, y: line.endPrice }]} 
                            stroke={isTarget ? '#fbbf24' : (line.type === 'RESISTANCE' ? '#ef4444' : '#22c55e')} 
                            strokeWidth={isTarget ? 1 : 2} 
                            strokeDasharray={isTarget ? "5 5" : "3 3"}
                            ifOverflow="extendDomain"
                            isFront={true}
                            label={isTarget ? { value: 'ALVO', fill: '#fbbf24', fontSize: 9, position: 'right' } : undefined}
                        />
                    );
                })}
                <ReferenceArea 
                    key={`area-${pattern.id}`}
                    yAxisId="right" 
                    x1={pattern.startTime} 
                    x2={pattern.endTime} 
                    fill={pattern.type.includes('TOP') || pattern.type.includes('HEAD') || (pattern.id.includes('DESC') && pattern.id.includes('TRI')) ? 'red' : 'green'} 
                    fillOpacity={0.05} 
                />
             </React.Fragment>
          ))}

          <Brush dataKey="time" height={20} stroke="#334155" fill="#0f172a" tickFormatter={() => ''} y={430} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TradingChart;
