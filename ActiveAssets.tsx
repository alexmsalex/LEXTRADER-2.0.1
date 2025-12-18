
import React, { useMemo } from 'react';
import { Trade } from '../types';
import { Activity, TrendingUp, TrendingDown, Clock, Layers, DollarSign, Zap, Hexagon } from 'lucide-react';

interface ActiveAssetsProps {
  trades: Trade[];
}

const ActiveAssets: React.FC<ActiveAssetsProps> = ({ trades }) => {
  const activeAssets = useMemo(() => {
    const assets = new Map<string, { 
      openOrders: number; 
      positions: number; 
      pnl: number; 
      type: string;
      lastUpdate: Date;
      platform: string;
    }>();

    trades.forEach(t => {
      // Consider OPEN trades as Active Orders
      // Consider recently FILLED trades as Active Positions (simplification for UI)
      const isActive = t.status === 'OPEN' || (t.status === 'FILLED' && Date.now() - new Date(t.timestamp).getTime() < 24 * 60 * 60 * 1000);
      
      if (isActive) {
        if (!assets.has(t.asset)) {
          assets.set(t.asset, { 
              openOrders: 0, 
              positions: 0, 
              pnl: 0, 
              type: t.type, 
              lastUpdate: new Date(t.timestamp),
              platform: t.platform || 'BINANCE'
          });
        }
        
        const data = assets.get(t.asset)!;
        if (t.status === 'OPEN') data.openOrders++;
        if (t.status === 'FILLED') {
            data.positions++;
            data.pnl += t.profit || 0;
        }
        if (new Date(t.timestamp) > data.lastUpdate) {
            data.lastUpdate = new Date(t.timestamp);
            data.type = t.type;
        }
      }
    });

    return Array.from(assets.entries()).map(([symbol, data]) => ({ symbol, ...data }));
  }, [trades]);

  if (activeAssets.length === 0) return null;

  return (
    <div className="bg-matrix-panel border border-matrix-border rounded-lg p-4 mb-6">
      <div className="flex items-center gap-2 mb-3 border-b border-gray-800 pb-2">
        <Layers size={16} className="text-quantum-400" />
        <h3 className="text-sm font-bold text-gray-200">ATIVOS EM OPERAÇÃO</h3>
        <span className="ml-auto text-[10px] bg-quantum-900/30 text-quantum-400 px-2 py-0.5 rounded-full">
            {activeAssets.length} Ativos
        </span>
      </div>
      
      <div className="space-y-2 max-h-[200px] overflow-y-auto scrollbar-thin pr-1">
        {activeAssets.map((asset) => (
          <div key={asset.symbol} className="bg-black/30 border border-gray-800 rounded p-2 flex justify-between items-center hover:border-gray-700 transition-colors">
            <div>
              <div className="flex items-center gap-2">
                {asset.platform === 'CTRADER' 
                    ? <Hexagon size={12} className="text-green-500" title="cTrader" /> 
                    : <Zap size={12} className="text-yellow-500" title="Binance" />
                }
                <span className="text-xs font-bold text-white">{asset.symbol}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${asset.type === 'BUY' ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'}`}>
                    {asset.type}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[9px] text-gray-500 mt-1">
                 {asset.openOrders > 0 && <span className="flex items-center gap-1"><Clock size={8} /> {asset.openOrders} Ordens</span>}
                 {asset.positions > 0 && <span className="flex items-center gap-1 text-gray-400"><Activity size={8} /> {asset.positions} Exec</span>}
              </div>
            </div>
            
            <div className="text-right">
               <div className={`text-xs font-mono font-bold ${asset.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {asset.pnl > 0 ? '+' : ''}{asset.pnl.toFixed(2)}
               </div>
               <div className="text-[8px] text-gray-600 uppercase">PnL Recente</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActiveAssets;
