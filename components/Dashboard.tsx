
import React, { useState, useEffect, useMemo } from 'react';
import { Order, MenuItem } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getProBusinessInsights } from '../geminiService';

interface DashboardProps {
  orders: Order[];
  menu: MenuItem[];
  systemNotifications?: {id: string, message: string, type: 'info' | 'success'}[];
}

const Dashboard: React.FC<DashboardProps> = ({ orders, menu, systemNotifications = [] }) => {
  const [insights, setInsights] = useState<string>("Initializing Pro AI Engine...");
  
  const revenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalItems = orders.reduce((sum, o) => sum + o.items.length, 0);
  const avgOrder = orders.length > 0 ? revenue / orders.length : 0;

  useEffect(() => {
    const fetchInsights = async () => {
      const result = await getProBusinessInsights(orders, menu);
      setInsights(result);
    };
    fetchInsights();
  }, [orders, menu]);

  const chartData = useMemo(() => {
    return [
      { name: 'Mon', revenue: 42000, volume: 45 },
      { name: 'Tue', revenue: 38000, volume: 40 },
      { name: 'Wed', revenue: 51000, volume: 55 },
      { name: 'Thu', revenue: 49000, volume: 52 },
      { name: 'Fri', revenue: 78000, volume: 85 },
      { name: 'Sat', revenue: 92000, volume: 105 },
      { name: 'Sun', revenue: 85000, volume: 95 },
    ];
  }, []);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Total Revenue', value: `₹${revenue.toLocaleString()}`, trend: '+18.4%', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'bg-indigo-600' },
          { label: 'Guest Count', value: orders.length * 2, trend: '+12.5%', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', color: 'bg-emerald-600' },
          { label: 'Avg Ticket Size', value: `₹${avgOrder.toFixed(0)}`, trend: '+4.2%', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z', color: 'bg-amber-600' },
          { label: 'Floor Occupancy', value: '78%', trend: 'High', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1', color: 'bg-purple-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:-translate-y-1 transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform"></div>
            <div className="relative z-10 flex justify-between items-start mb-6">
              <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center text-white shadow-xl group-hover:rotate-6 transition-all`}>
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={stat.icon} /></svg>
              </div>
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg ${stat.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                {stat.trend}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-2">{stat.label}</p>
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <div className="xl:col-span-2 space-y-10">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/30">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">Market Velocity</h3>
                <p className="text-sm text-slate-400 font-medium tracking-wide">Revenue vs Transaction Volume (Last 7 Days)</p>
              </div>
            </div>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '20px' }}
                    formatter={(value) => [`₹${value}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={5} fillOpacity={1} fill="url(#colorRev)" />
                  <Area type="monotone" dataKey="volume" stroke="#10b981" strokeWidth={5} fill="none" strokeDasharray="10 10" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* New Live System Feed Section */}
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl">
             <div className="flex items-center justify-between mb-8">
                <div>
                   <h3 className="text-xl font-black text-slate-900 uppercase italic">Live System Feed</h3>
                   <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Real-time terminal notifications</p>
                </div>
                <div className="flex gap-1.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse delay-75"></div>
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse delay-150"></div>
                </div>
             </div>
             <div className="space-y-4 max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
                {systemNotifications.length === 0 ? (
                  <div className="py-10 text-center text-slate-300 font-bold uppercase tracking-widest text-[10px] opacity-60">
                     Feed Synchronized • No Pending Alerts
                  </div>
                ) : (
                  systemNotifications.map(notif => (
                    <div key={notif.id} className={`flex items-center gap-4 p-5 rounded-2xl border animate-in slide-in-from-left-4 ${notif.type === 'success' ? 'bg-emerald-50 border-emerald-100' : 'bg-indigo-50 border-indigo-100'}`}>
                       <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${notif.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-indigo-500 text-white'}`}>
                          {notif.type === 'success' ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          )}
                       </div>
                       <p className={`text-xs font-black uppercase tracking-widest ${notif.type === 'success' ? 'text-emerald-700' : 'text-indigo-700'}`}>{notif.message}</p>
                    </div>
                  ))
                )}
             </div>
          </div>
        </div>

        <div className="flex flex-col gap-10">
          <div className="bg-[#0f111a] p-10 rounded-[3rem] shadow-2xl text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/10 rounded-full blur-[80px]"></div>
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM13.536 15.657a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM16 18a1 1 0 100-2 1 1 0 000 2z" /></svg>
                </div>
                <h3 className="text-xs font-black tracking-[0.3em] uppercase text-indigo-400">Zenith Pro Intelligence</h3>
              </div>
              <div className="flex-1 space-y-6 text-slate-300 italic text-sm leading-relaxed border-l-2 border-indigo-500/30 pl-6">
                {insights}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-10 rounded-[3rem] text-white shadow-xl relative overflow-hidden">
             <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-2">Live Floor Score</p>
                <div className="flex items-end gap-2 mb-4">
                  <span className="text-5xl font-black">9.8</span>
                  <span className="text-xl font-bold text-indigo-300 pb-1">/ 10</span>
                </div>
                <p className="text-xs text-indigo-100 font-medium">Customer satisfaction is at an all-time high for this branch.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
