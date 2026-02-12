import React from 'react';
import { ViewState } from '../types';

interface DashboardViewProps {
  setView: (view: ViewState) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ setView }) => {
  
  const menuCards = [
    {
      id: 'classes',
      title: 'Turmas & Chamada',
      description: 'Chamadas e gestão de alunos.',
      icon: '📚',
      bgGradient: 'from-blue-600 to-cyan-500',
      action: () => setView('classes')
    },
    {
      id: 'statistics',
      title: 'Estatísticas',
      description: 'Métricas e assiduidade.',
      icon: '📊',
      bgGradient: 'from-purple-600 to-blue-600',
      action: () => setView('statistics')
    },
    {
      id: 'tournaments',
      title: 'Torneios',
      description: 'Gestão de campeonatos.',
      icon: '🏆',
      bgGradient: 'from-orange-500 to-red-500',
      action: () => setView('tournaments')
    },
    {
      id: 'exercises',
      title: 'Exercícios',
      description: 'Problemas táticos e mates.',
      icon: '🧩',
      bgGradient: 'from-pink-600 to-rose-500',
      action: () => setView('exercises')
    },
    {
      id: 'notation',
      title: 'Notação Algébrica',
      description: 'Aprenda a ler e escrever partidas.',
      icon: '🔡',
      bgGradient: 'from-yellow-500 to-amber-600',
      action: () => setView('notation')
    },
    {
      id: 'play',
      title: 'Jogar',
      description: 'Partidas contra IA ou Local.',
      icon: '♟️',
      bgGradient: 'from-indigo-600 to-violet-600',
      action: () => setView('play')
    },
    {
      id: 'activities',
      title: 'Atividades',
      description: 'Livro de ponto e registros.',
      icon: '📝',
      bgGradient: 'from-emerald-500 to-green-600',
      action: () => setView('activities')
    },
    {
      id: 'ementa',
      title: 'Ementa do Xadrez',
      description: 'Conteúdo, Objetivos e Metodologia.',
      icon: '📜',
      bgGradient: 'from-slate-700 to-slate-900',
      action: () => setView('ementa')
    }
  ];

  return (
    <div className="animate-fade-in space-y-4 md:space-y-8 pb-20 mt-1 md:mt-2">
      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        {menuCards.map((card) => (
          <div 
            key={card.id}
            onClick={card.action}
            className={`relative overflow-hidden rounded-xl p-5 md:p-8 cursor-pointer group shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 bg-white/10 backdrop-blur-xl border border-white/20`}
          >
            {/* Background Gradient Blob - Subtle glow */}
            <div className={`absolute -right-6 -top-6 w-24 h-24 md:w-40 md:h-40 bg-gradient-to-br ${card.bgGradient} rounded-full opacity-20 blur-2xl group-hover:opacity-40 transition-opacity`}></div>
            
            <div className="relative z-10 flex items-center space-x-4 md:space-x-6">
              <div className={`w-12 h-12 md:w-16 md:h-16 flex-shrink-0 rounded-lg md:rounded-xl bg-gradient-to-br ${card.bgGradient} flex items-center justify-center text-xl md:text-3xl text-white shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                {card.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg md:text-2xl font-black text-white mb-0.5 md:mb-2 group-hover:text-blue-200 transition-colors truncate drop-shadow-md">{card.title}</h3>
                <p className="text-xs md:text-sm text-slate-200 font-medium leading-tight md:leading-relaxed truncate md:whitespace-normal drop-shadow-sm">
                  {card.description}
                </p>
              </div>
              <div className="self-center flex-shrink-0">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/80 group-hover:bg-white/20 group-hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Status Bar - Matching Glass Style */}
      <div className="mt-4 md:mt-8 bg-white/10 backdrop-blur-xl border border-white/20 p-4 md:p-6 rounded-lg md:rounded-xl flex flex-col md:flex-row justify-between items-center text-xs md:text-sm font-bold text-slate-200 space-y-2 md:space-y-0 shadow-lg">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.5)]"></span>
          <span className="text-white tracking-wider">SISTEMA ONLINE</span>
        </div>
        <div className="text-slate-300">
          Sincronizado: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </div>
      </div>
    </div>
  );
};