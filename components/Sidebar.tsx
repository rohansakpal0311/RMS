
import React, { useState, useEffect } from 'react';
import { AppRoute, User } from '../types';

interface SidebarProps {
  activeRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  user: User;
  onSignOut: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeRoute, onNavigate, user, onSignOut }) => {
  const [shiftTime, setShiftTime] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const diff = new Date().getTime() - user.shiftStart.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setShiftTime(`${hours}h ${mins}m`);
    }, 1000);
    return () => clearInterval(timer);
  }, [user.shiftStart]);

  const items = [
    { id: AppRoute.DASHBOARD, label: 'Control Center', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { id: AppRoute.POS, label: 'Smart POS', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
    { id: AppRoute.KDS, label: 'Kitchen Hub', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { id: AppRoute.TABLES, label: 'Floor Matrix', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { id: AppRoute.BRANCHES, label: 'Multi-Branch', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1' },
    { id: AppRoute.INVENTORY, label: 'Assets & Supply', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { id: AppRoute.REPORTS, label: 'Pro Analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { id: AppRoute.EMPLOYMENT, label: 'Personnel', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { id: AppRoute.SETTINGS, label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
  ];

  return (
    <aside className="w-80 bg-[#0f111a] h-screen flex flex-col shrink-0 overflow-hidden shadow-2xl relative">
      {/* Removed vertical divider line here */}
      
      <div className="p-10 flex items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 bg-indigo-600 rounded-[1.2rem] flex items-center justify-center shadow-lg shadow-indigo-600/20 rotate-12 transition-transform hover:rotate-0">
            <svg className="w-7 h-7 text-white -rotate-12 group-hover:rotate-0 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <div className="absolute -top-1 -right-1 bg-amber-400 text-black text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase">Pro</div>
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-black text-white tracking-tighter uppercase italic leading-none">Zenith</span>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1">Management</span>
        </div>
      </div>
      
      <nav className="flex-1 px-6 py-2 space-y-1 overflow-y-auto no-scrollbar">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
              activeRoute === item.id 
                ? 'bg-indigo-600/10 text-white' 
                : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
            }`}
          >
            {activeRoute === item.id && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-indigo-500 rounded-r-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>}
            <svg className={`w-5 h-5 transition-colors ${activeRoute === item.id ? 'text-indigo-400' : 'text-slate-600 group-hover:text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
            </svg>
            <span className={`font-bold text-sm tracking-wide ${activeRoute === item.id ? 'translate-x-1' : ''} transition-transform`}>{item.label}</span>
          </button>
        ))}
      </nav>
      
      <div className="p-8">
        <div className="bg-white/5 rounded-[2rem] p-6 border border-white/5 backdrop-blur-md relative overflow-hidden group">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-white/10 overflow-hidden ring-4 ring-indigo-500/10">
                 <img src={user.avatar} alt={user.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-[#1a1c27] rounded-full"></div>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-white truncate tracking-tight">{user.name}</p>
              <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">{user.role}</p>
            </div>
          </div>
          
          <div className="space-y-4">
             <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-white/5 pb-3">
                <span>Session Active</span>
                <span className="text-white bg-indigo-600/30 px-2 py-0.5 rounded-md">{shiftTime}</span>
             </div>
             
             <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => onNavigate(AppRoute.PROFILE)}
                  className="bg-white/5 hover:bg-white/10 text-white/70 hover:text-white py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                >
                  Edit Profile
                </button>
                <button 
                  onClick={onSignOut}
                  className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                >
                  Log Out
                </button>
             </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
