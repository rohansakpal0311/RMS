
import React, { useState, useMemo, useEffect } from 'react';
import { User } from '../types';

interface AuthProps {
  onAuthenticated: (user: User) => void;
}

type AuthMode = 'LOGIN' | 'SIGNUP' | 'RECOVERY';
type SignupStep = 'STORE_DETAILS' | 'CREDENTIALS' | 'IDENTITY_KYC' | 'OTP';
type RecoveryStep = 'MOBILE_INPUT' | 'OTP_VERIFY' | 'SUCCESS_POPUP' | 'RESET_CREDENTIALS';
type RecoveryTarget = 'USERNAME' | 'PASSWORD';

interface RegisteredStore {
  restaurantName: string;
  ownerName: string;
  address: string;
  username: string;
  password: string;
  mobile: string;
  aadhar: string;
  avatar?: string;
}

const Auth: React.FC<AuthProps> = ({ onAuthenticated }) => {
  const [mode, setMode] = useState<AuthMode>('LOGIN');
  const [step, setStep] = useState<SignupStep>('STORE_DETAILS');
  const [recoveryStep, setRecoveryStep] = useState<RecoveryStep>('MOBILE_INPUT');
  const [recoveryTarget, setRecoveryTarget] = useState<RecoveryTarget>('PASSWORD');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [otpSentNotification, setOtpSentNotification] = useState<{show: boolean, mobile: string}>({ show: false, mobile: '' });
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authenticatedUser, setAuthenticatedUser] = useState<User | null>(null);
  
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
        aadhar: '123456789012',
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
    aadhar: '',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zenith&mouth=smile'
  });
  const [signupOtp, setSignupOtp] = useState('');
  const [recoveryMobile, setRecoveryMobile] = useState('');
  const [recoveryOtp, setRecoveryOtp] = useState('');

  const generatedOtp = '1234';

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const validatePassword = (p: string) => {
    const hasOtherSymbols = /[^a-zA-Z0-9@]/.test(p);
    return {
      length: p.length >= 8 && p.length <= 15,
      noOtherSymbols: !hasOtherSymbols,
      hasUpper: /[A-Z]/.test(p),
      hasLower: /[a-z]/.test(p),
      hasDigit: /\d/.test(p)
    };
  };

  const signupPasswordCriteria = useMemo(() => validatePassword(signupForm.password), [signupForm.password]);
  const isSignupPasswordValid = Object.values(signupPasswordCriteria).every(Boolean);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Using a timeout to simulate a database query and ensure the UI has time to reflect state changes
    setTimeout(() => {
      // Re-fetch from localStorage to ensure we have the absolute latest registered stores (even those just added)
      const currentStores: RegisteredStore[] = JSON.parse(localStorage.getItem('zenith_registered_stores') || '[]');
      const store = currentStores.find(
        s => s.username.toLowerCase() === loginForm.username.toLowerCase() && s.password === loginForm.password
      );

      if (store) {
        const userObj: User = {
          id: 'u_' + store.username,
          name: store.ownerName,
          role: 'Owner',
          avatar: store.avatar || `https://ui-avatars.com/api/?name=${store.ownerName}&background=6366f1&color=fff`,
          shiftStart: new Date(),
          performanceScore: 100
        };
        setAuthenticatedUser(userObj);
        setIsSuccess(true);
        setIsLoading(false);
        
        // Wait for the initialization sequence to complete before switching views
        setTimeout(() => {
          onAuthenticated(userObj);
        }, 1800);
      } else {
        setError('Access Denied: Invalid Credentials.');
        setIsLoading(false);
      }
    }, 800);
  };

  const handleSignupNext = () => {
    if (step === 'STORE_DETAILS') {
      if (!signupForm.restaurantName || !signupForm.ownerName || !signupForm.address) return;
      setStep('CREDENTIALS');
    } else if (step === 'CREDENTIALS') {
      if (!signupForm.username || !signupForm.password || !isSignupPasswordValid) return;
      setStep('IDENTITY_KYC');
    } else if (step === 'IDENTITY_KYC') {
      if (signupForm.mobile.length !== 10 || signupForm.aadhar.length !== 12) return;
      
      // TRIGGER OTP NOTIFICATION POPUP
      setOtpSentNotification({ show: true, mobile: signupForm.mobile });
      
      // Auto-transition to OTP input after 2.5 seconds
      setTimeout(() => {
        setOtpSentNotification({ show: false, mobile: signupForm.mobile });
        setStep('OTP');
      }, 2500);
    }
  };

  const handleVerifySignupOtp = () => {
    if (signupOtp === generatedOtp) {
      setIsLoading(true);
      setTimeout(() => {
        // Save to state and storage
        const updatedStores = [...registeredStores, signupForm];
        setRegisteredStores(updatedStores);
        localStorage.setItem('zenith_registered_stores', JSON.stringify(updatedStores));
        
        setIsLoading(false);
        setSignupSuccess(true);
        setMode('LOGIN');
        setStep('STORE_DETAILS');
        setLoginForm({ ...loginForm, username: signupForm.username });
        setSignupForm({
          restaurantName: '', address: '', ownerName: '', username: '', password: '', mobile: '', aadhar: '',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zenith&mouth=smile'
        });
      }, 1200);
    } else {
      setError('Invalid OTP Verification Code.');
    }
  };

  const startRecovery = (target: RecoveryTarget) => {
    setRecoveryTarget(target);
    setMode('RECOVERY');
    setRecoveryStep('MOBILE_INPUT');
    setRecoveryMobile('');
    setError(null);
  };

  const handleRecoveryMobileNext = () => {
    const store = registeredStores.find(s => s.mobile === recoveryMobile);
    if (!store) {
      setError('Mobile Number Not Registered.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setRecoveryStep('OTP_VERIFY');
    }, 1000);
  };

  const maskMobileFull = (mobile: string) => {
    if (mobile.length < 3) return mobile;
    return 'xxxxxxx' + mobile.slice(-3);
  };

  if (isSuccess && authenticatedUser) {
    return (
      <div className="h-screen w-full flex items-center bg-[#05060b] px-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_50%,_#4f46e5_0%,_transparent_55%)]"></div>
        <div className="flex flex-row items-center gap-12 animate-in slide-in-from-left-12 duration-1000 relative z-10">
          <div className="w-48 h-48 rounded-[3.5rem] bg-white p-2 shadow-[0_30px_100px_rgba(99,102,241,0.3)] overflow-hidden ring-4 ring-indigo-500/20">
            <img src={authenticatedUser.avatar} alt={authenticatedUser.name} className="w-full h-full object-cover" />
          </div>
          <div className="space-y-3">
            <p className="text-indigo-400 text-sm font-black uppercase tracking-[0.5em] opacity-80 italic">Root Authority</p>
            <h2 className="text-6xl text-white uppercase tracking-[0.1em] font-black italic drop-shadow-2xl" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
              {authenticatedUser.name.toUpperCase()}
            </h2>
            <div className="flex items-center gap-6 mt-8">
               <div className="h-[2px] w-16 bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,1)]"></div>
               <span className="text-xs font-black text-slate-500 uppercase tracking-[0.4em] animate-pulse">Initializing Nexus...</span>
            </div>
          </div>
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
        <div className="absolute inset-0 bg-gradient-to-tr from-[#05060b] via-[#05060b]/90 to-transparent pointer-events-none"></div>
      </div>

      {error && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4">
           <div className="bg-rose-600 text-white px-10 py-5 rounded-[2rem] shadow-2xl border border-rose-400/30 flex items-center gap-4">
              <span className="font-black text-xs uppercase tracking-widest">{error}</span>
           </div>
        </div>
      )}

      {otpSentNotification.show && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in zoom-in-95 duration-300">
          <div className="bg-white p-10 rounded-[3rem] shadow-2xl text-center space-y-6 max-w-sm">
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </div>
            <div className="space-y-2">
              <h4 className="text-xl font-black text-slate-900 uppercase italic">OTP Sent</h4>
              <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">
                Verification code dispatched to: <br/>
                <span className="text-indigo-600 tracking-widest">{otpSentNotification.mobile}</span>
              </p>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
               <div className="h-full bg-indigo-600 animate-[progress_2.5s_linear_forwards]"></div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes progress { from { width: 0%; } to { width: 100%; } }
        @keyframes ken-burns { 0% { transform: scale(1); } 100% { transform: scale(1.15) translate(1%, 1%); } }
      `}</style>

      {signupSuccess && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4">
           <div className="bg-emerald-600 text-white px-10 py-5 rounded-[2rem] shadow-2xl border border-emerald-400/30 flex items-center gap-4">
              <span className="font-black text-xs uppercase tracking-widest">Provisioning Successful. Secure Login Enabled.</span>
              <button onClick={() => setSignupSuccess(false)} className="text-white hover:text-emerald-200">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
           </div>
        </div>
      )}

      <div className="max-w-xl w-full relative z-10 animate-in fade-in zoom-in-95 duration-1000">
        <div className="text-center mb-10">
          <div className="relative inline-block mb-6 group">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2.2rem] flex items-center justify-center shadow-2xl mx-auto rotate-12 group-hover:rotate-0 transition-all duration-700 ring-4 ring-white/10">
              <svg className="w-10 h-10 text-white -rotate-12 group-hover:rotate-0 transition-transform duration-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-amber-400 text-black text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-widest shadow-xl">v2.1 Pro</div>
          </div>
          <h1 className="text-white text-5xl font-black italic tracking-tighter uppercase leading-tight drop-shadow-2xl">Zenith Pro</h1>
        </div>

        <div className="bg-[#0f111a]/60 border border-white/10 p-1 rounded-[4rem] backdrop-blur-3xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] relative overflow-hidden group/card ring-1 ring-white/5">
          {(mode === 'LOGIN' || mode === 'SIGNUP') && (
            <div className="flex p-3 gap-2 border-b border-white/5">
              <button 
                onClick={() => { setMode('LOGIN'); setStep('STORE_DETAILS'); }}
                className={`flex-1 py-5 rounded-[3rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all ${mode === 'LOGIN' ? 'bg-white text-black shadow-2xl scale-105' : 'text-slate-500 hover:text-white'}`}
              >
                Authorized Login
              </button>
              <button 
                onClick={() => { setMode('SIGNUP'); setStep('STORE_DETAILS'); }}
                className={`flex-1 py-5 rounded-[3rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all ${mode === 'SIGNUP' ? 'bg-white text-black shadow-2xl scale-105' : 'text-slate-500 hover:text-white'}`}
              >
                Provision Node
              </button>
            </div>
          )}

          <div className="p-12">
            {mode === 'LOGIN' && (
              <form onSubmit={handleLogin} className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                <div className="space-y-4">
                  <input 
                    required
                    type="text" 
                    placeholder="Operator Identity (Username)" 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-6 text-white text-sm font-bold outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-700"
                    value={loginForm.username}
                    onChange={e => setLoginForm({...loginForm, username: e.target.value})}
                  />
                  <input 
                    required
                    type="password" 
                    placeholder="Secure Passcode" 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-6 text-white text-sm font-bold outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-700"
                    value={loginForm.password}
                    onChange={e => setLoginForm({...loginForm, password: e.target.value})}
                  />
                </div>

                <button 
                  disabled={isLoading || !loginForm.username || loginForm.password.length === 0}
                  type="submit" 
                  className="w-full bg-indigo-600 text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs transition-all shadow-2xl active:scale-[0.98] disabled:opacity-30 flex items-center justify-center gap-3"
                >
                  {isLoading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : 'Establish Nexus'}
                </button>

                <div className="flex flex-col items-center gap-4 pt-4">
                  <button type="button" onClick={() => startRecovery('USERNAME')} className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] hover:text-indigo-300">Forgot Username?</button>
                  <button type="button" onClick={() => startRecovery('PASSWORD')} className="text-slate-700 text-[9px] font-black uppercase tracking-[0.2em] hover:text-slate-500">Identity Recovery</button>
                </div>
              </form>
            )}

            {mode === 'SIGNUP' && (
              <div className="space-y-8 animate-in slide-in-from-right-8 duration-700">
                <div className="flex justify-between items-center mb-2">
                   <h4 className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.3em] italic">Step: {step.replace('_', ' ')}</h4>
                </div>

                {step === 'STORE_DETAILS' && (
                  <div className="space-y-6 animate-in fade-in duration-500">
                    <input required type="text" placeholder="Restaurant Name" className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-6 text-white text-sm font-bold outline-none" value={signupForm.restaurantName} onChange={e => setSignupForm({...signupForm, restaurantName: e.target.value})} />
                    <input required type="text" placeholder="Authorized Owner Name" className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-6 text-white text-sm font-bold outline-none" value={signupForm.ownerName} onChange={e => setSignupForm({...signupForm, ownerName: e.target.value})} />
                    <div className="space-y-1">
                      <textarea 
                        required
                        maxLength={32} 
                        placeholder="Shop Address (Max 32 characters)" 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-6 text-white text-sm font-bold outline-none h-24 resize-none" 
                        value={signupForm.address} 
                        onChange={e => setSignupForm({...signupForm, address: e.target.value})} 
                      />
                      <div className="flex justify-end px-2">
                        <span className={`text-[9px] font-black uppercase tracking-widest ${signupForm.address.length >= 32 ? 'text-rose-500' : 'text-slate-600'}`}>{signupForm.address.length}/32</span>
                      </div>
                    </div>
                    <button onClick={handleSignupNext} disabled={!signupForm.restaurantName || !signupForm.ownerName || !signupForm.address} className="w-full bg-indigo-600 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 disabled:opacity-30">Configure Credentials</button>
                  </div>
                )}

                {step === 'CREDENTIALS' && (
                  <div className="space-y-6 animate-in fade-in duration-500">
                    <input required type="text" placeholder="Desired Operator ID (Username)" className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-6 text-white text-sm font-bold outline-none" value={signupForm.username} onChange={e => setSignupForm({...signupForm, username: e.target.value})} />
                    <div className="space-y-4">
                      <input required type="password" placeholder="Root Passcode" className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-6 text-white text-sm font-bold outline-none" value={signupForm.password} onChange={e => setSignupForm({...signupForm, password: e.target.value})} />
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2 px-2">
                        {[
                          { label: '8-15 Chars', valid: signupPasswordCriteria.length },
                          { label: 'Upper Case', valid: signupPasswordCriteria.hasUpper },
                          { label: 'Lower Case', valid: signupPasswordCriteria.hasLower },
                          { label: 'Digit', valid: signupPasswordCriteria.hasDigit },
                          { label: 'No Syms (Exc @)', valid: signupPasswordCriteria.noOtherSymbols },
                        ].map((c, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${c.valid ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-slate-700'}`}></div>
                            <span className={`text-[8px] font-black uppercase tracking-widest ${c.valid ? 'text-emerald-500' : 'text-slate-600'}`}>{c.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => setStep('STORE_DETAILS')} className="bg-white/5 text-slate-500 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px]">Back</button>
                      <button onClick={handleSignupNext} disabled={!signupForm.username || !signupForm.password || !isSignupPasswordValid} className="flex-1 bg-indigo-600 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 disabled:opacity-30">Identity & KYC</button>
                    </div>
                  </div>
                )}

                {step === 'IDENTITY_KYC' && (
                  <div className="space-y-6 animate-in fade-in duration-500">
                    <input required type="text" maxLength={12} placeholder="Aadhar Card Number (12-Digit)" className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-6 text-white text-sm font-bold outline-none" value={signupForm.aadhar} onChange={e => setSignupForm({...signupForm, aadhar: e.target.value.replace(/\D/g, '')})} />
                    <input required type="tel" maxLength={10} placeholder="Registered Mobile (10-Digit)" className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-6 text-white text-sm font-bold outline-none" value={signupForm.mobile} onChange={e => setSignupForm({...signupForm, mobile: e.target.value.replace(/\D/g, '')})} />
                    
                    <div className="flex gap-3">
                      <button onClick={() => setStep('CREDENTIALS')} className="bg-white/5 text-slate-500 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px]">Back</button>
                      <button onClick={handleSignupNext} disabled={signupForm.mobile.length !== 10 || signupForm.aadhar.length !== 12} className="flex-1 bg-indigo-600 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 disabled:opacity-30">Verify & Save</button>
                    </div>
                  </div>
                )}

                {step === 'OTP' && (
                  <div className="space-y-8 text-center animate-in zoom-in-95 duration-500">
                    <div className="space-y-2">
                       <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Verification code sent to {maskMobileFull(signupForm.mobile)}</p>
                       <p className="text-indigo-400 text-[8px] font-black uppercase tracking-[0.3em] animate-pulse">(Hint: Use 1234 for demo)</p>
                    </div>
                    <input 
                      type="text" 
                      maxLength={4} 
                      className="w-40 bg-white/5 border border-white/10 rounded-3xl px-6 py-6 text-white text-3xl font-black outline-none text-center tracking-[0.5em] mx-auto block focus:border-indigo-500" 
                      value={signupOtp} 
                      onChange={e => setSignupOtp(e.target.value.replace(/\D/g, ''))} 
                    />
                    <button onClick={handleVerifySignupOtp} disabled={signupOtp.length < 4} className="w-full bg-emerald-600 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl active:scale-95 disabled:opacity-30">Authorize Activation</button>
                  </div>
                )}
              </div>
            )}

            {mode === 'RECOVERY' && (
              <div className="space-y-8 animate-in slide-in-from-left-8 duration-700">
                 <div className="flex justify-between items-center mb-8">
                    <button onClick={() => setMode('LOGIN')} className="text-slate-500 hover:text-white p-2 rounded-xl bg-white/5 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <span className="text-xs font-black text-indigo-400 uppercase tracking-widest italic">{recoveryTarget === 'USERNAME' ? 'Forgot Username' : 'Password Reset'}</span>
                 </div>

                 {recoveryStep === 'MOBILE_INPUT' && (
                  <div className="space-y-6">
                     <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Enter Registered Mobile</label>
                       <input type="tel" placeholder="Mobile Number" className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-6 text-white text-sm font-bold outline-none" value={recoveryMobile} onChange={e => setRecoveryMobile(e.target.value.replace(/\D/g, ''))} />
                     </div>
                     <button onClick={handleRecoveryMobileNext} disabled={recoveryMobile.length < 10} className="w-full bg-white text-black py-6 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl active:scale-95 disabled:opacity-30">Send Verification OTP</button>
                  </div>
                 )}

                 {recoveryStep === 'OTP_VERIFY' && (
                   <div className="space-y-6 text-center">
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Verification code sent to {maskMobileFull(recoveryMobile)}</p>
                      <input type="text" maxLength={4} className="w-32 bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white text-2xl font-black outline-none text-center tracking-[0.5em]" value={recoveryOtp} onChange={e => setRecoveryOtp(e.target.value)} />
                      <button onClick={() => setMode('LOGIN')} className="w-full bg-indigo-600 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl">Confirm OTP</button>
                   </div>
                 )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
