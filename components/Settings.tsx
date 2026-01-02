
import React, { useState, useRef, useEffect } from 'react';

type SettingsTab = 'Restaurant' | 'Identity' | 'Localization' | 'Finance' | 'Security' | 'Operations' | 'Platforms';

const DUMMY_LOGOS = [
  'https://cdn-icons-png.flaticon.com/512/3170/3170733.png',
  'https://cdn-icons-png.flaticon.com/512/3443/3443394.png',
  'https://cdn-icons-png.flaticon.com/512/706/706164.png',
  'https://cdn-icons-png.flaticon.com/512/2927/2927347.png',
  'https://cdn-icons-png.flaticon.com/512/1046/1046771.png',
  'https://cdn-icons-png.flaticon.com/512/2713/2713931.png'
];

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('Restaurant');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [settings, setSettings] = useState({
    restaurantName: 'Zenith Main Branch',
    restaurantLogo: DUMMY_LOGOS[0],
    restaurantAddress: '7th Ave, Downtown',
    ownerName: 'Vikram Malhotra',
    supportEmail: 'support@zenith.ai',
    mobile: '9999999999',
    aadhar: '123456789012',
    currency: 'INR',
    timezone: 'Asia/Kolkata (IST)',
    gstNumber: '27AAAZP0000A1Z5',
    taxRate: 5,
    rounding: true,
    twoFactorAuth: false,
    auditLogging: true,
    tableAutoRelease: true,
    kdsAlertSound: true,
    terminalMode: 'Ultra-Performance',
    swiggyLink: '',
    zomatoLink: '',
    isSwiggyActive: false,
    isZomatoActive: false,
  });

  useEffect(() => {
    const saved = localStorage.getItem('zenith_restaurant_settings');
    const savedPlatforms = localStorage.getItem('zenith_platform_links');
    
    let combinedSettings = { ...settings };
    if (saved) combinedSettings = { ...combinedSettings, ...JSON.parse(saved) };
    if (savedPlatforms) combinedSettings = { ...combinedSettings, ...JSON.parse(savedPlatforms) };
    
    setSettings(combinedSettings);
  }, []);

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const handleSave = () => {
    setSaveStatus('saving');
    
    const { swiggyLink, zomatoLink, isSwiggyActive, isZomatoActive, ...coreSettings } = settings;
    
    localStorage.setItem('zenith_restaurant_settings', JSON.stringify(coreSettings));
    localStorage.setItem('zenith_platform_links', JSON.stringify({ swiggyLink, zomatoLink, isSwiggyActive, isZomatoActive }));
    
    window.dispatchEvent(new Event('zenith_settings_updated'));
    
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }, 1200);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings(prev => ({ ...prev, restaurantLogo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConnect = (platform: 'Swiggy' | 'Zomato') => {
    const link = platform === 'Swiggy' ? settings.swiggyLink : settings.zomatoLink;
    if (!link) {
      alert(`Please provide a valid ${platform} Merchant URL before connecting.`);
      return;
    }
    setSaveStatus('saving');
    setTimeout(() => {
      setSettings(prev => ({ 
        ...prev, 
        [platform === 'Swiggy' ? 'isSwiggyActive' : 'isZomatoActive']: true 
      }));
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 800);
  };

  const tabs: {id: SettingsTab, label: string, icon: React.ReactNode, color: string, description: string}[] = [
    { id: 'Restaurant', label: 'Restaurant', color: 'text-amber-600', description: 'Global brand identity', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16" /></svg> },
    { id: 'Identity', label: 'Identity', color: 'text-indigo-600', description: 'Ownership & Legal KYC', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
    { id: 'Localization', label: 'Regional', color: 'text-sky-600', description: 'Currency & Timezone', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945" /></svg> },
    { id: 'Finance', label: 'Finance', color: 'text-emerald-600', description: 'GST & Invoicing logic', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg> },
    { id: 'Security', label: 'Security', color: 'text-rose-600', description: 'Access & Protection', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg> },
    { id: 'Operations', label: 'Operations', color: 'text-indigo-600', description: 'Floor & Kitchen logic', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg> },
    { id: 'Platforms', label: '3rd Party', color: 'text-orange-500', description: 'Swiggy & Zomato hub', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> },
  ];

  return (
    <div className="animate-in fade-in duration-500 max-w-7xl mx-auto pb-20">
      <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row h-[750px]">
        
        <div className="w-full md:w-80 bg-slate-50/50 border-r border-slate-100 flex flex-col shrink-0">
          <div className="p-8 pb-4 text-center">
            <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase italic">Configuration</h3>
          </div>
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
            {tabs.map((tab) => (
              <button 
                key={tab.id} 
                onMouseEnter={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 relative group ${
                  activeTab === tab.id 
                    ? 'bg-white shadow-xl text-slate-900 border border-slate-200 scale-105 z-10' 
                    : 'text-slate-500 hover:bg-white/50'
                }`}
              >
                <div className={`${activeTab === tab.id ? tab.color : 'text-slate-400'} transition-transform group-hover:scale-110`}>
                  {tab.icon}
                </div>
                <div className="text-left min-w-0">
                  <span className="font-black text-[10px] uppercase tracking-widest block">{tab.label}</span>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tight truncate block">{tab.description}</span>
                </div>
              </button>
            ))}
          </nav>
          <div className="p-6 border-t border-slate-100">
             <button onClick={handleSave} className="w-full bg-slate-900 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                {saveStatus === 'saving' ? 'Applying...' : saveStatus === 'saved' ? 'Config Saved' : 'Apply Matrix'}
             </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-10 bg-white">
          <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500" key={activeTab}>
            
            {activeTab === 'Restaurant' && (
              <section className="space-y-8">
                <div className="flex flex-col items-center p-8 bg-slate-50 rounded-[3rem] border border-slate-100">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-32 h-32 rounded-[2rem] bg-white border-2 border-dashed border-slate-200 flex items-center justify-center cursor-pointer hover:border-indigo-400 transition-all overflow-hidden relative group mb-4 shadow-sm"
                  >
                    <img src={settings.restaurantLogo} className="w-full h-full object-contain p-4" alt="Logo" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                      <span className="text-[9px] font-black uppercase tracking-widest">Custom Logo</span>
                    </div>
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleLogoChange} className="hidden" accept="image/*" />
                  
                  <div className="w-full space-y-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Select Ready-made Identity</p>
                    <div className="flex justify-center gap-3">
                      {DUMMY_LOGOS.map((logo, i) => (
                        <button 
                          key={i}
                          onClick={() => setSettings({ ...settings, restaurantLogo: logo })}
                          className={`w-12 h-12 rounded-xl border-2 transition-all p-1.5 hover:scale-110 active:scale-95 ${settings.restaurantLogo === logo ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white'}`}
                        >
                          <img src={logo} className="w-full h-full object-contain" alt={`dummy-logo-${i}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Restaurant Legal Name</label>
                     <input className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-indigo-500" value={settings.restaurantName} onChange={e => setSettings({...settings, restaurantName: e.target.value})} />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Base Node Address (32 Chars)</label>
                     <input maxLength={32} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-indigo-500" value={settings.restaurantAddress} onChange={e => setSettings({...settings, restaurantAddress: e.target.value})} />
                   </div>
                </div>
              </section>
            )}

            {activeTab === 'Identity' && (
              <section className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Principal Owner Name</label>
                     <input className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-indigo-500" value={settings.ownerName} onChange={e => setSettings({...settings, ownerName: e.target.value})} />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Authorized Contact (Mobile)</label>
                     <input type="tel" maxLength={10} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-indigo-500" value={settings.mobile} onChange={e => setSettings({...settings, mobile: e.target.value})} />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Root Identity Number (Aadhar)</label>
                     <input maxLength={12} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-indigo-500" value={settings.aadhar} onChange={e => setSettings({...settings, aadhar: e.target.value})} />
                   </div>
                </div>
              </section>
            )}

            {activeTab === 'Localization' && (
              <section className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Currency Format</label>
                     <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-indigo-500" value={settings.currency} onChange={e => setSettings({...settings, currency: e.target.value})}>
                        <option value="INR">₹ Indian Rupee (INR)</option>
                        <option value="USD">$ US Dollar (USD)</option>
                        <option value="EUR">€ Euro (EUR)</option>
                     </select>
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Temporal Alignment (Timezone)</label>
                     <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-indigo-500" value={settings.timezone} onChange={e => setSettings({...settings, timezone: e.target.value})}>
                        <option>Asia/Kolkata (IST)</option>
                        <option>America/New_York (EST)</option>
                        <option>Europe/London (GMT)</option>
                     </select>
                   </div>
                 </div>
              </section>
            )}

            {activeTab === 'Finance' && (
              <section className="space-y-6">
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">GST / VAT Identification</label>
                   <input className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold uppercase outline-none focus:border-indigo-500" value={settings.gstNumber} onChange={e => setSettings({...settings, gstNumber: e.target.value})} />
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Default Tax Rate (%)</label>
                     <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-indigo-500" value={settings.taxRate} onChange={e => setSettings({...settings, taxRate: parseFloat(e.target.value)})} />
                   </div>
                   <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-200 mt-6">
                      <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Auto-Rounding</span>
                      <button 
                        onClick={() => setSettings({...settings, rounding: !settings.rounding})}
                        className={`w-12 h-6 rounded-full transition-colors p-1 flex items-center ${settings.rounding ? 'bg-emerald-500' : 'bg-slate-300'}`}
                      >
                         <div className={`w-4 h-4 bg-white rounded-full transition-transform ${settings.rounding ? 'translate-x-6' : 'translate-x-0'}`}></div>
                      </button>
                   </div>
                 </div>
              </section>
            )}

            {activeTab === 'Security' && (
              <section className="space-y-4">
                 <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-200">
                    <div>
                      <p className="text-sm font-black text-slate-800">Two-Factor Authentication</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">SMS verification for root access</p>
                    </div>
                    <button 
                      onClick={() => setSettings({...settings, twoFactorAuth: !settings.twoFactorAuth})}
                      className={`w-12 h-6 rounded-full transition-colors p-1 flex items-center ${settings.twoFactorAuth ? 'bg-indigo-600' : 'bg-slate-300'}`}
                    >
                       <div className={`w-4 h-4 bg-white rounded-full transition-transform ${settings.twoFactorAuth ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                 </div>
                 <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-200">
                    <div>
                      <p className="text-sm font-black text-slate-800">Terminal Audit Logging</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Track every button press per operator</p>
                    </div>
                    <button 
                      onClick={() => setSettings({...settings, auditLogging: !settings.auditLogging})}
                      className={`w-12 h-6 rounded-full transition-colors p-1 flex items-center ${settings.auditLogging ? 'bg-indigo-600' : 'bg-slate-300'}`}
                    >
                       <div className={`w-4 h-4 bg-white rounded-full transition-transform ${settings.auditLogging ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                 </div>
              </section>
            )}

            {activeTab === 'Operations' && (
              <section className="space-y-4">
                 <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-200">
                    <div>
                      <p className="text-sm font-black text-slate-800">Auto-Release Matrix</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Clear tables on bill settlement</p>
                    </div>
                    <button 
                      onClick={() => setSettings({...settings, tableAutoRelease: !settings.tableAutoRelease})}
                      className={`w-12 h-6 rounded-full transition-colors p-1 flex items-center ${settings.tableAutoRelease ? 'bg-indigo-600' : 'bg-slate-300'}`}
                    >
                       <div className={`w-4 h-4 bg-white rounded-full transition-transform ${settings.tableAutoRelease ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                 </div>
                 <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-200">
                    <div>
                      <p className="text-sm font-black text-slate-800">Acoustic KDS Alerts</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Sound notification on new orders</p>
                    </div>
                    <button 
                      onClick={() => setSettings({...settings, kdsAlertSound: !settings.kdsAlertSound})}
                      className={`w-12 h-6 rounded-full transition-colors p-1 flex items-center ${settings.kdsAlertSound ? 'bg-indigo-600' : 'bg-slate-300'}`}
                    >
                       <div className={`w-4 h-4 bg-white rounded-full transition-transform ${settings.kdsAlertSound ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                 </div>
                 <div className="space-y-2 mt-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Terminal Execution Mode</label>
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-indigo-500" value={settings.terminalMode} onChange={e => setSettings({...settings, terminalMode: e.target.value})}>
                        <option>Ultra-Performance</option>
                        <option>Efficiency Matrix</option>
                        <option>Legacy Support</option>
                    </select>
                 </div>
              </section>
            )}

            {activeTab === 'Platforms' && (
              <section className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                <div className="space-y-8">
                  {/* Swiggy */}
                  <div className="p-8 bg-white border border-slate-100 rounded-[3rem] shadow-xl space-y-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#fc8019]/5 rounded-bl-full group-hover:scale-110 transition-transform"></div>
                    <div className="flex justify-between items-center relative z-10">
                       <div className="flex items-center gap-5">
                          <div className="w-16 h-16 bg-[#fc8019] rounded-2xl flex items-center justify-center shadow-lg shadow-[#fc8019]/20">
                            <img src="https://upload.wikimedia.org/wikipedia/en/thumb/1/12/Swiggy_logo.svg/1200px-Swiggy_logo.svg.png" className="w-10 brightness-0 invert" alt="Swiggy" />
                          </div>
                          <div>
                            <h4 className="text-xl font-black text-slate-800 uppercase italic">Swiggy Merchant</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Connect your delivery channel</p>
                          </div>
                       </div>
                       <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${settings.isSwiggyActive ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                        {settings.isSwiggyActive ? 'Linked' : 'Disconnected'}
                       </div>
                    </div>
                    <div className="flex gap-3 relative z-10">
                      <input 
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:border-[#fc8019]" 
                        placeholder="Swiggy Integration Key or Partner URL..."
                        value={settings.swiggyLink}
                        onChange={e => setSettings({...settings, swiggyLink: e.target.value})}
                      />
                      <button 
                        onClick={() => handleConnect('Swiggy')}
                        className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all active:scale-95 ${settings.isSwiggyActive ? 'bg-slate-100 text-slate-500' : 'bg-[#fc8019] text-white shadow-[#fc8019]/20'}`}
                      >
                        {settings.isSwiggyActive ? 'Update' : 'Connect'}
                      </button>
                    </div>
                  </div>

                  {/* Zomato */}
                  <div className="p-8 bg-white border border-slate-100 rounded-[3rem] shadow-xl space-y-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#cb202d]/5 rounded-bl-full group-hover:scale-110 transition-transform"></div>
                    <div className="flex justify-between items-center relative z-10">
                       <div className="flex items-center gap-5">
                          <div className="w-16 h-16 bg-[#cb202d] rounded-2xl flex items-center justify-center shadow-lg shadow-[#cb202d]/20">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Zomato_Logo.svg/1200px-Zomato_Logo.svg.png" className="w-12 brightness-0 invert" alt="Zomato" />
                          </div>
                          <div>
                            <h4 className="text-xl font-black text-slate-800 uppercase italic">Zomato Partner</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Connect your orders hub</p>
                          </div>
                       </div>
                       <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${settings.isZomatoActive ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                        {settings.isZomatoActive ? 'Linked' : 'Disconnected'}
                       </div>
                    </div>
                    <div className="flex gap-3 relative z-10">
                      <input 
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:border-[#cb202d]" 
                        placeholder="Zomato Integration Key or Partner URL..."
                        value={settings.zomatoLink}
                        onChange={e => setSettings({...settings, zomatoLink: e.target.value})}
                      />
                      <button 
                        onClick={() => handleConnect('Zomato')}
                        className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all active:scale-95 ${settings.isZomatoActive ? 'bg-slate-100 text-slate-500' : 'bg-[#cb202d] text-white shadow-[#cb202d]/20'}`}
                      >
                        {settings.isZomatoActive ? 'Update' : 'Connect'}
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
