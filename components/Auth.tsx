
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { User } from '../types';

interface AuthProps {
  onAuthenticated: (user: User) => void;
}

type AuthMode = 'LOGIN' | 'SIGNUP' | 'RECOVERY';
type SignupStep = 'STORE_DETAILS' | 'CREDENTIALS' | 'VERIFICATION' | 'OTP';
type RecoveryStep = 'MOBILE_INPUT' | 'OTP_VERIFY' | 'RESET_CREDENTIALS';
type RecoveryTarget = 'USERNAME' | 'PASSWORD';

interface RegisteredStore {
  restaurantName: string;
  ownerName: string;
  address: string;
  username: string;
  password: string;
  mobile: string;
  avatar?: string;
}

const Auth: React.FC<AuthProps> = ({ onAuthenticated }) => {
  const [mode, setMode] = useState<AuthMode>('LOGIN');
  const [step, setStep] = useState<SignupStep>('STORE_DETAILS');
  const [recoveryStep, setRecoveryStep] = useState<RecoveryStep>('MOBILE_INPUT');
  const [recoveryTarget, setRecoveryTarget] = useState<RecoveryTarget>('PASSWORD');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authenticatedUser, setAuthenticatedUser] = useState<User | null>(null);
  
  const welcomeAudioRef = useRef<HTMLAudioElement | null>(null);
  const [registeredStores, setRegisteredStores] = useState<RegisteredStore[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('zenith_registered_stores');
    if (saved) {
      setRegisteredStores(JSON.parse(saved));
    } else {
      const seed = [{
        restaurantName: 'Zenith Main',
        ownerName: 'Vikram Malhotra',
        address: '7th Ave, Downtown',
        username: 'admin',
        password: 'Admin@1234',
        mobile: '9999999999',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&mouth=smile'
      }];
      setRegisteredStores(seed);
      localStorage.setItem('zenith_registered_stores', JSON.stringify(seed));
    }
  }, []);

  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [signupForm, setSignupForm] = useState<RegisteredStore>({
    restaurantName: '',
    address: '',
    ownerName: '',
    username: '',
    password: '',
    mobile: '',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zenith&mouth=smile'
  });
  const [signupOtp, setSignupOtp] = useState('');
  const [recoveryMobile, setRecoveryMobile] = useState('');
  const [recoveryOtp, setRecoveryOtp] = useState('');
  const [recoveryNewData, setRecoveryNewData] = useState({ username: '', password: '' });

  const generatedOtp = '1234';

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (isSuccess && authenticatedUser) {
      // Play stylish welcome music
      welcomeAudioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3');
      welcomeAudioRef.current.volume = 0.4;
      welcomeAudioRef.current.play().catch(e => console.debug("Audio play blocked."));

      const timer = setTimeout(() => onAuthenticated(authenticatedUser), 4000);
      
      return () => {
        clearTimeout(timer);
        if (welcomeAudioRef.current) {
          welcomeAudioRef.current.pause();
          welcomeAudioRef.current = null;
        }
      };
    }
  }, [isSuccess, authenticatedUser, onAuthenticated]);

  const validatePassword = (p: string) => {
    const hasOtherSymbols = /[^a-zA-Z0-9@]/.test(p);
    return {
      length: p.length > 0 && p.length <= 10,
      noOtherSymbols: !hasOtherSymbols,
      hasUpper: /[A-Z]/.test(p),
      hasLower: /[a-z]/.test(p)
    };
  };

  const loginPasswordCriteria = useMemo(() => validatePassword(loginForm.password), [loginForm.password]);
  const signupPasswordCriteria = useMemo(() => validatePassword(signupForm.password), [signupForm.password]);
  const recoveryPasswordCriteria = useMemo(() => validatePassword(recoveryNewData.password), [recoveryNewData.password]);

  const isLoginPasswordValid = Object.values(loginPasswordCriteria).every(Boolean);
  const isSignupPasswordValid = Object.values(signupPasswordCriteria).every(Boolean);
  const isRecoveryPasswordValid = Object.values(recoveryPasswordCriteria).every(Boolean);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      const store = registeredStores.find(
        s => s.username.toLowerCase() === loginForm.username.toLowerCase() && s.password === loginForm.password
      );

      if (store) {
        setAuthenticatedUser({
          id: 'u_' + store.username,
          name: store.ownerName,
          role: 'Owner',
          avatar: store.avatar || `https://ui-avatars.com/api/?name=${store.ownerName}&background=6366f1&color=fff`,
          shiftStart: new Date(),
          performanceScore: 100
        });
        setIsSuccess(true);
      } else {
        setError('Access Denied: Invalid Username or Passcode.');
      }
      setIsLoading(false);
    }, 1200);
  };

  const handleSignupNext = () => {
    if (step === 'STORE_DETAILS') {
      const duplicate = registeredStores.find(s => 
        s.restaurantName.toLowerCase() === signupForm.restaurantName.toLowerCase() ||
        s.ownerName.toLowerCase() === signupForm.ownerName.toLowerCase()
      );
      if (duplicate) {
        setError('Duplicate Entry: A restaurant with these details is already registered.');
        return;
      }
      setStep('CREDENTIALS');
    } else if (step === 'CREDENTIALS') {
      const duplicate = registeredStores.find(s => s.username.toLowerCase() === signupForm.username.toLowerCase());
      if (duplicate) {
        setError('Username Unavailable: Please choose a unique identity.');
        return;
      }
      if (!isSignupPasswordValid) return;
      setStep('VERIFICATION');
    } else if (step === 'VERIFICATION') {
      const duplicate = registeredStores.find(s => s.mobile === signupForm.mobile);
      if (duplicate) {
        setError('Mobile Registered: This terminal is already linked to a store.');
        return;
      }
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setStep('OTP');
      }, 1000);
    }
  };

  const handleVerifySignupOtp = () => {
    if (signupOtp === generatedOtp) {
      setIsLoading(true);
      setTimeout(() => {
        const updatedStores = [...registeredStores, signupForm];
        setRegisteredStores(updatedStores);
        localStorage.setItem('zenith_registered_stores', JSON.stringify(updatedStores));
        setIsLoading(false);
        setSignupSuccess(true);
        setMode('LOGIN');
        setStep('STORE_DETAILS');
        setLoginForm({ ...loginForm, username: signupForm.username });
      }, 1500);
    } else {
      setError('Invalid Challenge Code. Identity validation failed.');
    }
  };

  const startRecovery = (target: RecoveryTarget) => {
    setRecoveryTarget(target);
    setMode('RECOVERY');
    setRecoveryStep('MOBILE_INPUT');
    setError(null);
  };

  const handleRecoveryMobileNext = () => {
    const store = registeredStores.find(s => s.mobile === recoveryMobile);
    if (!store) {
      setError('Identity Not Found: This mobile terminal is not registered.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setRecoveryStep('OTP_VERIFY');
    }, 1000);
  };

  const handleVerifyRecoveryOtp = () => {
    if (recoveryOtp === generatedOtp) {
      setRecoveryStep('RESET_CREDENTIALS');
      const store = registeredStores.find(s => s.mobile === recoveryMobile);
      if (store) {
        setRecoveryNewData({ username: store.username, password: '' });
      }
    } else {
      setError('Challenge Code Mismatch. Verification failed.');
    }
  };

  const handleFinalizeRecovery = () => {
    if (recoveryTarget === 'PASSWORD' && !isRecoveryPasswordValid) return;
    setIsLoading(true);
    setTimeout(() => {
      const updated = registeredStores.map(s => {
        if (s.mobile === recoveryMobile) {
          return { ...s, username: recoveryNewData.username, password: recoveryNewData.password || s.password };
        }
        return s;
      });
      setRegisteredStores(updated);
      localStorage.setItem('zenith_registered_stores', JSON.stringify(updated));
      setIsLoading(false);
      setSignupSuccess(true);
      setMode('LOGIN');
      setError(null);
    }, 1500);
  };

  const renderPasswordHints = (criteria: ReturnType<typeof validatePassword>, p: string) => {
    if (p.length === 0) return null;
    return (
      <div className="grid grid-cols-2 gap-3 px-2 mt-4 animate-in fade-in slide-in-from-top-2">
        {[
          { key: 'length', label: 'Max 10 Chars' },
          { key: 'noOtherSymbols', label: 'Only "@" Symbol allowed' },
          { key: 'hasUpper', label: 'Uppercase [A-Z]' },
          { key: 'hasLower', label: 'Lowercase [a-z]' }
        ].map((c) => (
          <div key={c.key} className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${criteria[c.key as keyof typeof criteria] ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.3)]'}`}></div>
            <span className={`text-[9px] font-black uppercase tracking-tighter transition-colors ${criteria[c.key as keyof typeof criteria] ? 'text-emerald-500' : 'text-rose-500'}`}>{c.label}</span>
          </div>
        ))}
      </div>
    );
  };

  if (isSuccess && authenticatedUser) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#020205] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1a1b2e_0%,_transparent_70%)] opacity-60"></div>
        
        <div className="z-10 animate-in fade-in zoom-in duration-1000 flex flex-row items-center gap-8 bg-white/5 p-12 rounded-[4rem] border border-white/10 backdrop-blur-3xl shadow-[0_0_80px_rgba(0,0,0,0.5)]">
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-full bg-white p-0.5 shadow-[0_0_40px_rgba(99,102,241,0.4)] overflow-hidden">
              <img src={authenticatedUser.avatar} alt={authenticatedUser.name} className="w-full h-full object-cover" />
            </div>
            <div className="absolute -inset-2 border border-indigo-500/20 rounded-full animate-ping pointer-events-none"></div>
          </div>

          <div className="flex flex-col">
            <p className="text-indigo-400 text-[9px] font-black uppercase tracking-[0.5em] mb-1.5 italic opacity-80">Access Granted</p>
            <h2 className="text-white text-[13px] uppercase tracking-[0.4em] whitespace-nowrap drop-shadow-2xl" 
                style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontStyle: 'italic', fontWeight: 700 }}>
              Welcome back, {authenticatedUser.name}
            </h2>
          </div>
        </div>

        <div className="absolute bottom-24 w-48 h-[1px] bg-white/5 overflow-hidden">
          <div className="h-full bg-indigo-500 w-full animate-[slide-in-from-left_3.5s_ease-in-out_infinite]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex items-center justify-center bg-[#05060b] p-6 relative overflow-hidden">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 scale-110 animate-[ken-burns_40s_infinite_alternate_ease-in-out]"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2400&auto=format&fit=crop')", backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#05060b] via-[#05060b]/80 to-transparent pointer-events-none"></div>
      </div>

      <style>{`@keyframes ken-burns { 0% { transform: scale(1); } 100% { transform: scale(1.15) translate(1%, 1%); } }`}</style>

      {error && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 fade-in duration-500">
           <div className="bg-rose-600 text-white px-8 py-4 rounded-3xl shadow-2xl border border-rose-400/30 flex items-center gap-4 animate-bounce">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <span className="font-black text-xs uppercase tracking-widest">{error}</span>
           </div>
        </div>
      )}

      {signupSuccess && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 fade-in duration-500">
           <div className="bg-emerald-600 text-white px-8 py-4 rounded-3xl shadow-2xl border border-emerald-400/30 flex items-center gap-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
              <span className="font-black text-xs uppercase tracking-widest">Protocol Initialized. You may proceed.</span>
              <button onClick={() => setSignupSuccess(false)} className="ml-4 opacity-50 hover:opacity-100">✕</button>
           </div>
        </div>
      )}

      <div className="max-w-xl w-full relative z-10 animate-in fade-in zoom-in-95 duration-1000">
        <div className="text-center mb-10">
          <div className="relative inline-block mb-6 group">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2.2rem] flex items-center justify-center shadow-2xl mx-auto rotate-12 group-hover:rotate-0 transition-all duration-700 ring-4 ring-white/10">
              <svg className="w-10 h-10 text-white -rotate-12 group-hover:rotate-0 transition-transform duration-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-amber-400 text-black text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-widest shadow-xl">Pro v2.1</div>
          </div>
          <h1 className="text-white text-5xl font-black italic tracking-tighter uppercase leading-tight drop-shadow-2xl">Zenith Pro</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-[10px] mt-2">Enterprise Resource Management</p>
        </div>

        <div className="bg-[#0f111a]/60 border border-white/10 p-12 rounded-[3.5rem] backdrop-blur-3xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] relative overflow-hidden group/card ring-1 ring-white/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none transition-all group-hover/card:bg-indigo-500/10"></div>
          
          {mode === 'LOGIN' && (
            <form onSubmit={handleLogin} className="space-y-7 relative z-10">
              <div className="space-y-2 text-center mb-10">
                <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">System Access</h2>
                <div className="h-1 w-12 bg-indigo-500 mx-auto rounded-full"></div>
              </div>
              
              <div className="space-y-4">
                <div className="relative">
                  <input 
                    required
                    type="text" 
                    placeholder="Operator ID" 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white text-sm font-bold outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-700"
                    value={loginForm.username}
                    onChange={e => setLoginForm({...loginForm, username: e.target.value})}
                  />
                  <svg className="w-5 h-5 absolute right-6 top-1/2 -translate-y-1/2 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <div className="relative">
                  <input 
                    required
                    type="password" 
                    placeholder="Security Passcode" 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white text-sm font-bold outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-700"
                    value={loginForm.password}
                    onChange={e => setLoginForm({...loginForm, password: e.target.value})}
                  />
                  <svg className="w-5 h-5 absolute right-6 top-1/2 -translate-y-1/2 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                {renderPasswordHints(loginPasswordCriteria, loginForm.password)}
              </div>

              <button 
                disabled={isLoading || !loginForm.username || !isLoginPasswordValid}
                type="submit" 
                className="w-full bg-white text-black py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all shadow-2xl active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 flex items-center justify-center gap-3 group/btn overflow-hidden relative"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                    Establishing...
                  </>
                ) : (
                  <>
                    <span>Establish Connection</span>
                    <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </>
                )}
              </button>

              <div className="flex flex-col items-center gap-4 pt-4">
                <button type="button" onClick={() => setMode('SIGNUP')} className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] hover:text-indigo-300 transition-all">Provision New Store</button>
                <div className="flex gap-4">
                  <button type="button" onClick={() => startRecovery('PASSWORD')} className="text-slate-700 text-[9px] font-black uppercase tracking-[0.2em] hover:text-slate-500 transition-all">Recover Key</button>
                  <span className="text-slate-800 text-[9px]">•</span>
                  <button type="button" onClick={() => startRecovery('USERNAME')} className="text-slate-700 text-[9px] font-black uppercase tracking-[0.2em] hover:text-slate-500 transition-all">Identify Node</button>
                </div>
              </div>
            </form>
          )}

          {mode === 'SIGNUP' && (
            <div className="space-y-8 relative z-10 animate-in slide-in-from-right-8 duration-700">
               <div className="flex justify-between items-center mb-8">
                  <button onClick={() => setMode('LOGIN')} className="text-slate-500 hover:text-white p-2 rounded-xl bg-white/5 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                  <div className="flex gap-2">
                    {['STORE_DETAILS', 'CREDENTIALS', 'VERIFICATION', 'OTP'].map((s, i) => (
                      <div key={s} className={`h-1 w-6 rounded-full transition-all duration-500 ${SignupStepOrder(step) >= i ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-white/10'}`}></div>
                    ))}
                  </div>
               </div>

               {step === 'STORE_DETAILS' && (
                <div className="space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-white italic tracking-tight uppercase">Base Configuration</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Store identity deployment</p>
                  </div>
                  <div className="space-y-4">
                    <input type="text" placeholder="Restaurant Entity Name" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white text-sm font-bold outline-none focus:border-indigo-500/50 transition-all" value={signupForm.restaurantName} onChange={e => setSignupForm({...signupForm, restaurantName: e.target.value})} />
                    <input type="text" placeholder="Authorized Representative" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white text-sm font-bold outline-none focus:border-indigo-500/50 transition-all" value={signupForm.ownerName} onChange={e => setSignupForm({...signupForm, ownerName: e.target.value})} />
                    <textarea placeholder="Principal Operating Address" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white text-sm font-bold outline-none focus:border-indigo-500/50 transition-all h-24 resize-none" value={signupForm.address} onChange={e => setSignupForm({...signupForm, address: e.target.value})} />
                  </div>
                  <button onClick={handleSignupNext} disabled={!signupForm.restaurantName || !signupForm.ownerName || !signupForm.address} className="w-full bg-white text-black py-6 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl active:scale-95 transition-all disabled:opacity-30">Continue Protocol</button>
                </div>
               )}

               {step === 'CREDENTIALS' && (
                <div className="space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-white italic tracking-tight uppercase">Root Identity</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Admin security credentials</p>
                  </div>
                  <div className="space-y-4">
                    <input type="text" placeholder="Admin Username" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white text-sm font-bold outline-none focus:border-indigo-500/50 transition-all" value={signupForm.username} onChange={e => setSignupForm({...signupForm, username: e.target.value})} />
                    <input type="password" placeholder="Root Passcode" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white text-sm font-bold outline-none focus:border-indigo-500/50 transition-all" value={signupForm.password} onChange={e => setSignupForm({...signupForm, password: e.target.value})} />
                    {renderPasswordHints(signupPasswordCriteria, signupForm.password)}
                  </div>
                  <button onClick={handleSignupNext} disabled={!signupForm.username || !isSignupPasswordValid} className="w-full bg-white text-black py-6 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl active:scale-95 transition-all disabled:opacity-30">Authorize Security Key</button>
                </div>
               )}

               {step === 'VERIFICATION' && (
                <div className="space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-white italic tracking-tight uppercase">Terminal Link</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Mobile identity verification</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-8 py-5">
                      <span className="text-slate-500 font-black">+91</span>
                      <input type="tel" placeholder="Mobile Terminal ID" className="bg-transparent text-white text-sm font-bold outline-none flex-1" value={signupForm.mobile} onChange={e => setSignupForm({...signupForm, mobile: e.target.value})} />
                    </div>
                  </div>
                  <button onClick={handleSignupNext} disabled={signupForm.mobile.length < 10} className="w-full bg-white text-black py-6 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl active:scale-95 transition-all disabled:opacity-30">Initiate Secure Handshake</button>
                </div>
               )}

               {step === 'OTP' && (
                <div className="space-y-8">
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-black text-white italic tracking-tight uppercase">Identity Challenge</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Enter the 4-digit code sent to node</p>
                  </div>
                  <div className="space-y-6">
                    <div className="flex justify-center">
                      <input 
                        type="text" 
                        maxLength={4} 
                        className="w-48 bg-white/5 border border-indigo-500/30 rounded-3xl px-8 py-8 text-white text-4xl font-black text-center tracking-[0.5em] outline-none focus:border-indigo-500 transition-all shadow-[0_0_40px_rgba(99,102,241,0.1)]"
                        value={signupOtp}
                        onChange={e => setSignupOtp(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <button onClick={handleVerifySignupOtp} disabled={signupOtp.length < 4 || isLoading} className="w-full bg-indigo-600 text-white py-6 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl active:scale-95 transition-all disabled:opacity-30">
                      {isLoading ? 'Establishing...' : 'Finalize Deployment'}
                    </button>
                    <p className="text-center text-slate-700 text-[9px] font-bold uppercase tracking-widest">Resend protocol in 30s</p>
                  </div>
                </div>
               )}
            </div>
          )}

          {mode === 'RECOVERY' && (
            <div className="space-y-8 relative z-10 animate-in slide-in-from-left-8 duration-700">
               <div className="flex justify-between items-center mb-8">
                  <button onClick={() => setMode('LOGIN')} className="text-slate-500 hover:text-white p-2 rounded-xl bg-white/5 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                  <span className="text-xs font-black text-indigo-400 uppercase tracking-widest italic">{recoveryTarget} Recovery</span>
               </div>

               {recoveryStep === 'MOBILE_INPUT' && (
                <div className="space-y-6">
                   <div className="space-y-1">
                    <h3 className="text-xl font-black text-white italic tracking-tight uppercase">Identity Check</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Enter registered mobile ID</p>
                   </div>
                   <input type="tel" placeholder="Mobile Terminal ID" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white text-sm font-bold outline-none" value={recoveryMobile} onChange={e => setRecoveryMobile(e.target.value)} />
                   <button onClick={handleRecoveryMobileNext} disabled={recoveryMobile.length < 10} className="w-full bg-white text-black py-6 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl">Confirm Identity</button>
                </div>
               )}

               {recoveryStep === 'OTP_VERIFY' && (
                <div className="space-y-6">
                   <div className="text-center space-y-2">
                    <h3 className="text-xl font-black text-white italic tracking-tight uppercase">Challenge</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Sent to terminal ending in {recoveryMobile.slice(-4)}</p>
                   </div>
                   <div className="flex justify-center">
                    <input type="text" maxLength={4} className="w-32 bg-white/5 border border-white/20 rounded-2xl px-6 py-6 text-white text-2xl font-black text-center tracking-[0.2em] outline-none" value={recoveryOtp} onChange={e => setRecoveryOtp(e.target.value)} />
                   </div>
                   <button onClick={handleVerifyRecoveryOtp} disabled={recoveryOtp.length < 4} className="w-full bg-indigo-600 text-white py-6 rounded-2xl font-black uppercase tracking-widest text-xs">Verify Challenge</button>
                </div>
               )}

               {recoveryStep === 'RESET_CREDENTIALS' && (
                <div className="space-y-6">
                   <div className="space-y-1">
                    <h3 className="text-xl font-black text-white italic tracking-tight uppercase">Key Generation</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Update your cluster credentials</p>
                   </div>
                   <div className="space-y-4">
                    {recoveryTarget === 'USERNAME' ? (
                      <input type="text" placeholder="New Operator ID" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white text-sm font-bold outline-none" value={recoveryNewData.username} onChange={e => setRecoveryNewData({...recoveryNewData, username: e.target.value})} />
                    ) : (
                      <>
                        <input type="password" placeholder="New Security Passcode" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white text-sm font-bold outline-none" value={recoveryNewData.password} onChange={e => setRecoveryNewData({...recoveryNewData, password: e.target.value})} />
                        {renderPasswordHints(recoveryPasswordCriteria, recoveryNewData.password)}
                      </>
                    )}
                   </div>
                   <button onClick={handleFinalizeRecovery} disabled={(recoveryTarget==='PASSWORD' && !isRecoveryPasswordValid) || (recoveryTarget==='USERNAME' && !recoveryNewData.username)} className="w-full bg-white text-black py-6 rounded-2xl font-black uppercase tracking-widest text-xs">Synchronize Key</button>
                </div>
               )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SignupStepOrder = (step: SignupStep): number => {
  switch (step) {
    case 'STORE_DETAILS': return 0;
    case 'CREDENTIALS': return 1;
    case 'VERIFICATION': return 2;
    case 'OTP': return 3;
    default: return 0;
  }
};

export default Auth;
