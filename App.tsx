
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
import Branches from './components/Branches';

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
  const [currentTime, setCurrentTime] = useState<string>('');
  
  const [restSettings, setRestSettings] = useState({
    name: 'Zenith Main Branch',
    logo: 'https://cdn-icons-png.flaticon.com/512/3170/3170733.png'
  });

  const syncRestSettings = useCallback(() => {
    const saved = localStorage.getItem('zenith_restaurant_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      setRestSettings({ 
        name: parsed.restaurantName || 'Zenith Main Branch', 
        logo: parsed.restaurantLogo || 'https://cdn-icons-png.flaticon.com/512/3170/3170733.png' 
      });
    }
  }, []);

  useEffect(() => {
    syncRestSettings();
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

    const handleUpdate = () => syncRestSettings();
    window.addEventListener('zenith_settings_updated', handleUpdate);
    
    return () => {
      clearInterval(timer);
      window.removeEventListener('zenith_settings_updated', handleUpdate);
    };
  }, [syncRestSettings]);

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

  const addNotification = useCallback((message: string, type: 'info' | 'success' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [{ id, message, type }, ...prev]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 8000);
  }, []);

  const handleAddBranch = (name: string, location: string) => {
    const newBranch: Branch = {
      id: 'b' + Date.now(),
      name,
      location,
      revenue: 0,
      active: false
    };
    setBranches([...branches, newBranch]);
    addNotification(`Branch "${name}" added successfully`, 'success');
  };

  const handleDeleteBranch = (id: string) => {
    const branchToDelete = branches.find(b => b.id === id);
    if (branchToDelete?.active) {
      addNotification(`Cannot delete the active branch`, 'info');
      return;
    }
    setBranches(branches.filter(b => b.id !== id));
    addNotification(`Branch "${branchToDelete?.name}" removed`, 'info');
  };

  const handleSwitchBranch = (branchId: string) => {
    setBranches(prev => prev.map(b => ({ ...b, active: b.id === branchId })));
    addNotification(`Switched to ${branches.find(b => b.id === branchId)?.name} branch`, 'info');
  };

  const addOrder = (newOrder: Order) => {
    setOrders(prev => [newOrder, ...prev]);
    addNotification(`Order received for POS #${newOrder.id.slice(0,4)}`, 'success');
  };

  const updateOrderStatus = (id: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const updateTableStatus = (id: string, status: Table['status']) => {
    setTables(prev => prev.map(t => t.id === id ? { ...t, status } : t));
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
      setIsLoggingOut(false);
    }, 1200);
  };

  const handleUpdateItem = (updatedItem: MenuItem) => {
    setMenu(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
    addNotification(`Menu Asset "${updatedItem.name}" updated`, 'success');
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
            onAddItem={(item) => setMenu([item, ...menu])}
            onUpdateItem={handleUpdateItem}
            initialTableId={selectedTableIdForPOS}
            tableCarts={tableCarts}
            onUpdateTableCart={(id, items) => setTableCarts({...tableCarts, [id]: items})}
            onClearTableCart={(id) => { const next = {...tableCarts}; delete next[id]; setTableCarts(next); }}
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
            onAddReservation={(res) => setReservations([...reservations, res])} 
            onUpdateReservation={(res) => setReservations(reservations.map(r => r.id === res.id ? res : r))}
            onDeleteReservation={(id) => setReservations(reservations.filter(r => r.id !== id))}
            onPlaceOrder={(id) => { setSelectedTableIdForPOS(id); setActiveRoute(AppRoute.POS); }}
            menu={menu}
            tableCarts={tableCarts}
            onUpdateTableCart={(id, items) => setTableCarts({...tableCarts, [id]: items})}
          />
        );
      case AppRoute.INVENTORY:
        return <Inventory inventory={inventory} />;
      case AppRoute.REPORTS:
        return <Reports orders={orders} />;
      case AppRoute.BRANCHES:
        return (
          <Branches 
            branches={branches} 
            onSwitch={handleSwitchBranch} 
            onAdd={handleAddBranch} 
            onDelete={handleDeleteBranch} 
          />
        );
      case AppRoute.SETTINGS:
        return <Settings />;
      case AppRoute.EMPLOYMENT:
        return <Employment />;
      case AppRoute.PROFILE:
        return <Profile user={currentUser} onUpdate={setCurrentUser} onSignOut={handleSignOut} />;
      default:
        return <div className="p-8">Module Development Pending</div>;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8f9fc]">
      <Sidebar 
        activeRoute={activeRoute} 
        onNavigate={setActiveRoute} 
        user={currentUser} 
        onSignOut={handleSignOut}
      />
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
        <header className="sticky top-0 z-30 flex items-center justify-between px-10 py-6 bg-white/80 backdrop-blur-xl border-b border-slate-100">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">
              {activeRoute.replace('_', ' ')}
            </h1>
            <div className="h-4 w-[1px] bg-slate-200"></div>
            <div className="flex items-center gap-2 bg-slate-900 px-4 py-1.5 rounded-xl shadow-lg border border-slate-800">
              <span className="text-[10px] font-black text-white uppercase tracking-widest tabular-nums">{currentTime}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 bg-slate-50 pl-2 pr-6 py-2 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
             <div className="w-10 h-10 rounded-xl bg-white p-1.5 shadow-sm border border-slate-50 flex items-center justify-center">
                <img src={restSettings.logo} alt="Brand" className="w-full h-full object-contain" />
             </div>
             <div className="flex flex-col">
                <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest leading-none mb-1">Active Root</span>
                <span className="text-xs font-black text-slate-800 uppercase tracking-widest whitespace-nowrap italic">
                  {restSettings.name}
                </span>
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
