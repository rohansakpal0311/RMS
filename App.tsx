
import React, { useState, useEffect, useCallback } from 'react';
import { AppRoute, Order, MenuItem, Table, InventoryItem, Reservation, User, Branch, CartItem } from './types';
import { INITIAL_MENU, INITIAL_TABLES, INITIAL_INVENTORY } from './mockData';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import POS from './components/POS';
import KDS from './components/KDS';
import TableManager from './components/TableManager';
import Inventory from './components/Inventory';
import Reports from './components/Reports';
import Settings from './components/Settings';
import Employment from './components/Employment';
import Profile from './components/Profile';
import Auth from './components/Auth';
import RealTimeAssistant from './components/RealTimeAssistant';

const INITIAL_BRANCHES: Branch[] = [
  { id: 'b1', name: 'Downtown Zen', location: '7th Ave', revenue: 45200, active: true },
  { id: 'b2', name: 'Zen Zenith Uptown', location: 'Madison Square', revenue: 32100, active: false },
  { id: 'b3', name: 'Zen Coastal', location: 'Pier 39', revenue: 12000, active: false }
];

const App: React.FC = () => {
  const [activeRoute, setActiveRoute] = useState<AppRoute>(AppRoute.DASHBOARD);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>(INITIAL_MENU);
  const [tables, setTables] = useState<Table[]>(INITIAL_TABLES);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [branches, setBranches] = useState<Branch[]>(INITIAL_BRANCHES);
  const [tableCarts, setTableCarts] = useState<Record<string, CartItem[]>>({});
  const [reservations, setReservations] = useState<Reservation[]>([
    { id: 'res1', customerName: 'Rahul Sharma', partySize: 4, tableId: 't4', time: '19:30', status: 'PENDING' }
  ]);
  const [selectedTableIdForPOS, setSelectedTableIdForPOS] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [notifications, setNotifications] = useState<{id: string, message: string, type: 'info' | 'success'}[]>([]);
  const [showAddBranchModal, setShowAddBranchModal] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  // IST Real-time Clock
  useEffect(() => {
    const timer = setInterval(() => {
      const istTime = new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }).format(new Date());
      setCurrentTime(istTime);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const savedOrders = localStorage.getItem('zenith_pro_orders');
    if (savedOrders) setOrders(JSON.parse(savedOrders).map((o: any) => ({...o, createdAt: new Date(o.createdAt)})));
    
    const savedBranches = localStorage.getItem('zenith_pro_branches');
    if (savedBranches) setBranches(JSON.parse(savedBranches));

    const savedUser = localStorage.getItem('zenith_pro_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser({
        ...user,
        shiftStart: new Date(user.shiftStart)
      });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('zenith_pro_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('zenith_pro_branches', JSON.stringify(branches));
  }, [branches]);

  // Global click listener to remove notifications when any button is clicked
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button')) {
        setNotifications([]);
      }
    };
    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, []);

  const addNotification = useCallback((message: string, type: 'info' | 'success' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [{ id, message, type }, ...prev]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 8000);
  }, []);

  const handleSwitchBranch = (branchId: string) => {
    setBranches(prev => prev.map(b => ({ ...b, active: b.id === branchId })));
    addNotification(`Switched to ${branches.find(b => b.id === branchId)?.name} branch`, 'info');
  };

  const handleAddBranch = (name: string, location: string) => {
    const newBranch: Branch = {
      id: 'b' + (branches.length + 1),
      name,
      location,
      revenue: 0,
      active: false
    };
    setBranches(prev => [...prev, newBranch]);
    addNotification(`New branch ${name} added to cluster`, 'success');
  };

  const handleDeleteBranch = (branchId: string) => {
    const branchToDelete = branches.find(b => b.id === branchId);
    if (branchToDelete?.active) {
      addNotification("Cannot delete the active branch node.", "info");
      return;
    }
    if (confirm(`Are you sure you want to decommission the "${branchToDelete?.name}" branch?`)) {
      setBranches(prev => prev.filter(b => b.id !== branchId));
      addNotification(`Branch "${branchToDelete?.name}" has been removed.`, "success");
    }
  };

  const addOrder = (newOrder: Order) => {
    setOrders(prev => [newOrder, ...prev]);
    addNotification(`New order #${newOrder.id.slice(0,4)} received at POS`, 'success');
  };

  const updateOrderStatus = (id: string, status: Order['status']) => {
    setOrders(prev => {
      const order = prev.find(o => o.id === id);
      if (order && order.status !== status) {
        addNotification(`Order #${id.slice(0,4)} status updated to ${status}`, 'info');
      }
      return prev.map(o => o.id === id ? { ...o, status } : o);
    });
  };

  const updateTableStatus = (id: string, status: Table['status']) => {
    setTables(prev => {
      const table = prev.find(t => t.id === id);
      if (table && table.status !== status) {
        addNotification(`Table ${table.number} is now ${status}`, 'info');
      }
      return prev.map(t => t.id === id ? { ...t, status } : t);
    });
  };

  const addReservation = (res: Reservation) => {
    setReservations(prev => [...prev, res]);
    updateTableStatus(res.tableId, 'RESERVED');
    addNotification(`Table reservation for ${res.customerName} confirmed`, 'success');
  };

  const updateReservation = (res: Reservation) => {
    setReservations(prev => {
      const oldRes = prev.find(r => r.id === res.id);
      if (oldRes && oldRes.tableId !== res.tableId) {
        // Change table status if table changed
        updateTableStatus(oldRes.tableId, 'AVAILABLE');
        updateTableStatus(res.tableId, 'RESERVED');
      }
      return prev.map(r => r.id === res.id ? res : r);
    });
    addNotification(`Reservation for ${res.customerName} updated`, 'info');
  };

  const deleteReservation = (id: string) => {
    const res = reservations.find(r => r.id === id);
    if (res) {
      updateTableStatus(res.tableId, 'AVAILABLE');
      setReservations(prev => prev.filter(r => r.id !== id));
      addNotification(`Reservation for ${res.customerName} cancelled`, 'info');
    }
  };

  const handleAddItem = (item: MenuItem) => {
    setMenu(prev => [item, ...prev]);
    addNotification(`Asset "${item.name}" registered to menu catalogue`, 'success');
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('zenith_pro_user', JSON.stringify(user));
  };

  const handleSignOut = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      localStorage.removeItem('zenith_pro_user');
      setCurrentUser(null);
      setActiveRoute(AppRoute.DASHBOARD);
      setTableCarts({});
      setSelectedTableIdForPOS(null);
      setIsLoggingOut(false);
    }, 1200);
  };

  const updateTableCart = (tableId: string, items: CartItem[]) => {
    setTableCarts(prev => ({ ...prev, [tableId]: items }));
  };

  const clearTableCart = (tableId: string) => {
    setTableCarts(prev => {
      const next = { ...prev };
      delete next[tableId];
      return next;
    });
  };

  const handleTablePlaceOrder = (tableId: string) => {
    setSelectedTableIdForPOS(tableId);
    setActiveRoute(AppRoute.POS);
  };

  if (!currentUser) {
    return <Auth onAuthenticated={handleLogin} />;
  }

  const restaurantData = {
    activeOrders: orders.filter(o => !['COMPLETED', 'CANCELLED'].includes(o.status)).length,
    revenue: orders.reduce((sum, o) => sum + o.total, 0),
    occupiedTables: tables.filter(t => t.status === 'OCCUPIED').length,
    availableTables: tables.filter(t => t.status === 'AVAILABLE').length,
  };

  const renderContent = () => {
    switch (activeRoute) {
      case AppRoute.DASHBOARD:
        return <Dashboard orders={orders} menu={menu} systemNotifications={notifications} />;
      case AppRoute.POS:
        return (
          <POS 
            menu={menu} 
            tables={tables} 
            onAddOrder={addOrder} 
            updateTableStatus={updateTableStatus} 
            onAddItem={handleAddItem}
            initialTableId={selectedTableIdForPOS}
            tableCarts={tableCarts}
            onUpdateTableCart={updateTableCart}
            onClearTableCart={clearTableCart}
            resetTableSelection={() => setSelectedTableIdForPOS(null)}
            orders={orders}
          />
        );
      case AppRoute.KDS:
        return <KDS orders={orders} updateOrderStatus={updateOrderStatus} />;
      case AppRoute.TABLES:
        return (
          <TableManager 
            tables={tables} 
            updateTableStatus={updateTableStatus} 
            reservations={reservations} 
            onAddReservation={addReservation} 
            onUpdateReservation={updateReservation}
            onDeleteReservation={deleteReservation}
            onPlaceOrder={handleTablePlaceOrder}
            menu={menu}
            tableCarts={tableCarts}
            onUpdateTableCart={updateTableCart}
          />
        );
      case AppRoute.INVENTORY:
        return <Inventory inventory={inventory} />;
      case AppRoute.REPORTS:
        return <Reports orders={orders} />;
      case AppRoute.SETTINGS:
        return <Settings />;
      case AppRoute.EMPLOYMENT:
        return <Employment />;
      case AppRoute.PROFILE:
        return <Profile user={currentUser} onUpdate={setCurrentUser} onSignOut={handleSignOut} />;
      case AppRoute.BRANCHES:
        return (
          <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">Multi-Branch Ecosystem</h3>
                <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">Manage cross-regional operations</p>
              </div>
              <button 
                onClick={() => setShowAddBranchModal(true)}
                className="bg-indigo-600 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
              >
                + Add Branch
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {branches.map(branch => (
                <div key={branch.id} className={`p-8 rounded-[3rem] border transition-all duration-500 relative overflow-hidden group ${branch.active ? 'bg-[#0f111a] text-white border-slate-800 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)]' : 'bg-white text-slate-900 border-slate-100 shadow-xl shadow-slate-200/50 hover:-translate-y-2'}`}>
                  {branch.active && <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl translate-x-10 -translate-y-10"></div>}
                  
                  <div className="flex justify-between items-start mb-8 relative z-10">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-6 ${branch.active ? 'bg-indigo-600 shadow-lg shadow-indigo-500/30' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1" /></svg>
                    </div>
                    <div className="flex gap-2">
                      {!branch.active && (
                        <button 
                          onClick={() => handleDeleteBranch(branch.id)}
                          className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                          title="Delete Branch"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      )}
                      {branch.active ? (
                        <span className="bg-emerald-500 text-black text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-emerald-500/20">Active Node</span>
                      ) : (
                        <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                      )}
                    </div>
                  </div>
                  <h3 className="text-2xl font-black mb-1 italic tracking-tight">{branch.name}</h3>
                  <p className={`text-xs font-bold uppercase tracking-widest mb-10 ${branch.active ? 'text-slate-500' : 'text-slate-400'}`}>{branch.location}</p>
                  <div className={`flex items-end justify-between pt-8 border-t ${branch.active ? 'border-white/5' : 'border-slate-50'}`}>
                     <div>
                        <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${branch.active ? 'text-slate-600' : 'text-slate-400'}`}>Cycle Revenue</p>
                        <p className="text-3xl font-black tracking-tighter">₹{branch.revenue.toLocaleString()}</p>
                     </div>
                     <button 
                      onClick={() => handleSwitchBranch(branch.id)}
                      disabled={branch.active}
                      className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${branch.active ? 'bg-white/5 text-slate-500 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-lg'}`}
                     >
                       {branch.active ? 'Current' : 'Establish'}
                     </button>
                  </div>
                </div>
              ))}
            </div>

            {showAddBranchModal && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#05060b]/80 backdrop-blur-xl p-4 animate-in fade-in duration-300">
                <div className="bg-white w-full max-w-md rounded-[3rem] p-12 shadow-2xl relative">
                  <button onClick={() => setShowAddBranchModal(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 p-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                  <h3 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter mb-8">Node Provisioning</h3>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target as any;
                    handleAddBranch(form.name.value, form.location.value);
                    setShowAddBranchModal(false);
                  }} className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Entity Identifier</label>
                      <input name="name" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 outline-none focus:border-indigo-500 font-bold" placeholder="e.g. Zen North" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Regional Sector</label>
                      <input name="location" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 outline-none focus:border-indigo-500 font-bold" placeholder="e.g. Times Square" />
                    </div>
                    <button type="submit" className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl active:scale-95 transition-all">Establish Branch</button>
                  </form>
                </div>
              </div>
            )}
          </div>
        );
      default:
        return <div className="p-8 text-slate-500">Module under development...</div>;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8f9fc]">
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-3 pointer-events-none w-full max-w-sm px-4">
        {notifications.map(n => (
          <div key={n.id} className={`px-6 py-4 rounded-3xl shadow-2xl border backdrop-blur-xl animate-in slide-in-from-top-4 duration-500 flex items-center gap-4 ${
            n.type === 'success' ? 'bg-emerald-50 text-white border-emerald-400' : 'bg-white text-slate-800 border-slate-100'
          }`}>
            <div className={`w-2 h-2 rounded-full ${n.type === 'success' ? 'bg-white animate-ping' : 'bg-indigo-500 animate-pulse'}`}></div>
            <p className="text-[10px] font-black uppercase tracking-widest">{n.message}</p>
          </div>
        ))}
      </div>

      {isLoggingOut && (
        <div className="fixed inset-0 z-[100] bg-[#0f111a]/95 backdrop-blur-2xl flex flex-col items-center justify-center text-white space-y-8 animate-in fade-in duration-500">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4-4H3" /></svg>
            </div>
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Terminating Session</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em]">Redirecting to Secure Login...</p>
          </div>
        </div>
      )}
      <Sidebar 
        activeRoute={activeRoute} 
        onNavigate={setActiveRoute} 
        user={currentUser} 
        onSignOut={handleSignOut}
      />
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
        <header className="sticky top-0 z-30 flex items-center justify-between px-10 py-5 bg-white/80 backdrop-blur-xl border-b border-slate-100">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">
              {activeRoute === AppRoute.TABLES ? 'Floor Matrix' : activeRoute.replace('_', ' ')}
            </h1>
            <div className="h-4 w-[1px] bg-slate-200"></div>
            <div className="flex items-center gap-4">
              <div className="relative flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Live Sync Active</span>
              </div>
              
              {/* Real-time IST Display */}
              <div className="flex items-center gap-2 bg-slate-900 px-4 py-1.5 rounded-xl border border-slate-800 shadow-lg group">
                <svg className="w-4 h-4 text-indigo-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-white uppercase tracking-widest tabular-nums">{currentTime}</span>
                  <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest -mt-0.5">Asia/Kolkata</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="flex items-center justify-end gap-2 mb-0.5">
                <span className="text-sm font-black text-slate-900">{currentUser.name}</span>
                <div className="w-5 h-5 bg-amber-400 rounded-md flex items-center justify-center">
                  <span className="text-[9px] font-black text-black">P</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">{currentUser.role} • {branches.find(b => b.active)?.name}</p>
            </div>
            <div 
              onClick={() => setActiveRoute(AppRoute.PROFILE)}
              className="w-12 h-12 rounded-[1rem] bg-slate-100 border-2 border-white shadow-lg overflow-hidden ring-4 ring-indigo-50 cursor-pointer hover:scale-110 transition-transform"
            >
               <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>
        
        <div className="p-10 max-w-[1600px] mx-auto">
          {renderContent()}
        </div>
      </main>
      
      <RealTimeAssistant restaurantData={restaurantData} />
    </div>
  );
};

export default App;
