
import React, { useState } from 'react';

interface StaffMember {
  id: string;
  name: string;
  age: number;
  gender: string;
  address: string;
  role: string;
  salary: number;
  mobile: string;
  aadhar: string;
  status: 'On Shift' | 'Break' | 'Offline';
  color: string;
}

const INITIAL_STAFF: StaffMember[] = [
  { 
    id: '1', 
    name: 'Alex Rivera', 
    age: 28, 
    gender: 'Male', 
    address: 'Sector 5, Gurgaon', 
    role: 'Manager', 
    salary: 45000, 
    mobile: '9876543210', 
    aadhar: '123456789012', 
    status: 'On Shift', 
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100' 
  },
  { 
    id: '2', 
    name: 'Maria Santos', 
    age: 32, 
    gender: 'Female', 
    address: 'Indiranagar, Bangalore', 
    role: 'Head Chef', 
    salary: 55000, 
    mobile: '9988776655', 
    aadhar: '987654321098', 
    status: 'Break', 
    color: 'bg-amber-50 text-amber-600 border-amber-100' 
  },
];

const Employment: React.FC = () => {
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const [newStaff, setNewStaff] = useState({ 
    name: '', 
    age: '', 
    gender: 'Male', 
    address: '', 
    role: 'Waiter', 
    salary: '', 
    mobile: '', 
    aadhar: '' 
  });

  const [isProcessingPayroll, setIsProcessingPayroll] = useState(false);

  const handleOpenModal = (member?: StaffMember) => {
    if (member) {
      setEditingStaff(member);
      setNewStaff({ 
        name: member.name, 
        age: member.age.toString(), 
        gender: member.gender, 
        address: member.address, 
        role: member.role, 
        salary: member.salary.toString(), 
        mobile: member.mobile, 
        aadhar: member.aadhar 
      });
    } else {
      setEditingStaff(null);
      setNewStaff({ name: '', age: '', gender: 'Male', address: '', role: 'Waiter', salary: '', mobile: '', aadhar: '' });
    }
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newStaff.mobile.length > 10) return;
    if (newStaff.aadhar.length !== 12) {
        alert("Aadhar card must be exactly 12 digits.");
        return;
    }

    const staffData: StaffMember = {
      id: editingStaff ? editingStaff.id : Math.random().toString(36).substr(2, 9),
      name: newStaff.name,
      age: parseInt(newStaff.age),
      gender: newStaff.gender,
      address: newStaff.address,
      role: newStaff.role,
      salary: parseFloat(newStaff.salary),
      mobile: newStaff.mobile,
      aadhar: newStaff.aadhar,
      status: editingStaff ? editingStaff.status : 'Offline',
      color: editingStaff ? editingStaff.color : 'bg-slate-100 text-slate-500 border-slate-200'
    };

    if (editingStaff) {
      setStaff(prev => prev.map(s => s.id === editingStaff.id ? staffData : s));
    } else {
      setStaff([...staff, staffData]);
    }
    setShowModal(false);
  };

  const handleStatusToggle = (id: string) => {
    setStaff(prev => prev.map(s => {
      if (s.id !== id) return s;
      const nextStatus = s.status === 'On Shift' ? 'Break' : s.status === 'Break' ? 'Offline' : 'On Shift';
      const color = nextStatus === 'On Shift' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                   nextStatus === 'Break' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                   'bg-slate-100 text-slate-500 border-slate-200';
      return { ...s, status: nextStatus, color };
    }));
  };

  const removeStaff = (id: string) => {
    const person = staff.find(s => s.id === id);
    if (!person) return;
    if(confirm(`TERMINATE EMPLOYMENT: Are you sure you want to terminate ${person.name}?`)) {
      setStaff(prev => prev.map(s => s.id === id ? { ...s, status: 'Offline', color: 'bg-rose-100 text-rose-500 border-rose-200 animate-pulse' } : s));
      setTimeout(() => {
        setStaff(prev => prev.filter(s => s.id !== id));
      }, 1000);
    }
  };

  const processPayroll = () => {
    setIsProcessingPayroll(true);
    setTimeout(() => {
      setIsProcessingPayroll(false);
      alert('Payroll processed successfully.');
    }, 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-3 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase italic">Staff Ecosystem</h3>
              <p className="text-xs text-slate-500 font-bold tracking-widest uppercase">Root Directory & Identity Management</p>
            </div>
            <button 
              onClick={() => handleOpenModal()}
              className="bg-indigo-600 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
            >
              + Hire New Asset
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Identity</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Assignment</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Contact / KYC</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Node Status</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Matrix Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staff.map(person => (
                  <React.Fragment key={person.id}>
                    <tr 
                      className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${expandedId === person.id ? 'bg-indigo-50/30' : ''}`}
                      onClick={() => setExpandedId(expandedId === person.id ? null : person.id)}
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 overflow-hidden shadow-sm">
                              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${person.name}`} alt={person.name} />
                           </div>
                           <div>
                            <span className="font-black text-slate-800 tracking-tight block">{person.name}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{person.age}y • {person.gender}</span>
                           </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-sm font-black text-slate-900 uppercase tracking-tighter">{person.role}</span>
                        <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-0.5">₹{person.salary.toLocaleString()}/mo</p>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold text-slate-600">+91 {person.mobile}</span>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">UID: {person.aadhar.replace(/(\d{4})/g, '$1 ')}</span>
                         </div>
                      </td>
                      <td className="px-8 py-6">
                         <button 
                          onClick={(e) => { e.stopPropagation(); handleStatusToggle(person.id); }}
                          className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all hover:scale-105 active:scale-95 ${person.color}`}
                         >
                            {person.status}
                         </button>
                      </td>
                      <td className="px-8 py-6 text-right">
                         <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={(e) => { e.stopPropagation(); handleOpenModal(person); }} className="text-[9px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all">Edit</button>
                            <button onClick={(e) => { e.stopPropagation(); removeStaff(person.id); }} className="text-[9px] font-black text-rose-500 uppercase tracking-widest bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100 hover:bg-rose-500 hover:text-white transition-all">Arch</button>
                         </div>
                      </td>
                    </tr>
                    {expandedId === person.id && (
                      <tr className="bg-slate-50/50 animate-in slide-in-from-top-2 duration-300">
                        <td colSpan={5} className="px-10 py-8">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            <div>
                              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Residential Vector</h5>
                              <p className="text-sm font-bold text-slate-600 leading-relaxed italic">"{person.address}"</p>
                            </div>
                            <div>
                              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Compliance Data</h5>
                              <div className="flex flex-col gap-2">
                                <div className="flex justify-between text-xs">
                                  <span className="font-bold text-slate-400 uppercase">Aadhar:</span>
                                  <span className="font-black text-slate-700">{person.aadhar}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                  <span className="font-bold text-slate-400 uppercase">Phone:</span>
                                  <span className="font-black text-slate-700">+91 {person.mobile}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col justify-center border-l border-slate-200 pl-10">
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Performance Efficiency</p>
                               <div className="flex items-end gap-2">
                                  <span className="text-4xl font-black text-indigo-600">92%</span>
                                  <span className="text-xs font-bold text-emerald-500 pb-1.5">▲ Optimal</span>
                               </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-8">
           <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden group">
              <div className="relative z-10">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-6 block border-b border-white/10 pb-4">Principal Shifts</h4>
                <div className="space-y-6">
                   {[
                     { time: '14:00', name: 'Kitchen Alpha', pax: 5 },
                     { time: '16:30', name: 'Service Beta', pax: 2 },
                     { time: '18:00', name: 'Closing Delta', pax: 12 }
                   ].map((shift, i) => (
                     <div key={i} className="flex items-center gap-4 group/item">
                        <div className="text-xl font-black text-indigo-400 group-hover/item:scale-110 transition-transform">{shift.time}</div>
                        <div>
                           <p className="text-sm font-bold tracking-tight">{shift.name}</p>
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{shift.pax} Nodes Online</p>
                        </div>
                     </div>
                   ))}
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-600/20 blur-3xl rounded-full"></div>
           </div>

           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Capital Expenditure</h4>
              <div className="space-y-4">
                 <div className="flex justify-between items-center p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Payroll</span>
                    <span className="text-xl font-black text-slate-800">₹{ staff.reduce((acc,s)=>acc+s.salary, 0).toLocaleString() }</span>
                 </div>
                 <div className="flex justify-between items-center p-5 bg-indigo-50 rounded-[1.5rem] border border-indigo-100">
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Cycle Remaining</span>
                    <span className="text-xl font-black text-indigo-600">12 Days</span>
                 </div>
              </div>
              <button 
                onClick={processPayroll}
                disabled={isProcessingPayroll}
                className="w-full mt-6 bg-slate-900 text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                {isProcessingPayroll ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Authenticating Transact...
                  </>
                ) : 'Execute Payroll Matrix'}
              </button>
           </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#05060b]/80 backdrop-blur-xl p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[3.5rem] p-12 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all active:scale-90">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="mb-10 text-center">
              <h3 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter mb-1">
                {editingStaff ? 'Re-Matrix Employee' : 'Onboard Human Asset'}
              </h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">Establishing Identity in Central Node</p>
            </div>

            <form onSubmit={handleSave} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Legal Identity (Name)</label>
                  <input 
                    required
                    type="text" 
                    value={newStaff.name} 
                    onChange={e => setNewStaff({...newStaff, name: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-black outline-none focus:border-indigo-500 transition-all" 
                    placeholder="e.g. Rahul Malhotra" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Biological Age</label>
                    <input 
                      required
                      type="number" 
                      value={newStaff.age} 
                      onChange={e => setNewStaff({...newStaff, age: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-black outline-none focus:border-indigo-500 transition-all" 
                      placeholder="Age" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gender Matrix</label>
                    <select 
                      value={newStaff.gender} 
                      onChange={e => setNewStaff({...newStaff, gender: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-black outline-none focus:border-indigo-500 transition-all"
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Non-Binary</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Residential Vector (Address)</label>
                <textarea 
                  required
                  value={newStaff.address} 
                  onChange={e => setNewStaff({...newStaff, address: e.target.value})} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-black outline-none focus:border-indigo-500 transition-all h-24 resize-none" 
                  placeholder="Full physical address..." 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Functional Designation (Role)</label>
                  <select 
                    value={newStaff.role} 
                    onChange={e => setNewStaff({...newStaff, role: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-black outline-none focus:border-indigo-500 transition-all"
                  >
                    <option>Manager</option>
                    <option>Head Chef</option>
                    <option>Chef de Partie</option>
                    <option>Senior Waiter</option>
                    <option>Waiter</option>
                    <option>Cashier</option>
                    <option>Cleaner</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cycle Compensation (Salary)</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-400">₹</span>
                    <input 
                      required
                      type="number" 
                      value={newStaff.salary} 
                      onChange={e => setNewStaff({...newStaff, salary: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-6 py-4 text-sm font-black outline-none focus:border-indigo-500 transition-all" 
                      placeholder="Salary/mo" 
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Terminal Link (Mobile)</label>
                  <div className="relative">
                    <input 
                      required
                      type="tel" 
                      value={newStaff.mobile} 
                      onChange={e => setNewStaff({...newStaff, mobile: e.target.value.replace(/\D/g, '')})} 
                      className={`w-full bg-slate-50 border rounded-2xl px-6 py-4 text-sm font-black outline-none transition-all ${newStaff.mobile.length > 10 ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'}`} 
                      placeholder="10-digit number" 
                    />
                    {newStaff.mobile.length > 10 && (
                      <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mt-1.5 ml-1 animate-pulse">Critical: Max 10 digits allowed</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">National KYC (Aadhar)</label>
                  <div className="relative">
                    <input 
                      required
                      type="text" 
                      maxLength={12}
                      value={newStaff.aadhar} 
                      onChange={e => setNewStaff({...newStaff, aadhar: e.target.value.replace(/\D/g, '')})} 
                      className={`w-full bg-slate-50 border rounded-2xl px-6 py-4 text-sm font-black outline-none transition-all ${newStaff.aadhar.length > 12 ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'}`} 
                      placeholder="12-digit Aadhar" 
                    />
                    {newStaff.aadhar.length > 12 && (
                      <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mt-1.5 ml-1 animate-pulse">Warning: Exactly 12 digits required</p>
                    )}
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={newStaff.mobile.length > 10 || newStaff.aadhar.length !== 12}
                className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.3em] text-xs shadow-2xl active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
              >
                {editingStaff ? 'Update Identity Matrix' : 'Establish Human Connection'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employment;
