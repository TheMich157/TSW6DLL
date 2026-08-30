import React, { useState } from 'react';
import { Train, Route as RouteIcon, MapPin } from 'lucide-react';

interface RoutePlannerProps {
  trains: any[];
  signals: any[];
  selectedTrain: any;
  onSelectTrain: (train: any) => void;
  onSetRoute: (trainId: string, targetSignalId: string) => void;
}

export default function RoutePlanner({ trains, signals, selectedTrain, onSelectTrain, onSetRoute }: RoutePlannerProps) {
  const [targetSignalId, setTargetSignalId] = useState<string>('');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-neutral-100 flex items-center gap-2">
          Route Planner
        </h2>
        <p className="text-xs text-neutral-500 mt-1">Assign paths for active trains</p>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">1. Select Train</label>
        <div className="grid grid-cols-1 gap-2">
          {trains.length === 0 ? (
            <div className="text-sm text-neutral-500 p-3 border border-neutral-800 rounded bg-neutral-900/50">
              No trains active.
            </div>
          ) : (
            trains.map(train => (
              <button
                key={train.id}
                onClick={() => onSelectTrain(train)}
                className={`p-3 rounded-lg border text-left transition-all flex items-center justify-between ${
                  selectedTrain?.id === train.id
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                    : 'border-neutral-700 bg-neutral-800/50 hover:bg-neutral-800 hover:border-neutral-500 text-neutral-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-md ${selectedTrain?.id === train.id ? 'bg-indigo-500/20' : 'bg-neutral-700'}`}>
                    <Train size={16} />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{train.name}</div>
                    <div className="text-[10px] opacity-70">ID: {train.id}</div>
                  </div>
                </div>
                <div className="text-xs font-mono">{train.speed} km/h</div>
              </button>
            ))
          )}
        </div>
      </div>

      {selectedTrain && (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">2. Select Destination Signal</label>
          <select 
            value={targetSignalId}
            onChange={(e) => setTargetSignalId(e.target.value)}
            className="w-full bg-neutral-800 border border-neutral-700 text-neutral-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-3 outline-none"
          >
            <option value="">-- Choose a Target Signal --</option>
            {signals.map(sig => (
              <option key={sig.id} value={sig.id}>
                {sig.name} ({sig.state})
              </option>
            ))}
          </select>

          <button
            onClick={() => onSetRoute(selectedTrain.id, targetSignalId)}
            disabled={!targetSignalId}
            className="w-full mt-4 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed text-white font-medium rounded-lg text-sm px-5 py-3 transition-colors"
          >
            <MapPin size={16} />
            Set Route to Target
          </button>
        </div>
      )}
      
      {!selectedTrain && (
        <div className="h-32 flex flex-col items-center justify-center text-neutral-500 gap-3 border border-dashed border-neutral-800 rounded-xl">
          <RouteIcon size={32} className="opacity-20" />
          <p className="text-sm">Select a train to plan its route.</p>
        </div>
      )}
    </div>
  );
}
