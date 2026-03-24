import React from 'react';

interface ScheduleViewProps {
  onBack: () => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({ onBack }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={onBack}
          className="px-5 py-2.5 bg-slate-900/80 backdrop-blur-md rounded-full text-white font-bold transition-all shadow-lg hover:bg-slate-800 flex items-center w-fit active:scale-95 border border-white/10"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Voltar
        </button>
        <h2 className="text-2xl font-black text-white uppercase tracking-tight drop-shadow-md">Quadro de Horários</h2>
      </div>

      <div className="glass-panel p-4 overflow-hidden rounded-2xl shadow-2xl border border-white/20">
        <div className="relative aspect-video w-full overflow-hidden rounded-xl">
          <img 
            src="/quadro.jpg" 
            alt="Quadro de Horários - Xadrez"
            className="w-full h-full object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/50 p-4 rounded-xl border border-white/30">
            <h4 className="font-bold text-slate-800 mb-2 flex items-center">
              <span className="mr-2">📅</span> Dias de Aula
            </h4>
            <p className="text-slate-600 text-sm">Segunda, Quinta e Sexta-feira</p>
          </div>
          <div className="bg-white/50 p-4 rounded-xl border border-white/30">
            <h4 className="font-bold text-slate-800 mb-2 flex items-center">
              <span className="mr-2">⏰</span> Carga Horária
            </h4>
            <p className="text-slate-600 text-sm">Aulas divididas por turmas do 6º Ano conforme grade escolar.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
