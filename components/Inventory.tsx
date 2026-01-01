
import React from 'react';
import { InventoryItem } from '../types';

interface InventoryProps {
  inventory: InventoryItem[];
}

const Inventory: React.FC<InventoryProps> = ({ inventory }) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
      <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div>
          <h3 className="text-lg font-black text-slate-800 tracking-tight">Stock Management</h3>
          <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-widest">Global Inventory Control</p>
        </div>
        <div className="flex gap-4">
           <button className="bg-white text-slate-800 px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors">Import PO</button>
           <button className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest shadow-lg shadow-slate-900/10 hover:bg-indigo-600 transition-colors">+ New Item</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/80">
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Item Details</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Category</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">In Stock</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Min Level</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {inventory.map(item => {
              const isLow = item.quantity <= item.minStock;
              const progress = Math.min(100, (item.quantity / (item.minStock * 4)) * 100);
              
              return (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${isLow ? 'bg-rose-50 text-rose-500' : 'bg-slate-100 text-slate-600'}`}>
                        {item.name.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-800 tracking-tight">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md">{item.category}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1.5">
                      <span className={`font-black tracking-tight ${isLow ? 'text-rose-600' : 'text-slate-800'}`}>
                        {item.quantity.toFixed(1)} {item.unit}
                      </span>
                      <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-1000 ${isLow ? 'bg-rose-500' : 'bg-indigo-600'}`} style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-slate-500 font-medium text-sm">{item.minStock} {item.unit}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      isLow ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                    }`}>
                      {isLow ? 'Critical' : 'Healthy'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="text-slate-300 hover:text-indigo-600 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventory;
