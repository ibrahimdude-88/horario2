import React, { useState } from 'react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (success: boolean) => void;
  expectedPassword?: string;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin, expectedPassword = 'admin123' }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate against the prop password (which comes from App state)
    if ((email === 'admin' || email === 'admin@example.com') && password === expectedPassword) {
      onLogin(true);
      onClose();
      setError('');
      // Reset fields
      setEmail('');
      setPassword('');
    } else {
      setError('Credenciales inválidas');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-md flex flex-col gap-4 rounded-xl border border-white/10 bg-white/40 p-8 shadow-2xl backdrop-blur-xl dark:bg-black/40 animate-fade-in-up">
        
        {/* Headline */}
        <div className="flex flex-col items-center">
          <h1 className="text-slate-900 dark:text-white tracking-light text-[32px] font-bold leading-tight text-center pb-3 pt-2">
            Admin Login
          </h1>
          {error && <p className="text-red-500 text-sm font-medium bg-red-100 dark:bg-red-900/30 px-3 py-1 rounded">{error}</p>}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
          <div className="flex w-full flex-wrap items-end">
            <label className="flex w-full flex-col flex-1">
              <p className="text-slate-800 dark:text-slate-200 text-base font-medium leading-normal pb-2">Usuario / Email</p>
              <input 
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-slate-300/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-900/50 h-14 placeholder:text-slate-500 dark:placeholder:text-slate-400 p-4 text-base font-normal leading-normal" 
                placeholder="Ingresa 'admin'" 
              />
            </label>
          </div>

          <div className="flex w-full flex-wrap items-end">
            <label className="flex w-full flex-col flex-1">
              <p className="text-slate-800 dark:text-slate-200 text-base font-medium leading-normal pb-2">Contraseña</p>
              <div className="flex w-full flex-1 items-stretch rounded-lg border border-slate-300/50 dark:border-slate-700/50 focus-within:ring-2 focus-within:ring-primary/50">
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-0 border-none bg-white/50 dark:bg-slate-900/50 h-14 placeholder:text-slate-500 dark:placeholder:text-slate-400 p-4 pr-2 text-base font-normal leading-normal" 
                  placeholder="Ingresa contraseña" 
                />
              </div>
            </label>
          </div>

          <div className="flex pt-4">
            <button type="submit" className="flex min-w-[84px] max-w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 flex-1 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors">
              <span className="truncate">Entrar</span>
            </button>
          </div>
          
          <div className="flex justify-center">
            <button type="button" onClick={onClose} className="text-slate-600 dark:text-slate-400 text-sm font-normal underline hover:text-primary transition-colors">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;