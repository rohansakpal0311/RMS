
import React, { useState } from 'react';
import { Table, TableStatus, Reservation, TableSection, MenuItem, CartItem } from '../types';

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
}

const TableManager: React.FC<TableManagerProps> = ({ 
  tables, updateTableStatus, reservations, onAddReservation, onUpdateReservation, onDeleteReservation, onPlaceOrder, 
  menu, tableCarts, onUpdateTableCart 
}) => {
  const [resForm, setResForm] = useState({ name: '', pax: 2, tableId: '', time: '19:00' });
  const [selectedSection, setSelectedSection] = useState<TableSection | 'All'>('All');
  const [quickAddTableId, setQuickAddTableId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingResId, setEditingResId] = useState<string | null>(null);

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

  const statusCounts = (['AVAILABLE', 'OCCUPIED', 'RESERVED', 'DIRTY'] as TableStatus[]).reduce((acc, status) => {
    acc[status] = tables.filter(t => t.status === status).length;
    return acc;
  }, {} as Record<TableStatus, number>);

  const handleResSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resForm.name || !resForm.tableId) return;

    if (editingResId) {
      onUpdateReservation({
        id: editingResId,
        customerName: resForm.name,
        partySize: resForm.pax,
        tableId: resForm.tableId,
        time: resForm.time,
        status: 'PENDING'
      });
      setEditingResId(null);
    } else {
      onAddReservation({
        id: Math.random().toString(36).substr(2, 9),
        customerName: resForm.name,
        partySize: resForm.pax,
        tableId: resForm.tableId,
        time: resForm.time,
        status: 'PENDING'
      });
    }
    setResForm({ name: '', pax: 2, tableId: '', time: '19:00' });
  };

  const startEditReservation = (res: Reservation) => {
    setEditingResId(res.id);
    setResForm({
      name: res.customerName,
      pax: res.partySize,
      tableId: res.tableId,
      time: res.time
    });
  };

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
    
    // Auto-update table status if it was available or dirty
    const table = tables.find(t => t.id === tableId);
    if (table && (table.status === 'AVAILABLE' || table.status === 'DIRTY' || table.status === 'RESERVED')) {
      updateTableStatus(tableId, 'OCCUPIED');
    }
  };

  const filteredMenu = menu.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { status: 'AVAILABLE' as TableStatus, label: 'Vacant Tables' },
          { status: 'OCCUPIED' as TableStatus, label: 'Occupied' },
          { status: 'RESERVED' as TableStatus, label: 'Reserved' },
          { status: 'DIRTY' as TableStatus, label: 'Need Clean' }
        ].map(({ status, label }) => {
          const info = getStatusInfo(status);
          return (
            <div key={status} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl flex items-center justify-between transition-transform hover:scale-105">
               <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{label}</p>
                  <h4 className="text-3xl font-black text-slate-900 tracking-tighter">{statusCounts[status]}</h4>
               </div>
               <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${info.color}`}>
                  <div className={`w-3 h-3 rounded-full ${info.dot}`}></div>
               </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col xl:flex-row gap-8">
        <div className="flex-1 space-y-6">
          <div className="flex gap-2 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-100 self-start">
            {sections.map(section => (
              <button
                key={section}
                onClick={() => setSelectedSection(section)}
                className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                  selectedSection === section 
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {section}
              </button>
            ))}
          </div>

          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 text-[10px] font-black text-slate-200 uppercase tracking-[0.5em] select-none pointer-events-none">Interactive Floor Plan</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
              {filteredTables.map(table => {
                const info = getStatusInfo(table.status);
                const cartCount = tableCarts[table.id]?.reduce((sum, item) => sum + item.quantity, 0) || 0;
                
                return (
                  <div key={table.id} className="relative group perspective-1000">
                    <div className={`aspect-square p-8 rounded-[3rem] flex flex-col items-center justify-center gap-2 border-2 transition-all duration-500 shadow-lg ${table.status === 'AVAILABLE' ? 'border-dashed border-slate-200 bg-white' : 'border-slate-50 bg-slate-50/30'} group-hover:shadow-indigo-500/10`}>
                      <span className="text-4xl font-black text-slate-900 tracking-tighter italic">#{table.number}</span>
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{table.capacity} SEATS</span>
                      </div>
                      <div className="mt-2 flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm relative">
                        <div className={`w-2 h-2 rounded-full ${info.dot}`}></div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{info.label}</span>
                        {cartCount > 0 && (
                          <div className="absolute -top-2 -right-2 bg-indigo-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black ring-4 ring-white">{cartCount}</div>
                        )}
                      </div>
                    </div>

                    <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center p-6 gap-3 rounded-[3rem] translate-y-4 group-hover:translate-y-0 shadow-2xl z-10 border border-white/10">
                      <button 
                        onClick={() => onPlaceOrder(table.id)}
                        className="w-full bg-indigo-600 text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 active:scale-95 transition-all shadow-lg shadow-indigo-600/20"
                      >
                        POS Terminal
                      </button>
                      <button 
                        onClick={() => setQuickAddTableId(table.id)}
                        className="w-full bg-white text-slate-900 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 active:scale-95 transition-all shadow-lg"
                      >
                        Quick Add Item
                      </button>
                      <div className="grid grid-cols-2 w-full gap-2 mt-2">
                        <button onClick={() => updateTableStatus(table.id, 'AVAILABLE')} className="bg-slate-800 text-emerald-400 py-2.5 rounded-xl text-[8px] font-black uppercase tracking-widest border border-white/5 hover:bg-slate-700 transition-colors">Free</button>
                        <button onClick={() => updateTableStatus(table.id, 'DIRTY')} className="bg-slate-800 text-slate-400 py-2.5 rounded-xl text-[8px] font-black uppercase tracking-widest border border-white/5 hover:bg-slate-700 transition-colors">Dirty</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="w-full xl:w-96 flex flex-col gap-8">
          <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-600/10 rounded-full blur-3xl"></div>
            <h3 className="text-xl font-black uppercase tracking-tight mb-8 italic flex items-center gap-3">
              <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              {editingResId ? 'Modify Booking' : 'Table Booking'}
            </h3>
            <form onSubmit={handleResSubmit} className="space-y-5">
              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-2">Guest Identity</label>
                <input value={resForm.name} onChange={e => setResForm({...resForm, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-indigo-500 text-sm font-medium text-white transition-all placeholder:text-slate-700" placeholder="e.g. Rahul Sharma" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-2">Party Size</label>
                  <input type="number" value={resForm.pax} onChange={e => setResForm({...resForm, pax: parseInt(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none text-sm font-medium text-white" />
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-2">Arrival Time</label>
                  <input type="time" value={resForm.time} onChange={e => setResForm({...resForm, time: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none text-sm font-medium text-white" />
                </div>
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-2">Assign Node</label>
                <select value={resForm.tableId} onChange={e => setResForm({...resForm, tableId: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none text-sm font-medium text-white appearance-none">
                  <option value="" className="text-slate-900">Choose Table...</option>
                  {tables.filter(t => t.status === 'AVAILABLE' || t.id === reservations.find(r => r.id === editingResId)?.tableId).map(t => (
                    <option key={t.id} value={t.id} className="text-slate-900">T#{t.number} ({t.section})</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-500 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 active:scale-95">
                  {editingResId ? 'Update Record' : 'Confirm Reservation'}
                </button>
                {editingResId && (
                  <button 
                    type="button" 
                    onClick={() => { setEditingResId(null); setResForm({ name: '', pax: 2, tableId: '', time: '19:00' }); }}
                    className="bg-white/10 hover:bg-white/20 px-6 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl flex-1 flex flex-col">
             <div className="flex items-center justify-between mb-8 shrink-0">
                <div className="flex items-center gap-3">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Confirmed Bookings</h3>
                  <span className="bg-indigo-600 text-white w-5 h-5 flex items-center justify-center rounded-md text-[9px] font-black">{reservations.length}</span>
                </div>
             </div>
             <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-2">
                {reservations.map(res => {
                  const table = tables.find(t => t.id === res.tableId);
                  const isBeingEdited = editingResId === res.id;
                  return (
                    <div key={res.id} className={`flex items-center gap-4 p-5 rounded-[1.5rem] border transition-all group ${isBeingEdited ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-100 hover:border-indigo-200'}`}>
                       <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black shadow-sm group-hover:scale-110 transition-transform ${isBeingEdited ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600'}`}>
                          {res.time.split(':')[0]}<span className="text-[10px] opacity-30">h</span>
                       </div>
                       <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-slate-800 truncate tracking-tight">{res.customerName}</p>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">T#{table?.number}</span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{res.partySize} PAX</span>
                          </div>
                       </div>
                       <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => startEditReservation(res)}
                            className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
                            title="Edit Booking"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button 
                            onClick={() => onDeleteReservation(res.id)}
                            className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:border-rose-200 transition-all shadow-sm"
                            title="Cancel Booking"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                       </div>
                    </div>
                  );
                })}
                {reservations.length === 0 && (
                   <div className="py-20 text-center opacity-20">
                      <p className="text-[10px] font-black uppercase tracking-widest">No Active Bookings</p>
                   </div>
                )}
             </div>
          </div>
        </div>
      </div>

      {/* Quick Add Item Modal */}
      {quickAddTableId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl relative flex flex-col h-[80vh]">
            <button onClick={() => setQuickAddTableId(null)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="mb-8">
              <h4 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic mb-1">Quick Add to T#{tables.find(t => t.id === quickAddTableId)?.number}</h4>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Adding to table cart instantly</p>
            </div>
            
            <div className="relative mb-6">
              <input 
                type="text" 
                placeholder="Search menu (e.g. Butter Chicken)..." 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold outline-none focus:border-indigo-500 transition-all"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
              {filteredMenu.map(item => (
                <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-all group">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm"><img src={item.image} className="w-full h-full object-cover" /></div>
                      <div>
                        <p className="text-sm font-black text-slate-800">{item.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.category} • ₹{item.price}</p>
                      </div>
                   </div>
                   <button 
                    onClick={() => handleQuickAdd(quickAddTableId, item)}
                    className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                   >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                   </button>
                </div>
              ))}
              {filteredMenu.length === 0 && (
                <div className="py-20 text-center opacity-30">
                   <p className="text-xs font-black uppercase tracking-widest">No matches found</p>
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
               <button 
                onClick={() => setQuickAddTableId(null)}
                className="bg-slate-900 text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
               >
                 Done Adding
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableManager;
