
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
    if (seconds <= 0) {
      onEnd();
      return;
    }
    const timer = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [seconds, onEnd]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <div className="text-rose-500 font-black text-2xl tabular-nums">
      {mins}:{secs < 10 ? `0${secs}` : secs}
    </div>
  );
};

const PaymentModal: React.FC<{ 
  total: number; 
  onClose: () => void; 
  onFinalize: (method: PaymentMethod) => void 
}> = ({ total, onClose, onFinalize }) => {
  const [step, setStep] = useState<'SELECT' | 'PROCESSING'>('SELECT');
  const [method, setMethod] = useState<PaymentMethod | null>(null);

  const handleMethodSelect = (m: PaymentMethod) => {
    setMethod(m);
    if (m === 'CASH') {
      onFinalize('CASH');
    } else {
      // Switches to processing view where timer starts immediately
      setStep('PROCESSING');
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] p-12 shadow-2xl relative overflow-hidden">
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 transition-colors">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        {step === 'SELECT' ? (
          <div className="animate-in slide-in-from-bottom-4">
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic mb-2">Final Estimation</h2>
            <p className="text-5xl font-black text-indigo-600 tracking-tighter mb-10">₹{total.toFixed(0)}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button onClick={() => handleMethodSelect('CASH')} className="flex items-center gap-4 p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-indigo-400 hover:bg-indigo-50 transition-all group">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm group-hover:bg-emerald-500 group-hover:text-white transition-all">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                </div>
                <div className="text-left">
                  <p className="font-black text-xs uppercase tracking-widest text-slate-400">Method</p>
                  <p className="font-black text-lg text-slate-800">Cash Payment</p>
                </div>
              </button>

              <button onClick={() => handleMethodSelect('CARD')} className="flex items-center gap-4 p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-indigo-400 hover:bg-indigo-50 transition-all group">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-500 shadow-sm group-hover:bg-blue-500 group-hover:text-white transition-all">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                </div>
                <div className="text-left">
                  <p className="font-black text-xs uppercase tracking-widest text-slate-400">Method</p>
                  <p className="font-black text-lg text-slate-800">Card Payment</p>
                </div>
              </button>

              <button onClick={() => handleMethodSelect('UPI_QR')} className="flex items-center gap-4 p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-indigo-400 hover:bg-indigo-50 transition-all group col-span-1 md:col-span-2">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-amber-500 shadow-sm group-hover:bg-amber-500 group-hover:text-white transition-all">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                </div>
                <div className="text-left">
                  <p className="font-black text-xs uppercase tracking-widest text-slate-400">Method</p>
                  <p className="font-black text-lg text-slate-800">Scan QR (GPay / PhonePe / Paytm)</p>
                </div>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 animate-in zoom-in-95 duration-500">
            {method === 'CARD' && (
              <div className="space-y-8">
                <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                   <svg className="w-12 h-12 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                </div>
                <h3 className="text-2xl font-black text-slate-900 uppercase italic">Insert or Swipe Card</h3>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Awaiting authentication from terminal...</p>
                <div className="bg-slate-50 inline-block px-8 py-4 rounded-[2rem] border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Session Active For</p>
                  <Timer initialSeconds={300} onEnd={onClose} />
                </div>
                <button onClick={() => onFinalize('CARD')} className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all">Manual Override (Success)</button>
              </div>
            )}

            {method === 'UPI_QR' && (
              <div className="space-y-8">
                <div className="bg-white p-6 rounded-[3rem] shadow-2xl border border-slate-100 inline-block relative group">
                  <div className="absolute inset-0 bg-indigo-500/5 rounded-[3rem] blur-2xl group-hover:bg-indigo-500/10 transition-all"></div>
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=zenith_pro_settlement" className="w-56 h-56 relative z-10" alt="Payment QR" />
                </div>
                
                <div className="flex justify-center items-center gap-10">
                   <div className="flex flex-col items-center gap-2 group transition-all">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Google_Pay_Logo.svg/512px-Google_Pay_Logo.svg.png" className="h-10 object-contain drop-shadow-md" alt="GPay" />
                      <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">GPay Available</span>
                   </div>
                   <div className="flex flex-col items-center gap-2 opacity-50 grayscale hover:grayscale-0 transition-all">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/PhonePe_Logo.svg/1200px-PhonePe_Logo.svg.png" className="h-7 object-contain" alt="PhonePe" />
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">PhonePe</span>
                   </div>
                   <div className="flex flex-col items-center gap-2 opacity-50 grayscale hover:grayscale-0 transition-all">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Paytm_Logo_%28standalone%29.svg/1200px-Paytm_Logo_%28standalone%29.svg.png" className="h-7 object-contain" alt="Paytm" />
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Paytm</span>
                   </div>
                </div>

                <h3 className="text-2xl font-black text-slate-900 uppercase italic">Scan to Pay</h3>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs tracking-[0.2em]">Transaction node synchronized</p>
                <div className="bg-slate-50 inline-block px-8 py-4 rounded-[2rem] border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">QR Expiry In</p>
                  <Timer initialSeconds={300} onEnd={onClose} />
                </div>
                <button onClick={() => onFinalize('UPI_QR')} className="w-full bg-indigo-600 text-white py-6 rounded-2xl font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all">Confirm Received</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const ReceiptModal: React.FC<{ order: Order; onClose: () => void }> = ({ order, onClose }) => {
  const [restInfo, setRestInfo] = useState({ name: 'Zenith Pro', address: '7th Ave, Downtown' });

  useEffect(() => {
    const saved = localStorage.getItem('zenith_restaurant_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      setRestInfo({ 
        name: parsed.restaurantName || 'Zenith Pro', 
        address: parsed.restaurantAddress || '7th Ave, Downtown' 
      });
    }
  }, []);

  const handlePrint = () => { 
    window.print(); 
  };

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300 print-hidden">
      <div id="receipt-print-area" className="bg-white w-full max-w-sm rounded-[3rem] overflow-hidden shadow-2xl relative flex flex-col items-center p-10 font-mono text-slate-800 border border-slate-100">
        <button 
          onClick={onClose} 
          className="print-hidden absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shadow-sm hover:bg-slate-200 transition-all z-20"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="w-full text-center border-b border-dashed border-slate-300 pb-6 mb-6">
          <h2 className="text-2xl font-black uppercase tracking-tighter mb-1">{restInfo.name}</h2>
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">{restInfo.address}</p>
        </div>

        <div className="w-full space-y-4 text-[11px]">
          <div className="flex justify-between">
            <span className="font-bold uppercase tracking-widest text-slate-400 text-[9px]">Date:</span>
            <span className="font-bold">{new Date(order.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold uppercase tracking-widest text-slate-400 text-[9px]">Time:</span>
            <span className="font-bold">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold uppercase tracking-widest text-slate-400 text-[9px]">Order ID:</span>
            <span className="font-black text-slate-900">#{order.id}</span>
          </div>
          <div className="flex justify-between border-b border-dashed border-slate-200 pb-4">
            <span className="font-bold uppercase tracking-widest text-slate-400 text-[9px]">Payment:</span>
            <span className="font-black text-indigo-600">{(order.paymentMethod || 'CASH').replace('_', ' ')}</span>
          </div>

          <div className="py-2 space-y-2">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-xs">
                <span className="text-slate-700 font-medium">{item.quantity}x {item.name}</span>
                <span className="font-bold">₹{(item.price * item.quantity).toFixed(0)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-slate-300 pt-4 mt-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black uppercase tracking-widest text-slate-900">Total Amount:</span>
              <span className="text-3xl font-black tracking-tighter text-indigo-600">₹{order.total.toFixed(0)}</span>
            </div>
          </div>
        </div>

        <div className="w-full text-center mt-10 space-y-3">
          <div className="w-12 h-[1px] bg-slate-200 mx-auto"></div>
          <p className="text-[10px] italic font-medium text-slate-400 px-6 leading-relaxed">
            "Bringing Flavors to Life, One Plate at a Time."
          </p>
          <div className="pt-4">
            <p className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-300">Thank You for Visiting</p>
          </div>
        </div>

        <div className="mt-10 w-full print-hidden">
          <button 
            onClick={handlePrint} 
            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl active:scale-95 transition-all hover:bg-slate-800"
          >
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

const AddCategoryModal: React.FC<{ 
  onClose: () => void; 
  onAdd: (name: string) => void; 
}> = ({ onClose, onAdd }) => {
  const [name, setName] = useState('');

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter mb-8 text-center">New Category</h3>
        <div className="space-y-6">
          <input 
            type="text" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none" 
            placeholder="Category Name (e.g. Appetizers)" 
          />
          <button 
            onClick={() => { if(name) { onAdd(name); onClose(); } }} 
            className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
          >
            Add Category
          </button>
        </div>
      </div>
    </div>
  );
};

const ItemModal: React.FC<{ 
  onClose: () => void; 
  onSave: (item: MenuItem) => void; 
  availableCategories: string[];
  initialItem?: MenuItem | null;
}> = ({ onClose, onSave, availableCategories, initialItem }) => {
  const [formData, setFormData] = useState({ 
    name: initialItem?.name || '', 
    price: initialItem?.price || 0, 
    category: initialItem?.category || availableCategories[1] || 'Main Course', 
    desc: initialItem?.description || '' 
  });

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter mb-8 text-center">{initialItem ? 'Update Item' : 'Add Item'}</h3>
        <div className="space-y-6">
          <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none" placeholder="Item Name" />
          <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: parseInt(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none" placeholder="Price" />
          <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none">
            {availableCategories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button onClick={() => onSave({ ...formData, id: initialItem?.id || Date.now().toString(), description: formData.desc, image: initialItem?.image || 'https://picsum.photos/seed/food/400/300', available: true, preparationTime: 15 })} className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">Save Asset</button>
        </div>
      </div>
    </div>
  );
};

const POS: React.FC<POSProps> = ({ 
  menu, tables, onAddOrder, updateTableStatus, onAddItem, onUpdateItem, initialTableId, 
  tableCarts, onUpdateTableCart, onClearTableCart, resetTableSelection, orders 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<OrderType>('DINE_IN');
  const [selectedTable, setSelectedTable] = useState<string | null>(initialTableId || null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<MenuItem | null>(null);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [lastProcessedOrder, setLastProcessedOrder] = useState<Order | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // DRAGGABLE TERMINAL STATE
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [terminalPos, setTerminalPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartOffset = useRef({ x: 0, y: 0 });
  const terminalRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const categories = useMemo(() => {
    const fromMenu = Array.from(new Set(menu.map(m => m.category)));
    return ['All', ...Array.from(new Set([...fromMenu, ...customCategories]))];
  }, [menu, customCategories]);

  const activeOrdersForTable = useMemo(() => {
    if (!selectedTable || orderType !== 'DINE_IN') return [];
    return orders.filter(o => o.tableId === selectedTable && !['COMPLETED', 'CANCELLED'].includes(o.status));
  }, [selectedTable, orders, orderType]);

  const placedItems = useMemo(() => activeOrdersForTable.flatMap(o => o.items), [activeOrdersForTable]);
  const placedSubtotal = useMemo(() => activeOrdersForTable.reduce((sum, o) => sum + o.total, 0), [activeOrdersForTable]);
  const allOrdersReady = useMemo(() => activeOrdersForTable.length > 0 && activeOrdersForTable.every(o => ['READY', 'SERVED'].includes(o.status)), [activeOrdersForTable]);

  useEffect(() => {
    if (selectedTable && tableCarts[selectedTable]) {
      setCart(tableCarts[selectedTable]);
    } else if (selectedTable && activeOrdersForTable.length === 0) {
      setCart([]);
    }
  }, [selectedTable, tableCarts, activeOrdersForTable.length]);

  // Set terminal to a visible center-right position initially
  useEffect(() => {
    if (isTerminalOpen && terminalPos.x === 0 && terminalPos.y === 0) {
      setTerminalPos({ x: window.innerWidth - 500, y: 120 });
    }
  }, [isTerminalOpen]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (terminalRef.current) {
      setIsDragging(true);
      dragStartOffset.current = {
        x: e.clientX - terminalPos.x,
        y: e.clientY - terminalPos.y
      };
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        // Enforce boundary constraints
        const newX = Math.max(0, Math.min(window.innerWidth - 450, e.clientX - dragStartOffset.current.x));
        const newY = Math.max(0, Math.min(window.innerHeight - 500, e.clientY - dragStartOffset.current.y));
        setTerminalPos({ x: newX, y: newY });
      }
    };
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const filteredMenu = selectedCategory === 'All' ? menu : menu.filter(m => m.category === selectedCategory);

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      let next = existing ? prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i) : [...prev, { ...item, quantity: 1 }];
      if (orderType === 'DINE_IN' && selectedTable) onUpdateTableCart(selectedTable, next);
      return next;
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => {
      const next = prev.filter(i => i.id !== id);
      if (orderType === 'DINE_IN' && selectedTable) onUpdateTableCart(selectedTable, next);
      return next;
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => {
      const next = prev.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i);
      if (orderType === 'DINE_IN' && selectedTable) onUpdateTableCart(selectedTable, next);
      return next;
    });
  };

  const cartSubtotal = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  const currentTotalSubtotal = cartSubtotal + placedSubtotal;
  const total = currentTotalSubtotal * 1.05;

  const handlePlaceOrder = () => {
    if (orderType === 'DINE_IN' && !selectedTable) return;
    if (cart.length === 0) return;
    
    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 6).toUpperCase(),
      tableId: selectedTable || undefined,
      type: orderType,
      items: [...cart],
      status: 'PENDING',
      subtotal: cartSubtotal,
      tax: cartSubtotal * 0.05,
      discount: 0,
      total: cartSubtotal * 1.05,
      createdAt: new Date(),
    };

    onAddOrder(newOrder);
    if (selectedTable) {
      updateTableStatus(selectedTable, 'OCCUPIED');
      onClearTableCart(selectedTable);
    }
    setCart([]);
    setIsTerminalOpen(false); 
  };

  const handleOpenPayment = () => {
    setIsTerminalOpen(false); 
    setShowPaymentModal(true);
  };

  const finalizeSettlement = (method: PaymentMethod) => {
    let finalOrder: Order;
    if (orderType === 'DINE_IN' && selectedTable) {
      updateTableStatus(selectedTable, 'DIRTY');
      const tableOrder = activeOrdersForTable[0];
      finalOrder = {
        ...tableOrder,
        id: tableOrder?.id || Math.random().toString(36).substr(2, 6).toUpperCase(),
        status: 'COMPLETED',
        paymentMethod: method,
        items: placedItems,
        total: placedSubtotal * 1.05,
        createdAt: new Date()
      };
      setSelectedTable(null);
      resetTableSelection();
    } else {
      finalOrder = {
        id: Math.random().toString(36).substr(2, 6).toUpperCase(),
        type: orderType,
        items: [...cart],
        status: 'COMPLETED',
        subtotal: cartSubtotal,
        tax: cartSubtotal * 0.05,
        discount: 0,
        total: cartSubtotal * 1.05,
        paymentMethod: method,
        createdAt: new Date(),
      };
      setCart([]);
    }
    setLastProcessedOrder(finalOrder);
    setShowPaymentModal(false);
  };

  return (
    <div className="flex h-[calc(100vh-160px)] gap-6 animate-in slide-in-from-bottom-4 duration-500 overflow-hidden relative">
      
      {/* Left Column: Interactive Menu Area (Always visible) */}
      <div className={`flex flex-col transition-all duration-500 h-full flex-1`}>
        <div className="flex items-center gap-6 mb-6">
          <div className="flex-1 flex items-center gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div ref={scrollRef} className="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth flex-1 px-2">
              {categories.map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setSelectedCategory(cat)} 
                  className={`px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest whitespace-nowrap transition-all border ${selectedCategory === cat ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex gap-2 shrink-0 pl-4">
              <button onClick={() => setShowAddCategory(true)} className="bg-slate-50 text-slate-600 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200 hover:bg-slate-100 transition-all">+ Category</button>
              <button onClick={() => { setItemToEdit(null); setShowItemModal(true); }} className="bg-indigo-600 text-white px-8 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">+ Menu Asset</button>
            </div>
          </div>

          <button 
            onClick={() => setIsTerminalOpen(!isTerminalOpen)}
            className="bg-slate-900 text-white h-full px-8 py-4 rounded-3xl flex items-center gap-3 shadow-xl hover:bg-slate-800 transition-all active:scale-95 group shrink-0 relative"
          >
            <svg className="w-6 h-6 text-indigo-400 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            <span className="font-black text-[11px] uppercase tracking-widest">{isTerminalOpen ? 'Dock Terminal' : 'Active Terminal'}</span>
            {(cart.length + placedItems.length) > 0 && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center text-[10px] font-black ring-4 ring-[#f8f9fc]">
                {cart.length + (placedItems.length > 0 ? 1 : 0)}
              </div>
            )}
          </button>
        </div>

        <div className={`grid gap-4 overflow-y-auto pr-2 no-scrollbar pb-20 grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5`}>
          {filteredMenu.map(item => (
            <div key={item.id} onClick={() => addToCart(item)} className="bg-white p-4 rounded-[2rem] border border-slate-200 hover:border-indigo-400 hover:shadow-xl transition-all cursor-pointer group flex flex-col relative h-fit text-left">
              <button onClick={(e) => { e.stopPropagation(); setItemToEdit(item); setShowItemModal(true); }} className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/90 backdrop-blur shadow-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-indigo-600 hover:text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              </button>
              <div className="w-full h-28 rounded-[1.5rem] bg-slate-100 mb-4 overflow-hidden">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 duration-500" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm mb-1 truncate px-1">{item.name}</h4>
              <div className="mt-auto flex justify-between items-center px-1">
                <span className="text-indigo-600 font-black tracking-tight text-sm">₹{item.price}</span>
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Draggable Active Terminal */}
      {isTerminalOpen && (
        <div 
          ref={terminalRef}
          style={{ 
            position: 'fixed', 
            left: `${terminalPos.x}px`, 
            top: `${terminalPos.y}px`,
            width: '450px',
            zIndex: 100,
            cursor: isDragging ? 'grabbing' : 'default'
          }}
          className="bg-white rounded-[3.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 max-h-[85vh]"
        >
          {/* Draggable Header Handle */}
          <div 
            onMouseDown={handleMouseDown}
            className="p-8 border-b border-slate-50 flex items-center justify-between shrink-0 bg-slate-50/50 cursor-grab active:cursor-grabbing"
          >
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-900/20">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
               </div>
               <div>
                 <h3 className="font-black text-slate-900 uppercase italic tracking-tight leading-none">Active Terminal</h3>
                 <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Hold & Drag to Move</p>
               </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <button 
                onClick={() => setIsTerminalOpen(false)}
                className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors shadow-sm hover:shadow-md"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col p-8 space-y-6 bg-white">
            <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
               {(['DINE_IN', 'TAKEAWAY', 'DELIVERY'] as OrderType[]).map(type => (
                 <button 
                  key={type} 
                  onClick={() => { setOrderType(type); if(type!=='DINE_IN') setSelectedTable(null); }} 
                  className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-center ${orderType === type ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                  {type.replace('_', ' ')}
                 </button>
               ))}
            </div>

            {orderType === 'DINE_IN' && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 text-center">Floor Matrix Nodes</label>
                <div className="grid grid-cols-4 gap-2">
                  {tables.map(t => (
                    <button key={t.id} onClick={() => setSelectedTable(t.id)} className={`py-3 rounded-xl text-xs font-black border transition-all ${selectedTable === t.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : tableCarts[t.id] ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}>T{t.number}</button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Session Summary</label>
              
              {placedItems.length > 0 && (
                <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-[2rem] space-y-2 mb-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">In Preparation</span>
                    <div className={`w-2 h-2 rounded-full ${allOrdersReady ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`}></div>
                  </div>
                  {placedItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs font-bold text-indigo-900 opacity-80">
                      <span>{item.quantity} x {item.name}</span>
                      <span className="font-black">₹{(item.price * item.quantity).toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-4">
                {cart.length === 0 && placedItems.length === 0 ? (
                  <div className="py-20 flex flex-col items-center justify-center text-slate-300 opacity-60">
                    <p className="text-[10px] font-black uppercase tracking-widest tracking-[0.3em]">No Active Line Items</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="flex gap-4 items-center animate-in slide-in-from-right-2">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0"><img src={item.image} className="w-full h-full object-cover" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h5 className="font-black text-xs text-slate-800 truncate tracking-tight">{item.name}</h5>
                          <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-rose-500"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg></button>
                        </div>
                        <div className="flex items-center justify-between mt-1.5">
                          <div className="flex items-center gap-4 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 text-[11px] font-black">
                            <button onClick={() => updateQuantity(item.id, -1)} className="hover:text-indigo-600">-</button>
                            <span>{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="hover:text-indigo-600">+</button>
                          </div>
                          <span className="text-[11px] font-black text-slate-900">₹{(item.price * item.quantity).toFixed(0)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="p-8 bg-slate-50 border-t border-slate-100 space-y-5 mt-auto">
            <div className="flex justify-between items-end mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Session Subtotal</span>
              <span className="text-3xl font-black text-slate-900 tracking-tighter italic">₹{total.toFixed(0)}</span>
            </div>
            <div className="space-y-3">
              {orderType === 'DINE_IN' ? (
                <>
                  {cart.length > 0 && (
                    <button onClick={handlePlaceOrder} className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl active:scale-95 transition-all">
                      Dispatch to Kitchen
                    </button>
                  )}
                  {placedItems.length > 0 && (
                    <button 
                      onClick={handleOpenPayment} 
                      disabled={!allOrdersReady && placedItems.length > 0}
                      className="w-full bg-emerald-600 text-white py-5 rounded-3xl font-black uppercase tracking-[0.2em] text-[11px] shadow-xl disabled:opacity-50"
                    >
                      Settle: ₹{(placedSubtotal * 1.05).toFixed(0)}
                    </button>
                  )}
                </>
              ) : (
                <button 
                  disabled={cart.length === 0} 
                  onClick={handleOpenPayment} 
                  className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl active:scale-[0.98] disabled:opacity-30"
                >
                  Proceed to Settle
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showAddCategory && <AddCategoryModal onClose={() => setShowAddCategory(false)} onAdd={(name) => setCustomCategories(prev => [...prev, name])} />}
      {showItemModal && (
        <ItemModal 
          onClose={() => { setShowItemModal(false); setItemToEdit(null); }} 
          onSave={(item) => { itemToEdit ? onUpdateItem?.(item) : onAddItem(item); setShowItemModal(false); }} 
          availableCategories={categories} 
          initialItem={itemToEdit}
        />
      )}
      {showPaymentModal && <PaymentModal total={orderType === 'DINE_IN' ? placedSubtotal * 1.05 : total} onClose={() => setShowPaymentModal(false)} onFinalize={finalizeSettlement} />}
      {lastProcessedOrder && <ReceiptModal order={lastProcessedOrder} onClose={() => setLastProcessedOrder(null)} />}
    </div>
  );
};

export default POS;
