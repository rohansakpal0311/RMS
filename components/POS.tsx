
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MenuItem, Table, Order, CartItem, OrderType, PaymentMethod, OrderStatus } from '../types';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface POSProps {
  menu: MenuItem[];
  tables: Table[];
  onAddOrder: (order: Order) => void;
  updateTableStatus: (id: string, status: Table['status']) => void;
  onAddItem: (item: MenuItem) => void;
  onUpdateItem?: (item: MenuItem) => void;
  initialTableId?: string | null;
  tableCarts: Record<string, CartItem[]>;
  onUpdateTableCart: (tableId: string, items: CartItem[]) => void;
  onClearTableCart: (tableId: string) => void;
  resetTableSelection: () => void;
  orders: Order[];
}

const Timer: React.FC<{ initialSeconds: number; onEnd: () => void }> = ({ initialSeconds, onEnd }) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  useEffect(() => {
    if (seconds <= 0) { onEnd(); return; }
    const timer = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [seconds, onEnd]);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return <div className="text-rose-500 font-black text-2xl tabular-nums">{mins}:{secs < 10 ? `0${secs}` : secs}</div>;
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
      <div className="bg-white w-full max-w-2xl rounded-[3rem] p-12 shadow-2xl relative overflow-hidden">
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 transition-colors">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        {step === 'SELECT' ? (
          <div className="animate-in slide-in-from-bottom-4">
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic mb-2">Final Estimation</h2>
            <p className="text-5xl font-black text-indigo-600 tracking-tighter mb-10">₹{total.toFixed(0)}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button onClick={() => handleMethodSelect('CASH')} className="flex items-center gap-4 p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-indigo-400 transition-all group">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm group-hover:bg-emerald-500 group-hover:text-white transition-all">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                </div>
                <div className="text-left"><p className="font-black text-xs uppercase tracking-widest text-slate-400">Method</p><p className="font-black text-lg text-slate-800">Cash Payment</p></div>
              </button>
              <button onClick={() => handleMethodSelect('UPI_QR')} className="flex items-center gap-4 p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-indigo-400 transition-all group">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-amber-500 shadow-sm group-hover:bg-amber-500 group-hover:text-white transition-all">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                </div>
                <div className="text-left"><p className="font-black text-xs uppercase tracking-widest text-slate-400">Method</p><p className="font-black text-lg text-slate-800">UPI QR Scan</p></div>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 animate-in zoom-in-95 duration-500">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=zenith_settlement" className="w-56 h-56 mx-auto mb-8 shadow-2xl rounded-3xl p-4 bg-white border border-slate-100" />
            <h3 className="text-2xl font-black text-slate-900 uppercase italic">Scan to Settle</h3>
            <div className="bg-slate-50 inline-block px-8 py-4 rounded-[2rem] border border-slate-100 mt-6">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Session Active For</p>
              <Timer initialSeconds={300} onEnd={onClose} />
            </div>
            <button onClick={() => onFinalize('UPI_QR')} className="w-full bg-indigo-600 text-white py-6 rounded-2xl font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all mt-8">Confirm Payment</button>
          </div>
        )}
      </div>
    </div>
  );
};

const ReceiptModal: React.FC<{ order: Order; onClose: () => void }> = ({ order, onClose }) => {
  const [restInfo, setRestInfo] = useState({ name: 'Zenith Pro', address: 'Main Hub' });
  useEffect(() => {
    const saved = localStorage.getItem('zenith_restaurant_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      setRestInfo({ name: parsed.restaurantName || 'Zenith Pro', address: parsed.restaurantAddress || 'Main Hub' });
    }
  }, []);
  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div id="receipt-print-area" className="bg-white w-full max-w-sm rounded-[3rem] overflow-hidden shadow-2xl relative flex flex-col items-center p-10 font-mono text-slate-800 border border-slate-100">
        <button onClick={onClose} className="print-hidden absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-all z-20">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <div className="w-full text-center border-b border-dashed border-slate-300 pb-6 mb-6">
          <h2 className="text-2xl font-black uppercase tracking-tighter mb-1">{restInfo.name}</h2>
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">{restInfo.address}</p>
        </div>
        <div className="w-full space-y-4 text-[11px]">
          <div className="flex justify-between"><span>Date:</span><span className="font-bold">{new Date(order.createdAt).toLocaleDateString()}</span></div>
          <div className="flex justify-between"><span>Time:</span><span className="font-bold">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
          <div className="flex justify-between border-b border-dashed border-slate-200 pb-4"><span>Order ID:</span><span className="font-black text-slate-900">#{order.id}</span></div>
          <div className="py-2 space-y-2">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-xs"><span>{item.quantity}x {item.name}</span><span className="font-bold">₹{(item.price * item.quantity).toFixed(0)}</span></div>
            ))}
          </div>
          <div className="border-t border-dashed border-slate-300 pt-4 mt-4">
            <div className="flex justify-between items-center"><span className="text-xs font-black uppercase tracking-widest text-slate-900">Total:</span><span className="text-3xl font-black tracking-tighter text-indigo-600">₹{order.total.toFixed(0)}</span></div>
          </div>
        </div>
        <div className="w-full text-center mt-10"><p className="text-[10px] italic font-medium text-slate-400">"Quality that speaks for itself."</p></div>
        <div className="mt-10 w-full print-hidden"><button onClick={() => window.print()} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl active:scale-95 transition-all">Print Receipt</button></div>
      </div>
    </div>
  );
};

