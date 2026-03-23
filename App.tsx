import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import { ChessGame } from './components/ChessGame';
import { Profile } from './components/Profile';
import { BackgroundSlider } from './components/BackgroundSlider';
import { DashboardView } from './components/DashboardView';
import { StatisticsView } from './components/StatisticsView';
import { ClassesView } from './components/ClassesView';
import { TournamentsView } from './components/TournamentsView';
import { EmentaView } from './components/EmentaView';
import { ExercisesView } from './components/ExercisesView';
import { NotationView } from './components/NotationView';
import { ScheduleView } from './components/ScheduleView';
import { GalleryView } from './components/GalleryView';
import { ActivityPrintModal } from './components/ActivityPrintModal';
import { WeatherWidget } from './components/WeatherWidget'; // Import Widget
import { ViewState, ClassDataMap, ActivityLogData, ClassData } from './types';
import { initialActivityLogData, mockUserProfile, initialClassData } from './constants';
import { initFirebase, subscribeToClasses, saveClassesToFirestore, subscribeToActivityLog, saveActivityLogToFirestore } from './services/firebaseService';

// --- Global Footer Component ---
const GlobalFooter = () => (
  <footer className="w-full py-4 md:py-6 text-center relative z-50 shrink-0 mt-auto">
    <div className="container mx-auto px-4">
      <h3 className="font-black text-[10px] md:text-sm tracking-widest uppercase mb-1 text-white whitespace-nowrap drop-shadow-md">
        CLUBE DO XADREZ - Gestão das aulas de Xadrez
      </h3>
      <p className="text-[10px] md:text-xs font-semibold text-slate-200 drop-shadow-sm">Desenvolvido por André Brito</p>
      <div className="mt-2">
         <span className="text-[10px] md:text-xs font-bold text-white bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10 shadow-sm">
           📱 21 994 527 694
         </span>
      </div>
    </div>
  </footer>
);

// --- Sub-components for Views ---

interface ActivityLogViewProps {
  data: ActivityLogData;
  setData: React.Dispatch<React.SetStateAction<ActivityLogData>>;
  onBack: () => void;
  availableClasses: {id: string, name: string}[];
  onSave: (data: ActivityLogData) => Promise<void>;
}

