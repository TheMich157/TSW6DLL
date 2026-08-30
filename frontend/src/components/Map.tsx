import React, { useRef, useEffect } from 'react';
import { Train } from 'lucide-react';

interface MapProps {
  gameState: any;
  selectedSignal: any;
  onSelectSignal: (signal: any) => void;
  selectedTrain: any;
  onSelectTrain: (train: any) => void;
}

const getSignalColor = (state: string) => {
  switch (state.toLowerCase()) {
    case 'proceed': return 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.9)]';
    case 'danger': return 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.9)]';
    case 'warning': return 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.9)]';
    default: return 'bg-neutral-500';
  }
};

export default function Map({ gameState, selectedSignal, onSelectSignal, selectedTrain, onSelectTrain }: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Drawing static track lines just for visualization
  return (
    <div className="w-full h-full relative" ref={containerRef}>
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
      
      {/* Mock Track Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
        <line x1="50" y1="166" x2="800" y2="166" stroke="#fff" strokeWidth="8" strokeDasharray="10 5" />
      </svg>

      {/* Signals Overlay */}
      {gameState.signals.map((sig: any) => (
        <div
          key={sig.id}
          className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group transition-all duration-300 z-20`}
          style={{ left: sig.x, top: sig.y }}
          onClick={() => onSelectSignal(sig)}
        >
          <div className={`w-1 h-6 bg-neutral-600 absolute bottom-4 left-1/2 -translate-x-1/2 rounded-t-sm`} />
          <div className={`w-4 h-5 rounded-sm border-2 transition-all ${selectedSignal?.id === sig.id ? 'border-blue-400 scale-125' : 'border-neutral-700 hover:border-neutral-500'} bg-neutral-900 flex flex-col items-center justify-center gap-0.5 p-0.5`}>
            <div className={`w-2 h-2 rounded-full ${getSignalColor(sig.state)}`} />
          </div>
          
          {/* Tooltip */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-800 text-xs px-2 py-1 rounded shadow-lg pointer-events-none border border-neutral-700">
            {sig.name} ({sig.state})
          </div>
        </div>
      ))}

      {/* Trains Overlay */}
      {gameState.trains.map((train: any) => (
        <div
          key={train.id}
          className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-30 transition-all duration-[2000ms] ease-linear`}
          style={{ left: train.x, top: train.y }}
          onClick={() => onSelectTrain(train)}
        >
          <div className={`
            p-1.5 rounded-lg border-2 shadow-xl backdrop-blur-sm transition-all
            ${selectedTrain?.id === train.id ? 'border-indigo-400 bg-indigo-500/20 scale-110' : 'border-neutral-700 bg-neutral-900/80 hover:border-neutral-500'}
          `}>
            <Train className={`w-6 h-6 ${train.speed > 0 ? 'text-blue-400' : 'text-neutral-400'}`} />
          </div>
          
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-neutral-900/90 backdrop-blur text-xs px-2 py-1 rounded shadow-lg pointer-events-none border border-neutral-800 font-mono flex items-center gap-2">
            <span className="font-semibold text-neutral-200">{train.name}</span>
            <span className={train.speed > 0 ? 'text-emerald-400' : 'text-amber-400'}>{train.speed}km/h</span>
          </div>
        </div>
      ))}
    </div>
  );
}
