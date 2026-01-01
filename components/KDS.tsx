
import React from 'react';
import { Order, OrderStatus } from '../types';

interface KDSProps {
  orders: Order[];
  updateOrderStatus: (id: string, status: OrderStatus) => void;
}

const KDS: React.FC<KDSProps> = ({ orders, updateOrderStatus }) => {
  const activeOrders = orders.filter(o => !['COMPLETED', 'CANCELLED'].includes(o.status));
  
  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'PREPARING': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'READY': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'SERVED': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getNextStatus = (status: OrderStatus): OrderStatus | null => {
    if (status === 'PENDING') return 'PREPARING';
    if (status === 'PREPARING') return 'READY';
    if (status === 'READY') return 'SERVED';
    if (status === 'SERVED') return 'COMPLETED';
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 animate-in fade-in duration-500">
      {activeOrders.length === 0 ? (
        <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-slate-300">
           <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-300">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
           </div>
           <p className="text-xl font-bold text-slate-400 uppercase tracking-widest">No active orders</p>
           <p className="text-slate-500 mt-2">Kitchen is clear! Time to prep for the rush.</p>
        </div>
      ) : (
        activeOrders.map(order => {
          const next = getNextStatus(order.status);
          const timeSince = Math.floor((new Date().getTime() - new Date(order.createdAt).getTime()) / 60000);
          
          return (
            <div key={order.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-300">
              <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h4 className="font-black text-slate-800 tracking-tight">#{order.id.slice(0,6)}</h4>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{order.type} {order.tableId ? `• Table ${order.tableId.slice(1)}` : ''}</span>
                </div>
                <div className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(order.status)}`}>
                  {order.status}
                </div>
              </div>
              
              <div className="flex-1 p-5 space-y-4">
                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center border-b border-slate-50 pb-2 last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 bg-slate-900 text-white rounded-md flex items-center justify-center text-xs font-black">{item.quantity}</span>
                        <span className="text-sm font-bold text-slate-700">{item.name}</span>
                      </div>
                      {item.notes && <span className="text-[10px] font-medium text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded italic">"{item.notes}"</span>}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span className={`text-xs font-bold ${timeSince > 20 ? 'text-rose-500' : 'text-slate-500'}`}>{timeSince}m ago</span>
                </div>
                {next && (
                  <button
                    onClick={() => updateOrderStatus(order.id, next)}
                    className="bg-slate-900 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-slate-900/10"
                  >
                    Mark {next}
                  </button>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default KDS;
