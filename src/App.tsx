
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Employee, 
  AppState, 
  SwapRequest, 
  Vacation,
  ShiftOverride,
  ShiftLocation
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
    if (override) {
        return { label: getLabelForLoc(override.location), location: override.location, debug: 'MANUAL' };
    }

    if (vacations.some(v => v.employeeId === emp.id && date >= v.start && date <= v.end)) {
      return { label: 'VACACIONES', location: 'VACACIONES' as any, debug: 'VAC' };
    }

    const currentWeekIdx = Number(weeksPassed);
    const activeSwap = swaps.find(s => 
      Number(s.weekNumber) === currentWeekIdx && 
      (s.requesterId === emp.id || s.targetId === emp.id)
    );

    let baseIdToUse = Number(emp.baseScheduleId);
    let swapTag = '';

    if (activeSwap) {
      if (activeSwap.requesterId === emp.id) {
        const partner = employees.find(e => e.id === activeSwap.targetId);
        if (partner) { baseIdToUse = Number(partner.baseScheduleId); swapTag = partner.name.split(' ')[0]; }
      } else {
        const partner = employees.find(e => e.id === activeSwap.requesterId);
        if (partner) { baseIdToUse = Number(partner.baseScheduleId); swapTag = partner.name.split(' ')[0]; }
      }
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

  const handleFactoryReset = async () => {
    if (window.confirm('⚠️ ¿BORRAR TODO? Esto dejará la base de datos vacía.')) {
        await clearPath('employees');
        await clearPath('swaps');
        await clearPath('vacations');
        await clearPath('overrides');
        window.location.reload();
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
        <header className="flex flex-col md:flex-row justify-between items-center gap-6 p-6 glassmorphism rounded-[2.5rem] border border-white/20 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-lg">
              <span className="material-symbols-outlined text-3xl">calendar_month</span>
            </div>
            <div>
              <h1 className="text-2xl font-black">ShiftMaster <span className="text-blue-600">2026</span></h1>
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-40">Gestión de Horarios Rotativos</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            {!appState.isAuthenticated ? (
              <button onClick={() => setIsLoginOpen(true)} className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm shadow-lg hover:opacity-90 transition-all">Acceso Admin</button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setIsSwapOpen(true)} className="p-3 bg-purple-600/10 text-purple-600 rounded-2xl border border-purple-200 hover:bg-purple-600 hover:text-white transition-all" title="Intercambio de Horario"><span className="material-symbols-outlined">swap_horiz</span></button>
                <button onClick={() => setIsVacationOpen(true)} className="p-3 bg-teal-600/10 text-teal-600 rounded-2xl border border-teal-200 hover:bg-teal-600 hover:text-white transition-all" title="Registrar Vacaciones"><span className="material-symbols-outlined">beach_access</span></button>
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

        <main className="animate-fade-in">
          {isLoading ? (
            <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-600"></div></div>
          ) : employees.length === 0 ? (
            <div className="text-center py-20 bg-white/50 dark:bg-slate-900/50 rounded-[3rem] border-4 border-dashed border-slate-200 dark:border-slate-800">
               <span className="material-symbols-outlined text-6xl opacity-10">person_add</span>
               <h3 className="text-2xl font-black opacity-20 mt-4 italic">No hay datos en el sistema</h3>
               <p className="opacity-30">Inicia sesión como admin para configurar el personal.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {appState.viewMode === 'my-schedule' && (
                <div className="space-y-8 flex flex-col items-center">
                  <div className="flex flex-col items-center gap-6 w-full">
                    <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)} className="w-full max-sm:max-w-xs max-w-sm p-5 bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-blue-600/20 shadow-2xl text-center font-black text-xl appearance-none cursor-pointer outline-none focus:border-blue-600 transition-all">
                      {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                    <WeekNav weeksPassed={weeksPassed} weekRange={weekRange} onPrev={() => setAppState(p => ({ ...p, currentDate: new Date(p.currentDate.setDate(p.currentDate.getDate() - 7)) }))} onNext={() => setAppState(p => ({ ...p, currentDate: new Date(p.currentDate.setDate(p.currentDate.getDate() + 7)) }))} onToday={() => setAppState(p => ({ ...p, currentDate: new Date() }))} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
                    {Array.from({length: 7}).map((_, i) => {
                      const date = new Date(weekRange.start); date.setDate(date.getDate() + i);
                      const isToday = date.toDateString() === new Date().toDateString();
                      const currentEmp = employees.find(e => e.id === selectedUserId);
                      const shift = currentEmp ? getEffectiveShift(currentEmp, i, date) : null;
                      const styles = getLocStyles(shift?.location || 'Descanso');
                      return (
                        <div key={i} className={`p-8 rounded-[2.5rem] border-2 transition-all hover:scale-105 ${isToday ? 'bg-blue-600/5 border-blue-600 shadow-2xl ring-4 ring-blue-600/10' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm'}`}>
                          <div className="flex justify-between items-center mb-6">
                            <span className="font-black text-2xl capitalize">{date.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric' })}</span>
                            {isToday && <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black rounded-xl uppercase">Hoy</span>}
                          </div>
                          <div className="space-y-4">
                            <p className="font-bold text-slate-500 dark:text-slate-400">{shift?.label}</p>
                            <div className="flex items-center gap-2">
                              <span className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-tighter border ${styles}`}>{shift?.location}</span>
                              <span className="text-[9px] font-mono opacity-20 italic">{shift?.debug}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {appState.viewMode === 'general' && (
                <div className="space-y-10">
                  <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                    <h2 className="text-3xl font-black italic tracking-tighter">Vista <span className="text-blue-600">Total</span></h2>
                    <WeekNav weeksPassed={weeksPassed} weekRange={weekRange} onPrev={() => setAppState(p => ({ ...p, currentDate: new Date(p.currentDate.setDate(p.currentDate.getDate() - 7)) }))} onNext={() => setAppState(p => ({ ...p, currentDate: new Date(p.currentDate.setDate(p.currentDate.getDate() + 7)) }))} onToday={() => setAppState(p => ({ ...p, currentDate: new Date() }))} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {['Guardia', 'Valle', 'Mitras'].map(loc => {
                      const dayIdx = (appState.currentDate.getDay() + 6) % 7; 
                      const people = employees.filter(emp => {
                        const shift = getEffectiveShift(emp, dayIdx, appState.currentDate);
                        return shift?.location === loc;
                      });
                      return (
                        <div key={loc} className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl transition-all hover:translate-y-[-4px]">
                          <div className="flex items-center gap-3 mb-6">
                             <div className={`w-3 h-3 rounded-full ${getLocStyles(loc, true)} animate-pulse`}></div>
                             <h4 className="font-black text-xl uppercase tracking-tighter">{loc}</h4>
                             <span className="ml-auto px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-[10px] font-black opacity-50">{people.length} Pers.</span>
                          </div>
                          <div className="space-y-3">
                            {people.length === 0 ? (
                                <p className="text-[10px] opacity-20 italic font-bold">Sin personal asignado hoy</p>
                            ) : (
                                people.map(p => (
                                    <div key={p.id} className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800 last:border-0">
                                        <span className="text-xs font-bold">{p.name}</span>
                                        <span className="text-[9px] font-mono opacity-20">
                                            {getEffectiveShift(p, dayIdx, appState.currentDate)?.label?.split(' - ')[0]}
                                        </span>
                                    </div>
                                ))
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
                    <div className="overflow-x-auto no-scrollbar">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-800/50">
                            <th className="px-10 py-8 text-[10px] font-black uppercase text-slate-400 border-r dark:border-slate-700 sticky left-0 z-10 bg-inherit shadow-xl">Empleado</th>
                            {['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'].map(d => <th key={d} className="px-4 py-8 text-center text-[10px] font-black uppercase text-slate-400">{d}</th>)}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {employees.map(emp => (
                            <tr key={emp.id} className="hover:bg-blue-600/5 transition-colors">
                              <td className="px-10 py-6 sticky left-0 z-10 bg-white dark:bg-slate-900 border-r dark:border-slate-700 shadow-lg">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black shadow-md">{emp.name.charAt(0)}</div>
                                  <span className="font-bold text-sm truncate w-40">{emp.name}</span>
                                </div>
                              </td>
                              {Array.from({length: 7}).map((_, i) => {
                                const date = new Date(weekRange.start); date.setDate(date.getDate() + i);
                                const shift = getEffectiveShift(emp, i, date);
                                const styles = getLocStyles(shift?.location || 'Descanso', true);
                                return (
                                  <td key={i} className="px-2 py-4">
                                    <div className={`h-16 rounded-3xl flex flex-col items-center justify-center text-[10px] font-black gap-0.5 shadow-sm transition-all hover:scale-110 ${styles}`}>
                                      <span className="leading-tight">{shift?.label?.split(' - ')[0]}</span>
                                      {shift?.location !== 'Descanso' && shift?.location !== 'VACACIONES' && (
                                        <span className="opacity-70">{shift?.label?.split(' - ')[1]}</span>
                                      )}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {appState.viewMode === 'config' && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pb-12">
                  <div className="lg:col-span-2 p-10 bg-white dark:bg-slate-900 rounded-[3.5rem] border border-slate-200 dark:border-slate-800 shadow-xl space-y-10">
                    <h3 className="text-3xl font-black">Control de <span className="text-blue-600">Personal</span></h3>
                    <div className="flex gap-3 p-3 bg-slate-100 dark:bg-slate-800 rounded-3xl">
                       <input value={newEmployeeName} onChange={e => setNewEmployeeName(e.target.value)} placeholder="Nombre completo del empleado..." className="flex-1 bg-transparent p-4 outline-none font-bold placeholder:opacity-30" />
                       <button onClick={async () => { if(newEmployeeName.trim()) { await addData('employees', { name: newEmployeeName, baseScheduleId: (employees.length % 7) + 1 }); setNewEmployeeName(''); } }} className="px-10 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">Agregar</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {employees.map(e => (
                        <div key={e.id} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-200 dark:border-slate-700 group">
                          <span className="font-bold text-sm">{e.name}</span>
                          <div className="flex items-center gap-4">
                             <select value={e.baseScheduleId} onChange={s => updateData('employees', e.id, { baseScheduleId: parseInt(s.target.value) })} className="bg-transparent text-xs font-black p-2 outline-none border rounded-xl">
                                {[1,2,3,4,5,6,7].map(n => <option key={n} value={n}>H-{n}</option>)}
                             </select>
                             <button onClick={() => removeData('employees', e.id)} className="text-red-500 hover:scale-125 transition-transform"><span className="material-symbols-outlined">delete</span></button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="pt-10 border-t-4 border-red-500/5">
                       <h4 className="text-red-500 font-black mb-4 flex items-center gap-2"><span className="material-symbols-outlined">report_problem</span> BORRADO TOTAL</h4>
                       <button onClick={handleFactoryReset} className="w-full py-5 bg-red-600/10 text-red-600 border border-red-600/20 font-black rounded-3xl hover:bg-red-600 hover:text-white transition-all">LIMPIAR TODA LA BASE DE DATOS</button>
                    </div>
                  </div>

                  <div className="lg:col-span-2 space-y-8">
                      {/* INTERCAMBIOS */}
                      <div className="p-8 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-xl h-fit">
                          <h3 className="text-xl font-black mb-6 text-purple-600 flex items-center gap-3"><span className="material-symbols-outlined">swap_horiz</span> Intercambios Activos</h3>
                          <div className="space-y-4 max-h-[250px] overflow-y-auto no-scrollbar">
                            {swaps.length === 0 && <p className="text-center py-6 opacity-30 italic font-bold">Sin intercambios registrados.</p>}
                            {swaps.map(sw => (
                              <div key={sw.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                <div>
                                  <p className="text-xs font-black">{employees.find(e => e.id === sw.requesterId)?.name?.split(' ')[0]} ↔ {employees.find(e => e.id === sw.targetId)?.name?.split(' ')[0]}</p>
                                  <p className="text-[10px] opacity-40 font-bold uppercase tracking-widest">Semana {Number(sw.weekNumber) + 1}</p>
                                </div>
                                <button onClick={() => removeData('swaps', sw.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all" title="Revocar Intercambio"><span className="material-symbols-outlined text-sm">delete_forever</span></button>
                              </div>
                            ))}
                          </div>
                      </div>

                      {/* VACACIONES */}
                      <div className="p-8 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-xl h-fit">
                          <h3 className="text-xl font-black mb-6 text-teal-600 flex items-center gap-3"><span className="material-symbols-outlined">beach_access</span> Vacaciones Registradas</h3>
                          <div className="space-y-4 max-h-[250px] overflow-y-auto no-scrollbar">
                            {vacations.length === 0 && <p className="text-center py-6 opacity-30 italic font-bold">Sin vacaciones registradas.</p>}
                            {vacations.map(vac => {
                              const emp = employees.find(e => e.id === vac.employeeId);
                              return (
                                <div key={vac.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                  <div>
                                    <p className="text-xs font-black">{emp?.name}</p>
                                    <p className="text-[10px] opacity-40 font-bold uppercase tracking-tighter">
                                      {vac.start.toLocaleDateString()} — {vac.end.toLocaleDateString()}
                                    </p>
                                  </div>
                                  <button onClick={() => removeData('vacations', vac.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all" title="Revocar Vacaciones"><span className="material-symbols-outlined text-sm">delete_forever</span></button>
                                </div>
                              );
                            })}
                          </div>
                      </div>

                      {/* MOVIMIENTOS MANUALES */}
                      <div className="p-8 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-xl h-fit">
                          <h3 className="text-xl font-black mb-6 text-orange-600 flex items-center gap-3"><span className="material-symbols-outlined">edit_location</span> Movimientos Manuales</h3>
                          <div className="space-y-4 max-h-[250px] overflow-y-auto no-scrollbar">
                            {overrides.length === 0 && <p className="text-center py-6 opacity-30 italic font-bold">Sin movimientos manuales.</p>}
                            {overrides.map(ov => {
                              const emp = employees.find(e => e.id === ov.employeeId);
                              return (
                                <div key={ov.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                  <div>
                                    <p className="text-xs font-black">{emp?.name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-[10px] opacity-40 font-bold">{ov.date}</span>
                                      <span className="px-2 py-0.5 bg-orange-500/10 text-orange-600 rounded-md text-[8px] font-black uppercase tracking-tighter">{ov.location}</span>
                                    </div>
                                  </div>
                                  <button onClick={() => removeData('overrides', ov.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all" title="Revocar Movimiento"><span className="material-symbols-outlined text-sm">delete_forever</span></button>
                                </div>
                              );
                            })}
                          </div>
                      </div>
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

const WeekNav: React.FC<any> = ({ weeksPassed, weekRange, onPrev, onNext, onToday }) => (
  <div className="flex items-center gap-6 bg-white dark:bg-slate-900 p-3 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800">
    <button onClick={onPrev} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all"><span className="material-symbols-outlined text-blue-600">chevron_left</span></button>
    <div className="flex flex-col items-center min-w-[160px]">
       <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Semana {Number(weeksPassed) + 1}</span>
       <span className="text-sm font-black">{weekRange.start.toLocaleDateString('es-MX', {day: 'numeric', month: 'short'})} - {weekRange.end.toLocaleDateString('es-MX', {day: 'numeric', month: 'short'})}</span>
    </div>
    <button onClick={onNext} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all"><span className="material-symbols-outlined text-blue-600">chevron_right</span></button>
    <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 mx-2" />
    <button onClick={onToday} className="px-5 py-2.5 bg-blue-600 text-white text-[10px] font-black rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all">HOY</button>
  </div>
);

export default App;
