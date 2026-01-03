
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MenuItem, Table, Order, CartItem, OrderType, PaymentMethod, OrderStatus } from '../types';

interface POSProps {
  menu: MenuItem[];
  tables: Table[];
  onAddOrder: (order: Order) => void;
  updateTableStatus: (id: string, status: Table['status']) => void;
  onAddItem: (item: MenuItem) => void;
  onUpdateItem: (item: MenuItem) => void;
  initialTableId?: string | null;
  tableCarts: Record<string, CartItem[]>;
  onUpdateTableCart: (tableId: string, items: CartItem[]) => void;
  onClearTableCart: (tableId: string) => void;
  resetTableSelection: () => void;
  orders: Order[];
}

const Timer: React.FC<{ initialSeconds: number; onEnd: () => void }> = ({ initialSeconds, onEnd }) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const lastUpdate = useRef(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onEnd]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return (
    <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 rounded-2xl border border-white/10 shadow-2xl">
      <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></div>
      <span className="text-white font-black text-xl tabular-nums tracking-tighter">
        {mins}:{secs < 10 ? `0${secs}` : secs}
      </span>
    </div>
  );
};

const PaymentModal: React.FC<{ total: number; onClose: () => void; onFinalize: (method: PaymentMethod) => void }> = ({ total, onClose, onFinalize }) => {
  const [step, setStep] = useState<'SELECT' | 'PROCESSING'>('SELECT');
  const [method, setMethod] = useState<PaymentMethod | null>(null);

  const handleMethodSelect = (m: PaymentMethod) => {
    setMethod(m);
    if (m === 'CASH') onFinalize('CASH');
    else setStep('PROCESSING');
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300 print-hidden">
      <div className="bg-white w-full max-w-2xl rounded-[3.5rem] p-12 shadow-2xl relative overflow-hidden">
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 transition-colors z-10">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        {step === 'SELECT' ? (
          <div className="animate-in slide-in-from-bottom-4 space-y-10">
            <div className="text-center">
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic mb-2">Final Estimation</h2>
              <div className="inline-block px-10 py-6 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                <p className="text-6xl font-black text-indigo-600 tracking-tighter">₹{total.toFixed(0)}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2 italic">Secure Settlement Matrix</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button onClick={() => handleMethodSelect('CASH')} className="flex items-center gap-4 p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-emerald-400 hover:bg-emerald-50 transition-all group">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm group-hover:bg-emerald-500 group-hover:text-white transition-all">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                </div>
                <div className="text-left"><p className="font-black text-xs uppercase tracking-widest text-slate-400">Manual</p><p className="font-black text-lg text-slate-800">Cash Payment</p></div>
              </button>
              <button onClick={() => handleMethodSelect('CARD')} className="flex items-center gap-4 p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-blue-400 hover:bg-blue-50 transition-all group">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-500 shadow-sm group-hover:bg-blue-500 group-hover:text-white transition-all">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                </div>
                <div className="text-left"><p className="font-black text-xs uppercase tracking-widest text-slate-400">Terminal</p><p className="font-black text-lg text-slate-800">Card Payment</p></div>
              </button>
              <button onClick={() => handleMethodSelect('UPI_QR')} className="flex items-center gap-4 p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-amber-400 hover:bg-amber-50 transition-all group col-span-1 md:col-span-2">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-amber-500 shadow-sm group-hover:bg-amber-500 group-hover:text-white transition-all">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                </div>
                <div className="text-left"><p className="font-black text-xs uppercase tracking-widest text-slate-400">Digital</p><p className="font-black text-lg text-slate-800">Unified UPI QR</p></div>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 flex flex-col items-center">
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic mb-8">
              {method === 'CARD' ? 'Terminal Active' : 'Scan to Settle'}
            </h3>
            <div className="flex flex-col items-center gap-8 w-full max-w-md">
              {method === 'UPI_QR' ? (
                <div className="p-6 bg-white rounded-[3.5rem] shadow-2xl border border-slate-100 group transition-all hover:scale-105">
                   <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=zenithpro@bank&pn=Zenith%20RMS&am=${total}&cu=INR`} className="w-56 h-56 rounded-2xl" alt="Payment QR" />
                </div>
              ) : (
                <div className="w-32 h-32 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center border border-indigo-100 shadow-xl shadow-indigo-500/10">
                   <svg className="w-16 h-16 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                </div>
              )}
              <div className="space-y-4 w-full">
                <div className="flex flex-col items-center gap-2">
                  <p className="text-5xl font-black text-slate-900">₹{total.toFixed(0)}</p>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authentication Window</span>
                  <Timer initialSeconds={300} onEnd={onClose} />
                </div>
                <button onClick={() => onFinalize(method!)} className="w-full bg-indigo-600 text-white py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl active:scale-95 transition-all">
                  Confirm Success
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ReceiptModal: React.FC<{ order: Order; onClose: () => void }> = ({ order, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div id="receipt-print-area" className="bg-white w-full max-w-sm rounded-[3rem] overflow-hidden shadow-2xl relative flex flex-col items-center p-10 font-mono text-slate-800 border border-slate-100">
        <button onClick={onClose} className="print-hidden absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-all z-20"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg></button>
        <div className="w-full text-center border-b border-dashed border-slate-300 pb-6 mb-6">
          <h2 className="text-2xl font-black uppercase tracking-tighter mb-1">Zenith Pro RMS</h2>
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Terminal Node: HUB-01</p>
        </div>
        <div className="w-full space-y-4 text-[11px]">
          <div className="flex justify-between border-b border-dashed border-slate-200 pb-4"><span>Order ID:</span><span className="font-black text-slate-900">#{order.id}</span></div>
          <div className="py-2 space-y-2">{order.items.map((item, idx) => (<div key={idx} className="flex justify-between text-xs"><span>{item.quantity}x {item.name}</span><span className="font-bold">₹{(item.price * item.quantity).toFixed(0)}</span></div>))}</div>
          <div className="border-t border-dashed border-slate-300 pt-4 mt-4"><div className="flex justify-between items-center"><span className="text-xs font-black uppercase tracking-widest text-slate-900">Total:</span><span className="text-3xl font-black tracking-tighter text-indigo-600">₹{order.total.toFixed(0)}</span></div></div>
        </div>
        <div className="mt-10 w-full print-hidden">
          <button onClick={handlePrint} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl active:scale-95 transition-all">
            Print & Save PDF
          </button>
        </div>
      </div>
    </div>
  );
};

const POS: React.FC<POSProps> = ({ menu, tables, onAddOrder, updateTableStatus, onAddItem, onUpdateItem, initialTableId, tableCarts, onUpdateTableCart, onClearTableCart, resetTableSelection, orders }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<OrderType>('DINE_IN');
  const [selectedTable, setSelectedTable] = useState<string | null>(initialTableId || null);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [terminalPos, setTerminalPos] = useState({ x: window.innerWidth - 500, y: 120 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  const categories = useMemo(() => ['All', ...Array.from(new Set(menu.map(m => m.category)))], [menu]);
  const activeOrdersForTable = useMemo(() => selectedTable ? orders.filter(o => o.tableId === selectedTable && !['COMPLETED', 'CANCELLED'].includes(o.status)) : [], [selectedTable, orders]);
  const placedItems = useMemo(() => activeOrdersForTable.flatMap(o => o.items), [activeOrdersForTable]);
  const placedSubtotal = useMemo(() => activeOrdersForTable.reduce((sum, o) => sum + o.total, 0), [activeOrdersForTable]);
  const hasServedItems = useMemo(() => activeOrdersForTable.some(o => o.status === 'SERVED'), [activeOrdersForTable]);

  useEffect(() => {
    if (selectedTable) {
      if (tableCarts[selectedTable]) setCart(tableCarts[selectedTable]);
      else if (activeOrdersForTable.length === 0) setCart([]);
    }
  }, [selectedTable, tableCarts, activeOrdersForTable.length]);

  const addToCart = (item: MenuItem) => {
    const existing = cart.find(i => i.id === item.id);
    const next = existing ? cart.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i) : [...cart, { ...item, quantity: 1 }];
    setCart(next);
    if (selectedTable) onUpdateTableCart(selectedTable, next);
  };

  const handlePlaceOrder = () => {
    if (cart.length === 0) return;
    const subtotal = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
    const newOrder: Order = { id: Math.random().toString(36).substr(2, 6).toUpperCase(), tableId: selectedTable || undefined, type: orderType, items: [...cart], status: 'PENDING', subtotal, tax: subtotal * 0.05, discount: 0, total: subtotal * 1.05, createdAt: new Date() };
    onAddOrder(newOrder);
    if (selectedTable) { updateTableStatus(selectedTable, 'OCCUPIED'); onClearTableCart(selectedTable); }
    setCart([]);
  };

  const finalizeSettlement = (method: PaymentMethod) => {
    const totalItems = [...placedItems, ...cart];
    const finalTotal = (orderType === 'DINE_IN' ? placedSubtotal + cart.reduce((s,i)=>s+i.price*i.quantity,0)*1.05 : cart.reduce((s,i)=>s+i.price*i.quantity,0)*1.05);
    
    const finalOrder: Order = { 
      id: activeOrdersForTable[0]?.id || Math.random().toString(36).substr(2, 6).toUpperCase(), 
      items: totalItems, total: finalTotal, createdAt: new Date(), status: 'COMPLETED', paymentMethod: method, type: orderType, tableId: selectedTable || undefined, subtotal: finalTotal/1.05, tax: finalTotal - (finalTotal/1.05), discount: 0
    };
    if (selectedTable) { updateTableStatus(selectedTable, 'DIRTY'); setSelectedTable(null); resetTableSelection(); onClearTableCart(selectedTable); }
    setCart([]);
    setLastOrder(finalOrder);
    setShowPayment(false);
  };

  return (
    <div className="flex h-[calc(100vh-160px)] gap-6 animate-in slide-in-from-bottom-4 duration-500 overflow-hidden relative print:hidden">
      <div className="flex flex-col h-full flex-1">
        <div className="flex items-center gap-4 mb-6 relative">
          <button onClick={() => categoryScrollRef.current?.scrollBy({ left: -200, behavior: 'smooth' })} className="shrink-0 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-slate-400 hover:text-indigo-600 border border-slate-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div ref={categoryScrollRef} className="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth flex-1 px-2 py-1">
            {categories.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-8 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest whitespace-nowrap border transition-all ${selectedCategory === cat ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-400'}`}>{cat}</button>
            ))}
          </div>
          <button onClick={() => categoryScrollRef.current?.scrollBy({ left: 200, behavior: 'smooth' })} className="shrink-0 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-slate-400 hover:text-indigo-600 border border-slate-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>

        <div className="grid gap-4 overflow-y-auto no-scrollbar grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 pb-20">
          {(selectedCategory === 'All' ? menu : menu.filter(m => m.category === selectedCategory)).map(item => (
            <div key={item.id} onClick={() => addToCart(item)} className="bg-white p-3 rounded-[2.5rem] border border-slate-200 hover:border-indigo-500 hover:shadow-2xl transition-all cursor-pointer group relative overflow-hidden flex flex-col h-full">
              <div className="w-full h-32 rounded-[1.8rem] bg-slate-100 mb-3 overflow-hidden relative">
                <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 duration-700" />
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <h4 className="font-black text-slate-800 text-[11px] uppercase tracking-tight mb-1 truncate px-1">{item.name}</h4>
              <div className="flex justify-between items-center mt-auto px-1">
                <span className="text-indigo-600 font-black text-xs italic">₹{item.price}</span>
                <div className="w-6 h-6 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                   <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ position: 'fixed', left: `${terminalPos.x}px`, top: `${terminalPos.y}px`, width: '450px', zIndex: 100 }} className="bg-white rounded-[3.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden max-h-[85vh] border-0 animate-in zoom-in-95">
        <div className="p-8 flex items-center justify-between bg-slate-50/50 cursor-grab border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg></div>
            <h3 className="font-black text-slate-900 uppercase italic tracking-tight leading-none">Terminal Hub</h3>
          </div>
          <button onClick={() => setIsTerminalOpen(false)} className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm hover:text-rose-500 transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-6 bg-white">
          <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">{(['DINE_IN', 'TAKEAWAY'] as OrderType[]).map(type => (<button key={type} onClick={() => setOrderType(type)} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${orderType === type ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}>{type.replace('_', ' ')}</button>))}</div>
          {orderType === 'DINE_IN' && (<div className="grid grid-cols-4 gap-2">{tables.map(t => (<button key={t.id} onClick={() => setSelectedTable(t.id)} className={`py-3 rounded-xl text-xs font-black border transition-all ${selectedTable === t.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}>T{t.number}</button>))}</div>)}
          <div className="space-y-4">
            {placedItems.length > 0 && (
              <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-[2.5rem] space-y-2 relative">
                <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Active Dispatch</span>
                {placedItems.map((i, idx) => (<div key={idx} className="flex justify-between text-xs font-bold text-indigo-900"><span>{i.quantity}x {i.name}</span><span>₹{i.price * i.quantity}</span></div>))}
              </div>
            )}
            {cart.map(item => (
              <div key={item.id} className="flex gap-4 items-center animate-in slide-in-from-right-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0"><img src={item.image} className="w-full h-full object-cover" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start"><h5 className="font-black text-xs text-slate-800 truncate tracking-tight">{item.name}</h5></div>
                  <div className="flex items-center justify-between mt-1"><div className="flex items-center gap-3 bg-slate-50 px-3 py-1 rounded-xl border border-slate-100"><span className="text-[11px] font-black">{item.quantity}</span></div><span className="text-[11px] font-black text-slate-900">₹{item.price * item.quantity}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="p-8 bg-slate-50 border-t border-slate-100 space-y-5">
          <div className="flex justify-between items-end"><span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Valuation</span><span className="text-3xl font-black text-slate-900 italic tracking-tighter">₹{(orderType === 'DINE_IN' ? (placedSubtotal + cart.reduce((s,i)=>s+i.price*i.quantity,0)*1.05) : (cart.reduce((s,i)=>s+i.price*i.quantity, 0)*1.05)).toFixed(0)}</span></div>
          {cart.length > 0 && <button onClick={handlePlaceOrder} className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black uppercase text-[11px] shadow-2xl active:scale-[0.98] transition-all hover:bg-indigo-600 tracking-[0.2em]">Send to Kitchen</button>}
          <button disabled={cart.length === 0 && placedItems.length === 0} onClick={() => setShowPayment(true)} className={`w-full py-5 rounded-3xl font-black uppercase text-[11px] shadow-xl transition-all active:scale-[0.98] tracking-[0.2em] ${hasServedItems || orderType === 'TAKEAWAY' ? 'bg-emerald-600 text-white hover:bg-emerald-500 animate-pulse' : 'bg-slate-200 text-slate-400 grayscale'}`}>Settle Matrix</button>
        </div>
      </div>
      {showPayment && <PaymentModal total={orderType === 'DINE_IN' ? (placedSubtotal + cart.reduce((s,i)=>s+i.price*i.quantity,0)*1.05) : (cart.reduce((s,i)=>s+i.price*i.quantity, 0)*1.05)} onClose={() => setShowPayment(false)} onFinalize={finalizeSettlement} />}
      {lastOrder && <ReceiptModal order={lastOrder} onClose={() => setLastOrder(null)} />}
    </div>
  );
};
export default POS;
