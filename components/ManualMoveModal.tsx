import React, { useState } from 'react';
import { Employee, ShiftLocation, LOCATIONS } from '../types';

interface ManualMoveModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  onConfirm: (employeeId: string, date: string, location: ShiftLocation, reason: string) => void;
}

const ManualMoveModal: React.FC<ManualMoveModalProps> = ({ isOpen, onClose, employees, onConfirm }) => {
  const [employeeId, setEmployeeId] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState<ShiftLocation>(LOCATIONS.GUARDIA);
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (employeeId && date && location) {
      onConfirm(employeeId, date, location, reason);
      onClose();
      setEmployeeId('');
      setReason('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg rounded-xl border border-white/20 bg-white/80 dark:bg-gray-900/80 p-6 shadow-2xl backdrop-blur-lg sm:p-8 animate-scale-in">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Movimiento Manual</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Asigna una ubicación específica.</p>
        </div>

        <div className="flex flex-col gap-5">
          <label className="flex flex-col w-full">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 pb-2">Empleado</p>
            <select 
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="form-select w-full rounded-lg border-gray-300 bg-white/50 text-gray-900 focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-800/50 dark:text-white p-3 border"
            >
              <option value="">Seleccionar...</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col w-full">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 pb-2">Fecha</p>
            <input 
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="form-input w-full rounded-lg border-gray-300 bg-white/50 text-gray-900 focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-800/50 dark:text-white p-3 border" 
            />
          </label>

          <label className="flex flex-col w-full">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 pb-2">Nueva Ubicación</p>
            <div className="grid grid-cols-2 gap-2">
              {(Object.values(LOCATIONS) as ShiftLocation[]).map((loc) => (
                <button
                  key={loc}
                  onClick={() => setLocation(loc)}
                  className={`p-3 rounded-lg border text-sm font-bold transition-all ${
                    location === loc 
                      ? 'bg-primary text-white border-primary shadow-md' 
                      : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </label>
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg">Cancelar</button>
          <button onClick={handleSubmit} disabled={!employeeId || !date} className="px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-50">Confirmar</button>
        </div>
      </div>
    </div>
  );
};

export default ManualMoveModal;