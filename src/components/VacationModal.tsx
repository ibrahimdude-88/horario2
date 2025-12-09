import React, { useState } from 'react';
import { Employee } from '../types';

interface VacationModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  onConfirm: (employeeId: string, startDate: string, endDate: string) => void;
}

const VacationModal: React.FC<VacationModalProps> = ({ isOpen, onClose, employees, onConfirm }) => {
  const [employeeId, setEmployeeId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (employeeId && startDate && endDate) {
      onConfirm(employeeId, startDate, endDate);
      onClose();
      setEmployeeId('');
      setStartDate('');
      setEndDate('');
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Registrar Vacaciones</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Selecciona empleado y fechas</p>
        </div>

        <div className="flex flex-col gap-4">
          <label className="flex flex-col w-full">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 pb-2">Empleado</p>
            <select 
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="form-select w-full rounded-lg border-gray-300 bg-white/50 text-gray-900 focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-800/50 dark:text-white p-3 border"
            >
              <option value="">Seleccionar empleado...</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col w-full">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 pb-2">Desde</p>
              <input 
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="form-input w-full rounded-lg border-gray-300 bg-white/50 text-gray-900 focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-800/50 dark:text-white p-3 border" 
              />
            </label>

            <label className="flex flex-col w-full">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 pb-2">Hasta</p>
              <input 
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="form-input w-full rounded-lg border-gray-300 bg-white/50 text-gray-900 focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-800/50 dark:text-white p-3 border" 
              />
            </label>
          </div>
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button 
            onClick={onClose}
            className="flex w-full cursor-pointer items-center justify-center rounded-lg h-11 px-4 bg-transparent text-gray-700 border border-gray-300 text-sm font-bold hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700/50 sm:w-auto transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSubmit}
            disabled={!employeeId || !startDate || !endDate}
            className="flex w-full cursor-pointer items-center justify-center rounded-lg h-11 px-4 bg-primary text-white text-sm font-bold hover:bg-primary/90 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default VacationModal;