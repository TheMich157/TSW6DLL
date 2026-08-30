import React, { useState } from 'react';
import { Plus, Trash2, Send } from 'lucide-react';

interface MemoryItem {
  id: string;
  name: string;
  offset: string;
  type: string;
  value: any;
  status: string;
}

interface MemoryBoardProps {
  memoryItems: MemoryItem[];
  onAdd: (name: string, offset: string, type: string) => void;
  onRemove: (id: string) => void;
  onWrite: (offset: string, type: string, value: any) => void;
}

export default function MemoryBoard({ memoryItems, onAdd, onRemove, onWrite }: MemoryBoardProps) {
  const [newName, setNewName] = useState('');
  const [newOffset, setNewOffset] = useState('');
  const [newType, setNewType] = useState('int');
  const [writeValue, setWriteValue] = useState<Record<string, string>>({});

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName && newOffset) {
      onAdd(newName, newOffset, newType);
      setNewName('');
      setNewOffset('');
    }
  };

  const handleWrite = (offset: string, type: string) => {
    if (writeValue[offset]) {
      const val = type === 'float' ? parseFloat(writeValue[offset]) : parseInt(writeValue[offset], 10);
      onWrite(offset, type, val);
      setWriteValue(prev => ({ ...prev, [offset]: '' }));
    }
  };

  return (
    <div className="w-full h-full p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar bg-[#0a0a0a]">
      {/* Header Form */}
      <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl shadow-xl">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-indigo-400">
          <Plus size={20} /> Add Memory Offset
        </h2>
        <form onSubmit={handleAdd} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-xs font-medium text-neutral-400 mb-1">Display Name</label>
            <input 
              type="text" 
              value={newName} 
              onChange={e => setNewName(e.target.value)} 
              placeholder="e.g. Main Signal State"
              className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-neutral-400 mb-1">Hex Offset</label>
            <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded px-2 focus-within:border-indigo-500">
              <span className="text-neutral-500 font-mono text-sm">0x</span>
              <input 
                type="text" 
                value={newOffset} 
                onChange={e => setNewOffset(e.target.value.replace(/[^0-9A-Fa-f]/g, '').toUpperCase())} 
                placeholder="5FA8"
                className="w-full bg-transparent p-2 text-sm text-white font-mono focus:outline-none"
              />
            </div>
          </div>
          <div className="w-32">
            <label className="block text-xs font-medium text-neutral-400 mb-1">Data Type</label>
            <select 
              value={newType} 
              onChange={e => setNewType(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="int">Integer</option>
              <option value="float">Float</option>
              <option value="byte">Byte</option>
            </select>
          </div>
          <button 
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded font-medium transition-colors h-10"
          >
            Track
          </button>
        </form>
      </div>

      {/* Tracker List */}
      <div className="flex flex-col gap-3">
        {memoryItems.length === 0 ? (
          <div className="text-center p-12 bg-neutral-900/50 rounded-xl border border-neutral-800 border-dashed text-neutral-500">
            No memory addresses are currently being tracked. Add one above!
          </div>
        ) : (
          memoryItems.map(item => (
            <div key={item.id} className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${item.status === 'ok' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : item.status === 'pending' ? 'bg-amber-500' : 'bg-red-500'}`} />
                <div>
                  <h3 className="font-medium text-neutral-200">{item.name}</h3>
                  <div className="flex items-center gap-3 text-xs mt-1 text-neutral-500">
                    <span className="font-mono bg-neutral-950 px-1.5 py-0.5 rounded border border-neutral-800">0x{item.offset}</span>
                    <span className="uppercase text-[10px] tracking-wider font-bold">{item.type}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-8">
                <div className="flex flex-col items-end min-w-[80px]">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Live Value</span>
                  <span className="font-mono text-xl text-blue-400 font-bold bg-blue-400/10 px-3 py-1 rounded">
                    {item.value !== null ? item.value : '---'}
                  </span>
                </div>

                {/* Overwrite Tool */}
                <div className="flex items-center gap-2 pl-6 border-l border-neutral-800">
                  <input
                    type="text"
                    placeholder="New value"
                    value={writeValue[item.offset] || ''}
                    onChange={e => setWriteValue({ ...writeValue, [item.offset]: e.target.value })}
                    className="w-24 bg-neutral-950 border border-neutral-700 rounded p-1.5 text-sm font-mono text-white focus:outline-none focus:border-indigo-500"
                  />
                  <button 
                    onClick={() => handleWrite(item.offset, item.type)}
                    className="p-2 bg-neutral-800 hover:bg-indigo-600 text-neutral-300 hover:text-white rounded transition-colors"
                    title="Write Value"
                  >
                    <Send size={14} />
                  </button>
                  <button 
                    onClick={() => onRemove(item.id)}
                    className="p-2 ml-2 bg-neutral-800 hover:bg-red-600/80 text-neutral-400 hover:text-white rounded transition-colors"
                    title="Stop Tracking"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
