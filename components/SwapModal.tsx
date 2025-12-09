import React, { useState } from 'react';
import { Employee } from '../types';

interface SwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  onConfirm: (requesterId: string, targetId: string, reason: string) => void;
}

const SwapModal: React.FC<SwapModalProps> = ({ isOpen, onClose, employees, onConfirm }) => {
  const [requesterId, setRequesterId] = useState('');
  const [targetId, setTargetId] = useState('');
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (requesterId && targetId && reason) {
      onConfirm(requesterId, targetId, reason);
      onClose();
      // Reset
      setRequesterId('');
      setTargetId('');
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Swap Shift</h1>
        </div>

        <div className="flex flex-col gap-6">
          <label className="flex flex-col w-full">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 pb-2">Empleado A (Sale de turno)</p>
            <select 
              value={requesterId}
              onChange={(e) => setRequesterId(e.target.value)}
              className="form-select w-full rounded-lg border-gray-300 bg-white/50 text-gray-900 focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-800/50 dark:text-white p-3 border"
            >
              <option value="">Select employee...</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col w-full">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 pb-2">Empleado B (Entra a turno)</p>
            <select 
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="form-select w-full rounded-lg border-gray-300 bg-white/50 text-gray-900 focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-800/50 dark:text-white p-3 border"
            >
              <option value="">Select employee...</option>
              {employees.filter(e => e.id !== requesterId).map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col w-full">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 pb-2">Motivo</p>
            <textarea 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="form-textarea w-full resize-none rounded-lg border-gray-300 bg-white/50 text-gray-900 focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-800/50 dark:text-white p-3 border" 
              placeholder="Enter a brief reason for the swap..." 
              rows={4}
            />
          </label>
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
            disabled={!requesterId || !targetId || !reason}
            className="flex w-full cursor-pointer items-center justify-center rounded-lg h-11 px-4 bg-primary text-white text-sm font-bold hover:bg-primary/90 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SwapModal;