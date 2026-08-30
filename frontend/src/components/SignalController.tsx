import React from 'react';
import { Radio } from 'lucide-react';

interface SignalControllerProps {
  signal: any;
  onOverride: (signalId: string, newState: string) => void;
}

export default function SignalController({ signal, onOverride }: SignalControllerProps) {
  if (!signal) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-neutral-500 gap-3">
        <Radio size={32} className="opacity-20" />
        <p className="text-sm">Select a signal on the map to control it.</p>
      </div>
    );
  }

  const getButtonClass = (state: string, isCurrent: boolean) => {
    const base = "px-4 py-3 rounded-lg border font-medium transition-all text-sm flex items-center justify-between";
    if (!isCurrent) {
      return `${base} border-neutral-700 bg-neutral-800 text-neutral-300 hover:border-neutral-500 hover:bg-neutral-700`;
    }
    
    switch (state.toLowerCase()) {
      case 'proceed': return `${base} border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]`;
      case 'danger': return `${base} border-red-500 bg-red-500/10 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.15)]`;
      case 'warning': return `${base} border-amber-500 bg-amber-500/10 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]`;
      default: return `${base} border-blue-500 bg-blue-500/10 text-blue-400`;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-neutral-100 flex items-center gap-2">
          {signal.name}
        </h2>
        <div className="text-xs text-neutral-500 font-mono mt-1">ID: {signal.id} | Pos: ({signal.x}, {signal.y})</div>
      </div>

      <div className="bg-neutral-900/50 p-4 rounded-xl border border-neutral-800">
        <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">Current State</h3>
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${
            signal.state === 'Proceed' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' :
            signal.state === 'Danger' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' :
            signal.state === 'Warning' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]' : 'bg-neutral-500'
          }`} />
          <span className="font-medium text-neutral-200">{signal.state}</span>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">Manual Override</h3>
        <div className="space-y-2">
          {signal.supportedStates.map((state: string) => (
            <button
              key={state}
              onClick={() => onOverride(signal.id, state)}
              disabled={signal.state === state}
              className={`w-full ${getButtonClass(state, signal.state === state)} ${signal.state === state ? 'opacity-100 cursor-default' : ''}`}
            >
              {state}
              {signal.state === state && <span className="text-[10px] uppercase bg-current/10 px-2 py-0.5 rounded-full">Active</span>}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-neutral-500 mt-3 text-center">
          Overriding a signal will force it to the selected state in the simulation.
        </p>
      </div>
    </div>
  );
}
