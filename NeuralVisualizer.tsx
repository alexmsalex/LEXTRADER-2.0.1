
import React, { useEffect, useState } from 'react';

const NeuralVisualizer: React.FC = () => {
  const [nodes, setNodes] = useState<{x: number, y: number, active: boolean}[]>([]);

  useEffect(() => {
    // Generate random nodes for the visualization
    const newNodes = Array.from({ length: 20 }).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      active: Math.random() > 0.5
    }));
    setNodes(newNodes);

    const interval = setInterval(() => {
      setNodes(prev => prev.map(n => ({
        ...n,
        active: Math.random() > 0.3
      })));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-48 bg-matrix-panel border border-matrix-border rounded-lg overflow-hidden mb-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-quantum-900/20 via-matrix-dark to-matrix-black"></div>
      
      {/* Grid Lines */}
      <div className="absolute inset-0" style={{ 
        backgroundImage: 'linear-gradient(rgba(14, 165, 233, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(14, 165, 233, 0.1) 1px, transparent 1px)', 
        backgroundSize: '20px 20px' 
      }}></div>

      {/* Nodes and Connections */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {nodes.map((node, i) => (
          <React.Fragment key={i}>
            {/* Connections to nearest neighbors would go here, simplified to random lines for effect */}
             {i < nodes.length - 1 && (
               <line 
                 x1={`${node.x}%`} 
                 y1={`${node.y}%`} 
                 x2={`${nodes[i+1].x}%`} 
                 y2={`${nodes[i+1].y}%`} 
                 stroke="#0ea5e9" 
                 strokeWidth="0.5" 
                 opacity="0.3"
               />
             )}
            <circle 
              cx={`${node.x}%`} 
              cy={`${node.y}%`} 
              r={node.active ? "3" : "2"} 
              fill={node.active ? "#38bdf8" : "#0c4a6e"}
              className={`transition-all duration-1000 ${node.active ? 'opacity-100' : 'opacity-40'}`}
            />
             {node.active && (
                <circle cx={`${node.x}%`} cy={`${node.y}%`} r="6" fill="none" stroke="#38bdf8" strokeWidth="1" className="animate-ping opacity-20" />
             )}
          </React.Fragment>
        ))}
      </svg>
      
      <div className="absolute bottom-2 left-2 text-xs text-quantum-400 font-mono">
        <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
        COERÊNCIA QUÂNTICA: 98.4%
      </div>
      <div className="absolute top-2 right-2 text-[10px] text-gray-500 font-mono uppercase tracking-widest">
        Arquitetura: Híbrida QNN-VQC
      </div>
    </div>
  );
};

export default NeuralVisualizer;
