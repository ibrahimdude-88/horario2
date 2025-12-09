import React, { useState, useEffect, useMemo } from 'react';
import { 
  Employee, 
  AppState, 
  SwapRequest, 
  LOCATIONS, 
  Shift,
  Vacation
} from './types';
import { INITIAL_EMPLOYEES } from './constants';
import { getWeeksPassed, getScheduleForWeek, getWeekRange } from './services/scheduleService';
import { subscribeToData, addData, removeData, updateData } from './services/firebaseService';
import LoginModal from './components/LoginModal';
import SwapModal from './components/SwapModal';
import VacationModal from './components/VacationModal';

const App: React.FC = () => {
  // --- State ---
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [swaps, setSwaps] = useState<SwapRequest[]>([]);
  const [vacations, setVacations] = useState<Vacation[]>([]);

  const [appState, setAppState] = useState<AppState>({
    currentDate: new Date(),
    viewMode: 'my-schedule',
    isAuthenticated: false,
    isAdmin: false,
    theme: 'dark' // Default to dark as per screenshot preference
  });
  
  // State for "My Schedule" view selection
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  const [adminPassword, setAdminPassword] = useState('admin123'); // Local state for demo password
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');

  // User Manager State
  const [newEmployeeName, setNewEmployeeName] = useState('');

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSwapOpen, setIsSwapOpen] = useState(false);
  const [isVacationOpen, setIsVacationOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // --- Derived State ---
  const weeksPassed = useMemo(() => getWeeksPassed(appState.currentDate), [appState.currentDate]);
  const weekRange = useMemo(() => getWeekRange(appState.currentDate), [appState.currentDate]);
  
  // --- Effects ---
  useEffect(() => {
    // Apply theme to HTML
    if (appState.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [appState.theme]);

  // Firebase Subscriptions
  useEffect(() => {
    const unsubEmployees = subscribeToData<Employee>('employees', (data) => {
      setEmployees(data);
      // Determine initial selection if none selected
      if (!selectedUserId && data.length > 0) {
        setSelectedUserId(data[0].id);
      } else if (selectedUserId && !data.find(e => e.id === selectedUserId) && data.length > 0) {
        // If currently selected user was deleted, switch to first available
        setSelectedUserId(data[0].id);
      }
      setIsLoading(false);
    });

    const unsubSwaps = subscribeToData<SwapRequest>('swaps', (data) => {
      setSwaps(data);
    });

    const unsubVacations = subscribeToData<any>('vacations', (data) => {
      // Need to convert string dates back to Date objects
      const parsed = data.map(v => ({
        ...v,
        start: new Date(v.start),
        end: new Date(v.end)
      }));
      setVacations(parsed);
    });

    return () => {
      unsubEmployees();
      unsubSwaps();
      unsubVacations();
    };
  }, [selectedUserId]);

  // --- Handlers ---
  const toggleTheme = () => {
    setAppState(prev => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }));
  };

  const handleLogin = (success: boolean) => {
    if (success) {
      setAppState(prev => ({ ...prev, isAuthenticated: true, isAdmin: true }));
    }
  };

  const handlePasswordChange = () => {
    if (newPasswordInput.length < 4) {
      setPasswordMessage('La contraseña debe tener al menos 4 caracteres.');
      return;
    }
    setAdminPassword(newPasswordInput);
    setPasswordMessage('Contraseña actualizada con éxito.');
    setNewPasswordInput('');
    setTimeout(() => setPasswordMessage(''), 3000);
  };

  const handleAddEmployee = async () => {
    if (!newEmployeeName.trim()) return;
    
    const newEmp = {
      name: newEmployeeName,
      baseScheduleId: 1 // Default to schedule 1
    };
    
    await addData('employees', newEmp);
    setNewEmployeeName('');
  };

  const handleDeleteEmployee = async (id: string) => {
    // Using a direct confirmation
    if (window.confirm('¿Estás seguro de eliminar este empleado?')) {
      await removeData('employees', id);
    }
  };

  const handleUpdateEmployeeSchedule = async (id: string, newScheduleId: number) => {
    await updateData('employees', id, { baseScheduleId: newScheduleId });
  };

  const handleSwapConfirm = async (requesterId: string, targetId: string, reason: string) => {
    const newSwap = {
      weekNumber: weeksPassed,
      requesterId,
      targetId,
      reason,
      status: 'approved' // Auto-approve for demo
    };
    await addData('swaps', newSwap);
  };

  const handleVacationConfirm = async (employeeId: string, startDate: string, endDate: string) => {
    const newVacation = {
      employeeId,
      start: new Date(startDate + 'T00:00:00').toISOString(), // Store as ISO string in DB
      end: new Date(endDate + 'T23:59:59').toISOString(),
    };
    await addData('vacations', newVacation);
  };

  const changeWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(appState.currentDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setAppState(prev => ({ ...prev, currentDate: newDate }));
  };

  const goToToday = () => {
    setAppState(prev => ({ ...prev, currentDate: new Date() }));
  };

  // --- Helpers for Render ---
  
  // Updated colors based on user request: Valle=Yellow, Mitras=Red, Guardia=Blue
  const getDisplayLocationStyles = (loc: string, isFullCell: boolean = false, swapStatus?: 'in' | 'out') => {
    // If it's a swap OUT (person leaving), show Amber background
    if (swapStatus === 'out') {
      return isFullCell 
          ? 'bg-amber-500/10 text-amber-700 dark:text-amber-500 border-amber-500/50'
          : 'bg-amber-100 text-amber-800 border-amber-300';
    }

    switch(loc) {
      case LOCATIONS.GUARDIA: 
        return isFullCell 
          ? 'bg-blue-600 text-white border-blue-700' 
          : 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30';
      case LOCATIONS.VALLE: 
        return isFullCell 
          ? 'bg-yellow-400 text-yellow-900 border-yellow-500' // Dark text for yellow bg
          : 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/30';
      case LOCATIONS.MITRAS: 
        return isFullCell 
          ? 'bg-red-600 text-white border-red-700' 
          : 'bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30';
      case 'VACACIONES': 
        return isFullCell
          ? 'bg-teal-500 text-white border-teal-600'
          : 'bg-teal-500/20 text-teal-700 dark:text-teal-300 border-teal-500/30';
      default: 
        return isFullCell
          ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700'
          : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const isSwapActive = (empId: string, week: number) => {
    return swaps.find(s => s.weekNumber === week && (s.requesterId === empId || s.targetId === empId));
  };

  const isOnVacation = (empId: string, date: Date) => {
    return vacations.some(v => 
      v.employeeId === empId && 
      date.getTime() >= v.start.getTime() && 
      date.getTime() <= v.end.getTime()
    );
  };

  // Logic to determine the effective shift for a specific employee on a specific day
  const getEffectiveShift = (emp: Employee, dayIndex: number, date: Date) => {
    // 1. Check Vacation
    if (isOnVacation(emp.id, date)) {
      return { label: 'VACACIONES', location: 'VACACIONES' };
    }

    // 2. Check Swaps
    const activeSwap = isSwapActive(emp.id, weeksPassed);
    
    let schedule = getScheduleForWeek(emp.baseScheduleId, weeksPassed);
    let shift = schedule?.shifts[dayIndex];

    if (activeSwap) {
      if (activeSwap.requesterId === emp.id) {
        // Requester: Return original shift but mark as swapped OUT
        return { ...shift, swapStatus: 'out' };
      }
      if (activeSwap.targetId === emp.id) {
        // Target: Take the requester's schedule
        const requester = employees.find(e => e.id === activeSwap.requesterId);
        if (requester) {
          const reqSchedule = getScheduleForWeek(requester.baseScheduleId, weeksPassed);
          return { ...reqSchedule?.shifts[dayIndex], swapStatus: 'in' };
        }
      }
    }

    return shift;
  };

  // Reusable Navigation Component
  const WeekNavigation = () => (
    <div className="flex items-center gap-1 sm:gap-2 bg-gray-200/50 dark:bg-gray-800/50 rounded-xl p-1 sm:p-2 shadow-sm">
      <button onClick={() => changeWeek('prev')} className="p-1.5 sm:p-2 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-all active:scale-95 text-gray-700 dark:text-gray-300">
        <span className="material-symbols-outlined text-xl sm:text-2xl">chevron_left</span>
      </button>
      
      <div className="text-center min-w-[90px] sm:min-w-[120px] flex flex-col items-center justify-center">
        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">Semana {weeksPassed + 1}</p>
        <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white whitespace-nowrap leading-tight">
          {weekRange.start.toLocaleDateString('es-MX', {day: 'numeric', month: 'short'})} - {weekRange.end.toLocaleDateString('es-MX', {day: 'numeric', month: 'short'})}
        </p>
      </div>

      <button onClick={() => changeWeek('next')} className="p-1.5 sm:p-2 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-all active:scale-95 text-gray-700 dark:text-gray-300">
        <span className="material-symbols-outlined text-xl sm:text-2xl">chevron_right</span>
      </button>

      <div className="w-px h-5 sm:h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>

      <button 
        onClick={goToToday}
        className="px-2 py-1 sm:px-3 sm:py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-[10px] sm:text-xs font-bold transition-colors uppercase"
        title="Ir a la semana actual"
      >
        HOY
      </button>
    </div>
  );

  // Render Logic
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden transition-colors duration-300 font-display">
      
      {/* Background decoration */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="layout-container flex h-full grow flex-col z-10">
        <div className="px-2 sm:px-6 md:px-10 lg:px-20 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col w-full max-w-[1400px] flex-1 gap-4 sm:gap-6">
            
            {/* --- Header --- */}
            <header className="flex flex-col md:flex-row gap-4 items-center justify-between whitespace-nowrap border border-white/10 bg-white/40 dark:bg-gray-900/40 px-4 py-3 sm:px-6 sm:py-4 glassmorphism rounded-2xl shadow-lg">
              <div className="flex flex-col sm:flex-row items-center gap-4 text-slate-900 dark:text-white w-full md:w-auto justify-center md:justify-start">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <span className="material-symbols-outlined text-primary">calendar_month</span>
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold leading-tight">Horarios Rotativos 2026</h2>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 w-full md:w-auto items-center justify-center md:justify-end flex-wrap sm:flex-nowrap">
                {!appState.isAuthenticated ? (
                  <button 
                    onClick={() => setIsLoginOpen(true)}
                    className="flex-1 md:flex-none min-w-[100px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-all shadow-md shadow-primary/20"
                  >
                    Iniciar Sesión Admin
                  </button>
                ) : (
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
                    <button 
                      onClick={() => setIsSwapOpen(true)}
                      className="flex items-center gap-1 h-10 px-3 sm:px-4 bg-purple-600/20 text-purple-700 dark:text-purple-300 hover:bg-purple-600/30 rounded-lg text-sm font-bold transition-all"
                    >
                      <span className="material-symbols-outlined text-sm">swap_horiz</span> 
                      <span className="hidden sm:inline">Cambio</span>
                    </button>
                    <button 
                      onClick={() => setIsVacationOpen(true)}
                      className="flex items-center gap-1 h-10 px-3 sm:px-4 bg-teal-600/20 text-teal-700 dark:text-teal-300 hover:bg-teal-600/30 rounded-lg text-sm font-bold transition-all"
                    >
                      <span className="material-symbols-outlined text-sm">beach_access</span> 
                      <span className="hidden sm:inline">Vacaciones</span>
                    </button>
                    <span className="hidden lg:block text-sm font-bold text-green-600 dark:text-green-400 px-3">Modo Admin</span>
                  </div>
                )}

                <button 
                  onClick={toggleTheme}
                  className="flex items-center justify-center rounded-lg h-10 w-10 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors shrink-0"
                >
                  <span className="material-symbols-outlined text-xl">
                    {appState.theme === 'dark' ? 'light_mode' : 'dark_mode'}
                  </span>
                </button>
              </div>
            </header>

            {/* --- Tab Navigation --- */}
            <div className="flex justify-center overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
              <div className="flex p-1 bg-gray-200/80 dark:bg-gray-800/60 backdrop-blur-md rounded-xl whitespace-nowrap">
                {['Mi Horario', 'Vista General', 'Configuración'].map((tab) => {
                  const modeMap: Record<string, AppState['viewMode']> = {
                    'Mi Horario': 'my-schedule',
                    'Vista General': 'general',
                    'Configuración': 'config'
                  };
                  const mode = modeMap[tab];
                  const isActive = appState.viewMode === mode;
                  
                  if (tab === 'Configuración' && !appState.isAdmin) return null;

                  return (
                    <button
                      key={tab}
                      onClick={() => setAppState(p => ({ ...p, viewMode: mode }))}
                      className={`
                        px-4 sm:px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200
                        ${isActive 
                          ? 'bg-white dark:bg-gray-700 shadow-sm text-primary dark:text-white' 
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}
                      `}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* --- Main Content Area --- */}
            <main className="flex-1 min-h-[500px]">
              
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                  <p className="mt-4 text-gray-500 dark:text-gray-400 animate-pulse">Cargando base de datos...</p>
                </div>
              ) : (
                <>
                  {/* VIEW: My Schedule */}
                  {appState.viewMode === 'my-schedule' && (() => {
                    const currentUser = employees.find(e => e.id === selectedUserId);
                    
                    // If no user selected or list empty
                    if (!currentUser && employees.length === 0) {
                      return (
                        <div className="text-center py-20">
                          <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">person_off</span>
                          <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300">No hay empleados registrados</h3>
                          <p className="text-gray-500">Inicia sesión como Admin y ve a Configuración para agregar empleados.</p>
                        </div>
                      )
                    }

                    // We use calculate days for "My Schedule"
                    const activeSwap = isSwapActive(selectedUserId, weeksPassed);
                    
                    // Check if user is on vacation THIS week at any point
                    const startOfWeek = new Date(weekRange.start);
                    const endOfWeek = new Date(weekRange.end);
                    const activeVacation = vacations.find(v => 
                      v.employeeId === selectedUserId && 
                      v.start <= endOfWeek && v.end >= startOfWeek
                    );

                    // Generate the dates for the current week
                    const days = Array.from({length: 7}, (_, i) => {
                      const d = new Date(weekRange.start);
                      d.setDate(d.getDate() + i);
                      return d;
                    });

                    return (
                      <div className="flex flex-col gap-6 animate-fade-in">
                        
                        {/* Centered Controls Container */}
                        <div className="flex flex-col items-center justify-center gap-4 py-2 w-full">
                          {/* Select User Dropdown */}
                          <div className="relative z-20 w-full max-w-[280px] sm:max-w-xs">
                            <select 
                              value={selectedUserId}
                              onChange={(e) => setSelectedUserId(e.target.value)}
                              className="w-full pl-4 pr-10 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white font-bold text-center focus:ring-2 focus:ring-primary shadow-lg appearance-none cursor-pointer truncate"
                            >
                              {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.name}</option>
                              ))}
                            </select>
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 dark:text-gray-400">
                              <span className="material-symbols-outlined text-xl">expand_more</span>
                            </span>
                          </div>
                          
                          {/* Week Navigation */}
                          <WeekNavigation />
                        </div>

                        {/* Alert Banner */}
                        {(activeSwap || activeVacation) && (
                          <div className={`mx-2 sm:mx-0 p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center gap-4 
                            ${activeVacation ? 'bg-teal-400/10 border-teal-500/20 text-teal-900 dark:text-teal-100' : 'bg-amber-400/10 border-amber-500/20 text-amber-900 dark:text-amber-100'}`}>
                            <span className="material-symbols-outlined text-3xl shrink-0">
                              {activeVacation ? 'beach_access' : 'swap_horiz'}
                            </span>
                            <div>
                              <p className="font-bold text-lg">
                                {activeVacation ? "Estás de Vacaciones" : "Cambio de Turno Activo"}
                              </p>
                              <p className="text-sm opacity-90">
                                {activeVacation 
                                  ? `Disfruta tu descanso del ${activeVacation.start.toLocaleDateString()} al ${activeVacation.end.toLocaleDateString()}` 
                                  : `Esta semana tienes un cambio registrado. Motivo: ${activeSwap?.reason}`}
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-2 sm:px-0">
                          {days.map((date, idx) => {
                            const isToday = new Date().toDateString() === date.toDateString();
                            
                            let shift = currentUser ? getEffectiveShift(currentUser, idx, date) : null;
                            
                            const colorClass = getDisplayLocationStyles(shift?.location || 'Descanso');
                            const isVacation = shift?.label === 'VACACIONES';
                            const isSwap = (shift as any)?.swapStatus === 'in' || (shift as any)?.swapStatus === 'out';
                            
                            return (
                              <div 
                                key={idx}
                                className={`
                                  relative flex flex-col gap-3 p-5 rounded-2xl border transition-all duration-300 hover:scale-[1.02]
                                  ${isToday 
                                    ? 'bg-primary/5 border-primary ring-2 ring-primary/20 dark:ring-primary/40' 
                                    : 'glassmorphism border-white/20 dark:border-gray-700'}
                                  ${isVacation ? 'ring-2 ring-teal-500/20' : ''}
                                  ${isSwap ? 'ring-2 ring-amber-500/20' : ''}
                                `}
                              >
                                <div className="flex justify-between items-center">
                                  <p className="font-bold text-lg text-gray-800 dark:text-gray-100 capitalize">
                                    {date.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric' })}
                                  </p>
                                  {isToday && <span className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-full">HOY</span>}
                                </div>
                                <div className="flex flex-col gap-2">
                                  <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">{shift?.label}</p>
                                  <span className={`self-start px-3 py-1 rounded-full text-xs font-bold border ${colorClass}`}>
                                    {shift?.location}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* VIEW: General Schedule */}
                  {appState.viewMode === 'general' && (
                    <div className="flex flex-col gap-6 animate-fade-in">
                      <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-4 px-2">
                        <div className="flex flex-col gap-1 text-center md:text-left">
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Horario General
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Visualización completa de todos los turnos.
                          </p>
                        </div>
                        {/* Week Nav for General View */}
                        <WeekNavigation />
                      </div>
                      
                      <div className="overflow-hidden rounded-2xl border border-white/20 dark:border-gray-700 shadow-xl bg-white/40 dark:bg-gray-800/40 backdrop-blur-md">
                        <div className="overflow-x-auto no-scrollbar">
                          <table className="w-full text-sm text-left border-collapse table-fixed min-w-[1000px]">
                            <thead className="bg-gray-100/80 dark:bg-gray-900/80 text-xs uppercase text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                              <tr>
                                <th className="w-48 px-6 py-5 font-bold tracking-wider sticky left-0 z-10 bg-gray-100 dark:bg-gray-900 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Empleado</th>
                                {['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'].map(d => (
                                  <th key={d} className="px-2 py-5 text-center">{d}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
                              {employees.map((emp, idx) => {
                                const userSwap = isSwapActive(emp.id, weeksPassed);
                                
                                // Determine if this row has a swap for highlighting
                                const rowHighlight = userSwap 
                                  ? 'bg-amber-100/30 dark:bg-amber-900/20' 
                                  : (idx % 2 === 0 ? 'bg-white/10 dark:bg-white/5' : 'bg-transparent');

                                const isCovered = userSwap?.requesterId === emp.id;
                                const isCovering = userSwap?.targetId === emp.id;

                                return (
                                  <tr key={emp.id} className={`${rowHighlight} transition-colors hover:bg-white/30 dark:hover:bg-gray-700/50`}>
                                    <td className={`px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap sticky left-0 z-10 ${rowHighlight} shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] backdrop-blur-sm`}>
                                      <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
                                          {emp.name.charAt(0)}
                                        </div>
                                        <div className="flex flex-col">
                                          <span className="text-sm font-bold truncate max-w-[110px]">{emp.name}</span>
                                          {isCovered && <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded w-fit">Cubierto</span>}
                                          {isCovering && <span className="text-[10px] text-green-600 dark:text-green-400 font-bold bg-green-100 dark:bg-green-900/40 px-1.5 py-0.5 rounded w-fit">Cubriendo</span>}
                                        </div>
                                      </div>
                                    </td>
                                    {Array.from({length: 7}).map((_, i) => {
                                      // Calculate exact date for this cell to check vacation
                                      const cellDate = new Date(weekRange.start);
                                      cellDate.setDate(cellDate.getDate() + i);

                                      const effective = getEffectiveShift(emp, i, cellDate);
                                      const isVacation = effective?.label === 'VACACIONES';
                                      const isDescanso = effective?.label === 'Descanso' || effective?.label === 'OFF';
                                      const swapStatus = (effective as any)?.swapStatus;
                                      
                                      const colorStyle = getDisplayLocationStyles(effective?.location || 'Descanso', true, swapStatus);
                                      
                                      // Parse start/end time
                                      let timeStart = '';
                                      let timeEnd = '';
                                      if (effective?.label && !isVacation && !isDescanso) {
                                          const parts = effective.label.split(' - ');
                                          if (parts.length === 2) {
                                              timeStart = parts[0];
                                              timeEnd = parts[1];
                                          }
                                      }

                                      return (
                                        <td key={i} className="px-2 py-3 text-center h-full">
                                          <div className={`w-full h-full min-h-[64px] rounded-lg border flex flex-col items-center justify-center p-1 shadow-sm transition-all hover:scale-105 ${colorStyle} ${swapStatus === 'out' ? 'opacity-70 grayscale-[0.5]' : ''}`}>
                                            
                                            {isVacation ? (
                                                <span className="font-bold text-[10px] uppercase">Vacaciones</span>
                                            ) : isDescanso ? (
                                                <span className="font-bold text-[10px] uppercase opacity-50">Descanso</span>
                                            ) : (
                                                <>
                                                    <div className="font-bold text-xs leading-tight whitespace-nowrap">{timeStart}</div>
                                                    <div className="w-full h-px bg-current opacity-20 my-0.5"></div>
                                                    <div className="text-[10px] font-medium opacity-90 leading-tight whitespace-nowrap">{timeEnd}</div>
                                                </>
                                            )}
                                          </div>
                                        </td>
                                      );
                                    })}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Summary Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4">
                        {[LOCATIONS.GUARDIA, LOCATIONS.VALLE, LOCATIONS.MITRAS].map(loc => {
                          const today = new Date();
                          // Find current day index (0=Mon...6=Sun) based on weekStart
                          const dayDiff = Math.floor((today.getTime() - weekRange.start.getTime()) / (1000 * 3600 * 24));
                          const dayIdx = dayDiff >= 0 && dayDiff <= 6 ? dayDiff : 0; // Default to Monday if out of range for demo

                          // Filter employees
                          const employeesInLoc = employees.filter(e => {
                            const shift = getEffectiveShift(e, dayIdx, today);
                            // Make sure we don't count people who swapped OUT or are on vacation
                            const isSwappedOut = (shift as any)?.swapStatus === 'out';
                            return shift?.location === loc && !isSwappedOut;
                          });

                          const color = getDisplayLocationStyles(loc, false); // use pill style for badge

                          return (
                            <div key={loc} className="glassmorphism p-6 rounded-2xl border border-white/10 dark:border-gray-700 flex flex-col items-center shadow-lg transition-transform hover:-translate-y-1">
                              <h4 className="text-gray-500 dark:text-gray-400 font-medium mb-3 uppercase text-xs tracking-wider">
                                Personal en {loc} (Hoy)
                              </h4>
                              <div className="flex items-center gap-3 mb-5">
                                <span className="text-5xl font-black text-slate-900 dark:text-white drop-shadow-sm">{employeesInLoc.length}</span>
                                <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${color}`}>{loc}</span>
                              </div>
                              
                              {/* List of names */}
                              <div className="flex flex-wrap justify-center gap-2 w-full">
                                  {employeesInLoc.length > 0 ? (
                                    employeesInLoc.map(e => (
                                      <span key={e.id} className="text-xs font-medium bg-white/50 dark:bg-black/30 px-3 py-1.5 rounded-full text-gray-800 dark:text-gray-200 border border-black/5 dark:border-white/5">
                                        {e.name.split(' ')[0]}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-xs text-gray-400 italic">Sin personal asignado</span>
                                  )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* VIEW: Config */}
                  {appState.viewMode === 'config' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in pb-8">
                      
                      {/* Left Col: Employee Management */}
                      <div className="lg:col-span-2 p-6 glassmorphism rounded-2xl border border-white/10 dark:border-gray-700">
                        <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Gestor de Empleados</h3>
                        
                        {/* Add Employee Form */}
                        <div className="flex flex-col sm:flex-row gap-2 mb-6 p-4 bg-white/30 dark:bg-black/20 rounded-xl">
                          <input 
                            type="text" 
                            placeholder="Nombre del nuevo empleado"
                            value={newEmployeeName}
                            onChange={(e) => setNewEmployeeName(e.target.value)}
                            className="flex-1 rounded-lg border-gray-300 dark:border-gray-600 bg-white/70 dark:bg-gray-800/70 p-2.5 focus:ring-2 focus:ring-primary outline-none text-gray-900 dark:text-white"
                            onKeyDown={(e) => e.key === 'Enter' && handleAddEmployee()}
                          />
                          <button 
                            onClick={handleAddEmployee}
                            disabled={!newEmployeeName.trim()}
                            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-bold disabled:opacity-50 transition-colors"
                          >
                            <span className="material-symbols-outlined align-middle mr-1">add</span> Agregar
                          </button>
                        </div>

                        <div className="flex gap-4 mb-8">
                          <button 
                            onClick={() => setIsVacationOpen(true)}
                            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm font-bold shadow-lg shadow-teal-500/20 flex items-center gap-2"
                          >
                            <span className="material-symbols-outlined text-lg">beach_access</span>
                            Registrar Vacaciones
                          </button>
                        </div>

                        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">Asignar horarios base para el ciclo actual.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {employees.map(emp => (
                            <div key={emp.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white/40 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 transition-colors group">
                              <span className="font-medium dark:text-gray-200 truncate pr-2">{emp.name}</span>
                              
                              <div className="flex items-center gap-2">
                                <select 
                                    value={emp.baseScheduleId}
                                    onChange={(e) => {
                                      const newId = parseInt(e.target.value);
                                      handleUpdateEmployeeSchedule(emp.id, newId);
                                    }}
                                    className="bg-transparent border border-gray-300 dark:border-gray-600 rounded p-1.5 text-sm dark:text-white focus:ring-2 focus:ring-primary/50 outline-none max-w-[100px]"
                                >
                                  {[1,2,3,4,5,6,7].map(n => <option key={n} value={n} className="dark:bg-gray-800 text-gray-900 dark:text-white">Horario {n}</option>)}
                                </select>

                                <button 
                                  onClick={() => handleDeleteEmployee(emp.id)}
                                  className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 p-2 rounded-lg transition-all border border-transparent hover:border-red-500/20"
                                  title="Eliminar empleado"
                                >
                                  <span className="material-symbols-outlined text-lg">delete</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right Col: Admin Settings (Password) */}
                      <div className="p-6 glassmorphism rounded-2xl border border-white/10 dark:border-gray-700 h-fit">
                        <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                          <span className="material-symbols-outlined">lock</span>
                          Seguridad
                        </h3>
                        
                        <div className="flex flex-col gap-4">
                          <label className="flex flex-col gap-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Cambiar Contraseña Admin</span>
                            <input 
                                type="password" 
                                placeholder="Nueva contraseña"
                                value={newPasswordInput}
                                onChange={(e) => setNewPasswordInput(e.target.value)}
                                className="form-input rounded-lg border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-black/20 p-2 text-sm focus:ring-primary"
                            />
                          </label>
                          
                          <button 
                            onClick={handlePasswordChange}
                            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold transition-colors"
                          >
                            Actualizar Contraseña
                          </button>

                          {passwordMessage && (
                            <p className={`text-xs text-center p-2 rounded ${passwordMessage.includes('éxito') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {passwordMessage}
                            </p>
                          )}
                          
                          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-xs text-gray-400">Contraseña actual (demo): <span className="font-mono">{adminPassword}</span></p>
                          </div>
                        </div>
                      </div>

                    </div>
                  )}
                </>
              )}
            </main>
          </div>
        </div>
      </div>

      {/* Modals */}
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        onLogin={handleLogin}
        expectedPassword={adminPassword} // Pass the dynamic password
      />
      <SwapModal 
        isOpen={isSwapOpen} 
        onClose={() => setIsSwapOpen(false)} 
        employees={employees}
        onConfirm={handleSwapConfirm}
      />
      <VacationModal
        isOpen={isVacationOpen}
        onClose={() => setIsVacationOpen(false)}
        employees={employees}
        onConfirm={handleVacationConfirm}
      />

    </div>
  );
};

export default App;