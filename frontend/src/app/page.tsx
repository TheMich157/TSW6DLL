"use client";

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import MemoryBoard from '@/components/MemoryBoard';
import { Activity } from 'lucide-react';

interface MemoryItem {
  id: string;
  name: string;
  offset: string;
  type: string;
  value: any;
  status: string;
}

export default function Dashboard() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [memoryItems, setMemoryItems] = useState<MemoryItem[]>([]);

  useEffect(() => {
    // Connect to backend server
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    newSocket.on('memoryUpdate', (items: MemoryItem[]) => {
      setMemoryItems(items);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const handleAddTracker = async (name: string, offset: string, type: string) => {
    try {
      const res = await fetch(`http://localhost:3001/api/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, offset, type })
      });
      if (!res.ok) {
        const error = await res.json();
        alert(error.error || 'Failed to add tracker');
      }
    } catch (e) {
      console.error(e);
      alert('Network error while adding tracker');
    }
  };

  const handleRemoveTracker = async (id: string) => {
    try {
      await fetch(`http://localhost:3001/api/track/${id}`, {
        method: 'DELETE',
      });
      setMemoryItems(prev => prev.filter(item => item.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleWriteMemory = async (offset: string, type: string, value: any) => {
    try {
      const res = await fetch(`http://localhost:3001/api/write`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offset, type, value })
      });
      if (!res.ok) {
        const error = await res.json();
        alert(error.error || 'Failed to write memory');
      } else {
        alert('Memory written successfully');
      }
    } catch (e) {
      console.error(e);
      alert('Network error while writing to memory');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-neutral-950 text-white font-sans overflow-hidden">
      {/* Top Header */}
      <div className="bg-neutral-900 border-b border-neutral-800 p-4 flex items-center justify-between z-10 shadow-lg">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent flex items-center gap-2">
          <Activity className="text-blue-400" /> TSW6 Live Memory Tracker
        </h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-neutral-950 px-3 py-1.5 rounded-full border border-neutral-800">
            <div className={`w-2 h-2 rounded-full ${socket?.connected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-red-500'}`} />
            <span className="text-xs font-medium text-neutral-300">
              {socket?.connected ? 'Connected to Backend' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Board View */}
      <div className="flex-1 relative bg-[#0a0a0a] overflow-hidden">
        <MemoryBoard 
          memoryItems={memoryItems}
          onAdd={handleAddTracker}
          onRemove={handleRemoveTracker}
          onWrite={handleWriteMemory}
        />
      </div>
    </div>
  );
}
