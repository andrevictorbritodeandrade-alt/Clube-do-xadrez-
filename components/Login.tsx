import React, { useState } from 'react';
// import { ConfigModal } from './ConfigModal'; // Removed import

interface LoginProps {
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  // const [isConfigOpen, setConfigOpen] = useState(false); // Removed state

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10 w-full h-full">
      
      {/* Config Button Removed - Configuration is hardcoded */}

      {/* Title Section */}
      <div className="text-center mb-8 md:mb-10 drop-shadow-xl animate-fade-in-down">
         <div className="text-7xl md:text-8xl mb-4 hover:scale-110 transition-transform duration-300 cursor-default">
           ♟️
         </div>
         <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-wider">
           Clube do <span className="text-blue-300">Xadrez</span>
         </h1>
         <div className="mt-2">
            <span className="text-blue-100 text-xs md:text-sm font-bold tracking-[0.3em] uppercase bg-black/40 backdrop-blur-md py-2 px-6 rounded-full border border-white/10 shadow-lg">
              Estratégia • Foco • Vitória
            </span>
         </div>
      </div>

      <div className="w-full max-w-sm md:max-w-md space-y-6 md:space-y-8 bg-black/20 backdrop-blur-xl p-6 md:p-10 rounded-2xl md:rounded-3xl shadow-2xl border border-white/10 ring-1 ring-white/5">
        <div className="text-center">
          <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-wide drop-shadow-md">Bem-vindo</h2>
          <p className="mt-2 text-xs md:text-sm text-slate-200 font-medium leading-relaxed drop-shadow-sm">
            Sistema de gestão integrado do Clube de Xadrez Escolar.
          </p>
        </div>
        
        <div className="mt-6 md:mt-8">
          <button 
            onClick={onLogin}
            className="group relative w-full flex justify-center py-3 md:py-4 px-4 border border-transparent text-sm md:text-lg font-black tracking-widest rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-[1.02] shadow-lg active:scale-95 uppercase"
          >
            Acessar Sistema
          </button>
        </div>
      </div>
    </div>
  );
};