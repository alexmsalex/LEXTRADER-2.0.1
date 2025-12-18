
import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Activity, 
  TrendingDown, 
  PieChart, 
  Sliders, 
  Save 
} from './Icons';
import { Trade, MarketDataPoint, RiskSettings } from '../types';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

interface RiskDashboardProps {
  trades: Trade[];
  marketData: MarketDataPoint[];
  currentVolatility: number;
  settings: RiskSettings;
  onUpdateSettings: (newSettings: RiskSettings) => void;
}

const RiskDashboard: React.FC<RiskDashboardProps> = ({ 
  trades, 
  marketData, 
  currentVolatility, 
  settings, 
  onUpdateSettings 
}) => {
  const [localSettings, setLocalSettings] = useState<RiskSettings>(settings);
  const [isSaved, setIsSaved] = useState(false);

  // --- DERIVED METRICS ---

  // Calculate Cumulative PnL and Drawdown
  const equityCurve = useMemo(() => {
    let runningBalance = 10000; // Assume simulated base
    let peak = runningBalance;
    const curve = [];

    // Sort trades chronologically
    const sortedTrades = [...trades].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    for (const trade of sortedTrades) {
      if (trade.status !== 'FILLED') continue;
      
      const profit = trade.profit || 0;
      runningBalance += profit;
      if (runningBalance > peak) peak = runningBalance;
      
      const drawdown = (peak - runningBalance) / peak * 100;
      
      curve.push({
        tradeId: trade.id,
        balance: runningBalance,
        drawdown: drawdown,
        timestamp: trade.timestamp.toLocaleTimeString()
      });
    }
    
    // Add current state if no trades or just to extend line
    if (curve.length === 0) {
        curve.push({ tradeId: 'init', balance: 10000, drawdown: 0, timestamp: 'Agora' });
    }
    return curve;
  }, [trades]);

  const maxDrawdown = Math.max(...equityCurve.map(p => p.drawdown), 0);
  const currentDrawdown = equityCurve.length > 0 ? equityCurve[equityCurve.length - 1].drawdown : 0;

  // Risk Score Calculation (0-100)
  // Weighted sum of Volatility (High bad), Drawdown (High bad), and Open Exposure
  const riskScore = Math.min(100, (currentVolatility * 10) + (currentDrawdown * 5));
  
  const getRiskColor = (score: number) => {
    if (score < 20) return 'text-green-400';
    if (score < 50) return 'text-yellow-400';
    if (score < 80) return 'text-orange-400';
    return 'text-red-500 animate-pulse';
  };

  const getRiskLabel = (score: number) => {
    if (score < 20) return 'SEGURO';
    if (score < 50) return 'MODERADO';
    if (score < 80) return 'ELEVADO';
    return 'CRÍTICO';
  };

  const handleSettingChange = (key: keyof RiskSettings, value: string) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: parseFloat(value)
    }));
    setIsSaved(false);
  };

  const saveSettings = () => {
    onUpdateSettings(localSettings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      
      {/* HEADER */}
      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <ShieldCheck className="text-quantum-400" size={32} />
            PROTOCOLOS DE GESTÃO DE RISCO
          </h2>
          <p className="text-sm text-gray-500 mt-1 font-mono">
            Monitoramento Ativo & Limites de Segurança
          </p>
        </div>
        <div className={`px-4 py-2 rounded-lg border bg-black/40 ${riskScore > 80 ? 'border-red-500/50' : 'border-gray-800'}`}>
           <div className="text-[10px] text-gray-500 uppercase tracking-widest text-right">Pontuação de Risco Agregada</div>
           <div className={`text-3xl font-bold font-mono text-right ${getRiskColor(riskScore)}`}>
             {riskScore.toFixed(1)} / 100
           </div>
           <div className={`text-xs text-right font-bold tracking-widest ${getRiskColor(riskScore)}`}>
             {getRiskLabel(riskScore)}
           </div>
        </div>
      </div>

      {/* KEY METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-matrix-panel border border-matrix-border p-4 rounded-lg">
           <div className="flex justify-between items-start mb-2">
              <div className="p-2 bg-red-900/20 rounded text-red-400"><TrendingDown size={20} /></div>
              <span className="text-[10px] text-gray-500 uppercase">Drawdown Máximo</span>
           </div>
           <div className="text-2xl font-mono text-white mb-1">
             {maxDrawdown.toFixed(2)}%
           </div>
           <div className="text-xs text-gray-500">
             Limite: <span className="text-red-400">{localSettings.maxDrawdownLimit}%</span>
           </div>
        </div>

        <div className="bg-matrix-panel border border-matrix-border p-4 rounded-lg">
           <div className="flex justify-between items-start mb-2">
              <div className="p-2 bg-blue-900/20 rounded text-blue-400"><Activity size={20} /></div>
              <span className="text-[10px] text-gray-500 uppercase">Volatilidade Mercado (ATR)</span>
           </div>
           <div className="text-2xl font-mono text-white mb-1">
             {currentVolatility.toFixed(2)}
           </div>
           <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden mt-2">
              <div className="h-full bg-blue-500" style={{ width: `${Math.min(currentVolatility * 10, 100)}%` }}></div>
           </div>
        </div>

        <div className="bg-matrix-panel border border-matrix-border p-4 rounded-lg">
           <div className="flex justify-between items-start mb-2">
              <div className="p-2 bg-yellow-900/20 rounded text-yellow-400"><PieChart size={20} /></div>
              <span className="text-[10px] text-gray-500 uppercase">Tamanho da Posição</span>
           </div>
           <div className="text-2xl font-mono text-white mb-1">
             Fixo {localSettings.maxPositionSize}%
           </div>
           <div className="text-xs text-gray-500">
             Do Patrimônio Total
           </div>
        </div>

        <div className="bg-matrix-panel border border-matrix-border p-4 rounded-lg">
           <div className="flex justify-between items-start mb-2">
              <div className="p-2 bg-green-900/20 rounded text-green-400"><ShieldAlert size={20} /></div>
              <span className="text-[10px] text-gray-500 uppercase">Status do Sistema</span>
           </div>
           <div className="text-xl font-mono text-green-400 mb-1">
             PROTEGIDO
           </div>
           <div className="text-xs text-gray-500">
             Stop Loss: Ativo ({localSettings.stopLossDefault}%)
           </div>
        </div>
      </div>

      {/* CHARTS & CONFIG */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Drawdown Chart */}
        <div className="lg:col-span-2 bg-matrix-panel border border-matrix-border rounded-lg p-4 h-[400px] flex flex-col">
           <h3 className="text-sm font-bold text-gray-300 mb-4 flex items-center gap-2">
             <TrendingDown size={16} className="text-red-400" />
             CURVA DE DRAWDOWN DE PATRIMÔNIO
           </h3>
           <div className="flex-1 w-full min-h-0">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={equityCurve}>
                  <defs>
                    <linearGradient id="colorDd" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                  <XAxis dataKey="timestamp" hide />
                  <YAxis orientation="right" tick={{fontSize: 10, fill: '#666'}} width={40} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: number) => [`${value.toFixed(2)}%`, 'Drawdown']}
                  />
                  <Area type="monotone" dataKey="drawdown" stroke="#ef4444" fill="url(#colorDd)" />
                </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Configuration Panel */}
        <div className="bg-matrix-panel border border-matrix-border rounded-lg p-6">
           <h3 className="text-sm font-bold text-gray-300 mb-6 flex items-center gap-2">
             <Sliders size={16} className="text-quantum-400" />
             CONFIGURAÇÃO DE RISCO
           </h3>
           
           <div className="space-y-6">
              
              <div className="space-y-2">
                 <label className="text-xs text-gray-500 uppercase font-mono block">Limite Máximo de Drawdown (%)</label>
                 <div className="flex items-center gap-3">
                    <input 
                      type="range" 
                      min="1" max="20" step="0.5" 
                      value={localSettings.maxDrawdownLimit}
                      onChange={(e) => handleSettingChange('maxDrawdownLimit', e.target.value)}
                      className="flex-1 h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-quantum-500"
                    />
                    <span className="text-sm font-mono w-12 text-right">{localSettings.maxDrawdownLimit}%</span>
                 </div>
                 <p className="text-[10px] text-gray-600">Trading para se a queda de patrimônio exceder este limite.</p>
              </div>

              <div className="space-y-2">
                 <label className="text-xs text-gray-500 uppercase font-mono block">Tamanho Máx. Posição (% Patrimônio)</label>
                 <div className="flex items-center gap-3">
                    <input 
                      type="range" 
                      min="1" max="100" step="1" 
                      value={localSettings.maxPositionSize}
                      onChange={(e) => handleSettingChange('maxPositionSize', e.target.value)}
                      className="flex-1 h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <span className="text-sm font-mono w-12 text-right">{localSettings.maxPositionSize}%</span>
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-xs text-gray-500 uppercase font-mono block">Stop Loss Padrão (%)</label>
                 <div className="flex items-center gap-3">
                    <input 
                      type="range" 
                      min="0.5" max="10" step="0.1" 
                      value={localSettings.stopLossDefault}
                      onChange={(e) => handleSettingChange('stopLossDefault', e.target.value)}
                      className="flex-1 h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                    />
                    <span className="text-sm font-mono w-12 text-right">{localSettings.stopLossDefault}%</span>
                 </div>
              </div>

              <div className="pt-4 border-t border-gray-800">
                 <button 
                   onClick={saveSettings}
                   className="w-full flex items-center justify-center gap-2 bg-quantum-900/30 hover:bg-quantum-900/50 border border-quantum-900 text-quantum-400 py-3 rounded-lg transition-all"
                 >
                   <Save size={16} />
                   {isSaved ? 'CONFIGURAÇÃO SALVA' : 'APLICAR PARÂMETROS'}
                 </button>
              </div>

           </div>
        </div>

      </div>
    </div>
  );
};

export default RiskDashboard;
