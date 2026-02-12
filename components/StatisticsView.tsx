import React, { useEffect, useState, useMemo } from 'react';
import { subscribeToDashboard, seedDatabase } from '../services/firebaseService';
import { DashboardCardData, ClassDataMap, ClassData } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

interface StatisticsViewProps {
  classData?: ClassDataMap;
  onBack: () => void;
}

export const StatisticsView: React.FC<StatisticsViewProps> = ({ classData, onBack }) => {
  const [cards, setCards] = useState<DashboardCardData[]>([]);
  const [loading, setLoading] = useState(true);

  // Drill Down State for History View
  const [viewMode, setViewMode] = useState<'dashboard' | 'grade_select' | 'class_select' | 'details'>('dashboard');
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  // --- CÁLCULOS DINÂMICOS (Correção do Total de Alunos) ---
  const realStats = useMemo(() => {
    if (!classData) return { students: 0, classes: 0 };
    
    // Safety check to ensure we have an object before getting values
    const classes = Object.values(classData || {}) as ClassData[];
    const totalClasses = classes.length;
    const totalStudents = classes.reduce((acc, cls) => acc + (cls.students ? cls.students.length : 0), 0);

    return { students: totalStudents, classes: totalClasses };
  }, [classData]);

  useEffect(() => {
    seedDatabase();
    const unsubscribe = subscribeToDashboard((data) => {
      setCards(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const getIcon = (iconName?: string) => {
    switch(iconName) {
      case 'users': return <span className="text-2xl">👥</span>;
      case 'book': return <span className="text-2xl">📚</span>;
      case 'trophy': return <span className="text-2xl">🏆</span>;
      case 'door': return <span className="text-2xl">🚪</span>;
      default: return <span className="text-2xl">📊</span>;
    }
  };

  // Helper to get all unique dates for a specific class
  const getUniqueDates = (cls: ClassData) => {
    const dates = new Set<string>();
    if(cls.students) {
      cls.students.forEach(s => {
        if(s.attendance) {
          Object.keys(s.attendance).forEach(d => dates.add(d));
        }
      });
    }
    return Array.from(dates).sort((a,b) => {
       const [d1, m1] = a.split('/').map(Number);
       const [d2, m2] = b.split('/').map(Number);
       return m1 - m2 || d1 - d2;
    });
  };

  // --- RENDER CONTENT ---

  // 1. DETAIL VIEW (The Historical Matrix)
  if (viewMode === 'details' && selectedClassId && classData) {
    const currentClass = classData[selectedClassId];
    if (!currentClass) return <div>Erro ao carregar turma</div>;
    
    const dates = getUniqueDates(currentClass);
    // Sort students alphabetically
    const sortedStudents = currentClass.students ? [...currentClass.students].sort((a, b) => a.name.localeCompare(b.name)) : [];

    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center space-x-4 mb-4">
          <button 
            onClick={() => setViewMode('class_select')}
            className="px-4 py-2 bg-white rounded-lg shadow-sm hover:bg-slate-100 text-sm font-bold text-slate-700 transition"
          >
            ⬅ Voltar
          </button>
          <div>
            <h2 className="text-xl font-black text-white uppercase drop-shadow-md">Histórico: {currentClass.name}</h2>
            <p className="text-sm text-slate-200 drop-shadow-sm">Visualização detalhada dia a dia</p>
          </div>
        </div>

        <div className="glass-panel p-0 overflow-hidden rounded-xl shadow-md">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 uppercase text-xs font-bold border-b border-slate-200">
                  <th className="px-4 py-3 sticky left-0 bg-slate-100 z-10 shadow-sm border-r border-slate-200 min-w-[200px]">Nome do Aluno</th>
                  {dates.map(date => (
                    <th key={date} className="px-3 py-3 text-center min-w-[60px] whitespace-nowrap">{date}</th>
                  ))}
                  <th className="px-4 py-3 text-center bg-slate-100 font-black text-blue-600 border-l border-slate-200">Total %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {sortedStudents.map((student) => {
                  const totalDays = dates.length;
                  const presents = student.attendance ? Object.values(student.attendance).filter(v => v === 'P').length : 0;
                  const percentage = totalDays ? Math.round((presents / totalDays) * 100) : 0;
                  
                  return (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-800 sticky left-0 bg-white z-10 border-r border-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                        {student.name}
                      </td>
                      {dates.map(date => {
                        const status = student.attendance ? student.attendance[date] : null;
                        return (
                          <td key={date} className="px-2 py-3 text-center border-r border-slate-50 last:border-0">
                            {status === 'P' && <span className="inline-block w-6 h-6 leading-6 rounded bg-green-100 text-green-700 font-bold text-xs">P</span>}
                            {status === 'F' && <span className="inline-block w-6 h-6 leading-6 rounded bg-red-100 text-red-700 font-bold text-xs">F</span>}
                            {!status && <span className="text-slate-200">-</span>}
                          </td>
                        );
                      })}
                      <td className="px-4 py-3 text-center font-bold text-blue-600 border-l border-slate-100 bg-slate-50/50">
                        {percentage}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {dates.length === 0 && (
            <div className="p-8 text-center text-slate-400 font-medium">
              Nenhuma chamada realizada nesta turma ainda.
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. CLASS SELECT
  if (viewMode === 'class_select' && selectedGrade && classData) {
    const classes = (Object.values(classData) as ClassData[]).filter(c => c.grade === selectedGrade);
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center space-x-4 mb-6">
          <button 
            onClick={() => setViewMode('grade_select')}
            className="p-2 bg-white rounded-full shadow-sm hover:bg-slate-100 transition"
          >
            ⬅ Voltar
          </button>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight drop-shadow-md">Histórico {selectedGrade}º Ano</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map(cls => (
            <div 
              key={cls.id}
              onClick={() => { setSelectedClassId(cls.id); setViewMode('details'); }}
              className="glass-panel p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-white/90 transition-all transform hover:scale-[1.05] border-l-8 border-purple-600"
            >
              <h3 className="text-3xl font-black text-slate-800">{cls.name.replace('Turma ', '')}</h3>
              <p className="text-slate-500 mt-2 font-medium">Ver Frequência Detalhada</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 3. GRADE SELECT
  if (viewMode === 'grade_select') {
    return (
      <div className="space-y-6 animate-fade-in">
         <div className="flex items-center space-x-4 mb-6">
          <button 
            onClick={() => setViewMode('dashboard')}
            className="p-2 bg-white rounded-full shadow-sm hover:bg-slate-100 transition"
          >
            ⬅ Voltar
          </button>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight drop-shadow-md">Selecione o Nível</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div 
            onClick={() => { setSelectedGrade('6'); setViewMode('class_select'); }}
            className="glass-panel h-64 flex flex-col items-center justify-center cursor-pointer hover:bg-white/90 transition-all transform hover:scale-[1.02] group"
          >
            <div className="text-8xl mb-4 group-hover:scale-110 transition-transform">6️⃣</div>
            <h3 className="text-4xl font-black text-slate-800">Histórico 6º ANO</h3>
          </div>
          <div 
            onClick={() => { setSelectedGrade('7'); setViewMode('class_select'); }}
            className="glass-panel h-64 flex flex-col items-center justify-center cursor-pointer hover:bg-white/90 transition-all transform hover:scale-[1.02] group"
          >
            <div className="text-8xl mb-4 group-hover:scale-110 transition-transform">7️⃣</div>
            <h3 className="text-4xl font-black text-slate-800">Histórico 7º ANO</h3>
          </div>
        </div>
      </div>
    );
  }

  // 4. MAIN DASHBOARD VIEW
  return (
    <div className="space-y-8 animate-fade-in">
       <button 
        onClick={onBack}
        className="mb-4 flex items-center text-white/90 hover:text-white font-bold transition drop-shadow-md"
      >
        <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Voltar ao Menu
      </button>

      {/* Header Info */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-sm font-semibold text-white/90 uppercase tracking-wider drop-shadow-sm">Painel Geral</h2>
        <span className="text-xs text-green-600 flex items-center bg-green-100 px-2 py-1 rounded-full">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
          Conectado
        </span>
      </div>

      {loading ? (
        <div className="text-center py-10 text-white font-medium">Carregando dados...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card) => {
            // SUBSTITUIÇÃO DINÂMICA DOS VALORES
            let displayValue = card.value;
            let displayTrend = card.trend;

            if (card.id === 'total_students') {
               displayValue = realStats.students;
               displayTrend = 'Calculado em tempo real';
            }
            if (card.id === 'active_classes') {
               displayValue = realStats.classes;
               displayTrend = 'Turmas cadastradas';
            }

            return (
              <div key={card.id} className="glass-panel p-6 rounded-xl shadow-lg border border-white/50 relative">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">{card.title}</h3>
                  {getIcon(card.icon)}
                </div>
                <p className={`text-2xl font-black text-slate-800 truncate ${card.type === 'status' ? (String(card.value).toLowerCase() === 'aberto' ? 'text-green-600' : 'text-red-500') : ''}`}>
                  {displayValue}
                </p>
                {displayTrend && (
                  <div className="mt-4 flex items-center text-xs font-medium text-slate-500 bg-slate-100/50 inline-block px-2 py-1 rounded">
                    {displayTrend}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Button to Drill Down */}
      <div className="glass-panel p-8 rounded-xl shadow-md border-l-8 border-blue-600 flex flex-col md:flex-row items-center justify-between gap-6 cursor-pointer hover:bg-white/80 transition" onClick={() => setViewMode('grade_select')}>
         <div>
            <h3 className="text-2xl font-black text-slate-800 uppercase">Relatórios Detalhados de Frequência</h3>
            <p className="text-slate-500 font-medium">Acesse o histórico completo dia-a-dia de presença e falta de cada aluno por turma.</p>
         </div>
         <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
         </div>
      </div>

      {/* General Chart */}
      <div className="glass-panel p-6 rounded-xl shadow-md border border-white/50">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Frequência Mensal Geral (Exemplo)</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[
              { name: 'Jan', vitorias: 12, derrotas: 4 },
              { name: 'Fev', vitorias: 19, derrotas: 8 },
              { name: 'Mar', vitorias: 35, derrotas: 12 },
              { name: 'Abr', vitorias: 22, derrotas: 15 },
              { name: 'Mai', vitorias: 40, derrotas: 10 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
              <Legend />
              <Bar dataKey="vitorias" fill="#4F46E5" name="Presentes" radius={[4, 4, 0, 0]} />
              <Bar dataKey="derrotas" fill="#e2e8f0" name="Ausentes" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};