
import React, { useState } from 'react';

interface StaffMember {
  id: string;
  name: string;
  role: string;
  status: 'On Shift' | 'Break' | 'Offline';
  color: string;
}

const INITIAL_STAFF: StaffMember[] = [
  { id: '1', name: 'Alex Rivera', role: 'Manager', status: 'On Shift', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  { id: '2', name: 'Maria Santos', role: 'Head Chef', status: 'Break', color: 'bg-amber-50 text-amber-600 border-amber-100' },
  { id: '3', name: 'James Wilson', role: 'Senior Waiter', status: 'On Shift', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  { id: '4', name: 'Sara Kim', role: 'Cashier', status: 'Offline', color: 'bg-slate-100 text-slate-500 border-slate-200' },
];

const Employment: React.FC = () => {
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [newStaff, setNewStaff] = useState({ name: '', role: 'Waiter' });
  const [isProcessingPayroll, setIsProcessingPayroll] = useState(false);

  const handleOpenModal = (member?: StaffMember) => {
    if (member) {
      setEditingStaff(member);
      setNewStaff({ name: member.name, role: member.role });
    } else {
      setEditingStaff(null);
      setNewStaff({ name: '', role: 'Waiter' });
    }
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStaff) {
      setStaff(prev => prev.map(s => s.id === editingStaff.id ? { ...s, name: newStaff.name, role: newStaff.role } : s));
    } else {
      const member: StaffMember = {
        id: Math.random().toString(36).substr(2, 9),
        name: newStaff.name,
        role: newStaff.role,
        status: 'Offline',
        color: 'bg-slate-100 text-slate-500 border-slate-200'
      };
      setStaff([...staff, member]);
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

    if(confirm(`TERMINATE EMPLOYMENT: Are you absolutely sure you want to terminate ${person.name}? This will revoke all system access immediately.`)) {
      // Add a small "terminating" delay for professional feel
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
      alert('Payroll processed successfully for all active staff members.');
    }, 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase italic">Staff Roster</h3>
              <p className="text-xs text-slate-500 font-bold tracking-widest uppercase">Currently Active Personnel</p>
            </div>
            <button 
              onClick={() => handleOpenModal()}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
            >
              + Hire New
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Employee</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Designation</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Current Status</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staff.map(person => (
                  <tr key={person.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                            <img src={`https://picsum.photos/seed/p${person.id}/100/100`} alt={person.name} />
                         </div>
                         <span className="font-bold text-slate-800">{person.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-medium text-slate-500">{person.role}</span>
                    </td>
                    <td className="px-8 py-6">
                       <button 
                        onClick={() => handleStatusToggle(person.id)}
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all hover:scale-105 active:scale-95 ${person.color}`}
                       >
                          {person.status}
                       </button>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleOpenModal(person)} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Edit</button>
                          <button onClick={() => removeStaff(person.id)} className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline">Terminate</button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-8">
           <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden group">
              <div className="relative z-10">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-6 block border-b border-white/10 pb-4">Upcoming Shifts</h4>
                <div className="space-y-6">
                   {[
                     { time: '14:00', name: 'Dinner Team A', pax: 5 },
                     { time: '16:30', name: 'Logistics Prep', pax: 2 },
                     { time: '18:00', name: 'Peak Night Team', pax: 12 }
                   ].map((shift, i) => (
                     <div key={i} className="flex items-center gap-4 group/item">
                        <div className="text-xl font-black text-indigo-400 group-hover/item:scale-110 transition-transform">{shift.time}</div>
                        <div>
                           <p className="text-sm font-bold">{shift.name}</p>
                           <p className="text-[10px] text-slate-400 font-medium">{shift.pax} Staff Members Required</p>
                        </div>
                     </div>
                   ))}
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-600/20 blur-3xl rounded-full"></div>
           </div>

           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">Payroll Overview</h4>
              <div className="space-y-4">
                 <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Payroll</span>
                    <span className="text-lg font-black text-slate-800">₹{ (staff.length * 15000).toLocaleString() }</span>
                 </div>
                 <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Bonuses Pending</span>
                    <span className="text-lg font-black text-emerald-500">₹{ (staff.filter(s=>s.status==='On Shift').length * 200).toLocaleString() }</span>
                 </div>
              </div>
              <button 
                onClick={processPayroll}
                disabled={isProcessingPayroll}
                className="w-full mt-6 bg-slate-100 text-slate-600 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
              >
                {isProcessingPayroll ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : 'Process Payroll'}
              </button>
           </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl relative">
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter mb-8 text-center">
              {editingStaff ? 'Update Personnel' : 'Hire Personnel'}
            </h3>
            <form onSubmit={handleSave} className="space-y-6">
              <input 
                required
                type="text" 
                value={newStaff.name} 
                onChange={e => setNewStaff({...newStaff, name: e.target.value})} 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium outline-none focus:border-indigo-500" 
                placeholder="Full Name" 
              />
              <select 
                value={newStaff.role} 
                onChange={e => setNewStaff({...newStaff, role: e.target.value})} 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium outline-none"
              >
                <option>Manager</option>
                <option>Head Chef</option>
                <option>Chef de Partie</option>
                <option>Senior Waiter</option>
                <option>Waiter</option>
                <option>Cashier</option>
                <option>Cleaner</option>
              </select>
              <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                {editingStaff ? 'Apply Changes' : 'Onboard Member'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employment;
