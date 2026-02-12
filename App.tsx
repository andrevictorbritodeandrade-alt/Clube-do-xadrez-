import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import { Login } from './components/Login';
import { ChessGame } from './components/ChessGame';
import { Profile } from './components/Profile';
import { BackgroundSlider } from './components/BackgroundSlider';
import { DashboardView } from './components/DashboardView';
import { StatisticsView } from './components/StatisticsView';
import { ClassesView } from './components/ClassesView';
import { TournamentsView } from './components/TournamentsView';
import { EmentaView } from './components/EmentaView';
import { ExercisesView } from './components/ExercisesView';
import { ActivityPrintModal } from './components/ActivityPrintModal';
import { WeatherWidget } from './components/WeatherWidget'; // Import Widget
import { ViewState, ClassDataMap, ActivityLogData, ClassData } from './types';
import { initialActivityLogData, mockUserProfile, initialClassData } from './constants';
import { initFirebase, subscribeToClasses, saveClassesToFirestore } from './services/firebaseService';

// --- Global Footer Component ---
const GlobalFooter = () => (
  <footer className="w-full py-4 md:py-6 text-center relative z-50 shrink-0">
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
}

const ActivityLogView: React.FC<ActivityLogViewProps> = ({ data, setData, onBack, availableClasses }) => {
  const { header, log } = data;
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  
  // Form State
  const [formDate, setFormDate] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formClasses, setFormClasses] = useState<string[]>([]);

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
        return { ...prev, log: newLog };
      });
    } else {
      // Create Mode
      setData(prev => ({
        ...prev,
        log: [...prev.log, { date: formDate, classes: formClasses, activities: activityLines }]
      }));
    }
    
    setIsEditing(false);
    setEditingIndex(null);
  };

  const handleDelete = (index: number) => {
    if(window.confirm('Tem certeza que deseja apagar este registro?')) {
      setData(prev => ({
        ...prev,
        log: prev.log.filter((_, i) => i !== index)
      }));
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
        className="mb-4 flex items-center text-slate-600 hover:text-blue-600 font-bold transition"
      >
        <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Voltar ao Menu
      </button>

      {/* Official Header */}
      <div className="text-center border-b-4 border-slate-900 pb-4 mb-6">
        <h1 className="font-black text-sm md:text-xl uppercase tracking-wide leading-tight">{header.government}</h1>
        <h2 className="font-bold text-xs md:text-lg text-slate-700 leading-tight">{header.city}</h2>
        <h3 className="font-bold text-[10px] md:text-sm text-slate-600 mt-1">{header.department}</h3>
        <p className="mt-2 text-xs md:text-sm font-medium uppercase">{header.school}</p>
        <div className="mt-4 flex flex-col md:flex-row justify-between text-xs md:text-sm font-bold border-t-2 border-slate-900 pt-2 gap-1">
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

// --- Main App Component ---

const App: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setView] = useState<ViewState>('home');
  
  // Shared State
  const [classData, setClassData] = useState<ClassDataMap>(initialClassData);
  const [activityLogData, setActivityLogData] = useState<ActivityLogData>(initialActivityLogData);

  // State for Navigation within Classes
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  // Persistence Refs
  const isRemoteUpdate = useRef(false);
  const hasLoaded = useRef(false);

  useEffect(() => {
    // Inicializa Firebase ao carregar o app
    const success = initFirebase();
    if(success) {
      // Subscribe to classes
      const unsub = subscribeToClasses((firebaseClasses) => {
        // Only update if we have data, otherwise keep initial/mock data for first seed
        if (Object.keys(firebaseClasses).length > 0) {
          isRemoteUpdate.current = true;
          setClassData(firebaseClasses);
        } else if (!hasLoaded.current) {
          // If cloud is empty and we haven't loaded yet, we are in initial state.
          // We can optionally save the mock data to cloud now?
          // Let's save the initial mock data to the cloud so it's not empty next time
          saveClassesToFirestore(initialClassData);
        }
        hasLoaded.current = true;
      });
      return () => unsub();
    }
  }, []);

  // Sync back to Firebase when local state changes (and it wasn't a remote update)
  useEffect(() => {
    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }
    
    // Check if we have data to save
    if (hasLoaded.current && Object.keys(classData).length > 0) {
       // Debounce or just save. For this app scale, direct save is fine.
       // Ideally we use a debounce here.
       const timer = setTimeout(() => {
         saveClassesToFirestore(classData);
       }, 500);
       return () => clearTimeout(timer);
    }
  }, [classData]);

  // Hardware Back Button Handling
  useEffect(() => {
    // Only handle popstate if logged in
    if (!isLoggedIn) return;

    const handlePopState = (event: PopStateEvent) => {
      // Prevent default back behavior if we can handle it internally
      if (selectedClassId) {
        event.preventDefault();
        setSelectedClassId(null);
      } else if (selectedGrade) {
        event.preventDefault();
        setSelectedGrade(null);
      } else if (currentView !== 'home') {
        event.preventDefault();
        setView('home');
      }
      // If at home, we let the browser go back (e.g. to previous website)
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isLoggedIn, currentView, selectedGrade, selectedClassId]);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setSidebarOpen(false); // Reset sidebar state
    setView('home');
    // Add a history entry so Back button works to "logout" or stay in app
    window.history.pushState({ app: 'home' }, '', window.location.pathname);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setSidebarOpen(false); // Reset sidebar state
    setView('home'); // Reset view for next login
    resetClassesNav();
  };
  
  const goBack = () => {
    if (selectedClassId) {
        setSelectedClassId(null);
    } else if (selectedGrade) {
        setSelectedGrade(null);
    } else {
        setView('home');
    }
  };

  const resetClassesNav = () => {
    setSelectedGrade(null);
    setSelectedClassId(null);
  };

  const renderView = () => {
    switch(currentView) {
      case 'home': return <DashboardView setView={(v) => { resetClassesNav(); setView(v); }} />;
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
        />
      );
      case 'activities': return (
        <ActivityLogView 
          data={activityLogData} 
          setData={setActivityLogData} 
          onBack={goBack}
          availableClasses={Object.values(classData).map((c: ClassData) => ({ id: c.id, name: c.name }))} 
        />
      );
      case 'tournaments': return <TournamentsView onBack={goBack} />;
      case 'play': return <ChessGame onBack={goBack} />;
      case 'ementa': return <EmentaView onBack={goBack} />;
      case 'exercises': return <ExercisesView onBack={goBack} />;
      case 'profile': return <Profile user={mockUserProfile} onBack={goBack} />;
      default: return <DashboardView setView={setView} />;
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
      case 'profile': return 'Perfil';
      default: return 'Painel';
    }
  };

  return (
    <div className="flex flex-col min-h-screen relative font-sans overflow-hidden">
      {/* Global Background */}
      <BackgroundSlider />
      
      {/* Wrapper for Content + Footer to ensure footer is always at bottom */}
      <div className="flex-1 flex flex-col z-10 h-full overflow-hidden">
        
        {!isLoggedIn ? (
          // Login View
          <Login onLogin={handleLogin} />
        ) : (
          // Logged In App Structure
          <div className="flex-1 flex flex-col min-h-0">
             
             {/* Sidebar */}
             <Sidebar 
               isOpen={isSidebarOpen} 
               onClose={() => setSidebarOpen(false)} 
               currentView={currentView}
               setView={(v) => { resetClassesNav(); setView(v); }}
               logout={handleLogout}
             />

             {/* Header */}
             <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 h-14 md:h-16 flex items-center px-4 sticky top-0 z-30 shadow-sm shrink-0 transition-all duration-300">
               <button 
                 onClick={() => setSidebarOpen(true)}
                 className="p-1.5 md:p-2 -ml-1 md:-ml-2 mr-2 md:mr-3 rounded-lg hover:bg-slate-100 text-slate-800 focus:outline-none transition-colors"
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
                      <span className="text-lg md:text-2xl font-black uppercase tracking-wider animate-gradient-text leading-tight">
                        Clube do Xadrez
                      </span>
                   </div>
                 ) : (
                   // Header padrão para outras views
                   <>
                     <h1 className="text-[10px] md:text-xs font-black text-blue-600 uppercase tracking-widest hidden md:block">
                       CLUBE DO XADREZ
                     </h1>
                     <h2 className="text-base md:text-lg font-bold text-slate-800 leading-tight">
                       {getTitle()}
                     </h2>
                   </>
                 )}
               </div>
               
               <div className="ml-auto flex items-center">
                  {/* Weather Widget (Replaces Profile Button) */}
                  <WeatherWidget />
               </div>
             </header>

             {/* Main Content Area (Scrollable) */}
             <main className="flex-1 p-3 md:p-6 overflow-y-auto custom-scrollbar">
               <div className="max-w-7xl mx-auto pb-6">
                  {renderView()}
               </div>
             </main>
          </div>
        )}
      </div>

      {/* Global Footer (Always visible) */}
      <GlobalFooter />
    </div>
  );
};

export default App;