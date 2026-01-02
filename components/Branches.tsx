
import React, { useState } from 'react';
import { Branch } from '../types';

interface BranchesProps {
  branches: Branch[];
  onSwitch: (id: string) => void;
  onAdd: (name: string, location: string) => void;
  onDelete: (id: string) => void;
}

const Branches: React.FC<BranchesProps> = ({ branches, onSwitch, onAdd, onDelete }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBranch, setNewBranch] = useState({ name: '', location: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBranch.name && newBranch.location) {
      onAdd(newBranch.name, newBranch.location);
      setNewBranch({ name: '', location: '' });
      setShowAddModal(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Multi-Branch Network</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Scale your restaurant across locations</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
        >
          + Establish New Branch
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {branches.map(branch => (
          <div key={branch.id} className={`bg-white rounded-[2.5rem] border transition-all p-8 relative group overflow-hidden ${branch.active ? 'border-indigo-500 shadow-2xl shadow-indigo-500/10' : 'border-slate-100 shadow-xl'}`}>
            {branch.active && (
              <div className="absolute top-0 right-0 bg-indigo-600 text-white px-4 py-1.5 rounded-bl-2xl text-[9px] font-black uppercase tracking-widest">Active Node</div>
            )}
            
            <div className="flex items-center gap-4 mb-8">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${branch.active ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1" /></svg>
              </div>
              <div className="min-w-0">
                <h3 className="text-xl font-black text-slate-800 truncate tracking-tight">{branch.name}</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{branch.location}</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Revenue</span>
                 <span className="text-lg font-black text-slate-800">₹{branch.revenue.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                disabled={branch.active}
                onClick={() => onSwitch(branch.id)}
                className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${branch.active ? 'bg-slate-50 text-slate-300' : 'bg-indigo-600 text-white shadow-lg active:scale-95'}`}
              >
                {branch.active ? 'Current Environment' : 'Initialize Session'}
              </button>
              {!branch.active && (
                <button 
                  onClick={() => onDelete(branch.id)}
                  className="w-14 h-14 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all border border-rose-100 active:scale-95"
                  title="Terminate Branch"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl relative">
            <button onClick={() => setShowAddModal(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter mb-8 text-center">New Branch Node</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Branch Identity (Name)</label>
                <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold" value={newBranch.name} onChange={e => setNewBranch({...newBranch, name: e.target.value})} placeholder="e.g. Zenith Coastal" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Geographic Vector (Location)</label>
                <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold" value={newBranch.location} onChange={e => setNewBranch({...newBranch, location: e.target.value})} placeholder="e.g. Bandra West" />
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">Establish Branch</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Branches;
