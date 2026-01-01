
import React, { useState } from 'react';

type SettingsTab = 'Identity' | 'Localization' | 'Finance' | 'Security' | 'Cloud' | 'Operations' | 'Delivery';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('Identity');
  const [settings, setSettings] = useState({
    restaurantName: 'Zenith Main Branch',
    supportEmail: 'support@zenith.ai',
    autoKOT: true,
    gstCompliance: true,
    inventoryAlerts: true,
    loyaltyProgram: false,
    currency: 'INR',
    taxRate: 5,
    kitchenAlertSound: true,
    displayOrderDuration: 15, // minutes
    timezone: 'IST',
    rounding: true,
    twoFactorAuth: false,
    auditLogging: true,
    cloudAutoBackup: true,
    syncFrequency: '60', // minutes
    dataPrivacyMode: 'Standard',
    swiggyLinked: false,
    zomatoLinked: false,
    swiggyLink: '',
    zomatoLink: '',
    autoAcceptDelivery: true,
  });

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [backupStatus, setBackupStatus] = useState<'idle' | 'backing_up' | 'completed'>('idle');
  const [linkingPlatform, setLinkingPlatform] = useState<string | null>(null);

  const handleSave = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }, 1500);
  };

  const handleManualBackup = () => {
    setBackupStatus('backing_up');
    setTimeout(() => {
      setBackupStatus('completed');
      setTimeout(() => setBackupStatus('idle'), 3000);
    }, 2500);
  };

  const validateLink = (link: string, platform: 'swiggy' | 'zomato') => {
    if (!link) return false;
    const urlPattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
      '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    
    if (!urlPattern.test(link)) return false;
    if (!link.startsWith('https://')) return false;

    if (platform === 'swiggy' && !link.toLowerCase().includes('swiggy.com')) return false;
    if (platform === 'zomato' && !link.toLowerCase().includes('zomato.com')) return false;

    return true;
  };

  const handleLinkPlatform = (platform: 'swiggyLinked' | 'zomatoLinked') => {
    const linkKey = platform === 'swiggyLinked' ? 'swiggyLink' : 'zomatoLink';
    const platformName = platform === 'swiggyLinked' ? 'swiggy' : 'zomato';
    
    if (!settings[platform]) {
      const currentLink = settings[linkKey];
      if (!validateLink(currentLink, platformName as 'swiggy' | 'zomato')) {
        alert(`Link is not operational. Please provide a verified HTTPS link for ${platformName.toUpperCase()}.`);
        return;
      }
    }

    setLinkingPlatform(platform === 'swiggyLinked' ? 'Swiggy' : 'Zomato');
    setTimeout(() => {
      setSettings(prev => ({ ...prev, [platform]: !prev[platform] }));
      setLinkingPlatform(null);
    }, 1500);
  };

  const resetToDefaults = () => {
    if(confirm('Reset all system configurations to factory defaults?')) {
      setSettings({
        restaurantName: 'Zenith Main Branch',
        supportEmail: 'support@zenith.ai',
        autoKOT: true,
        gstCompliance: true,
        inventoryAlerts: true,
        loyaltyProgram: false,
        currency: 'INR',
        taxRate: 5,
        kitchenAlertSound: true,
        displayOrderDuration: 15,
        timezone: 'IST',
        rounding: true,
        twoFactorAuth: false,
        auditLogging: true,
        cloudAutoBackup: true,
        syncFrequency: '60',
        dataPrivacyMode: 'Standard',
        swiggyLinked: false,
        zomatoLinked: false,
        swiggyLink: '',
        zomatoLink: '',
        autoAcceptDelivery: true,
      });
    }
  };

  const toggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleInputChange = (key: keyof typeof settings, value: string | number | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const tabs: {id: SettingsTab, label: string, icon: React.ReactNode, color: string}[] = [
    { id: 'Identity', label: 'Identity', color: 'text-indigo-600', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1" /></svg> },
    { id: 'Localization', label: 'Regional', color: 'text-sky-600', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { id: 'Finance', label: 'Billing', color: 'text-emerald-600', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg> },
    { id: 'Delivery', label: 'Deliver', color: 'text-orange-600', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9a1 1 0 01-1-1V5a1 1 0 011-1h2a1 1 0 011 1v11z" /></svg> },
    { id: 'Security', label: 'Security', color: 'text-rose-600', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg> },
    { id: 'Cloud', label: 'Cloud', color: 'text-blue-600', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg> },
    { id: 'Operations', label: 'Operations', color: 'text-amber-600', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg> }
  ];

  return (
    <div className="animate-in fade-in duration-500 max-w-7xl mx-auto pb-20">
      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row h-[700px]">
        
        <div className="w-full md:w-72 bg-slate-50/50 border-r border-slate-100 flex flex-col shrink-0">
          <div className="p-8 pb-4">
            <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase italic">Settings</h3>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {tabs.map((tab) => (
              <button 
                key={tab.id} 
                onMouseEnter={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${
                  activeTab === tab.id 
                    ? 'bg-white shadow-md text-slate-900 border border-slate-200' 
                    : 'text-slate-500 hover:bg-white/50 hover:translate-x-1'
                }`}
              >
                <div className={`${activeTab === tab.id ? tab.color : 'text-slate-400'} transition-transform group-hover:scale-110`}>
                  {tab.icon}
                </div>
                <span className="font-black text-[10px] uppercase tracking-widest">{tab.label}</span>
              </button>
            ))}
          </nav>
          <div className="p-6 border-t border-slate-100">
             <button onClick={handleSave} className="w-full bg-slate-900 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                {saveStatus === 'saving' ? 'Saving...' : 'Apply Changes'}
             </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-10 bg-white relative">
          <div className="max-w-3xl mx-auto space-y-10 animate-in fade-in duration-500" key={activeTab}>
            {activeTab === 'Identity' && (
              <section className="space-y-8">
                <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                  <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16" /></svg>
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">Restaurant Identity</h4>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 block mb-2 uppercase tracking-widest">Brand Name</label>
                    <input className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold" value={settings.restaurantName} onChange={e => handleInputChange('restaurantName', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 block mb-2 uppercase tracking-widest">Master Email</label>
                    <input className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold" value={settings.supportEmail} onChange={e => handleInputChange('supportEmail', e.target.value)} />
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'Localization' && (
              <section className="space-y-8">
                <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                  <div className="w-14 h-14 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945" /></svg>
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-slate-900 uppercase italic">Regional Settings</h4>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 block mb-2 uppercase tracking-widest">Currency Code</label>
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold" value={settings.currency} onChange={e => handleInputChange('currency', e.target.value)}>
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 block mb-2 uppercase tracking-widest">Timezone</label>
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold" value={settings.timezone} onChange={e => handleInputChange('timezone', e.target.value)}>
                      <option value="IST">Asia/Kolkata (IST)</option>
                      <option value="UTC">Universal Coordinated Time (UTC)</option>
                    </select>
                  </div>
                  <div onClick={() => toggle('rounding')} className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer">
                    <span className="text-sm font-black uppercase text-slate-700">Cash Rounding</span>
                    <div className={`w-12 h-6 rounded-full transition-colors p-1 ${settings.rounding ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${settings.rounding ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'Finance' && (
              <section className="space-y-8">
                 <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                  <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2" /></svg>
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-slate-900 uppercase italic">Billing & Taxes</h4>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-6">
                   <div>
                    <label className="text-[10px] font-black text-slate-400 block mb-2 uppercase tracking-widest">Tax Percentage (%)</label>
                    <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold" value={settings.taxRate} onChange={e => handleInputChange('taxRate', parseInt(e.target.value))} />
                  </div>
                  <div onClick={() => toggle('gstCompliance')} className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer">
                    <span className="text-sm font-black uppercase text-slate-700">GST Compliance Reporting</span>
                    <div className={`w-12 h-6 rounded-full transition-colors p-1 ${settings.gstCompliance ? 'bg-emerald-600' : 'bg-slate-300'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${settings.gstCompliance ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'Security' && (
              <section className="space-y-8">
                 <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                  <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-slate-900 uppercase italic">Access Controls</h4>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-6">
                   <div onClick={() => toggle('twoFactorAuth')} className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer">
                    <span className="text-sm font-black uppercase text-slate-700">Multi-Factor Authentication</span>
                    <div className={`w-12 h-6 rounded-full transition-colors p-1 ${settings.twoFactorAuth ? 'bg-rose-600' : 'bg-slate-300'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${settings.twoFactorAuth ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </div>
                  </div>
                  <div onClick={() => toggle('auditLogging')} className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer">
                    <span className="text-sm font-black uppercase text-slate-700">Real-time Audit Logs</span>
                    <div className={`w-12 h-6 rounded-full transition-colors p-1 ${settings.auditLogging ? 'bg-rose-600' : 'bg-slate-300'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${settings.auditLogging ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'Delivery' && (
              <section className="space-y-10">
                <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                  <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9a1 1 0 01-1-1V5a1 1 0 011-1h2a1 1 0 011 1v11z" /></svg>
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-slate-900 uppercase italic">Delivery Hub</h4>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className={`p-8 rounded-[3rem] border transition-all ${settings.swiggyLinked ? 'bg-orange-50/40 border-orange-200' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="flex justify-between items-center mb-6">
                      <span className="font-black text-orange-600 text-xs tracking-widest">SWIGGY</span>
                      <div className={`w-2 h-2 rounded-full ${settings.swiggyLinked ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                    </div>
                    <div className="mb-6">
                      <label className="text-[10px] font-black text-slate-400 block mb-2 uppercase tracking-widest">Portal Link</label>
                      <input 
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-orange-500 disabled:opacity-50" 
                        placeholder="https://www.swiggy.com/..."
                        value={settings.swiggyLink}
                        onChange={e => handleInputChange('swiggyLink', e.target.value)}
                        disabled={settings.swiggyLinked}
                      />
                    </div>
                    <button onClick={() => handleLinkPlatform('swiggyLinked')} className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${settings.swiggyLinked ? 'bg-white text-orange-600 border border-orange-200' : 'bg-orange-600 text-white'}`}>
                      {linkingPlatform === 'Swiggy' ? 'Linking...' : settings.swiggyLinked ? 'Disconnect' : 'Connect Swiggy'}
                    </button>
                  </div>

                  <div className={`p-8 rounded-[3rem] border transition-all ${settings.zomatoLinked ? 'bg-rose-50/40 border-rose-200' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="flex justify-between items-center mb-6">
                      <span className="font-black text-rose-600 text-xs tracking-widest">ZOMATO</span>
                      <div className={`w-2 h-2 rounded-full ${settings.zomatoLinked ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                    </div>
                    <div className="mb-6">
                      <label className="text-[10px] font-black text-slate-400 block mb-2 uppercase tracking-widest">Portal Link</label>
                      <input 
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-rose-500 disabled:opacity-50" 
                        placeholder="https://www.zomato.com/..."
                        value={settings.zomatoLink}
                        onChange={e => handleInputChange('zomatoLink', e.target.value)}
                        disabled={settings.zomatoLinked}
                      />
                    </div>
                    <button onClick={() => handleLinkPlatform('zomatoLinked')} className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${settings.zomatoLinked ? 'bg-white text-rose-600 border border-rose-200' : 'bg-rose-600 text-white'}`}>
                      {linkingPlatform === 'Zomato' ? 'Linking...' : settings.zomatoLinked ? 'Disconnect' : 'Connect Zomato'}
                    </button>
                  </div>
                </div>
                
                <div onClick={() => toggle('autoAcceptDelivery')} className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer">
                  <span className="text-sm font-black uppercase text-slate-700">Auto-Accept Third Party Orders</span>
                  <div className={`w-12 h-6 rounded-full transition-colors p-1 ${settings.autoAcceptDelivery ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${settings.autoAcceptDelivery ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'Cloud' && (
              <section className="space-y-8">
                 <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-slate-900 uppercase italic">Cloud Sync</h4>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-6">
                   <div onClick={() => toggle('cloudAutoBackup')} className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer">
                    <span className="text-sm font-black uppercase text-slate-700">Continuous Cloud Sync</span>
                    <div className={`w-12 h-6 rounded-full transition-colors p-1 ${settings.cloudAutoBackup ? 'bg-blue-600' : 'bg-slate-300'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${settings.cloudAutoBackup ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </div>
                  </div>
                  <button onClick={handleManualBackup} disabled={backupStatus==='backing_up'} className="w-full bg-slate-50 border border-slate-100 py-6 rounded-2xl text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-white transition-all">
                     {backupStatus === 'backing_up' ? 'Encrypting & Uploading...' : backupStatus === 'completed' ? 'Vault Updated Successfully' : 'Initiate Emergency Backup'}
                  </button>
                </div>
              </section>
            )}

            {activeTab === 'Operations' && (
              <section className="space-y-8">
                 <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                  <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-slate-900 uppercase italic">Floor Operations</h4>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-6">
                   <div onClick={() => toggle('kitchenAlertSound')} className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer">
                    <span className="text-sm font-black uppercase text-slate-700">KDS Audio Feedback</span>
                    <div className={`w-12 h-6 rounded-full transition-colors p-1 ${settings.kitchenAlertSound ? 'bg-amber-600' : 'bg-slate-300'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${settings.kitchenAlertSound ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 block mb-2 uppercase tracking-widest">Late Ticket Warning (Min)</label>
                    <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold" value={settings.displayOrderDuration} onChange={e => handleInputChange('displayOrderDuration', parseInt(e.target.value))} />
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
