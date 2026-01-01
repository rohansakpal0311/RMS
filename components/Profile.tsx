
import React, { useState, useRef } from 'react';
import { User } from '../types';

interface ProfileProps {
  user: User;
  onUpdate: (updatedUser: User) => void;
  onSignOut: () => void;
}

const IDENTITY_MATRICES = [
  {
    id: 'matrix_alpha',
    label: 'Collection Alpha',
    avatars: [
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Anya&mouth=smile',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Bella&mouth=smile',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie&mouth=smile',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Mia&mouth=smile',
    ]
  },
  {
    id: 'matrix_beta',
    label: 'Collection Beta',
    avatars: [
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&mouth=smile',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver&mouth=smile',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack&mouth=smile',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie&mouth=smile',
    ]
  },
  {
    id: 'matrix_gamma',
    label: 'Collection Gamma',
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
        {/* Profile Banner */}
        <div className="h-64 bg-[#0a0b14] relative flex items-center px-16 overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,_#4f46e5_0%,_transparent_60%)]"></div>
          
          <div className="relative z-10 flex items-center gap-10">
            {/* Profile Pic Alignment */}
            <div className="relative group shrink-0">
              <div className="w-32 h-32 rounded-[2.5rem] bg-white border-[4px] border-white shadow-2xl overflow-hidden ring-4 ring-indigo-500/20 flex items-center justify-center">
                <img 
                  src={avatarPreview} 
                  alt={user.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
              </div>
              <button 
                type="button"
                onClick={triggerFileInput}
                className="absolute inset-0 bg-indigo-600/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center rounded-[2.2rem] text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                </svg>
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            </div>

            {/* Owner Name Alignment - Size 13, Stylish Font */}
            <div className="space-y-1">
              <p className="text-indigo-400 text-[9px] font-black uppercase tracking-[0.4em] mb-1 italic opacity-80">Principal Authority</p>
              <h2 className="text-[13px] text-white uppercase tracking-[0.4em] drop-shadow-lg whitespace-nowrap" 
                  style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontStyle: 'italic', fontWeight: 700 }}>
                {user.name}
              </h2>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em]">Enterprise Root Node • Active</p>
            </div>
          </div>

          <div className="ml-auto z-10">
             <button 
                type="button" 
                onClick={onSignOut} 
                className="bg-white/5 hover:bg-rose-600/20 text-white border border-white/10 px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all backdrop-blur-md"
             >
                Terminate Session
             </button>
          </div>
        </div>

        <div className="px-16 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-5 space-y-10">
              <div className="space-y-2">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em]">Identity Matrix</h4>
                <p className="text-xs text-slate-500 italic">Select from AI-generated persona collections to set your node identity.</p>
              </div>

              <div className="space-y-6">
                {IDENTITY_MATRICES.map(category => (
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

                    {/* Pop-out avatar selector on hover */}
                    <div className="absolute left-full top-0 ml-4 hidden group-hover:flex gap-3 p-4 bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl z-20 animate-in fade-in slide-in-from-left-2">
                      {category.avatars.map((url, i) => (
                        <button 
                          key={i}
                          type="button"
                          onClick={() => setAvatarPreview(url)}
                          className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 border-2 border-transparent hover:border-indigo-500 transition-all shadow-md shrink-0 active:scale-90"
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
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operator Designation (Name)</label>
                      <input 
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-black outline-none focus:border-indigo-500 transition-all placeholder:text-slate-300" 
                        placeholder="Enter primary identity name..."
                        value={formData.name} 
                        onChange={e => setFormData({ ...formData, name: e.target.value })} 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entity Role</label>
                      <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-black outline-none focus:border-indigo-500 transition-all" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                        <option>Owner</option>
                        <option>Principal Admin</option>
                        <option>General Manager</option>
                      </select>
                    </div>
                 </div>

                 <button 
                  disabled={isSaving}
                  onClick={handleSave}
                  className="w-full bg-slate-900 text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-4"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                      Synchronize Identity Matrix
                    </>
                  )}
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
