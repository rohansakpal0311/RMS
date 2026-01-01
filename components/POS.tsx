
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
  initialTableId?: string | null;
  tableCarts: Record<string, CartItem[]>;
  onUpdateTableCart: (tableId: string, items: CartItem[]) => void;
  onClearTableCart: (tableId: string) => void;
  resetTableSelection: () => void;
  orders: Order[];
}

const AddCategoryModal: React.FC<{ onClose: () => void; onAdd: (name: string) => void }> = ({ onClose, onAdd }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-10 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter mb-8 text-center">New Category</h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input 
            autoFocus
            type="text" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:border-indigo-500" 
            placeholder="Category Name (e.g. Seafood)" 
          />
          <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">Create Category</button>
        </form>
      </div>
    </div>
  );
};

const ReceiptModal: React.FC<{ order: Order; onClose: () => void }> = ({ order, onClose }) => {
  const handlePrint = () => { 
    window.print(); 
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div id="receipt-print-area" className="bg-white w-full max-w-sm rounded-[3rem] overflow-hidden shadow-2xl relative flex flex-col items-center">
        
        <button 
          onClick={onClose} 
          className="print-hidden absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shadow-sm hover:bg-slate-200 transition-all active:scale-90 z-20"
          aria-label="Close Receipt"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="w-full p-10 text-center border-b border-dashed border-slate-200 flex flex-col items-center">
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 mb-1">ZENITH PRO</h2>
          <p className="text-[10px] text-indigo-600 font-black uppercase tracking-[0.4em]">Premium Gastronomy</p>
        </div>

        <div className="w-full p-10 space-y-8 flex flex-col">
          <div className="grid grid-cols-2 gap-y-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-6">
            <div className="flex flex-col gap-1 items-start">
               <span className="text-slate-300">Order ID</span>
               <span className="text-slate-900">#{order.id}</span>
            </div>
            <div className="flex flex-col gap-1 items-end text-right">
               <span className="text-slate-300">Location</span>
               <span className="text-slate-900">{order.tableId ? `T${order.tableId.replace('t', '')}` : 'Takeaway'}</span>
            </div>
            <div className="flex flex-col gap-1 col-span-2 items-center pt-2">
               <span className="text-slate-300">Sync Time</span>
               <span className="text-slate-900">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] border-b border-slate-50 pb-2">
               <span>Item Details</span>
               <span>Price</span>
            </div>
            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs items-center group">
                  <span className="text-slate-700 font-bold flex-1">{item.quantity} x {item.name}</span>
                  <span className="text-slate-900 font-black ml-4">₹{(item.price * item.quantity).toFixed(0)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-dashed border-slate-200 space-y-2">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400 font-black uppercase tracking-widest">Subtotal</span>
              <span className="text-slate-800 font-bold">₹{order.subtotal.toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400 font-black uppercase tracking-widest">Tax (5%)</span>
              <span className="text-slate-800 font-bold">₹{order.tax.toFixed(0)}</span>
            </div>
            <div className="flex justify-between items-end pt-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Total Due</span>
                <span className="text-[9px] text-slate-400 font-bold italic">Inc. All Taxes</span>
              </div>
              <span className="text-4xl font-black tracking-tighter text-indigo-600 italic">₹{order.total.toFixed(0)}</span>
            </div>
          </div>

          <div className="bg-slate-50 p-5 rounded-[2rem] border border-slate-100 flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Settlement</span>
              <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest">{order.paymentMethod ? order.paymentMethod.replace('_', ' ') : 'PENDING'}</span>
            </div>
            <div className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center shadow-lg">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
            </div>
          </div>
        </div>

        <div className="w-full p-10 pt-0 text-center space-y-8 flex flex-col items-center">
          <div className="w-full print-hidden">
            <button 
              onClick={handlePrint} 
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl active:scale-95 transition-all hover:bg-slate-800 flex items-center justify-center gap-3"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              Dispatch to Print
            </button>
          </div>
          
          <div className="space-y-3 flex flex-col items-center">
            <div className="w-12 h-[2px] bg-slate-100 rounded-full"></div>
            <p className="text-[10px] font-black text-slate-400 italic leading-relaxed uppercase tracking-tighter px-4">
              "Thank you for choosing Zenith. May your next meal be just as exceptional."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const PaymentModal: React.FC<{ 
  total: number; 
  onClose: () => void; 
  onFinalize: (method: PaymentMethod) => void 
}> = ({ total, onClose, onFinalize }) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const upiLink = `upi://pay?pa=shantanusapkal1694@okicic&pn=Zenith%20Pro&am=${total.toFixed(2)}&cu=INR&tn=OrderPayment`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiLink)}`;

  const handleRazorpayPayment = () => {
    setIsProcessing(true);
    const options = {
      key: 'rzp_test_RyYknkXTiWoel7',
      amount: Math.round(total * 100),
      currency: 'INR',
      name: 'Zenith Pro Restaurant',
      description: 'Order Payment Settlement',
      image: 'https://picsum.photos/seed/zenith/200/200',
      handler: function (response: any) {
        setIsProcessing(false);
        onFinalize('CARD');
      },
      prefill: {
        name: 'Guest Customer',
        email: 'guest@example.com',
        contact: '9999999999'
      },
      theme: {
        color: '#6366f1'
      },
      modal: {
        ondismiss: function() {
          setIsProcessing(false);
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handleConfirm = () => {
    if (!selectedMethod) return;
    if (selectedMethod === 'CARD') {
      handleRazorpayPayment();
    } else {
      onFinalize(selectedMethod);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl relative flex flex-col md:flex-row gap-8">
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="flex-1 space-y-6">
          <div>
            <h4 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic mb-1">Settlement</h4>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Select payment preference</p>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {[
              { id: 'CASH', label: 'Cash Payment', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
              { id: 'CARD', label: 'Card (Razorpay Pro)', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
              { id: 'UPI_QR', label: 'UPI / Scan QR', icon: 'M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01' },
            ].map(m => (
              <button 
                key={m.id}
                onClick={() => setSelectedMethod(m.id as PaymentMethod)}
                className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${selectedMethod === m.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20' : 'bg-slate-50 text-slate-600 border-transparent hover:border-slate-200'}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedMethod === m.id ? 'bg-white/20' : 'bg-white shadow-sm'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={m.icon} /></svg>
                </div>
                <span className="font-black text-xs uppercase tracking-widest">{m.label}</span>
              </button>
            ))}
          </div>

          <div className="pt-6 border-t border-slate-100">
            <div className="flex justify-between items-end mb-6">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Final Payable</span>
              <span className="text-4xl font-black text-indigo-600 tracking-tighter italic">₹{total.toFixed(0)}</span>
            </div>
            <button 
              disabled={!selectedMethod || isProcessing}
              onClick={handleConfirm}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                'Confirm & Settle Bill'
              )}
            </button>
          </div>
        </div>

        <div className="hidden md:flex w-72 bg-slate-50 rounded-[2.5rem] border border-slate-100 items-center justify-center p-8">
           {selectedMethod === 'UPI_QR' ? (
             <div className="text-center space-y-6">
                <div className="bg-white p-4 rounded-[2rem] shadow-xl border border-slate-100">
                  <img src={qrCodeUrl} alt="UPI QR" className="w-full h-auto mix-blend-multiply" />
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 text-indigo-600 italic">Scan with GPay, PhonePe, Paytm</p>
                   <div className="flex justify-center gap-3 opacity-30 grayscale scale-75">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/PhonePe_Logo.svg/1200px-PhonePe_Logo.svg.png" className="h-4" />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" className="h-4" />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Paytm_Logo.qt" className="h-4" />
                   </div>
                </div>
             </div>
           ) : selectedMethod === 'CARD' ? (
             <div className="text-center space-y-6">
                <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mx-auto shadow-xl border border-slate-100">
                   <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Razorpay Integrated</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Secured payment flow enabled for Zenith Pro.</p>
                </div>
             </div>
           ) : selectedMethod === 'CASH' ? (
             <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl rotate-6">
                   <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Collect Physical Cash</p>
             </div>
           ) : (
             <div className="text-center opacity-20">
                <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                <p className="text-[10px] font-black uppercase tracking-widest">Secure Gateway</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

const AddItemModal: React.FC<{ onClose: () => void; onAdd: (item: MenuItem) => void; availableCategories: string[] }> = ({ onClose, onAdd, availableCategories }) => {
  const [formData, setFormData] = useState({ name: '', price: 0, category: availableCategories[0] || 'Main Course', desc: '' });
  const [itemImage, setItemImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setItemImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!formData.name || formData.price <= 0) {
      alert("Please enter valid item details.");
      return;
    }
    onAdd({ 
      ...formData, 
      id: Date.now().toString(), 
      description: formData.desc, 
      image: itemImage || 'https://picsum.photos/seed/food/400/300', 
      available: true, 
      preparationTime: 15 
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter mb-8 text-center">Create Menu Asset</h3>
        
        <div className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-40 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 transition-all overflow-hidden relative group"
            >
              {itemImage ? (
                <img src={itemImage} className="w-full h-full object-cover" />
              ) : (
                <>
                  <svg className="w-10 h-10 text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Item Visual</span>
                </>
              )}
              <div className="absolute inset-0 bg-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
          </div>

          <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium outline-none focus:border-indigo-500" placeholder="Item Entity Name" />
          
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
              <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: parseInt(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-5 py-4 text-sm font-medium outline-none" placeholder="Price" />
            </div>
            <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium outline-none">
              {availableCategories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          
          <button onClick={handleSubmit} className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">Establish Menu Asset</button>
        </div>
      </div>
    </div>
  );
};

const POS: React.FC<POSProps> = ({ 
  menu, tables, onAddOrder, updateTableStatus, onAddItem, initialTableId, 
  tableCarts, onUpdateTableCart, onClearTableCart, resetTableSelection, orders 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<OrderType>('DINE_IN');
  const [selectedTable, setSelectedTable] = useState<string | null>(initialTableId || null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [lastProcessedOrder, setLastProcessedOrder] = useState<Order | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const categories = useMemo(() => {
    const fromMenu = Array.from(new Set(menu.map(m => m.category)));
    return ['All', ...Array.from(new Set([...fromMenu, ...customCategories]))];
  }, [menu, customCategories]);

  const activeOrdersForTable = useMemo(() => {
    if (!selectedTable || orderType !== 'DINE_IN') return [];
    return orders.filter(o => o.tableId === selectedTable && !['COMPLETED', 'CANCELLED'].includes(o.status));
  }, [selectedTable, orders, orderType]);

  const placedItems = useMemo(() => {
    return activeOrdersForTable.flatMap(o => o.items);
  }, [activeOrdersForTable]);

  const placedSubtotal = useMemo(() => {
    return activeOrdersForTable.reduce((sum, o) => sum + o.subtotal, 0);
  }, [activeOrdersForTable]);

  const allOrdersReady = useMemo(() => {
    if (activeOrdersForTable.length === 0) return false;
    return activeOrdersForTable.every(o => ['READY', 'SERVED'].includes(o.status));
  }, [activeOrdersForTable]);

  useEffect(() => {
    if (selectedTable && tableCarts[selectedTable]) {
      setCart(tableCarts[selectedTable]);
    } else if (selectedTable && activeOrdersForTable.length === 0) {
      setCart([]);
    }
  }, [selectedTable]);

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
  const tax = currentTotalSubtotal * 0.05;
  const total = currentTotalSubtotal + tax;

  const handlePlaceOrder = () => {
    if (orderType === 'DINE_IN' && !selectedTable) return alert("Please select a table.");
    if (cart.length === 0) return alert("Add items to place order.");
    
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
  };

  const finalizeSettlement = (method: PaymentMethod) => {
    if (orderType === 'DINE_IN') {
      if (activeOrdersForTable.length === 0) return;
      
      updateTableStatus(selectedTable!, 'DIRTY');
      
      const combinedOrder: Order = {
        id: activeOrdersForTable[0].id,
        tableId: selectedTable!,
        type: 'DINE_IN',
        items: placedItems,
        status: 'COMPLETED',
        subtotal: placedSubtotal,
        tax: placedSubtotal * 0.05,
        discount: 0,
        total: placedSubtotal * 1.05,
        paymentMethod: method,
        createdAt: new Date(),
      };
      
      setLastProcessedOrder(combinedOrder);
      setShowPaymentModal(false);
      setSelectedTable(null);
      resetTableSelection();
    } else {
      const newOrder: Order = {
        id: Math.random().toString(36).substr(2, 6).toUpperCase(),
        type: orderType,
        items: [...cart],
        status: 'PENDING',
        subtotal: cartSubtotal,
        tax: cartSubtotal * 0.05,
        discount: 0,
        total: cartSubtotal * 1.05,
        paymentMethod: method,
        createdAt: new Date(),
      };
      onAddOrder(newOrder);
      setLastProcessedOrder(newOrder);
      setCart([]);
      setShowPaymentModal(false);
    }
  };

  const handleScroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = 200;
      scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex h-[calc(100vh-160px)] gap-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex-1 flex flex-col gap-6">
        <div className="flex items-center gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm relative group/nav">
          {/* Scroll Navigation */}
          <button 
            onClick={() => handleScroll('left')}
            className="hidden group-hover/nav:flex absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur shadow-md z-10 items-center justify-center text-slate-400 hover:text-indigo-600 transition-all border border-slate-100"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
          </button>

          <div ref={scrollRef} className="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth flex-1 px-2">
            {categories.map(cat => (
              <button 
                key={cat} 
                onClick={() => setSelectedCategory(cat)} 
                className={`px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest whitespace-nowrap transition-all border ${selectedCategory === cat ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-105' : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <button 
            onClick={() => handleScroll('right')}
            className="hidden group-hover/nav:flex absolute right-[280px] top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur shadow-md z-10 items-center justify-center text-slate-400 hover:text-indigo-600 transition-all border border-slate-100"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
          </button>

          <div className="flex gap-2 shrink-0 border-l border-slate-100 pl-4">
            <button 
              onClick={() => setShowAddCategory(true)} 
              className="bg-slate-50 text-slate-600 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200 hover:bg-slate-100 transition-all active:scale-95"
            >
              + Category
            </button>
            <button 
              onClick={() => setShowAddItem(true)} 
              className="bg-indigo-600 text-white px-8 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/10 active:scale-95 transition-all"
            >
              + Menu Asset
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 overflow-y-auto pr-2 custom-scrollbar">
          {filteredMenu.map(item => (
            <div key={item.id} onClick={() => addToCart(item)} className="bg-white p-4 rounded-[2rem] border border-slate-200 hover:border-indigo-400 hover:shadow-xl transition-all cursor-pointer group flex flex-col">
              <div className="w-full h-32 rounded-[1.5rem] bg-slate-100 mb-4 overflow-hidden relative">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 duration-500" />
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-black text-slate-800">{item.preparationTime}M</div>
              </div>
              <h4 className="font-bold text-slate-800 text-sm mb-1 truncate px-1">{item.name}</h4>
              <div className="mt-auto flex justify-between items-center px-1">
                <span className="text-indigo-600 font-black tracking-tight text-base">₹{item.price}</span>
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                </div>
              </div>
            </div>
          ))}
          {filteredMenu.length === 0 && (
            <div className="col-span-full py-32 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-dashed border-slate-300 opacity-50">
                <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              </div>
              <p className="text-sm font-black text-slate-300 uppercase tracking-widest">Category Empty</p>
              <p className="text-xs text-slate-400 mt-2">Add assets to this category using 'Create Menu Asset'</p>
            </div>
          )}
        </div>
      </div>

      <div className="w-[420px] bg-white rounded-[3rem] border border-slate-100 shadow-2xl flex flex-col overflow-hidden relative">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between shrink-0">
          <h3 className="font-black text-slate-900 uppercase italic tracking-tight">Active Terminal</h3>
          {activeOrdersForTable.length === 0 && cart.length > 0 && (
            <button onClick={() => { setCart([]); setSelectedTable(null); resetTableSelection(); }} className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline">Reset Selection</button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
          <div className="p-8 pb-4 space-y-6 shrink-0">
            <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100 items-center justify-center">
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
          </div>

          <div className="p-8 pt-0 space-y-5 flex-1 flex flex-col">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Session Summary</label>
            
            {placedItems.length > 0 && (
              <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-[2rem] space-y-3 mb-2 shadow-sm animate-in zoom-in-95">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Kitchen Hub: Active</span>
                  <div className={`w-2 h-2 rounded-full ${allOrdersReady ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-pulse'}`}></div>
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
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em]">Ready for Terminal Input</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex gap-4 group animate-in slide-in-from-right-2 items-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0 shadow-sm"><img src={item.image} className="w-full h-full object-cover" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h5 className="font-black text-xs text-slate-800 truncate tracking-tight">{item.name}</h5>
                        <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-rose-500 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg></button>
                      </div>
                      <div className="flex items-center justify-between mt-1.5">
                        <div className="flex items-center gap-4 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                          <button onClick={() => updateQuantity(item.id, -1)} className="text-slate-400 hover:text-indigo-600 font-black transition-colors">-</button>
                          <span className="text-[11px] font-black text-slate-900">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="text-slate-400 hover:text-indigo-600 font-black transition-colors">+</button>
                        </div>
                        <span className="text-[11px] font-black text-slate-900 tracking-tight">₹{(item.price * item.quantity).toFixed(0)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-8 bg-slate-50/50 border-t border-slate-100 space-y-5 shrink-0 mt-auto">
            <div className="flex justify-between items-end mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Projected Total</span>
              <span className="text-3xl font-black text-slate-900 tracking-tighter italic">₹{total.toFixed(0)}</span>
            </div>

            <div className="space-y-3">
              {orderType === 'DINE_IN' ? (
                <>
                  {cart.length > 0 && (
                    <button onClick={handlePlaceOrder} className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3">
                      Dispatch to Kitchen
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </button>
                  )}
                  
                  {placedItems.length > 0 && (
                    allOrdersReady ? (
                      <button 
                        onClick={() => setShowPaymentModal(true)} 
                        className="w-full bg-emerald-600 text-white py-5 rounded-3xl font-black uppercase tracking-[0.2em] text-[11px] shadow-xl flex items-center justify-center gap-3 animate-bounce"
                      >
                        Initiate Settlement: ₹{(placedSubtotal * 1.05).toFixed(0)}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                      </button>
                    ) : (
                      cart.length === 0 && (
                        <div className="p-5 bg-amber-50 text-amber-600 rounded-[2rem] border border-amber-100 text-center flex flex-col items-center gap-1 shadow-sm">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">Preparation in Progress...</p>
                          <p className="text-[9px] font-bold opacity-60 italic">Payment unlocks when all items are READY</p>
                        </div>
                      )
                    )
                  )}
                </>
              ) : (
                <button 
                  disabled={cart.length === 0}
                  onClick={() => setShowPaymentModal(true)} 
                  className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-30 disabled:grayscale transition-all"
                >
                  Confirm & Finalize: ₹{total.toFixed(0)}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showAddCategory && <AddCategoryModal onClose={() => setShowAddCategory(false)} onAdd={(name) => setCustomCategories(prev => [...prev, name])} />}
      {showAddItem && <AddItemModal onClose={() => setShowAddItem(false)} onAdd={(item) => { onAddItem(item); setShowAddItem(false); }} availableCategories={categories} />}
      {showPaymentModal && <PaymentModal total={orderType === 'DINE_IN' ? placedSubtotal * 1.05 : total} onClose={() => setShowPaymentModal(false)} onFinalize={finalizeSettlement} />}
      {lastProcessedOrder && <ReceiptModal order={lastProcessedOrder} onClose={() => setLastProcessedOrder(null)} />}
    </div>
  );
};

export default POS;
