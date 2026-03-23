import React, { useState } from 'react';
import { UserProfile, ClassDataMap, ActivityLogData } from '../types';
import { performAttendanceBackfill } from '../services/backfillService';

interface ProfileProps {
  user: UserProfile;
  onBack: () => void;
  classData: ClassDataMap;
  setClassData: (data: ClassDataMap) => void;
  activityLogData: ActivityLogData;
  setActivityLogData: (data: ActivityLogData) => void;
}

export const Profile: React.FC<ProfileProps> = ({ 
  user, 
  onBack, 
  classData, 
  setClassData, 
  activityLogData, 
  setActivityLogData 
}) => {
  const [isBackfilling, setIsBackfilling] = useState(false);
  const [backfillSuccess, setBackfillSuccess] = useState(false);

  const handleBackfill = async () => {
    if (window.confirm('Deseja realizar a sincronização automática de presenças para Fevereiro e Março? Isso preencherá as presenças de todas as turmas conforme solicitado.')) {
      setIsBackfilling(true);
      try {
        const result = await performAttendanceBackfill(classData, activityLogData);
        setClassData(result.newClasses);
        setActivityLogData(result.newLog);
        setBackfillSuccess(true);
        setTimeout(() => setBackfillSuccess(false), 5000);
      } catch (error) {
        console.error("Erro ao realizar backfill:", error);
        alert("Erro ao sincronizar presenças.");
      } finally {
        setIsBackfilling(false);
      }
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
       <button 
        onClick={onBack}
        className="mb-4 px-5 py-2.5 bg-slate-900/80 backdrop-blur-md rounded-full text-white font-bold transition-all shadow-lg hover:bg-slate-800 flex items-center w-fit active:scale-95 border border-white/10"
      >
        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Voltar ao Menu
      </button>

      {/* Header Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <div className="flex items-end">
              <div className="w-24 h-24 rounded-full border-4 border-white bg-slate-200 flex items-center justify-center text-3xl shadow-md">
                {user.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full rounded-full" /> : "👤"}
              </div>
              <div className="ml-4 mb-1">
                <h1 className="text-2xl font-bold text-slate-800">{user.name}</h1>
                <p className="text-slate-500 text-sm">{user.email} • Membro desde {user.joinedAt}</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition shadow-sm">
              Editar Perfil
            </button>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-50 p-4 rounded-lg text-center border border-slate-100">
              <span className="block text-slate-500 text-xs uppercase tracking-wider font-semibold">Rating ELO</span>
              <span className="block text-2xl font-black text-blue-600 mt-1">{user.elo}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg text-center border border-slate-100">
              <span className="block text-slate-500 text-xs uppercase tracking-wider font-semibold">Partidas</span>
              <span className="block text-2xl font-bold text-slate-800 mt-1">{user.gamesPlayed}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg text-center border border-slate-100">
              <span className="block text-slate-500 text-xs uppercase tracking-wider font-semibold">Vitórias</span>
              <span className="block text-2xl font-bold text-green-600 mt-1">{user.wins}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg text-center border border-slate-100">
              <span className="block text-slate-500 text-xs uppercase tracking-wider font-semibold">Precisão</span>
              <span className="block text-2xl font-bold text-purple-600 mt-1">~82%</span>
            </div>
          </div>

          {/* Admin Actions */}
          <div className="border-t border-slate-100 pt-6">
            <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">Ferramentas de Administrador</h3>
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={handleBackfill}
                disabled={isBackfilling}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm active:scale-95 ${
                  backfillSuccess 
                    ? 'bg-green-600 text-white' 
                    : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
                }`}
              >
                <svg className={`w-4 h-4 mr-2 ${isBackfilling ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {isBackfilling ? 'Sincronizando...' : backfillSuccess ? 'Presenças Sincronizadas!' : 'Sincronizar Presenças (Fev/Mar)'}
              </button>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">
              * Esta ação preencherá automaticamente as presenças de Fevereiro e Março conforme solicitado.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Recent Games */}
        <div className="md:col-span-2 space-y-6">
          <h3 className="text-lg font-bold text-slate-800">Partidas Recentes</h3>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-3">Resultado</th>
                  <th className="px-6 py-3">Oponente</th>
                  <th className="px-6 py-3">Data</th>
                  <th className="px-6 py-3 text-right">Lances</th>
                </tr>
              </thead>
              <tbody>
                {user.recentGames.map((game) => (
                  <tr key={game.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        game.result === 'win' ? 'bg-green-100 text-green-800' :
                        game.result === 'loss' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {game.result === 'win' ? 'Vitória' : game.result === 'loss' ? 'Derrota' : 'Empate'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">{game.opponent}</td>
                    <td className="px-6 py-4 text-slate-500">{game.date}</td>
                    <td className="px-6 py-4 text-right">{game.moves}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Badges / Achievements */}
        <div className="space-y-6">
           <h3 className="text-lg font-bold text-slate-800">Conquistas</h3>
           <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
             <div className="grid grid-cols-1 gap-4">
               {user.achievements.map((badge) => (
                 <div key={badge.id} className="flex items-center p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-blue-200 transition">
                   <div className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm text-xl">
                     {badge.icon}
                   </div>
                   <div className="ml-3">
                     <h4 className="text-sm font-bold text-slate-800">{badge.title}</h4>
                     <p className="text-xs text-slate-500 leading-tight mt-0.5">{badge.description}</p>
                   </div>
                 </div>
               ))}
               <div className="flex items-center justify-center p-4 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-sm">
                  + 12 bloqueadas
               </div>
             </div>
           </div>
        </div>

      </div>

    </div>
  );
};