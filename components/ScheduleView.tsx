import React from 'react';

interface ScheduleViewProps {
  onBack: () => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({ onBack }) => {
  return (
    <div className="space-y-6 animate-fade-in pb-12">
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

      <div className="glass-panel p-6 md:p-8 overflow-hidden rounded-3xl shadow-2xl border border-white/20 bg-white/95 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row items-center gap-6 mb-8 border-b border-slate-100 pb-6">
          <div className="w-24 h-24 rounded-full bg-slate-200 border-4 border-white shadow-lg overflow-hidden flex-shrink-0">
            <img 
              src="https://picsum.photos/seed/professor/200/200" 
              alt="Professor André"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
              Quadro de Horários - Xadrez
            </h3>
            <p className="text-blue-600 font-bold">Professor André Brito</p>
            <div className="mt-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-sm font-medium border border-blue-100 inline-block">
              "Tudo pronto para os novos desafios de xadrez! Vamos calcular nossas jogadas!"
            </div>
          </div>
        </div>

        <div className="relative w-full overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
          <table className="w-full border-collapse text-xs md:text-sm">
            <thead>
              <tr className="bg-slate-800 text-white">
                <th className="border border-slate-200 p-4">Hora</th>
                <th className="border border-slate-200 p-4">Segunda</th>
                <th className="border border-slate-200 p-4">Terça</th>
                <th className="border border-slate-200 p-4">Quarta</th>
                <th className="border border-slate-200 p-4">Quinta</th>
                <th className="border border-slate-200 p-4">Sexta</th>
              </tr>
            </thead>
            <tbody>
              {[
                { time: '08h-09h', mon: 'Turma 602', tue: 'Vazio', wed: 'Vazio', thu: 'Vazio', fri: 'Turma 604' },
                { time: '09h-10h', mon: 'Turma 603', tue: 'Vazio', wed: 'Vazio', thu: 'Vazio', fri: 'Turma 603' },
                { time: '10h-11h', mon: 'Turma 604', tue: 'Vazio', wed: 'Vazio', thu: 'Turma 603', fri: 'Turma 601' },
                { time: '11h-12h', mon: 'Turma 602', tue: 'Vazio', wed: 'Vazio', thu: 'Vazio', fri: 'Turma 601' },
                { time: '16h-16h50', mon: 'Vazio', tue: 'Turma 711', wed: 'Vazio', thu: 'Vazio', fri: 'Vazio' },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="border border-slate-200 p-4 font-bold bg-slate-50 text-center text-slate-700">{row.time}</td>
                  <td className={`border border-slate-200 p-4 text-center font-bold ${row.mon !== 'Vazio' ? 'bg-green-50 text-green-700' : 'text-slate-300 italic'}`}>{row.mon}</td>
                  <td className={`border border-slate-200 p-4 text-center font-bold ${row.tue !== 'Vazio' ? (row.tue === 'Turma 711' ? 'bg-purple-50 text-purple-700' : 'bg-slate-50 text-slate-700') : 'text-slate-300 italic'}`}>{row.tue}</td>
                  <td className={`border border-slate-200 p-4 text-center font-bold ${row.wed !== 'Vazio' ? 'bg-slate-50 text-slate-700' : 'text-slate-300 italic'}`}>{row.wed}</td>
                  <td className={`border border-slate-200 p-4 text-center font-bold ${row.thu !== 'Vazio' ? 'bg-yellow-50 text-yellow-700' : 'text-slate-300 italic'}`}>{row.thu}</td>
                  <td className={`border border-slate-200 p-4 text-center font-bold ${row.fri !== 'Vazio' ? 'bg-blue-50 text-blue-700' : 'text-slate-300 italic'}`}>{row.fri}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <h4 className="font-black text-slate-800 mb-2 flex items-center gap-2 uppercase tracking-tight text-sm">
              <span className="text-2xl">⏰</span> Dias de Aula
            </h4>
            <p className="text-slate-600 font-bold">Segunda, Quinta e Sexta-feira</p>
          </div>
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <h4 className="font-black text-slate-800 mb-2 flex items-center gap-2 uppercase tracking-tight text-sm">
              <span className="text-2xl">📅</span> Carga Horária
            </h4>
            <p className="text-slate-600 font-medium text-sm leading-relaxed">
              Aulas divididas por turmas do 6º Ano conforme grade escolar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