const ActivityLogView: React.FC<ActivityLogViewProps> = ({ data, setData, onBack, availableClasses, onSave }) => {
  const { header, log } = data;
  const [isEditing, setIsEditing] = useState(() => {
    return localStorage.getItem('app_activity_isEditing') === 'true';
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(() => {
    const val = localStorage.getItem('app_activity_editingIndex');
    return val ? parseInt(val, 10) : null;
  });
  const [showPrintModal, setShowPrintModal] = useState(false);
  
  // Form State
  const [formDate, setFormDate] = useState(() => {
    return localStorage.getItem('app_activity_formDate') || '';
  });
  const [formContent, setFormContent] = useState(() => {
    return localStorage.getItem('app_activity_formContent') || '';
  });
  const [formClasses, setFormClasses] = useState<string[]>(() => {
    const val = localStorage.getItem('app_activity_formClasses');
    return val ? JSON.parse(val) : [];
  });

  useEffect(() => {
    localStorage.setItem('app_activity_isEditing', String(isEditing));
  }, [isEditing]);

  useEffect(() => {
    if (editingIndex !== null) localStorage.setItem('app_activity_editingIndex', String(editingIndex));
    else localStorage.removeItem('app_activity_editingIndex');
  }, [editingIndex]);

  useEffect(() => {
    localStorage.setItem('app_activity_formDate', formDate);
  }, [formDate]);

  useEffect(() => {
    localStorage.setItem('app_activity_formContent', formContent);
  }, [formContent]);

  useEffect(() => {
    localStorage.setItem('app_activity_formClasses', JSON.stringify(formClasses));
  }, [formClasses]);

  const openNew = () => {
    setFormDate('');
    setFormContent('');
    setFormClasses([]);
    setEditingIndex(null);
    setIsEditing(true);
  };

  const openEdit = (index: number) => {
    const entry = log[index];
    setFormDate(entry.date);
    setFormContent(entry.activities.join('\n'));
    setFormClasses(entry.classes || []);
    setEditingIndex(index);
    setIsEditing(true);
  };
  
  const handleSave = () => {
    if(!formDate || !formContent) {
      alert("Preencha a data e o conteúdo da aula.");
      return;
    }

    const activityLines = formContent.split('\n').filter(line => line.trim() !== '');

    if (editingIndex !== null) {
      // Edit Mode
      setData(prev => {
        const newLog = [...prev.log];
        newLog[editingIndex] = {
          date: formDate,
          classes: formClasses,
          activities: activityLines
        };
        const newData = { ...prev, log: newLog };
        onSave(newData).catch(console.error);
        return newData;
      });
    } else {
      // Create Mode
      setData(prev => {
        const newData = {
          ...prev,
          log: [...prev.log, { date: formDate, classes: formClasses, activities: activityLines }]
        };
        onSave(newData).catch(console.error);
        return newData;
      });
    }
    
    setIsEditing(false);
    setEditingIndex(null);
  };

  const handleDelete = (index: number) => {
    if(window.confirm('Tem certeza que deseja apagar este registro?')) {
      setData(prev => {
        const newData = {
          ...prev,
          log: prev.log.filter((_, i) => i !== index)
        };
        onSave(newData).catch(console.error);
        return newData;
      });
    }
  };

  const toggleClassSelection = (classId: string) => {
    setFormClasses(prev => 
      prev.includes(classId) ? prev.filter(c => c !== classId) : [...prev, classId]
    );
  };

  return (
    <>
    <div className="max-w-4xl mx-auto glass-panel p-4 md:p-8 print:shadow-none animate-fade-in relative pb-20">
      <button 
        onClick={onBack}
        className="mb-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full font-bold transition flex items-center shadow-sm w-fit"
      >
        <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Voltar ao Menu
      </button>

      {/* Official Header */}
      <div className="text-center border-b-4 border-slate-900 pb-4 mb-6">
        <h1 className="font-black text-sm md:text-xl uppercase tracking-wide leading-tight text-slate-900">{header.government}</h1>
        <h2 className="font-bold text-xs md:text-lg text-slate-700 leading-tight">{header.city}</h2>
        <h3 className="font-bold text-[10px] md:text-sm text-slate-600 mt-1">{header.department}</h3>
        <p className="mt-2 text-xs md:text-sm font-medium uppercase text-slate-800">{header.school}</p>
        <div className="mt-4 flex flex-col md:flex-row justify-between text-xs md:text-sm font-bold border-t-2 border-slate-900 pt-2 gap-1 text-slate-900">
          <span className="uppercase">PROF: {header.professor}</span>
          <span className="uppercase">{header.project}</span>
        </div>
      </div>
      
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-slate-100 py-3 px-4 rounded-lg border-l-4 border-blue-600 shadow-sm">
           <h2 className="text-lg md:text-2xl font-black text-slate-800 uppercase tracking-widest">Diário de Classe</h2>
           <div className="flex gap-2">
             <button
               onClick={() => setShowPrintModal(true)}
               className="w-10 h-10 flex items-center justify-center bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition shadow-md"
               title="Imprimir Diário"
             >
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
             </button>
             <button 
               onClick={openNew}
               className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition flex items-center shadow-md hover:shadow-xl active:scale-95"
             >
               <span className="mr-2 text-lg">+</span> Nova Aula
             </button>
           </div>
        </div>

        {isEditing && (
          <div className="bg-white border-2 border-blue-100 p-6 rounded-xl animate-scale-in shadow-xl relative z-20">
            <h3 className="font-bold text-blue-800 mb-4 uppercase tracking-wide border-b pb-2">
              {editingIndex !== null ? 'Editar Registro' : 'Novo Registro de Aula'}
            </h3>
            
            <div className="grid grid-cols-1 gap-4">
              {/* Data Input - Fixed Colors */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Data</label>
                <input 
                  type="text" 
                  placeholder="Ex: 25/mar" 
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium bg-white text-slate-900 placeholder-slate-400"
                  value={formDate}
                  onChange={e => setFormDate(e.target.value)}
                />
              </div>

              {/* Class Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Turmas Aplicadas</label>
                <div className="flex flex-wrap gap-2">
                  {availableClasses.map(cls => (
                    <button
                      key={cls.id}
                      onClick={() => toggleClassSelection(cls.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                        formClasses.includes(cls.id) 
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                          : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      {cls.name.replace('Turma ', '')}
                      {formClasses.includes(cls.id) && ' ✓'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Activity Content - Fixed Colors */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Conteúdo e Objetivos</label>
                <textarea 
                  placeholder="Descreva as atividades, objetivos e observações..." 
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-32 resize-y font-medium bg-white text-slate-900 placeholder-slate-400"
                  value={formContent}
                  onChange={e => setFormContent(e.target.value)}
                />
                <p className="text-[10px] text-slate-400 mt-1">Pule linhas para criar tópicos separados.</p>
              </div>

              <div className="flex justify-end gap-3 mt-2">
                <button onClick={() => setIsEditing(false)} className="px-5 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg transition">
                  Cancelar
                </button>
                <button onClick={handleSave} className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 shadow-md transition transform active:scale-95">
                  Salvar Registro
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Timeline Log */}
        <div className="relative border-l-2 border-slate-200 ml-3 md:ml-6 space-y-8 pl-6 md:pl-8 py-2">
          {log.map((entry, idx) => (
            <div key={idx} className="relative group">
              {/* Timeline Dot */}
              <div className="absolute -left-[33px] md:-left-[41px] top-0 w-4 h-4 md:w-5 md:h-5 bg-blue-500 rounded-full border-4 border-white shadow-sm z-10"></div>
              
              <div className="bg-white/90 p-5 rounded-xl border border-slate-200 hover:border-blue-300 transition-all shadow-sm hover:shadow-md">
                
                {/* Actions */}
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/50 backdrop-blur rounded-lg p-1">
                   <button 
                    onClick={() => openEdit(idx)}
                    className="p-1.5 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                    title="Editar"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                  <button 
                    onClick={() => handleDelete(idx)}
                    className="p-1.5 text-red-300 hover:text-red-600 hover:bg-red-50 rounded transition"
                    title="Excluir"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>

                <div className="flex flex-col md:flex-row md:items-start gap-4 mb-3">
                  <div className="flex-shrink-0">
                    <span className="block text-2xl font-black text-blue-600 leading-none">{entry.date.split('/')[0]}</span>
                    <span className="block text-xs font-bold text-slate-400 uppercase">{entry.date.split('/')[1] || 'mês'}</span>
                  </div>
                  
                  <div className="flex-1">
                    {/* Classes Tags */}
                    {entry.classes && entry.classes.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {entry.classes.map(clsId => (
                          <span key={clsId} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded border border-slate-200">
                             {availableClasses.find(c => c.id === clsId)?.name.replace('Turma ', 'T') || clsId}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <ul className="space-y-2">
                      {entry.activities.map((act, i) => (
                        <li key={i} className="text-slate-800 text-sm md:text-base leading-relaxed flex items-start">
                          <span className="text-blue-400 mr-2 mt-1.5 text-[8px]">●</span>
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Print Modal */}
    <ActivityPrintModal 
      isOpen={showPrintModal} 
      onClose={() => setShowPrintModal(false)} 
      data={data}
    />
    </>
  );
};

// --- Sync Status Indicator ---
const SyncStatusIndicator = ({ status }: { status: 'synced' | 'saving' | 'error' }) => {
  if (status === 'saving') {
    return (
      <div className="flex items-center gap-1.5 bg-blue-600/20 px-2 py-1 rounded-full border border-blue-500/30">
        <svg className="animate-spin h-3 w-3 text-blue-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="text-[10px] font-bold text-blue-200 uppercase tracking-wider">Salvando...</span>
      </div>
    );
  }
  if (status === 'error') {
    return (
      <div className="flex items-center gap-1.5 bg-red-600/20 px-2 py-1 rounded-full border border-red-500/30">
        <svg className="h-3 w-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-[10px] font-bold text-red-200 uppercase tracking-wider">Erro ao Salvar</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 bg-green-600/20 px-2 py-1 rounded-full border border-green-500/30 transition-all duration-500">
      <svg className="h-3 w-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      <span className="text-[10px] font-bold text-green-200 uppercase tracking-wider">Sincronizado</span>
    </div>
  );
};

// --- Main App Component ---

const App: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setView] = useState<ViewState>(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && ['home', 'statistics', 'classes', 'activities', 'tournaments', 'play', 'ementa', 'exercises', 'notation', 'profile'].includes(hash)) {
      return hash as ViewState;
    }
    return (localStorage.getItem('app_currentView') as ViewState) || 'home';
  });
  
  // Shared State
  const [classData, setClassData] = useState<ClassDataMap>(() => {
    const stored = localStorage.getItem('app_classData');
    return stored ? JSON.parse(stored) : initialClassData;
  });
  const [activityLogData, setActivityLogData] = useState<ActivityLogData>(() => {
    const stored = localStorage.getItem('app_activityLogData');
    return stored ? JSON.parse(stored) : initialActivityLogData;
  });

  // Persistence Refs
  const isRemoteClassUpdate = useRef(false);
  const hasLoadedClasses = useRef(false);
  const isRemoteActivityUpdate = useRef(false);
  const hasLoadedActivities = useRef(false);

  // Sync Status State
  const [syncStatus, setSyncStatus] = useState<'synced' | 'saving' | 'error'>('synced');

  // Helper to save classes explicitly
  const handleSaveClasses = async (newData: ClassDataMap) => {
    setSyncStatus('saving');
    try {
      await saveClassesToFirestore(newData);
      setSyncStatus('synced');
    } catch (error) {
      console.error("Erro ao salvar:", error);
      setSyncStatus('error');
    }
  };

  // Helper to save activity log explicitly
  const handleSaveActivityLog = async (newData: ActivityLogData) => {
    setSyncStatus('saving');
    try {
      await saveActivityLogToFirestore(newData);
      setSyncStatus('synced');
    } catch (error) {
      console.error("Erro ao salvar atividades:", error);
      setSyncStatus('error');
    }
  };

  useEffect(() => {
    localStorage.setItem('app_classData', JSON.stringify(classData));
    if (hasLoadedClasses.current) {
      if (isRemoteClassUpdate.current) {
        isRemoteClassUpdate.current = false;
      } else {
        handleSaveClasses(classData);
      }
    }
  }, [classData]);

  useEffect(() => {
    localStorage.setItem('app_activityLogData', JSON.stringify(activityLogData));
    if (hasLoadedActivities.current) {
      if (isRemoteActivityUpdate.current) {
        isRemoteActivityUpdate.current = false;
      } else {
        handleSaveActivityLog(activityLogData);
      }
    }
  }, [activityLogData]);

  // State for Navigation within Classes
  const [selectedGrade, setSelectedGrade] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('grade') || localStorage.getItem('app_selectedGrade');
  });
  const [selectedClassId, setSelectedClassId] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('classId') || localStorage.getItem('app_selectedClassId');
  });

  useEffect(() => {
    localStorage.setItem('app_currentView', currentView);
    window.location.hash = currentView;
    // Expose setView to window for external access (like from ClassesView)
    (window as any).setView = setView;
  }, [currentView]);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (selectedGrade) {
      localStorage.setItem('app_selectedGrade', selectedGrade);
      url.searchParams.set('grade', selectedGrade);
    } else {
      localStorage.removeItem('app_selectedGrade');
      url.searchParams.delete('grade');
    }
    window.history.replaceState({}, '', url.toString());
  }, [selectedGrade]);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (selectedClassId) {
      localStorage.setItem('app_selectedClassId', selectedClassId);
      url.searchParams.set('classId', selectedClassId);
    } else {
      localStorage.removeItem('app_selectedClassId');
      url.searchParams.delete('classId');
    }
    window.history.replaceState({}, '', url.toString());
  }, [selectedClassId]);

  useEffect(() => {
    // Inicializa Firebase ao carregar o app
    const success = initFirebase();
    if(success) {
      // Subscribe to classes
      const unsubClasses = subscribeToClasses((firebaseClasses) => {
        if (Object.keys(firebaseClasses).length > 0) {
          isRemoteClassUpdate.current = true;
          
          // Migration: If class 600 exists, replace it with 601, 602, 603, 604
          let migratedClasses = { ...firebaseClasses };
          let needsSave = false;
          
          if (migratedClasses["600"] && !migratedClasses["601"]) {
            delete migratedClasses["600"];
            migratedClasses["601"] = initialClassData["601"];
            migratedClasses["602"] = initialClassData["602"];
            migratedClasses["603"] = initialClassData["603"];
            migratedClasses["604"] = initialClassData["604"];
            needsSave = true;
          }

          // Migration: Update schedules, days and student rosters (preserving attendance)
          Object.keys(initialClassData).forEach(id => {
            if (migratedClasses[id]) {
              let classChanged = false;
              
              // Update schedule/days if missing or different
              if (migratedClasses[id].schedule !== initialClassData[id].schedule) {
                migratedClasses[id].schedule = initialClassData[id].schedule;
                classChanged = true;
              }
              if (JSON.stringify(migratedClasses[id].days) !== JSON.stringify(initialClassData[id].days)) {
                migratedClasses[id].days = initialClassData[id].days;
                classChanged = true;
              }

              // Update students roster but preserve attendance for matching names
              const currentStudents = migratedClasses[id].students || [];
              const newStudents = initialClassData[id].students.map(ns => {
                const existing = currentStudents.find(cs => cs.name === ns.name);
                if (existing) {
                  return { ...ns, attendance: { ...ns.attendance, ...existing.attendance } };
                }
                return ns;
              });

              // Check if students list actually changed (ignoring attendance for comparison)
              const rosterChanged = JSON.stringify(currentStudents.map(s => s.name)) !== JSON.stringify(newStudents.map(s => s.name));
              
              if (rosterChanged) {
                migratedClasses[id].students = newStudents;
                classChanged = true;
              }

              if (classChanged) needsSave = true;
            }
          });

          // Migration for 09/03 attendance
          const checkAndMergeAttendance = (classId: string) => {
            if (migratedClasses[classId] && migratedClasses[classId].students) {
              const has0903 = migratedClasses[classId].students.some(s => s.attendance && s.attendance["09/03"]);
              if (!has0903) {
                migratedClasses[classId].students = migratedClasses[classId].students.map(s => {
                  const initialStudent = initialClassData[classId].students.find(is => is.name === s.name);
                  if (initialStudent && initialStudent.attendance && initialStudent.attendance["09/03"]) {
                    return {
                      ...s,
                      attendance: {
                        ...s.attendance,
                        "09/03": initialStudent.attendance["09/03"]
                      }
                    };
                  }
                  return s;
                });
                needsSave = true;
              }
            }
          };

          checkAndMergeAttendance("603");
          checkAndMergeAttendance("604");
          
          if (needsSave) {
            saveClassesToFirestore(migratedClasses);
          }
          setClassData(migratedClasses);
        } else if (!hasLoadedClasses.current) {
          // Se vazio no servidor, salva o inicial ou o que tem no local storage
          const stored = localStorage.getItem('app_classData');
          let dataToSave = stored ? JSON.parse(stored) : initialClassData;
          
          // Migration for local storage data
          let needsSave = false;
          if (dataToSave["600"] && !dataToSave["601"]) {
            delete dataToSave["600"];
            dataToSave["601"] = initialClassData["601"];
            dataToSave["602"] = initialClassData["602"];
            dataToSave["603"] = initialClassData["603"];
            dataToSave["604"] = initialClassData["604"];
            needsSave = true;
          }

          const checkAndMergeAttendanceLocal = (classId: string) => {
            if (dataToSave[classId] && dataToSave[classId].students) {
              const has0903 = dataToSave[classId].students.some((s: any) => s.attendance && s.attendance["09/03"]);
              if (!has0903) {
                dataToSave[classId].students = dataToSave[classId].students.map((s: any) => {
                  const initialStudent = initialClassData[classId].students.find(is => is.name === s.name);
                  if (initialStudent && initialStudent.attendance && initialStudent.attendance["09/03"]) {
                    return {
                      ...s,
                      attendance: {
                        ...s.attendance,
                        "09/03": initialStudent.attendance["09/03"]
                      }
                    };
                  }
                  return s;
                });
                needsSave = true;
              }
            }
          };

          checkAndMergeAttendanceLocal("603");
          checkAndMergeAttendanceLocal("604");
          
          saveClassesToFirestore(dataToSave);
          setClassData(dataToSave);
        }
        hasLoadedClasses.current = true;
      });

      // Subscribe to activity log
      const unsubActivity = subscribeToActivityLog((firebaseLog) => {
        if (firebaseLog && firebaseLog.log && firebaseLog.log.length > 0) {
          isRemoteActivityUpdate.current = true;
          setActivityLogData(firebaseLog);
        } else if (!hasLoadedActivities.current) {
          const stored = localStorage.getItem('app_activityLogData');
          const dataToSave = stored ? JSON.parse(stored) : initialActivityLogData;
          saveActivityLogToFirestore(dataToSave);
          setActivityLogData(dataToSave);
        }
        hasLoadedActivities.current = true;
      });

      return () => {
        unsubClasses();
        unsubActivity();
      };
    }
  }, []);

  // Hardware Back Button Handling
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // Prevent default back behavior if we can handle it internally
      if (selectedClassId) {
        setSelectedClassId(null);
        window.history.pushState({ app: 'classes_grade' }, '', window.location.pathname);
      } else if (selectedGrade) {
        setSelectedGrade(null);
        window.history.pushState({ app: 'classes_home' }, '', window.location.pathname);
      } else if (currentView !== 'home') {
        setView('home');
        window.history.pushState({ app: 'home' }, '', window.location.pathname);
      } else {
        // If at home, push state again to prevent exiting the app
        window.history.pushState({ app: 'home' }, '', window.location.pathname);
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentView, selectedGrade, selectedClassId]);

  const goBack = () => {
    if (selectedClassId) {
        setSelectedClassId(null);
    } else if (selectedGrade) {
        setSelectedGrade(null);
    } else {
        setView('home');
    }
  };

  const setViewWithHistory = (v: ViewState) => {
    resetClassesNav(); 
    setView(v);
  };

  const resetClassesNav = () => {
    setSelectedGrade(null);
    setSelectedClassId(null);
  };

  const renderView = () => {
    switch(currentView) {
      case 'home': return <DashboardView setView={setViewWithHistory} />;
      case 'statistics': return <StatisticsView classData={classData} onBack={goBack} />;
      case 'classes': return (
        <ClassesView 
          classData={classData} 
          setClassData={setClassData} 
          onBack={goBack}
          selectedGrade={selectedGrade}
          setSelectedGrade={setSelectedGrade}
          selectedClassId={selectedClassId}
          setSelectedClassId={setSelectedClassId}
          onSave={handleSaveClasses}
        />
      );
      case 'activities': return (
        <ActivityLogView 
          data={activityLogData} 
          setData={setActivityLogData} 
          onBack={goBack}
          availableClasses={Object.values(classData).map((c: ClassData) => ({ id: c.id, name: c.name }))} 
          onSave={handleSaveActivityLog}
        />
      );
      case 'tournaments': return <TournamentsView onBack={goBack} />;
      case 'play': return <ChessGame onBack={goBack} />;
      case 'ementa': return <EmentaView onBack={goBack} />;
      case 'exercises': return <ExercisesView onBack={goBack} />;
      case 'notation': return <NotationView onBack={goBack} />;
      case 'schedule': return <ScheduleView onBack={goBack} />;
      case 'gallery': return <GalleryView onBack={goBack} />;
      case 'profile': return <Profile user={mockUserProfile} onBack={goBack} />;
      default: return <DashboardView setView={setViewWithHistory} />;
    }
  };

  const getTitle = () => {
     switch(currentView) {
      case 'home': return 'Início';
      case 'statistics': return 'Estatísticas';
      case 'classes': 
        if (selectedClassId && classData[selectedClassId]) return classData[selectedClassId].name.toUpperCase();
        if (selectedGrade) return `${selectedGrade}º ANO`;
        return 'Turmas';
      case 'activities': return 'Diário de Classe';
      case 'tournaments': return 'Torneios';
      case 'play': return 'Jogar Xadrez';
      case 'ementa': return 'Ementa Escolar';
      case 'exercises': return 'Exercícios Táticos';
      case 'notation': return 'Notação Algébrica';
      case 'schedule': return 'Quadro de Horários';
      case 'gallery': return 'Galeria';
      case 'profile': return 'Perfil';
      default: return 'Painel';
    }
  };

  return (
    <div className="flex flex-col min-h-screen relative font-sans">
      {/* Global Background */}
      <BackgroundSlider />
      
      {/* Wrapper for Content + Footer */}
      <div className="flex-1 flex flex-col z-10">
        
          // Logged In App Structure
          <div className="flex-1 flex flex-col">
             
             {/* Sidebar */}
             <Sidebar 
               isOpen={isSidebarOpen} 
               onClose={() => setSidebarOpen(false)} 
               currentView={currentView}
               setView={(v) => { resetClassesNav(); setView(v); }}
             />

             {/* Header */}
             <header className="bg-white/10 backdrop-blur-xl border-b border-white/20 h-14 md:h-16 flex items-center px-4 sticky top-0 z-30 shadow-lg shrink-0 transition-all duration-300 text-white">
               <button 
                 onClick={() => setSidebarOpen(true)}
                 className="p-1.5 md:p-2 -ml-1 md:-ml-2 mr-2 md:mr-3 rounded-lg hover:bg-white/10 text-white focus:outline-none transition-colors"
               >
                 <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                 </svg>
               </button>
               
               <div className="flex flex-col justify-center">
                 {currentView === 'home' ? (
                   // Logo no Header (Igual Login)
                   <div className="flex items-center gap-2 -ml-1">
                      <span className="text-2xl md:text-3xl filter drop-shadow-md hover:scale-110 transition-transform cursor-default">♟️</span>
                      <span className="text-lg md:text-2xl font-black uppercase tracking-wider animate-gradient-text leading-tight drop-shadow-sm">
                        Clube do Xadrez
                      </span>
                   </div>
                 ) : (
                   // Header padrão para outras views
                   <>
                     <h1 className="text-[10px] md:text-xs font-black text-blue-300 uppercase tracking-widest hidden md:block drop-shadow-md">
                       CLUBE DO XADREZ
                     </h1>
                     <h2 className="text-base md:text-lg font-bold text-white leading-tight drop-shadow-md">
                       {getTitle()}
                     </h2>
                   </>
                 )}
               </div>
               
               <div className="ml-auto flex items-center gap-3">
                  <SyncStatusIndicator status={syncStatus} />
                  {/* Weather Widget (Replaces Profile Button) */}
                  <WeatherWidget />
               </div>
             </header>

             {/* Main Content Area (Naturally Scrollable) */}
             <main className="flex-1 p-3 md:p-6">
               <div className="max-w-7xl mx-auto pb-6">
                  {renderView()}
               </div>
             </main>
             
          </div>
      </div>

      {/* Global Footer (Always visible) */}
      <GlobalFooter />
    </div>
  );
};

export default App;