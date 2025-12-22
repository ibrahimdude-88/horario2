
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Employee, 
  AppState, 
  SwapRequest, 
  Vacation,
  ShiftOverride
} from './types';
import { getWeeksPassed, getScheduleForWeek, getWeekRange } from './services/scheduleService';
import { subscribeToData, addData, removeData, updateData, clearPath } from './services/firebaseService';
import LoginModal from './components/LoginModal';
import SwapModal from './components/SwapModal';
import VacationModal from './components/VacationModal';
import ManualMoveModal from './components/ManualMoveModal';

const App: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [swaps, setSwaps] = useState<SwapRequest[]>([]);
  const [vacations, setVacations] = useState<Vacation[]>([]);
  const [overrides, setOverrides] = useState<ShiftOverride[]>([]);

  const [appState, setAppState] = useState<AppState>({
    currentDate: new Date(),
    viewMode: 'my-schedule',
    isAuthenticated: false,
    isAdmin: false,
    theme: 'dark'
  });
  
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSwapOpen, setIsSwapOpen] = useState(false);
  const [isVacationOpen, setIsVacationOpen] = useState(false);
  const [isManualMoveOpen, setIsManualMoveOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newEmployeeName, setNewEmployeeName] = useState('');

  const weeksPassed = useMemo(() => getWeeksPassed(appState.currentDate), [appState.currentDate]);
  const weekRange = useMemo(() => getWeekRange(appState.currentDate), [appState.currentDate]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', appState.theme === 'dark');
  }, [appState.theme]);

  useEffect(() => {
    const unsubEmployees = subscribeToData<Employee>('employees', (data) => {
      setEmployees(data);
      if (!selectedUserId && data.length > 0) setSelectedUserId(data[0].id);
      setIsLoading(false);
    });
    const unsubSwaps = subscribeToData<SwapRequest>('swaps', (data) => setSwaps(data));
    const unsubVacations = subscribeToData<any>('vacations', (data) => {
      setVacations(data.map((v: any) => ({ ...v, start: new Date(v.start), end: new Date(v.end) })));
    });
    const unsubOverrides = subscribeToData<ShiftOverride>('overrides', (data) => setOverrides(data));

    return () => {
      unsubEmployees(); unsubSwaps(); unsubVacations(); unsubOverrides();
    };
  }, [selectedUserId]);

  const getEffectiveShift = (emp: Employee, dayIndex: number, date: Date) => {
    const isoDate = date.toISOString().split('T')[0];
    const override = overrides.find(o => o.employeeId === emp.id && o.date === isoDate);
    if (override) return { label: getLabelForLoc(override.location), location: override.location, debug: 'MANUAL' };

    if (vacations.some(v => v.employeeId === emp.id && date >= v.start && date <= v.end)) {
      return { label: 'VACACIONES', location: 'VACACIONES' as any, debug: 'VAC' };
    }

    const currentWeekIdx = Number(weeksPassed);
    const activeSwap = swaps.find(s => Number(s.weekNumber) === currentWeekIdx && (s.requesterId === emp.id || s.targetId === emp.id));
    let baseIdToUse = Number(emp.baseScheduleId);
    let swapTag = '';

    if (activeSwap) {
      const partnerId = activeSwap.requesterId === emp.id ? activeSwap.targetId : activeSwap.requesterId;
      const partner = employees.find(e => e.id === partnerId);
      if (partner) { baseIdToUse = Number(partner.baseScheduleId); swapTag = partner.name.split(' ')[0]; }
    }

    const schedule = getScheduleForWeek(baseIdToUse, currentWeekIdx);
    const shift = schedule?.shifts[dayIndex];
    return shift ? { ...shift, debug: swapTag ? `↔ ${swapTag}` : `H-${baseIdToUse}` } : null;
  };

  const getLabelForLoc = (loc: string) => {
    if (loc === 'Guardia') return '05:30 PM - 09:00 PM';
    if (loc === 'Valle') return '10:00 AM - 07:00 PM';
    if (loc === 'Mitras') return '08:30 AM - 05:30 PM';
    return 'Descanso';
  };

  const getLocStyles = (loc: string, isFull: boolean = false) => {
    switch(loc) {
      case 'Guardia': return isFull ? 'bg-blue-600 text-white' : 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'Valle': return isFull ? 'bg-yellow-400 text-black' : 'bg-yellow-400/10 text-yellow-700 border-yellow-200';
      case 'Mitras': return isFull ? 'bg-red-600 text-white' : 'bg-red-500/10 text-red-600 border-red-200';
      case 'VACACIONES': return isFull ? 'bg-teal-500 text-white' : 'bg-teal-500/10 text-teal-600 border-teal-200';
      default: return isFull ? 'bg-slate-200 text-slate-400' : 'bg-slate-100 text-slate-400 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-all pb-32">
      {appState.isAdmin && (
        <button onClick={() => setIsManualMoveOpen(true)} className="fixed bottom-10 right-10 z-50 w-16 h-16 bg-orange-600 text-white rounded-full shadow-2xl hover:scale-110 active:scale-90 transition-all border-4 border-white flex items-center justify-center">
          <span className="material-symbols-outlined text-3xl">edit_location</span>
        </button>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-center gap-6 p-6 glass rounded-[2.5rem] border border-white/20 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-lg">
              <span className="material-symbols-outlined text-3xl">calendar_month</span>
            </div>
            <div>
              <h1 className="text-2xl font-black">Horarios <span className="text-blue-600">ST</span> 2026</h1>
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-40">Gestión de Horarios Rotativos</p>
            </div>
          </div>
          <div className="flex gap-3">
            {!appState.isAuthenticated ? (
              <button onClick={() => setIsLoginOpen(true)} className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm shadow-lg hover:opacity-90 transition-all">Acceso Admin</button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setIsSwapOpen(true)} className="p-3 bg-purple-600/10 text-purple-600 rounded-2xl border border-purple-200 hover:bg-purple-600 hover:text-white transition-all"><span className="material-symbols-outlined">swap_horiz</span></button>
                <button onClick={() => setIsVacationOpen(true)} className="p-3 bg-teal-600/10 text-teal-600 rounded-2xl border border-teal-200 hover:bg-teal-600 hover:text-white transition-all"><span className="material-symbols-outlined">beach_access</span></button>
              </div>
            )}
            <button onClick={() => setAppState(p => ({ ...p, theme: p.theme === 'dark' ? 'light' : 'dark' }))} className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-slate-100 dark:border-slate-700">
              <span className="material-symbols-outlined">{appState.theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
            </button>
          </div>
        </header>

        <nav className="flex justify-center">
          <div className="flex p-1.5 bg-slate-200 dark:bg-slate-900 rounded-[1.5rem] shadow-inner">
            {['Mi Horario', 'Vista General', 'Ajustes'].map(tab => {
              const mode: any = tab === 'Mi Horario' ? 'my-schedule' : tab === 'Vista General' ? 'general' : 'config';
              if (mode === 'config' && !appState.isAdmin) return null;
              const active = appState.viewMode === mode;
              return (
                <button key={tab} onClick={() => setAppState(p => ({ ...p, viewMode: mode }))} className={`px-8 py-3 rounded-2xl text-sm font-black transition-all ${active ? 'bg-white dark:bg-slate-700 shadow-md text-blue-600 dark:text-white' : 'text-slate-500 hover:text-slate-800'}`}>{tab}</button>
              );
            })}
          </div>
        </nav>

        <main className="animate-fade">
          {isLoading ? (
            <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-600"></div></div>
          ) : (
            <div className="space-y-8">
              {appState.viewMode === 'my-schedule' && (
                <div className="space-y-8 flex flex-col items-center">
                  <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)} className="w-full max-w-sm p-5 bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-blue-600/20 shadow-2xl text-center font-black text-xl outline-none transition-all">
                    {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
                  <WeekNav weeksPassed={weeksPassed} weekRange={weekRange} onPrev={() => setAppState(p => ({ ...p, currentDate: new Date(p.currentDate.setDate(p.currentDate.getDate() - 7)) }))} onNext={() => setAppState(p => ({ ...p, currentDate: new Date(p.currentDate.setDate(p.currentDate.getDate() + 7)) }))} onToday={() => setAppState(p => ({ ...p, currentDate: new Date() }))} />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
                    {Array.from({length: 7}).map((_, i) => {
                      const date = new Date(weekRange.start); date.setDate(date.getDate() + i);
                      const currentEmp = employees.find(e => e.id === selectedUserId);
                      const shift = currentEmp ? getEffectiveShift(currentEmp, i, date) : null;
                      const styles = getLocStyles(shift?.location || 'Descanso');
                      return (
                        <div key={i} className={`p-8 rounded-[2.5rem] border-2 transition-all bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm`}>
                          <span className="font-black text-2xl capitalize block mb-6">{date.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric' })}</span>
                          <p className="font-bold text-slate-500 dark:text-slate-400 mb-4">{shift?.label}</p>
                          <span className={`px-5 py-2 rounded-full text-xs font-black uppercase border ${styles}`}>{shift?.location}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {appState.viewMode === 'general' && (
                <div className="space-y-10">
                  <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                    <h2 className="text-3xl font-black italic">Vista <span className="text-blue-600">Global</span></h2>
                    <WeekNav weeksPassed={weeksPassed} weekRange={weekRange} onPrev={() => setAppState(p => ({ ...p, currentDate: new Date(p.currentDate.setDate(p.currentDate.getDate() - 7)) }))} onNext={() => setAppState(p => ({ ...p, currentDate: new Date(p.currentDate.setDate(p.currentDate.getDate() + 7)) }))} onToday={() => setAppState(p => ({ ...p, currentDate: new Date() }))} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {['Guardia', 'Valle', 'Mitras'].map(loc => {
                      const dayIdx = (appState.currentDate.getDay() + 6) % 7; 
                      const people = employees.filter(emp => getEffectiveShift(emp, dayIdx, appState.currentDate)?.location === loc);
                      return (
                        <div key={loc} className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl">
                          <h4 className="font-black text-xl uppercase mb-6 flex justify-between">{loc} <span className="opacity-30">{people.length}</span></h4>
                          <div className="space-y-2">
                            {people.map(p => <div key={p.id} className="text-xs font-bold py-1 border-b border-slate-50 dark:border-slate-800 last:border-0">{p.name}</div>)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {appState.viewMode === 'config' && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                  <div className="lg:col-span-2 p-10 bg-white dark:bg-slate-900 rounded-[3.5rem] border border-slate-200 dark:border-slate-800 shadow-xl">
                    <h3 className="text-3xl font-black mb-10">Control de <span className="text-blue-600">Personal</span></h3>
                    <div className="flex gap-3 mb-8">
                       <input value={newEmployeeName} onChange={e => setNewEmployeeName(e.target.value)} placeholder="Nuevo empleado..." className="flex-1 bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl outline-none font-bold" />
                       <button onClick={async () => { if(newEmployeeName.trim()) { await addData('employees', { name: newEmployeeName, baseScheduleId: (employees.length % 7) + 1 }); setNewEmployeeName(''); } }} className="px-8 bg-blue-600 text-white font-black rounded-2xl">Añadir</button>
                    </div>
                    <div className="grid gap-3">
                      {employees.map(e => (
                        <div key={e.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                          <span className="font-bold text-sm">{e.name}</span>
                          <button onClick={() => removeData('employees', e.id)} className="text-red-500"><span className="material-symbols-outlined">delete</span></button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="lg:col-span-2 space-y-6">
                    <RevocationList title="Intercambios" data={swaps} onRevoke={(id) => removeData('swaps', id)} icon="swap_horiz" color="purple" />
                    <RevocationList title="Vacaciones" data={vacations} onRevoke={(id) => removeData('vacations', id)} icon="beach_access" color="teal" />
                    <RevocationList title="Movimientos Manuales" data={overrides} onRevoke={(id) => removeData('overrides', id)} icon="edit_location" color="orange" />
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onLogin={(s) => s && setAppState(p => ({ ...p, isAuthenticated: true, isAdmin: true }))} />
      <SwapModal isOpen={isSwapOpen} onClose={() => setIsSwapOpen(false)} employees={employees} onConfirm={(r, t, re) => addData('swaps', { weekNumber: weeksPassed, requesterId: r, targetId: t, reason: re })} />
      <VacationModal isOpen={isVacationOpen} onClose={() => setIsVacationOpen(false)} employees={employees} onConfirm={(id, s, e) => addData('vacations', { employeeId: id, start: new Date(s).toISOString(), end: new Date(e).toISOString() })} />
      <ManualMoveModal isOpen={isManualMoveOpen} onClose={() => setIsManualMoveOpen(false)} employees={employees} onConfirm={(id, d, l) => addData('overrides', { employeeId: id, date: d, location: l })} />
    </div>
  );
};

const RevocationList: React.FC<any> = ({ title, data, onRevoke, icon, color }) => (
  <div className="p-6 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-lg">
    <h4 className={`text-lg font-black mb-4 flex items-center gap-2 text-${color}-600`}><span className="material-symbols-outlined">{icon}</span> {title}</h4>
    <div className="space-y-3 max-h-[200px] overflow-y-auto no-scrollbar">
      {data.length === 0 ? <p className="text-xs opacity-30 italic">No hay registros.</p> : data.map((item: any) => (
        <div key={item.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
           <span className="text-[10px] font-bold truncate pr-2">{item.reason || item.date || 'Registro activo'}</span>
           <button onClick={() => onRevoke(item.id)} className="text-red-500 hover:scale-110 transition-transform"><span className="material-symbols-outlined text-sm">delete_forever</span></button>
        </div>
      ))}
    </div>
  </div>
);

const WeekNav: React.FC<any> = ({ weeksPassed, weekRange, onPrev, onNext, onToday }) => (
  <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-3 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800">
    <button onClick={onPrev} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"><span className="material-symbols-outlined text-blue-600">chevron_left</span></button>
    <div className="text-center min-w-[140px]">
       <span className="text-[10px] font-black text-blue-600 uppercase block">Semana {Number(weeksPassed) + 1}</span>
       <span className="text-xs font-black">{weekRange.start.toLocaleDateString()} - {weekRange.end.toLocaleDateString()}</span>
    </div>
    <button onClick={onNext} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"><span className="material-symbols-outlined text-blue-600">chevron_right</span></button>
    <button onClick={onToday} className="px-4 py-2 bg-blue-600 text-white text-[10px] font-black rounded-xl">HOY</button>
  </div>
);

export default App;
