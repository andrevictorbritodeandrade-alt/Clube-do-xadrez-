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
  const [viewMode, setViewMode] = useState<'dashboard' | 'grade_select' | 'class_select' | 'details' | 'full_report'>('dashboard');
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  // --- CÁLCULOS DINÂMICOS ---
  const classStats = useMemo(() => {
    if (!classData) return [];
    
    return (Object.values(classData) as ClassData[]).map(cls => {
      let totalPresents = 0;
      let totalPossible = 0;
      const studentStats = cls.students?.map(s => {
        const presents = s.attendance ? Object.values(s.attendance).filter(v => v === 'P').length : 0;
        const total = s.attendance ? Object.keys(s.attendance).length : 0;
        totalPresents += presents;
        totalPossible += total;
        return {
          id: s.id,
          name: s.name,
          presents,
          total,
          percentage: total > 0 ? Math.round((presents / total) * 100) : 0
        };
      }) || [];

      return {
        id: cls.id,
        name: cls.name,
        grade: cls.grade,
        studentCount: cls.students?.length || 0,
        avgAttendance: totalPossible > 0 ? Math.round((totalPresents / totalPossible) * 100) : 0,
        students: studentStats
      };
    });
  }, [classData]);

  const realStats = useMemo(() => {
    if (!classData) return { students: 0, classes: 0, todayAttendance: 0, todayTotal: 0 };
    
    const classes = Object.values(classData || {}) as ClassData[];
    const totalClasses = classes.length;
    let totalStudents = 0;
    let todayAttendance = 0;
    let todayTotal = 0;

    const todayDate = "09/03"; // Data de hoje conforme os PDFs

    classes.forEach(cls => {
      if (cls.students) {
        totalStudents += cls.students.length;
        const hasClassToday = cls.students.some(s => s.attendance && s.attendance[todayDate]);
        if (hasClassToday) {
          todayTotal += cls.students.length;
          cls.students.forEach(s => {
            if (s.attendance && s.attendance[todayDate] === 'P') {
              todayAttendance++;
            }
          });
        }
      }
    });

    return { students: totalStudents, classes: totalClasses, todayAttendance, todayTotal };
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

  const getMonthName = (month: number) => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[month - 1] || 'Mês';
  };

  // --- RENDER CONTENT ---

  // 0. FULL REPORT VIEW
  if (viewMode === 'full_report') {
    // Calculate monthly average for the whole school
    const monthlyStats: { [month: string]: { presents: number, total: number } } = {};
    (Object.values(classData || {}) as ClassData[]).forEach(cls => {
      cls.students?.forEach(s => {
        if (s.attendance) {
          Object.entries(s.attendance).forEach(([date, status]) => {
            const month = date.split('/')[1];
            if (!monthlyStats[month]) monthlyStats[month] = { presents: 0, total: 0 };
            monthlyStats[month].total++;
            if (status === 'P') monthlyStats[month].presents++;
          });
        }
      });
    });

    const chartData = Object.keys(monthlyStats).sort((a, b) => Number(a) - Number(b)).map(month => ({
      name: getMonthName(Number(month)),
      percentage: Math.round((monthlyStats[month].presents / monthlyStats[month].total) * 100)
    }));

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setViewMode('dashboard')}
              className="px-4 py-2 bg-slate-900/80 text-white rounded-full shadow-lg hover:bg-slate-800 text-sm font-bold transition flex items-center"
            >
              <span className="mr-2">⬅</span> Voltar
            </button>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight drop-shadow-md">Relatório Geral Consolidado</h2>
          </div>
          <button 
            onClick={() => window.print()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 text-sm font-bold transition flex items-center"
          >
            <span className="mr-2">🖨️</span> Imprimir Relatório
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-panel p-6 border-l-4 border-blue-500">
            <p className="text-xs font-bold text-slate-500 uppercase">Total de Alunos</p>
            <p className="text-3xl font-black text-slate-800">{realStats.students}</p>
          </div>
          <div className="glass-panel p-6 border-l-4 border-purple-500">
            <p className="text-xs font-bold text-slate-500 uppercase">Média de Frequência</p>
            <p className="text-3xl font-black text-slate-800">
              {classStats.length > 0 ? Math.round(classStats.reduce((acc, curr) => acc + curr.avgAttendance, 0) / classStats.length) : 0}%
            </p>
          </div>
          <div className="glass-panel p-6 border-l-4 border-green-500">
            <p className="text-xs font-bold text-slate-500 uppercase">Turmas Ativas</p>
            <p className="text-3xl font-black text-slate-800">{realStats.classes}</p>
          </div>
        </div>

        {/* Monthly Chart */}
        <div className="glass-panel p-6 rounded-xl shadow-md bg-white">
          <h3 className="text-lg font-bold text-slate-800 mb-4 uppercase text-center">Desempenho de Frequência por Mês</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="percentage" fill="#3b82f6" name="Frequência %" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel overflow-hidden rounded-xl shadow-lg bg-white">
          <div className="p-4 bg-slate-50 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 uppercase text-sm">Resumo por Turma</h3>
          </div>
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-slate-800 text-white uppercase text-[10px] font-bold">
                <th className="px-6 py-4">Turma</th>
                <th className="px-6 py-4">Série</th>
                <th className="px-6 py-4 text-center">Total Alunos</th>
                <th className="px-6 py-4 text-center">Frequência Média</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classStats.sort((a,b) => a.name.localeCompare(b.name)).map(stat => (
                <tr key={stat.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-black text-slate-800">{stat.name}</td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{stat.grade}º Ano</td>
                  <td className="px-6 py-4 text-center font-bold text-slate-700">{stat.studentCount}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${stat.avgAttendance > 80 ? 'bg-green-500' : stat.avgAttendance > 50 ? 'bg-blue-500' : 'bg-red-500'}`}
                          style={{ width: `${stat.avgAttendance}%` }}
                        ></div>
                      </div>
                      <span className="font-bold text-slate-800">{stat.avgAttendance}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => { setSelectedClassId(stat.id); setViewMode('details'); }}
                      className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold hover:bg-blue-100 transition-colors"
                    >
                      Ver Detalhes
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // 1. DETAIL VIEW (The Historical Matrix)
  if (viewMode === 'details' && selectedClassId && classData) {
    const currentClass = classData[selectedClassId];
    if (!currentClass) return <div>Erro ao carregar turma</div>;
    
    const dates = getUniqueDates(currentClass);
    // Group dates by month
    const groupedDates: { [month: string]: string[] } = {};
    dates.forEach(date => {
      const month = date.split('/')[1];
      if (!groupedDates[month]) groupedDates[month] = [];
      groupedDates[month].push(date);
    });

    const sortedMonths = Object.keys(groupedDates).sort((a, b) => Number(a) - Number(b));

    // Sort students alphabetically
    const sortedStudents = currentClass.students ? [...currentClass.students].sort((a, b) => a.name.localeCompare(b.name)) : [];

    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setViewMode(selectedGrade ? 'class_select' : 'full_report')}
              className="px-4 py-2 bg-slate-900/80 text-white rounded-full shadow-lg hover:bg-slate-800 text-sm font-bold transition flex items-center"
            >
              <span className="mr-2">⬅</span> Voltar
            </button>
            <div>
              <h2 className="text-xl font-black text-white uppercase drop-shadow-md">Histórico: {currentClass.name}</h2>
              <p className="text-sm text-slate-200 drop-shadow-sm">Total de Alunos: {currentClass.students?.length || 0}</p>
            </div>
          </div>
          <button 
            onClick={() => window.print()}
            className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 text-sm font-bold transition"
          >
            🖨️ Imprimir Turma
          </button>
        </div>

        <div className="glass-panel p-0 overflow-hidden rounded-xl shadow-md bg-white">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-slate-800 text-white uppercase text-[10px] font-bold">
                  <th rowSpan={2} className="px-4 py-3 sticky left-0 bg-slate-800 z-20 border-r border-slate-700 min-w-[220px]">Nome do Aluno</th>
                  {sortedMonths.map(month => (
                    <th key={month} colSpan={groupedDates[month].length} className="px-3 py-2 text-center border-r border-slate-700 bg-slate-700">
                      {getMonthName(Number(month))}
                    </th>
                  ))}
                  <th rowSpan={2} className="px-4 py-3 text-center bg-blue-900 z-10 border-l border-slate-700">Resumo %</th>
                </tr>
                <tr className="bg-slate-100 text-slate-600 text-[9px] font-black border-b border-slate-200">
                  {sortedMonths.map(month => (
                    groupedDates[month].map(date => (
                      <th key={date} className="px-1 py-2 text-center min-w-[40px] border-r border-slate-200">{date.split('/')[0]}</th>
                    ))
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedStudents.map((student) => {
                  const totalDays = dates.length;
                  const presents = student.attendance ? Object.values(student.attendance).filter(v => v === 'P').length : 0;
                  const percentage = totalDays ? Math.round((presents / totalDays) * 100) : 0;
                  
                  return (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-2.5 font-bold text-slate-800 sticky left-0 bg-white z-10 border-r border-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] text-xs">
                        {student.name}
                      </td>
                      {sortedMonths.map(month => (
                        groupedDates[month].map(date => {
                          const status = student.attendance ? student.attendance[date] : null;
                          const isPresent = status === 'P';
                          return (
                            <td key={date} className="px-1 py-2 text-center border-r border-slate-50 last:border-0">
                              {isPresent && <span className="text-blue-600 font-black">P</span>}
                              {status === 'F' && <span className="text-red-500 font-black">F</span>}
                              {!status && <span className="text-slate-200">-</span>}
                            </td>
                          );
                        })
                      ))}
                      <td className={`px-4 py-2.5 text-center font-black border-l border-slate-100 bg-slate-50/50 text-xs ${percentage > 80 ? 'text-green-600' : percentage > 50 ? 'text-blue-600' : 'text-red-500'}`}>
                        {percentage}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {dates.length === 0 && (
            <div className="p-12 text-center text-slate-400 font-medium">
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
            className="px-4 py-2 bg-slate-900/80 text-white rounded-full shadow-lg hover:bg-slate-800 text-sm font-bold transition flex items-center"
          >
            <span className="mr-2">⬅</span> Voltar
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
            className="px-4 py-2 bg-slate-900/80 text-white rounded-full shadow-lg hover:bg-slate-800 text-sm font-bold transition flex items-center"
          >
            <span className="mr-2">⬅</span> Voltar
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
        className="mb-4 px-5 py-2.5 bg-slate-900/80 backdrop-blur-md rounded-full text-white font-bold transition-all shadow-lg hover:bg-slate-800 flex items-center w-fit active:scale-95 border border-white/10"
      >
        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
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
            if (card.id === 'next_event') {
               displayValue = realStats.todayTotal > 0 ? `${realStats.todayAttendance} / ${realStats.todayTotal}` : 'Sem aulas';
               displayTrend = 'Presença Hoje (09/03)';
               card.title = 'Presença Hoje';
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div 
          className="glass-panel p-8 rounded-xl shadow-md border-l-8 border-blue-600 flex items-center justify-between cursor-pointer hover:bg-white/80 transition group" 
          onClick={() => setViewMode('full_report')}
        >
          <div>
            <h3 className="text-xl font-black text-slate-800 uppercase">Relatório Geral Consolidado</h3>
            <p className="text-slate-500 text-sm font-medium">Visão macro de todas as turmas, total de alunos e médias.</p>
          </div>
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 00-4-4H5m11 2a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          </div>
        </div>

        <div 
          className="glass-panel p-8 rounded-xl shadow-md border-l-8 border-purple-600 flex items-center justify-between cursor-pointer hover:bg-white/80 transition group" 
          onClick={() => setViewMode('grade_select')}
        >
          <div>
            <h3 className="text-xl font-black text-slate-800 uppercase">Histórico por Aluno</h3>
            <p className="text-slate-500 text-sm font-medium">Acesse a frequência individual detalhada dia a dia.</p>
          </div>
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
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