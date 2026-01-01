
import React, { useMemo } from 'react';
import { Order } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

interface ReportsProps {
  orders: Order[];
}

const Reports: React.FC<ReportsProps> = ({ orders }) => {
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.flatMap(o => o.items).forEach(item => {
      counts[item.category] = (counts[item.category] || 0) + (item.price * item.quantity);
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [orders]);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-black text-slate-800 tracking-tight mb-8">Sales by Category</h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
              <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 12, fontWeight: 'bold'}} />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                formatter={(value) => [`₹${value}`, 'Revenue']}
              />
              <Bar dataKey="value" fill="#6366f1" radius={[0, 8, 8, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-black text-slate-800 tracking-tight mb-8">Revenue Distribution</h3>
        <div className="h-[400px] flex items-center justify-center relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={8}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                formatter={(value) => [`₹${value}`, 'Revenue']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute flex flex-col items-center pointer-events-none">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Revenue</span>
            <span className="text-3xl font-black text-slate-800 tracking-tighter">
              ₹{orders.reduce((sum, o) => sum + o.total, 0).toFixed(0)}
            </span>
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 bg-slate-900 p-10 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-4 text-center md:text-left">
          <h2 className="text-4xl font-black tracking-tighter">Zenith Analytics v2.0</h2>
          <p className="text-slate-400 max-w-md leading-relaxed">Advanced predictive modeling for inventory usage and peak-hour staff allocation is now active for your branch.</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
           <div className="bg-white/10 p-6 rounded-3xl border border-white/10 backdrop-blur-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Confidence Score</span>
              <p className="text-3xl font-black text-indigo-400">98.2%</p>
           </div>
           <div className="bg-white/10 p-6 rounded-3xl border border-white/10 backdrop-blur-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Processing Speed</span>
              <p className="text-3xl font-black text-emerald-400">12ms</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