const POS: React.FC<POSProps> = ({ menu, tables, onAddOrder, updateTableStatus, onAddItem, initialTableId, tableCarts, onUpdateTableCart, onClearTableCart, resetTableSelection, orders }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<OrderType>('DINE_IN');
  const [selectedTable, setSelectedTable] = useState<string | null>(initialTableId || null);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [terminalPos, setTerminalPos] = useState({ x: window.innerWidth - 500, y: 120 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const categories = useMemo(() => ['All', ...Array.from(new Set(menu.map(m => m.category)))], [menu]);
  const activeOrdersForTable = useMemo(() => selectedTable ? orders.filter(o => o.tableId === selectedTable && !['COMPLETED', 'CANCELLED'].includes(o.status)) : [], [selectedTable, orders]);
  const placedItems = useMemo(() => activeOrdersForTable.flatMap(o => o.items), [activeOrdersForTable]);
  const placedSubtotal = useMemo(() => activeOrdersForTable.reduce((sum, o) => sum + o.total, 0), [activeOrdersForTable]);

  useEffect(() => {
    if (selectedTable) {
      if (tableCarts[selectedTable]) setCart(tableCarts[selectedTable]);
      else if (activeOrdersForTable.length === 0) setCart([]);
    }
  }, [selectedTable, tableCarts, activeOrdersForTable.length]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - terminalPos.x, y: e.clientY - terminalPos.y };
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isDragging) return;
      setTerminalPos({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
    };
    const onUp = () => setIsDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [isDragging]);

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

  // Fixed finalizeSettlement to include missing properties from type 'Order' (subtotal, tax, discount)
  const finalizeSettlement = (method: PaymentMethod) => {
    const currentSubtotal = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
    const finalItems = orderType === 'DINE_IN' ? placedItems : cart;
    const finalSubtotal = orderType === 'DINE_IN' 
      ? placedItems.reduce((s, i) => s + (i.price * i.quantity), 0)
      : currentSubtotal;
    const finalTax = finalSubtotal * 0.05;
    const finalTotal = finalSubtotal + finalTax;

    const finalOrder: Order = { 
      id: activeOrdersForTable[0]?.id || Math.random().toString(36).substr(2, 6).toUpperCase(), 
      items: finalItems,
      subtotal: finalSubtotal,
      tax: finalTax,
      discount: 0,
      total: finalTotal,
      createdAt: new Date(),
      status: 'COMPLETED',
      paymentMethod: method,
      type: orderType,
      tableId: selectedTable || undefined
    };
    if (selectedTable) { updateTableStatus(selectedTable, 'DIRTY'); setSelectedTable(null); resetTableSelection(); }
    setCart([]);
    setLastOrder(finalOrder);
    setShowPayment(false);
  };

  return (
    <div className="flex h-[calc(100vh-160px)] gap-6 animate-in slide-in-from-bottom-4 duration-500 overflow-hidden relative print:hidden">
      <div className="flex flex-col h-full flex-1">
        <div className="flex items-center gap-6 mb-6">
          <div className="flex-1 flex items-center gap-4 bg-white p-4 rounded-3xl shadow-sm overflow-hidden">
            <div className="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth flex-1 px-2">
              {categories.map(cat => (
                <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest whitespace-nowrap border transition-all ${selectedCategory === cat ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>{cat}</button>
              ))}
            </div>
            <div className="flex gap-2 shrink-0 pl-4">
              <button className="bg-indigo-600 text-white px-8 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">+ Menu Asset</button>
            </div>
          </div>
          <button onClick={() => setIsTerminalOpen(!isTerminalOpen)} className="bg-slate-900 text-white h-full px-8 py-4 rounded-3xl flex items-center gap-3 shadow-xl hover:bg-slate-800 shrink-0 relative">
            <span className="font-black text-[11px] uppercase tracking-widest">POS Terminal</span>
          </button>
        </div>
        <div className="grid gap-4 overflow-y-auto no-scrollbar grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5 pb-20">
          {(selectedCategory === 'All' ? menu : menu.filter(m => m.category === selectedCategory)).map(item => (
            <div key={item.id} onClick={() => addToCart(item)} className="bg-white p-4 rounded-[2rem] border border-slate-200 hover:border-indigo-400 hover:shadow-xl transition-all cursor-pointer group">
              <div className="w-full h-28 rounded-[1.5rem] bg-slate-100 mb-4 overflow-hidden"><img src={item.image} className="w-full h-full object-cover group-hover:scale-110 duration-500" /></div>
              <h4 className="font-bold text-slate-800 text-sm mb-1 truncate">{item.name}</h4>
              <span className="text-indigo-600 font-black text-sm">₹{item.price}</span>
            </div>
          ))}
        </div>
      </div>
      {isTerminalOpen && (
        <div style={{ position: 'fixed', left: `${terminalPos.x}px`, top: `${terminalPos.y}px`, width: '450px', zIndex: 100 }} className="bg-white rounded-[3.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden max-h-[85vh] border-0 animate-in zoom-in-95">
          <div onMouseDown={handleMouseDown} className="p-8 flex items-center justify-between bg-slate-50/50 cursor-grab border-b border-slate-100 shrink-0">
            <h3 className="font-black text-slate-900 uppercase italic tracking-tight leading-none">Active Terminal</h3>
            <button onClick={() => setIsTerminalOpen(false)} className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-6 bg-white">
            <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
               {(['DINE_IN', 'TAKEAWAY'] as OrderType[]).map(type => (
                 <button key={type} onClick={() => setOrderType(type)} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${orderType === type ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>{type.replace('_', ' ')}</button>
               ))}
            </div>
            {orderType === 'DINE_IN' && (
              <div className="grid grid-cols-4 gap-2">
                {tables.map(t => (
                  <button key={t.id} onClick={() => setSelectedTable(t.id)} className={`py-3 rounded-xl text-xs font-black border transition-all ${selectedTable === t.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-white text-slate-600 border-slate-200'}`}>T{t.number}</button>
                ))}
              </div>
            )}
            <div className="space-y-4">
              {placedItems.length > 0 && (
                <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-[2rem] space-y-2">
                  <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">In Kitchen</span>
                  {placedItems.map((i, idx) => <div key={idx} className="flex justify-between text-xs font-bold text-indigo-900"><span>{i.quantity} x {i.name}</span><span>₹{i.price * i.quantity}</span></div>)}
                </div>
              )}
              {cart.map(item => (
                <div key={item.id} className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden"><img src={item.image} className="w-full h-full object-cover" /></div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-black text-xs text-slate-800 truncate">{item.name}</h5>
                    <div className="flex items-center justify-between mt-1"><span className="text-[11px] font-black">₹{item.price * i.quantity}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="p-8 bg-slate-50 border-t border-slate-100 space-y-5">
            <div className="flex justify-between items-end"><span className="text-[10px] font-black uppercase text-slate-400">Total</span><span className="text-3xl font-black text-slate-900 italic">₹{(orderType === 'DINE_IN' ? placedSubtotal : (cart.reduce((s,i)=>s+i.price*i.quantity, 0)*1.05)).toFixed(0)}</span></div>
            {cart.length > 0 && <button onClick={handlePlaceOrder} className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black uppercase text-[11px] shadow-2xl">Dispatch Items</button>}
            <button onClick={() => setShowPayment(true)} className="w-full bg-emerald-600 text-white py-5 rounded-3xl font-black uppercase text-[11px] shadow-xl">Settle Session</button>
          </div>
        </div>
      )}
      {showPayment && <PaymentModal total={orderType === 'DINE_IN' ? placedSubtotal : (cart.reduce((s,i)=>s+i.price*i.quantity, 0)*1.05)} onClose={() => setShowPayment(false)} onFinalize={finalizeSettlement} />}
      {lastOrder && <ReceiptModal order={lastOrder} onClose={() => setLastOrder(null)} />}
    </div>
  );
};
export default POS;
