"use client";

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import Map from '@/components/Map';
import SignalController from '@/components/SignalController';
import RoutePlanner from '@/components/RoutePlanner';
import { Train, Activity, Route } from 'lucide-react';

export default function Dashboard() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<any>({ signals: [], trains: [], mapInfo: {} });
  const [selectedSignal, setSelectedSignal] = useState<any>(null);
  const [selectedTrain, setSelectedTrain] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'signals' | 'routing'>('signals');

  useEffect(() => {
    // Connect to backend server
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    newSocket.on('gameStateUpdate', (state) => {
      setGameState(state);
      // Update selected signal if it exists in the new state
      setSelectedSignal((current: any) => {
        if (!current) return null;
        return state.signals.find((s: any) => s.id === current.id) || null;
      });
      // Update selected train if it exists in the new state
      setSelectedTrain((current: any) => {
        if (!current) return null;
        return state.trains.find((t: any) => t.id === current.id) || null;
      });
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const handleOverrideSignal = async (signalId: string, newState: string) => {
    try {
      const res = await fetch(`http://localhost:3001/api/signals/${signalId}/override`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newState })
      });
      if (!res.ok) {
        const error = await res.json();
        alert(error.error || 'Failed to override signal');
      }
    } catch (e) {
      console.error(e);
      alert('Network error while overriding signal');
    }
  };

  const handleSetRoute = async (trainId: string, targetSignalId: string) => {
    try {
      const res = await fetch(`http://localhost:3001/api/trains/${trainId}/route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetSignalId, pathSegments: [] })
      });
      if (!res.ok) {
        const error = await res.json();
        alert(error.error || 'Failed to set route');
      } else {
        alert('Route configured successfully');
      }
    } catch (e) {
      console.error(e);
      alert('Network error while setting route');
    }
  };

  return (
    <div className="flex h-screen bg-neutral-950 text-white font-sans overflow-hidden">
      {/* Sidebar Panel */}
      <div className="w-80 bg-neutral-900 border-r border-neutral-800 flex flex-col z-10 shadow-2xl">
        <div className="p-6 border-b border-neutral-800">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent flex items-center gap-2">
            <Activity className="text-blue-400" /> Dispatcher OS
          </h1>
          <p className="text-neutral-400 text-sm mt-1">TSW6 External Control</p>
          <div className="mt-4 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${socket?.connected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-red-500'}`} />
            <span className="text-xs font-medium text-neutral-300">
              {socket?.connected ? 'Connected to Backend' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-800">
          <button
            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'signals' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'}`}
            onClick={() => setActiveTab('signals')}
          >
            <div className="flex items-center justify-center gap-2">
              <Activity size={16} /> Signals
            </div>
          </button>
          <button
            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'routing' ? 'border-b-2 border-indigo-500 text-indigo-400' : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'}`}
            onClick={() => setActiveTab('routing')}
          >
            <div className="flex items-center justify-center gap-2">
              <Route size={16} /> Routing
            </div>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {activeTab === 'signals' && (
            <SignalController 
              signal={selectedSignal} 
              onOverride={handleOverrideSignal} 
            />
          )}
          {activeTab === 'routing' && (
            <RoutePlanner 
              trains={gameState.trains}
              signals={gameState.signals}
              selectedTrain={selectedTrain}
              onSelectTrain={setSelectedTrain}
              onSetRoute={handleSetRoute}
            />
          )}
        </div>
      </div>

      {/* Main Map View */}
      <div className="flex-1 relative bg-[#0a0a0a] overflow-hidden">
        <Map 
          gameState={gameState} 
          selectedSignal={selectedSignal}
          onSelectSignal={setSelectedSignal}
          selectedTrain={selectedTrain}
          onSelectTrain={setSelectedTrain}
        />
        
        {/* Map Overlay Info */}
        <div className="absolute top-6 right-6 bg-neutral-900/80 backdrop-blur-md border border-neutral-700/50 p-4 rounded-xl shadow-xl pointer-events-none">
          <h2 className="text-sm font-semibold text-neutral-300 mb-2">Network Status</h2>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center gap-4">
              <span className="text-neutral-400">Active Trains</span>
              <span className="font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">{gameState.trains.length}</span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <span className="text-neutral-400">Monitored Signals</span>
              <span className="font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">{gameState.signals.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
