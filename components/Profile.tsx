
import React, { useState, useRef } from 'react';
import { User } from '../types';

interface ProfileProps {
  user: User;
  onUpdate: (updatedUser: User) => void;
  onSignOut: () => void;
}

const GENDER_CATEGORIES = [
  {
    id: 'female',
    label: 'Ladies',
    avatars: [
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Anya&mouth=smile',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Bella&mouth=smile',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie&mouth=smile',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Mia&mouth=smile',
    ]
  },
  {
    id: 'male',
    label: 'Gentlemen',
    avatars: [
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&mouth=smile',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver&mouth=smile',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack&mouth=smile',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie&mouth=smile',
    ]
  },
  {
    id: 'cyber',
    label: 'Cyber',
    avatars: [
      'https://api.dicebear.com/7.x/bottts/svg?seed=Zenith',
      'https://api.dicebear.com/7.x/bottts/svg?seed=Matrix',
      'https://api.dicebear.com/7.x/bottts/svg?seed=Glitch',
      'https://api.dicebear.com/7.x/bottts/svg?seed=Spark',
    ]
  }
];

const Profile: React.FC<ProfileProps> = ({ user, onUpdate, onSignOut }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: user.name,
    email: 'owner@zenithpro.io',
    role: user.role,
    phone: '+91 99999 88888'
  });
  const [avatarPreview, setAvatarPreview] = useState<string>(user.avatar);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File size exceeds 2MB limit.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      onUpdate({ 
        ...user, 
        name: formData.name, 
        role: formData.role,
        avatar: avatarPreview
      });
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-2xl overflow-hidden">
        <div className="h-56 bg-[#0a0b14] relative flex items-end justify-between px-16 pb-8 overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,_#4f46e5_0%,_transparent_60%)]"></div>
          
          <div className="relative z-10 flex items-center gap-8 translate-y-24">
            <div className="relative group">
              <div className="w-40 h-40 rounded-[3rem] bg-white border-[6px] border-white shadow-2xl overflow-hidden ring-8 ring-slate-900/40 flex items-center justify-center">
                <img 
                  src={avatarPreview} 
                  alt={user.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
              </div>
              <button 
                type="button"
                onClick={triggerFileInput}
                className="absolute inset-0 bg-indigo-600/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center rounded-[2.8rem] text-white"
              >
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                </svg>
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            </div>
            <div className="pt-20">
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">{user.name}</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1">Enterprise Kernel • Level 1 Admin</p>
            </div>
          </div>

          <div className="z-10 flex gap-4 pb-4">
             <button 
                type="button" 
                onClick={onSignOut} 
                className="bg-white/5 hover:bg-rose-600/20 text-white border border-white/10 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all backdrop-blur-md"
             >
                Terminate Session
             </button>
          </div>
        </div>

        <div className="px-16 pt-32 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-5 space-y-10">
              <div className="space-y-2">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em]">Identity Matrix</h4>
                <p className="text-xs text-slate-500 italic">Select from gender-specific AI-generated personas.</p>
              </div>

              <div className="space-y-6">
                {GENDER_CATEGORIES.map(category => (
                  <div key={category.id} className="group relative">
                    <div className="flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-[2rem] hover:bg-white hover:border-indigo-200 transition-all cursor-default shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 shadow-sm">
                          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <span className="font-black text-xs uppercase tracking-widest text-slate-700">{category.label}</span>
                      </div>
                      <svg className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                    </div>

                    <div className="absolute left-full top-0 ml-4 hidden group-hover:flex gap-3 p-3 bg-white border border-slate-200 rounded-[2.2rem] shadow-2xl z-20 animate-in fade-in slide-in-from-left-2">
                      {category.avatars.map((url, i) => (
                        <button 
                          key={i}
                          type="button"
                          onClick={() => setAvatarPreview(url)}
                          className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 border-2 border-transparent hover:border-indigo-500 transition-all shadow-md shrink-0"
                        >
                          <img src={url} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm space-y-8">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-4">Principal Configuration</h4>
                 
                 <div className="grid grid-cols-1 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                      <input className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-black outline-none focus:border-indigo-500 transition-all" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Designation</label>
                      <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-black outline-none focus:border-indigo-500 transition-all" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                        <option>Owner</option>
                        <option>Principal Admin</option>
                      </select>
                    </div>
                 </div>

                 <button 
                  disabled={isSaving}
                  onClick={handleSave}
                  className="w-full bg-slate-900 text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-4"
                >
                  {isSaving ? 'Syncing...' : 'Synchronize Identity'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
