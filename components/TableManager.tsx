
import React, { useState } from 'react';
import { Table, TableStatus, Reservation, TableSection, MenuItem, CartItem, Order } from '../types';

interface TableManagerProps {
  tables: Table[];
  updateTableStatus: (id: string, status: TableStatus) => void;
  reservations: Reservation[];
  onAddReservation: (res: Reservation) => void;
  onUpdateReservation: (res: Reservation) => void;
  onDeleteReservation: (id: string) => void;
  onPlaceOrder: (tableId: string) => void;
  menu: MenuItem[];
  tableCarts: Record<string, CartItem[]>;
  onUpdateTableCart: (tableId: string, items: CartItem[]) => void;
  onAddOrder: (order: Order) => void;
}

const TableManager: React.FC<TableManagerProps> = ({ 
  tables, updateTableStatus, reservations, onAddReservation, onUpdateReservation, onDeleteReservation, onPlaceOrder, 
  menu, tableCarts, onUpdateTableCart, onAddOrder
}) => {
  const [resForm, setResForm] = useState({ name: '', pax: 2, tableId: '', time: '19:00' });
  const [selectedSection, setSelectedSection] = useState<TableSection | 'All'>('All');
  const [quickAddTableId, setQuickAddTableId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusInfo = (status: TableStatus) => {
    switch (status) {
      case 'AVAILABLE': return { label: 'Vacant', color: 'bg-emerald-50 text-emerald-600 border-emerald-100', dot: 'bg-emerald-500' };
      case 'OCCUPIED': return { label: 'Occupied', color: 'bg-rose-50 text-rose-600 border-rose-100', dot: 'bg-rose-500' };
      case 'RESERVED': return { label: 'Reserved', color: 'bg-amber-50 text-amber-600 border-amber-100', dot: 'bg-amber-500' };
      case 'DIRTY': return { label: 'Need Clean', color: 'bg-slate-100 text-slate-500 border-slate-200', dot: 'bg-slate-400' };
    }
  };

  const sections: (TableSection | 'All')[] = ['All', 'Main Hall', 'Bar', 'Terrace'];
  const filteredTables = selectedSection === 'All' ? tables : tables.filter(t => t.section === selectedSection);

  const handleQuickAdd = (tableId: string, item: MenuItem) => {
    const existingItems = tableCarts[tableId] || [];
    const itemIdx = existingItems.findIndex(i => i.id === item.id);
    let updatedCart: CartItem[];
    if (itemIdx >= 0) {
      updatedCart = existingItems.map((i, idx) => idx === itemIdx ? { ...i, quantity: i.quantity + 1 } : i);
    } else {
      updatedCart = [...existingItems, { ...item, quantity: 1 }];
    }
    onUpdateTableCart(tableId, updatedCart);
  };

  const handleSendToKitchen = (tableId: string) => {
    const cart = tableCarts[tableId] || [];
    if (cart.length === 0) return;
    const subtotal = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
    const newOrder: Order = { 
      id: Math.random().toString(36).substr(2, 6).toUpperCase(), 
      tableId: tableId, 
      type: 'DINE_IN', 
      items: [...cart], 
      status: 'PENDING', 
      subtotal, tax: subtotal * 0.05, discount: 0, total: subtotal * 1.05, createdAt: new Date() 
    };
    onAddOrder(newOrder);
    updateTableStatus(tableId, 'OCCUPIED');
    onUpdateTableCart(tableId, []); // Clear local cart
    setQuickAddTableId(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {(['AVAILABLE', 'OCCUPIED', 'RESERVED', 'DIRTY'] as TableStatus[]).map(status => {
          const info = getStatusInfo(status);
          const count = tables.filter(t => t.status === status).length;
          return (
            <div key={status} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl flex items-center justify-between transition-transform hover:scale-105">
               <div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{status}</p><h4 className="text-3xl font-black text-slate-900 tracking-tighter">{count}</h4></div>
               <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${info.color}`}><div className={`w-3 h-3 rounded-full ${info.dot}`}></div></div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col xl:flex-row gap-8">
        <div className="flex-1 space-y-6">
          <div className="flex gap-2 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-100 self-start">
            {sections.map(section => (
              <button key={section} onClick={() => setSelectedSection(section)} className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${selectedSection === section ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}>{section}</button>
            ))}
          </div>
          <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-2xl relative overflow-hidden grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
              {filteredTables.map(table => {
                const info = getStatusInfo(table.status);
                const cartCount = tableCarts[table.id]?.reduce((sum, item) => sum + item.quantity, 0) || 0;
                return (
                  <div key={table.id} className="relative group perspective-1000">
                    <div className={`aspect-square p-8 rounded-[3.5rem] flex flex-col items-center justify-center gap-2 border-2 transition-all duration-500 shadow-lg ${table.status === 'AVAILABLE' ? 'border-dashed border-slate-200 bg-white' : 'border-slate-50 bg-slate-50/30'}`}>
                      <span className="text-4xl font-black text-slate-900 tracking-tighter italic">#{table.number}</span>
                      <div className="mt-2 flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm relative">
                        <div className={`w-2 h-2 rounded-full ${info.dot}`}></div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{info.label}</span>
                        {cartCount > 0 && <div className="absolute -top-2 -right-2 bg-indigo-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black ring-4 ring-white">{cartCount}</div>}
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center p-6 gap-3 rounded-[3.5rem] translate-y-4 group-hover:translate-y-0 shadow-2xl z-10">
                      <button onClick={() => onPlaceOrder(table.id)} className="w-full bg-indigo-600 text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 active:scale-95 transition-all shadow-lg">Terminal Mode</button>
                      <button onClick={() => setQuickAddTableId(table.id)} className="w-full bg-white text-slate-900 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 active:scale-95 transition-all shadow-lg">Quick Entry</button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {quickAddTableId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[3.5rem] p-10 shadow-2xl relative flex flex-col h-[85vh]">
            <button onClick={() => setQuickAddTableId(null)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 p-2"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg></button>
            <div className="mb-8">
              <h4 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic mb-1">Quick Add: T#{tables.find(t => t.id === quickAddTableId)?.number}</h4>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Active Table Cart State Management</p>
            </div>
            
            <input 
              type="text" placeholder="Search Matrix Assets..." 
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-8 py-5 text-sm font-bold outline-none mb-6 focus:border-indigo-500 transition-all"
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            />

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-2">
              {menu.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase())).map(item => (
                <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-all group">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm"><img src={item.image} className="w-full h-full object-cover" /></div>
                      <div>
                        <p className="text-sm font-black text-slate-800">{item.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">₹{item.price}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-2">
                      {tableCarts[quickAddTableId]?.find(i => i.id === item.id) && (
                        <span className="bg-indigo-600 text-white w-6 h-6 flex items-center justify-center rounded-lg text-[10px] font-black">
                          {tableCarts[quickAddTableId]?.find(i => i.id === item.id)?.quantity}
                        </span>
                      )}
                      <button onClick={() => handleQuickAdd(quickAddTableId, item)} className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg></button>
                   </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex gap-4">
               <button onClick={() => setQuickAddTableId(null)} className="flex-1 bg-slate-100 text-slate-500 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Save to Terminal</button>
               <button onClick={() => handleSendToKitchen(quickAddTableId)} className="flex-1 bg-indigo-600 text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">Dispatch to Hub</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableManager;
