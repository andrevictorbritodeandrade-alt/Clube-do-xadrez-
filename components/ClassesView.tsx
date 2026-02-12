import React, { useState } from 'react';
import { ClassData, ClassDataMap, Student } from '../types';
import { PrintPreviewModal } from './PrintPreviewModal';

interface ClassesViewProps {
  classData: ClassDataMap;
  setClassData: React.Dispatch<React.SetStateAction<ClassDataMap>>;
  onBack: () => void;
  // Props recebidas do App.tsx para controle de navegação
  selectedGrade: string | null;
  setSelectedGrade: (grade: string | null) => void;
  selectedClassId: string | null;
  setSelectedClassId: (id: string | null) => void;
}

export const ClassesView: React.FC<ClassesViewProps> = ({ 
  classData, 
  setClassData, 
  onBack,
  selectedGrade,
  setSelectedGrade,
  selectedClassId,
  setSelectedClassId
}) => {
  
  // Modals State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<Student | null>(null);
  const [showMoveModal, setShowMoveModal] = useState<Student | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Student | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  
  // Input States
  const [newStudentName, setNewStudentName] = useState('');
  const [targetClassId, setTargetClassId] = useState('');
  
  // Date Logic
  const today = new Date();
  const dateStr = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth()+1).toString().padStart(2, '0')}`;

  // --- CRUD ACTIONS ---

  // Helper para ordenar array de alunos
  const sortStudentsAlphabetically = (students: Student[]) => {
    return [...students].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }));
  };

  const sortClassAlphabetically = () => {
    if (!selectedClassId) return;
    // Agora apenas força a reordenação caso algo esteja fora de ordem, sem perguntar
    setClassData(prev => {
        const newData = { ...prev };
        newData[selectedClassId].students = sortStudentsAlphabetically(newData[selectedClassId].students);
        return newData;
    });
  };

  const handleAttendance = (studentId: number, status: 'P' | 'F') => {
    if (!selectedClassId) return;

    setClassData((prev) => {
      const newData = { ...prev };
      if (!newData[selectedClassId]) return prev;

      const studentIndex = newData[selectedClassId].students.findIndex(s => s.id === studentId);
      if (studentIndex >= 0) {
        const updatedStudents = [...newData[selectedClassId].students];
        updatedStudents[studentIndex] = {
          ...updatedStudents[studentIndex],
          attendance: {
            ...updatedStudents[studentIndex].attendance,
            [dateStr]: status
          }
        };
        newData[selectedClassId] = {
          ...newData[selectedClassId],
          students: updatedStudents
        };
      }
      return newData;
    });
  };

  const addStudent = () => {
    if (!newStudentName.trim() || !selectedClassId) return;
    
    const newId = Date.now(); // Simple unique ID
    const newStudent: Student = {
      id: newId,
      name: newStudentName.trim(),
      attendance: {}
    };

    setClassData(prev => {
      const newData = { ...prev };
      // Adiciona e ordena imediatamente
      const updatedList = [...newData[selectedClassId].students, newStudent];
      newData[selectedClassId].students = sortStudentsAlphabetically(updatedList);
      return newData;
    });
    setNewStudentName('');
    setShowAddModal(false);
  };

  const updateStudentName = () => {
    if (!showEditModal || !selectedClassId || !newStudentName.trim()) return;

    setClassData(prev => {
      const newData = { ...prev };
      const students = newData[selectedClassId].students.map(s => 
        s.id === showEditModal.id ? { ...s, name: newStudentName.trim() } : s
      );
      // Reordena após editar o nome para manter a lista correta
      newData[selectedClassId].students = sortStudentsAlphabetically(students);
      return newData;
    });
    setShowEditModal(null);
    setNewStudentName('');
  };

  const deleteStudent = () => {
    if (!showDeleteConfirm || !selectedClassId) return;

    setClassData(prev => {
      const newData = { ...prev };
      newData[selectedClassId].students = newData[selectedClassId].students.filter(s => s.id !== showDeleteConfirm.id);
      return newData;
    });
    setShowDeleteConfirm(null);
  };

  const moveStudent = () => {
    if (!showMoveModal || !selectedClassId || !targetClassId) return;

    setClassData(prev => {
      const newData = { ...prev };
      
      const studentToMove = newData[selectedClassId].students.find(s => s.id === showMoveModal.id);
      if (!studentToMove) return prev;

      // Remove da turma atual
      newData[selectedClassId].students = newData[selectedClassId].students.filter(s => s.id !== showMoveModal.id);

      // Adiciona na nova turma e ORDENA a nova turma
      if (newData[targetClassId]) {
        const newTargetList = [...newData[targetClassId].students, studentToMove];
        newData[targetClassId].students = sortStudentsAlphabetically(newTargetList);
      }

      return newData;
    });
    setShowMoveModal(null);
    setTargetClassId('');
  };

  const getClassesByGrade = (grade: string): ClassData[] => {
    return (Object.values(classData) as ClassData[]).filter((c: ClassData) => c.grade === grade);
  };

  // Helper for stats
  const getStats = (student: Student) => {
    const totalDays = Object.keys(student.attendance).length;
    if (totalDays === 0) return { pCount: 0, pPercent: 0, fCount: 0, fPercent: 0 };
    
    const pCount = Object.values(student.attendance).filter(v => v === 'P').length;
    const fCount = Object.values(student.attendance).filter(v => v === 'F').length;
    
    return {
      pCount,
      fCount,
      pPercent: Math.round((pCount / totalDays) * 100),
      fPercent: Math.round((fCount / totalDays) * 100)
    };
  };

  // --- VIEWS ---

  // NÍVEL 1: SELEÇÃO DE ANO
  if (!selectedGrade) {
    return (
      <div className="space-y-6 animate-fade-in">
        <button 
          onClick={onBack}
          className="mb-4 flex items-center text-white/90 hover:text-white font-bold transition drop-shadow-md"
        >
          <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Voltar ao Menu
        </button>
        
        <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-6 drop-shadow-md">Selecione o Ano Escolar</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div 
            onClick={() => setSelectedGrade('6')}
            className="glass-panel h-64 flex flex-col items-center justify-center cursor-pointer hover:bg-white/90 transition-all transform hover:scale-[1.02] group"
          >
            <div className="text-8xl mb-4 group-hover:scale-110 transition-transform">6️⃣</div>
            <h3 className="text-4xl font-black text-slate-800">6º ANO</h3>
            <p className="text-slate-500 mt-2 font-bold">Turmas 601, 602, 603</p>
          </div>

          <div 
            onClick={() => setSelectedGrade('7')}
            className="glass-panel h-64 flex flex-col items-center justify-center cursor-pointer hover:bg-white/90 transition-all transform hover:scale-[1.02] group"
          >
            <div className="text-8xl mb-4 group-hover:scale-110 transition-transform">7️⃣</div>
            <h3 className="text-4xl font-black text-slate-800">7º ANO</h3>
            <p className="text-slate-500 mt-2 font-bold">Turmas 711 - 723</p>
          </div>
        </div>
      </div>
    );
  }

  // NÍVEL 2: SELEÇÃO DE TURMA
  if (!selectedClassId) {
    const classes = getClassesByGrade(selectedGrade);
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center space-x-4 mb-6">
          <button 
            onClick={() => setSelectedGrade(null)}
            className="p-2 bg-white rounded-full shadow-sm hover:bg-slate-100 transition"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight drop-shadow-md">Turmas de {selectedGrade}º Ano</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map(cls => (
            <div 
              key={cls.id}
              onClick={() => setSelectedClassId(cls.id)}
              className="glass-panel p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-white/90 transition-all transform hover:scale-[1.05] border-l-8 border-blue-600"
            >
              <h3 className="text-3xl font-black text-slate-800">{cls.name.replace('Turma ', '')}</h3>
              <p className="text-slate-500 mt-2 font-medium">{cls.students.length} Alunos</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // NÍVEL 3: LISTA DE CHAMADA
  const currentClass = classData[selectedClassId];
  const sortedStudents = currentClass.students;

  return (
    <>
    <div className="glass-panel rounded-xl shadow-sm overflow-hidden animate-fade-in relative pb-4">
      
      {/* Header View - Toolbar Compacta */}
      <div className="p-3 border-b border-slate-200 flex flex-row justify-between items-center bg-slate-100">
        <div className="flex items-center">
          <button 
            onClick={() => setSelectedClassId(null)}
            className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm hover:bg-slate-200 text-slate-700 transition border border-slate-200"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <div className="ml-3">
             <p className="text-xs text-blue-600 font-bold uppercase tracking-wide">Chamada • {dateStr}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           <button
             onClick={() => setShowPrintModal(true)}
             className="w-10 h-10 flex items-center justify-center bg-slate-800 text-white rounded-lg shadow-md hover:bg-slate-900 transition"
             title="Imprimir"
           >
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
           </button>
           {/* Botão de Ordenar removido pois agora é automático, mantido apenas o ícone para feedback visual se desejar, ou removido para limpar UI */}
          <button 
            onClick={() => { setNewStudentName(''); setShowAddModal(true); }}
            className="w-10 h-10 flex items-center justify-center bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition"
            title="Adicionar Aluno"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          </button>
        </div>
      </div>

      {/* --- LISTA DE ALUNOS (LAYOUT UNIFICADO E RESPONSIVO) --- */}
      <div className="space-y-3 p-3 bg-slate-50/50">
        {sortedStudents.map((student, index) => {
          const status = student.attendance[dateStr];
          const stats = getStats(student);
          
          return (
            <div key={student.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-3">
              {/* Row 1: Number, Name, Actions */}
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                 <div className="flex items-center gap-3 overflow-hidden">
                    <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-sm font-black text-slate-500 bg-slate-100 rounded-lg">{index + 1}</span>
                    <h4 className="font-bold text-slate-800 text-base truncate leading-tight">{student.name}</h4>
                 </div>
                 
                 <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                    <button 
                      onClick={() => { setNewStudentName(student.name); setShowEditModal(student); }} 
                      className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded transition"
                      title="Editar"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                     <button 
                       onClick={() => setShowMoveModal(student)} 
                       className="p-1.5 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded transition"
                       title="Mover"
                     >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                    </button>
                     <button 
                       onClick={() => setShowDeleteConfirm(student)} 
                       className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition"
                       title="Excluir"
                     >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                 </div>
              </div>

              {/* Row 2: Attendance Grid (Linear 4 cols) */}
              <div className="grid grid-cols-4 gap-2 h-12">
                 {/* 1. Botão Presente */}
                 <button
                   onClick={() => handleAttendance(student.id, 'P')}
                   className={`rounded-lg font-black text-xs md:text-sm uppercase tracking-wider transition-all shadow-sm active:scale-95 flex items-center justify-center ${
                     status === 'P'
                     ? 'bg-green-600 text-white shadow-green-500/30 ring-2 ring-green-600 ring-offset-1'
                     : 'bg-slate-50 text-slate-400 hover:bg-green-100 hover:text-green-600 border border-slate-200'
                   }`}
                 >
                   {status === 'P' ? 'PRESENTE' : 'P'}
                 </button>

                 {/* 2. Stat Presente */}
                 <div className="rounded-lg bg-green-50 border border-green-100 flex flex-col items-center justify-center text-green-700">
                    <span className="text-xs font-bold uppercase opacity-70">Presenças</span>
                    <span className="font-black text-sm">{stats.pCount} <span className="text-[10px] opacity-70">({stats.pPercent}%)</span></span>
                 </div>

                 {/* 3. Botão Falta */}
                 <button
                   onClick={() => handleAttendance(student.id, 'F')}
                   className={`rounded-lg font-black text-xs md:text-sm uppercase tracking-wider transition-all shadow-sm active:scale-95 flex items-center justify-center ${
                     status === 'F'
                     ? 'bg-red-600 text-white shadow-red-500/30 ring-2 ring-red-600 ring-offset-1'
                     : 'bg-slate-50 text-slate-400 hover:bg-red-100 hover:text-red-600 border border-slate-200'
                   }`}
                 >
                   {status === 'F' ? 'FALTA' : 'F'}
                 </button>

                 {/* 4. Stat Falta */}
                 <div className="rounded-lg bg-red-50 border border-red-100 flex flex-col items-center justify-center text-red-700">
                    <span className="text-xs font-bold uppercase opacity-70">Faltas</span>
                    <span className="font-black text-sm">{stats.fCount} <span className="text-[10px] opacity-70">({stats.fPercent}%)</span></span>
                 </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* --- MODALS --- */}
      
      {/* Print Preview Modal */}
      <PrintPreviewModal 
        isOpen={showPrintModal} 
        onClose={() => setShowPrintModal(false)}
        classData={currentClass}
        dateStr={dateStr}
      />

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 animate-scale-in">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Adicionar Novo Aluno</h3>
            <input 
              autoFocus
              className="w-full p-3 border rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Nome Completo"
              value={newStudentName}
              onChange={e => setNewStudentName(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded">Cancelar</button>
              <button onClick={addStudent} className="px-4 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700">Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 animate-scale-in">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Editar Nome</h3>
            <input 
              autoFocus
              className="w-full p-3 border rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
              value={newStudentName}
              onChange={e => setNewStudentName(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowEditModal(null)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded">Cancelar</button>
              <button onClick={updateStudentName} className="px-4 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700">Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* Move Student Modal */}
      {showMoveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 animate-scale-in">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Mover Aluno</h3>
            <p className="text-sm text-slate-500 mb-4">Mover <b>{showMoveModal.name}</b> para qual turma?</p>
            
            <select 
              className="w-full p-3 border rounded-lg mb-4 bg-slate-50"
              value={targetClassId}
              onChange={e => setTargetClassId(e.target.value)}
            >
              <option value="">Selecione a turma...</option>
              {(Object.values(classData) as ClassData[])
                .filter(c => c.id !== selectedClassId) // Don't show current class
                .map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <div className="flex justify-end gap-2">
              <button onClick={() => setShowMoveModal(null)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded">Cancelar</button>
              <button 
                onClick={moveStudent} 
                disabled={!targetClassId}
                className="px-4 py-2 bg-orange-500 text-white rounded font-bold hover:bg-orange-600 disabled:opacity-50"
              >
                Mover
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 animate-scale-in text-center">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🗑️</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Excluir Aluno?</h3>
            <p className="text-sm text-slate-500 mb-6">
              Tem certeza que deseja remover <b>{showDeleteConfirm.name}</b>?<br/>
              Essa ação não pode ser desfeita.
            </p>
            
            <div className="flex justify-center gap-3">
              <button onClick={() => setShowDeleteConfirm(null)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded font-bold">Cancelar</button>
              <button onClick={deleteStudent} className="px-6 py-2 bg-red-600 text-white rounded font-bold hover:bg-red-700">Excluir</button>
            </div>
          </div>
        </div>
      )}

    </div>
    </>
  );
};