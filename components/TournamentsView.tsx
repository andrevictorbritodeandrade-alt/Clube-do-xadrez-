import React, { useState, useEffect, useRef } from 'react';
import { Player, Match, Group, TournamentState } from '../types';
import { subscribeToTournament, saveTournamentToFirestore } from '../services/firebaseService';

// --- LOGIC HELPERS ---

const generateUUID = () => Math.random().toString(36).substr(2, 9);

const shuffleArray = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// --- COMPONENT ---

export const TournamentsView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  
  // Setup Wizard State
  const [setupStep, setSetupStep] = useState<0 | 1 | 2>(0); // 0: Count, 1: Mode, 2: Names
  const [playerCount, setPlayerCount] = useState(4);
  const [selectedNumGroups, setSelectedNumGroups] = useState(1);
  const [playerInputs, setPlayerInputs] = useState<{name: string, class: string}[]>([]);

  // Tournament Data
  const [tData, setTData] = useState<TournamentState>({
    stage: 'setup',
    players: [],
    groups: [],
    matches: [],
    finalMatches: [],
    finalPlayers: []
  });

  const isRemoteUpdate = useRef(false);

  // --- SYNC ---
  useEffect(() => {
    const unsub = subscribeToTournament((data) => {
      if (data) {
        isRemoteUpdate.current = true;
        setTData(data);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }
    // Simple debounce to save state
    const timer = setTimeout(() => {
      saveTournamentToFirestore(tData);
    }, 500);
    return () => clearTimeout(timer);
  }, [tData]);

  // --- ACTIONS ---

  const triggerFullScreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch((err) => {
        console.warn("Error attempting to enable full-screen mode:", err);
      });
    }
  };

  const exitFullScreen = () => {
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch((err) => console.warn(err));
    }
  };

  const handleCountConfirm = () => {
    if (playerCount < 3) {
      alert("Mínimo de 3 jogadores.");
      return;
    }
    // Inicializa os inputs vazios
    setPlayerInputs(Array.from({ length: playerCount }, () => ({ name: '', class: '' })));
    setSetupStep(1);
  };

  const handleModeConfirm = (groups: number) => {
    setSelectedNumGroups(groups);
    setSetupStep(2);
  };

  const updatePlayerInput = (index: number, field: 'name' | 'class', value: string) => {
    const newInputs = [...playerInputs];
    newInputs[index] = { ...newInputs[index], [field]: value };
    setPlayerInputs(newInputs);
  };

  const startTournament = () => {
    // Validar nomes
    const validInputs = playerInputs.filter(p => p.name.trim() !== '');
    if (validInputs.length !== playerCount) {
      alert("Por favor, preencha o nome de todos os jogadores.");
      return;
    }

    // Criar objetos de jogadores
    const players: Player[] = validInputs.map(p => ({
      id: generateUUID(),
      name: p.name.trim(),
      class: p.class.trim() || 'Geral',
      points: 0, wins: 0, draws: 0, losses: 0, gamesPlayed: 0
    }));

    // Embaralhar para sorteio justo
    const shuffledPlayers = shuffleArray([...players]);

    // Criar Grupos
    const groups: Group[] = Array.from({ length: selectedNumGroups }, (_, i) => ({
      id: i,
      name: selectedNumGroups === 1 ? 'Grupo Único' : `Grupo ${String.fromCharCode(65 + i)}`,
      players: []
    }));

    // Distribuir jogadores (Lógica A, B, C, A, B, C...)
    shuffledPlayers.forEach((p, idx) => {
      const groupIdx = idx % selectedNumGroups;
      groups[groupIdx].players.push(p.id);
    });

    // Gerar Confrontos (Round Robin dentro de cada grupo)
    const matches: Match[] = [];
    groups.forEach(group => {
      const pIds = group.players;
      for (let i = 0; i < pIds.length; i++) {
        for (let j = i + 1; j < pIds.length; j++) {
          matches.push({
            id: generateUUID(),
            p1Id: pIds[i],
            p2Id: pIds[j],
            result: null,
            groupIndex: group.id
          });
        }
      }
    });

    setTData({
      stage: 'groups',
      players: shuffledPlayers, 
      groups,
      matches,
      finalMatches: [],
      finalPlayers: []
    });
  };

  // --- GAMEPLAY ACTIONS ---

  const updateMatchResult = (matchId: string, result: '1-0' | '0-1' | '0.5-0.5', isFinal: boolean = false) => {
    const matchType = isFinal ? 'finalMatches' : 'matches';
    
    setTData(prev => {
      const newMatches = prev[matchType].map(m => 
        m.id === matchId ? { ...m, result } : m
      );
      
      // Reset stats
      const newPlayers = prev.players.map(p => ({...p, points: 0, wins: 0, losses: 0, draws: 0, gamesPlayed: 0}));
      
      const allMatches = [...newMatches, ...(isFinal ? prev.matches : prev.finalMatches)];

      allMatches.forEach(m => {
        if (!m.result) return;
        
        const p1 = newPlayers.find(p => p.id === m.p1Id);
        const p2 = newPlayers.find(p => p.id === m.p2Id);
        if (!p1 || !p2) return;

        p1.gamesPlayed++;
        p2.gamesPlayed++;

        if (m.result === '1-0') {
          p1.wins++; p1.points += 1;
          p2.losses++;
        } else if (m.result === '0-1') {
          p2.wins++; p2.points += 1;
          p1.losses++;
        } else {
          p1.draws++; p1.points += 0.5;
          p2.draws++; p2.points += 0.5;
        }
      });

      return {
        ...prev,
        [matchType]: newMatches,
        players: newPlayers
      };
    });
  };

  // Helper para obter ranking de um grupo específico
  const getGroupStandings = (groupId: number, playerIds: string[]) => {
    const groupMatches = tData.matches.filter(m => m.groupIndex === groupId);
    const statsMap: Record<string, {points: number, wins: number, losses: number}> = {};
    playerIds.forEach(id => statsMap[id] = { points: 0, wins: 0, losses: 0 });

    groupMatches.forEach(m => {
      if (!m.result) return;
      if (m.result === '1-0') {
         if(statsMap[m.p1Id]) { statsMap[m.p1Id].points += 1; statsMap[m.p1Id].wins++; }
         if(statsMap[m.p2Id]) { statsMap[m.p2Id].losses++; }
      } else if (m.result === '0-1') {
         if(statsMap[m.p2Id]) { statsMap[m.p2Id].points += 1; statsMap[m.p2Id].wins++; }
         if(statsMap[m.p1Id]) { statsMap[m.p1Id].losses++; }
      } else {
         if(statsMap[m.p1Id]) { statsMap[m.p1Id].points += 0.5; }
         if(statsMap[m.p2Id]) { statsMap[m.p2Id].points += 0.5; }
      }
    });

    return playerIds.map(id => {
      const p = tData.players.find(pl => pl.id === id)!;
      return { ...p, ...statsMap[id] };
    }).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.wins !== a.wins) return b.wins - a.wins;
      return 0;
    });
  };

  // Helper para obter ranking da final
  const getSortedPlayers = (playerIds: string[]) => {
    const matchesToCheck = tData.finalMatches;
    const statsMap: Record<string, {points: number, wins: number, losses: number}> = {};
    playerIds.forEach(id => statsMap[id] = { points: 0, wins: 0, losses: 0 });

    matchesToCheck.forEach(m => {
      if (!m.result) return;
      if (m.result === '1-0') {
         if(statsMap[m.p1Id]) { statsMap[m.p1Id].points += 1; statsMap[m.p1Id].wins++; }
         if(statsMap[m.p2Id]) { statsMap[m.p2Id].losses++; }
      } else if (m.result === '0-1') {
         if(statsMap[m.p2Id]) { statsMap[m.p2Id].points += 1; statsMap[m.p2Id].wins++; }
         if(statsMap[m.p1Id]) { statsMap[m.p1Id].losses++; }
      } else {
         if(statsMap[m.p1Id]) { statsMap[m.p1Id].points += 0.5; }
         if(statsMap[m.p2Id]) { statsMap[m.p2Id].points += 0.5; }
      }
    });

    return playerIds.map(id => {
      const p = tData.players.find(pl => pl.id === id)!;
      return { ...p, ...statsMap[id] };
    }).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.wins !== a.wins) return b.wins - a.wins;
      return 0;
    });
  };

  const advanceToFinals = () => {
    const finalists: string[] = [];
    tData.groups.forEach(g => {
      const sorted = getGroupStandings(g.id, g.players);
      if (sorted.length > 0) finalists.push(sorted[0].id);
    });

    if (tData.groups.length === 1) {
       triggerFullScreen();
       setTData(prev => ({ ...prev, stage: 'finished', finalPlayers: finalists }));
       return;
    }

    const finalMatches: Match[] = [];
    for (let i = 0; i < finalists.length; i++) {
        for (let j = i + 1; j < finalists.length; j++) {
          finalMatches.push({
            id: generateUUID(),
            p1Id: finalists[i],
            p2Id: finalists[j],
            result: null,
            groupIndex: -1
          });
        }
    }

    setTData(prev => ({
      ...prev,
      stage: 'finals',
      finalPlayers: finalists,
      finalMatches
    }));
  };

  const finishTournament = () => {
    triggerFullScreen();
    setTData(prev => ({ ...prev, stage: 'finished' }));
  };

  // --- RENDERERS ---

  const renderMatchCard = (m: Match, isFinal: boolean) => {
    const p1 = tData.players.find(p => p.id === m.p1Id);
    const p2 = tData.players.find(p => p.id === m.p2Id);
    if (!p1 || !p2) return null;

    return (
      <div key={m.id} className="flex flex-col md:flex-row items-center bg-white p-3 rounded-lg shadow-sm border border-slate-200 gap-2 mb-2">
         <div className="flex-1 text-center md:text-right font-bold text-slate-800 truncate w-full">{p1.name}</div>
         
         <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => updateMatchResult(m.id, '1-0', isFinal)} className={`px-3 py-1 text-xs font-bold rounded ${m.result === '1-0' ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-400 hover:bg-green-100'}`}>V</button>
            <button onClick={() => updateMatchResult(m.id, '0.5-0.5', isFinal)} className={`px-3 py-1 text-xs font-bold rounded ${m.result === '0.5-0.5' ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-400 hover:bg-orange-100'}`}>E</button>
            <button onClick={() => updateMatchResult(m.id, '0-1', isFinal)} className={`px-3 py-1 text-xs font-bold rounded ${m.result === '0-1' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-400 hover:bg-red-100'}`}>D</button>
         </div>

         <div className="flex-1 text-center md:text-left font-bold text-slate-800 truncate w-full">{p2.name}</div>
      </div>
    );
  };

  const renderStandingsTable = (players: Player[]) => {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50">
            <tr>
              <th className="px-2 py-2">#</th>
              <th className="px-2 py-2">Nome</th>
              <th className="px-2 py-2 text-center">Pts</th>
              <th className="px-2 py-2 text-center">V</th>
              <th className="px-2 py-2 text-center">D</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p, i) => (
              <tr key={p.id} className={`border-b ${i < 1 ? 'bg-yellow-50' : 'bg-white'}`}>
                <td className="px-2 py-2 font-bold">{i+1}º</td>
                <td className="px-2 py-2 font-medium truncate max-w-[100px]">{p.name}</td>
                <td className="px-2 py-2 text-center font-black text-blue-600">{p.points}</td>
                <td className="px-2 py-2 text-center text-green-600">{p.wins}</td>
                <td className="px-2 py-2 text-center text-red-400">{p.losses}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // --- VIEW: SETUP WIZARD ---

  if (tData.stage === 'setup') {
    return (
      <div className="animate-fade-in max-w-4xl mx-auto space-y-6">
        <button 
          onClick={onBack} 
          className="mb-4 px-5 py-2.5 bg-slate-900/80 backdrop-blur-md rounded-full text-white font-bold transition-all shadow-lg hover:bg-slate-800 flex items-center w-fit active:scale-95 border border-white/10"
        >
          <span className="mr-2">⬅</span> Voltar ao Menu
        </button>
        
        <div className="glass-panel p-8 rounded-xl min-h-[500px] flex flex-col">
           <div className="text-center mb-8">
             <div className="text-6xl mb-2">🏆</div>
             <h2 className="text-3xl font-black text-slate-800 uppercase">Configurar Torneio</h2>
             
             {/* Stepper */}
             <div className="flex justify-center items-center mt-4 space-x-4">
               <div className={`h-2 w-10 rounded-full ${setupStep >= 0 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
               <div className={`h-2 w-10 rounded-full ${setupStep >= 1 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
               <div className={`h-2 w-10 rounded-full ${setupStep >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
             </div>
           </div>

           <div className="flex-1 flex flex-col justify-center items-center">
             
             {/* STEP 1: PLAYER COUNT */}
             {setupStep === 0 && (
               <div className="w-full max-w-md text-center animate-fade-in">
                 <h3 className="text-xl font-bold text-slate-700 mb-6">Quantos jogadores participarão?</h3>
                 
                 <div className="flex items-center justify-center space-x-6 mb-8">
                    <button 
                      onClick={() => setPlayerCount(Math.max(3, playerCount - 1))}
                      className="w-16 h-16 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-3xl font-bold transition"
                    >-</button>
                    <span className="text-6xl font-black text-blue-600 w-32">{playerCount}</span>
                    <button 
                      onClick={() => setPlayerCount(Math.min(64, playerCount + 1))}
                      className="w-16 h-16 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-3xl font-bold transition"
                    >+</button>
                 </div>

                 <button 
                   onClick={handleCountConfirm}
                   className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg"
                 >
                   Continuar ➜
                 </button>
               </div>
             )}

             {/* STEP 2: MODE SELECTION */}
             {setupStep === 1 && (
               <div className="w-full max-w-2xl text-center animate-fade-in">
                 <h3 className="text-xl font-bold text-slate-700 mb-6">Como será o formato?</h3>
                 <p className="text-slate-500 mb-8">Para {playerCount} jogadores, sugerimos:</p>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Always allow Single Group */}
                    <button 
                      onClick={() => handleModeConfirm(1)}
                      className="p-6 border-2 border-blue-100 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition text-left group"
                    >
                      <h4 className="font-bold text-slate-800 group-hover:text-blue-700">Grupo Único</h4>
                      <p className="text-sm text-slate-500 mt-1">Todos contra todos. {playerCount} jogadores em 1 tabela.</p>
                      {playerCount > 8 && <span className="inline-block mt-2 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">Muitos jogos!</span>}
                    </button>

                    {/* 2 Groups (Min 5 players) */}
                    {playerCount >= 5 && (
                      <button 
                        onClick={() => handleModeConfirm(2)}
                        className="p-6 border-2 border-purple-100 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition text-left group"
                      >
                         <h4 className="font-bold text-slate-800 group-hover:text-purple-700">2 Grupos + Final</h4>
                         <p className="text-sm text-slate-500 mt-1">
                           Fase de grupos (A e B). O campeão de cada grupo faz a final.
                         </p>
                      </button>
                    )}

                    {/* 3 Groups (Min 9 players) */}
                    {playerCount >= 9 && (
                       <button 
                       onClick={() => handleModeConfirm(3)}
                       className="p-6 border-2 border-green-100 rounded-xl hover:border-green-500 hover:bg-green-50 transition text-left group"
                     >
                        <h4 className="font-bold text-slate-800 group-hover:text-green-700">3 Grupos + Final</h4>
                        <p className="text-sm text-slate-500 mt-1">
                          Grupos A, B e C. Triangular final entre os campeões.
                        </p>
                     </button>
                    )}
                    
                     {/* 4 Groups (Min 12 players) */}
                     {playerCount >= 12 && (
                       <button 
                       onClick={() => handleModeConfirm(4)}
                       className="p-6 border-2 border-indigo-100 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition text-left group"
                     >
                        <h4 className="font-bold text-slate-800 group-hover:text-indigo-700">4 Grupos + Final</h4>
                        <p className="text-sm text-slate-500 mt-1">
                          4 Grupos. Campeões avançam.
                        </p>
                     </button>
                    )}
                 </div>

                 <button onClick={() => setSetupStep(0)} className="mt-8 text-slate-400 hover:text-slate-600 underline text-sm">Voltar</button>
               </div>
             )}

             {/* STEP 3: NAMES INPUT */}
             {setupStep === 2 && (
               <div className="w-full animate-fade-in flex flex-col h-full">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-slate-700">Inscrição dos Jogadores</h3>
                    <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold">{selectedNumGroups} Grupos</span>
                  </div>
                  
                  <div className="overflow-y-auto max-h-[300px] pr-2 custom-scrollbar space-y-3 mb-6 flex-1">
                    {playerInputs.map((input, i) => (
                      <div key={i} className="flex gap-2">
                         <div className="w-10 h-12 flex items-center justify-center bg-slate-100 rounded font-bold text-slate-500 shrink-0">
                           {i + 1}
                         </div>
                         <input 
                           className="flex-1 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900 placeholder-slate-400 font-medium"
                           placeholder={`Nome do Jogador ${i+1}`}
                           value={input.name}
                           onChange={(e) => updatePlayerInput(i, 'name', e.target.value)}
                         />
                         <input 
                           className="w-24 md:w-32 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900 placeholder-slate-400 font-medium"
                           placeholder="Turma"
                           value={input.class}
                           onChange={(e) => updatePlayerInput(i, 'class', e.target.value)}
                         />
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-4">
                    <button onClick={() => setSetupStep(1)} className="px-6 py-4 border border-slate-300 rounded-xl font-bold text-slate-600 hover:bg-slate-50">
                      Voltar
                    </button>
                    <button 
                      onClick={startTournament}
                      className="flex-1 py-4 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 transition shadow-lg"
                    >
                      Iniciar Torneio 🏁
                    </button>
                  </div>
               </div>
             )}

           </div>
        </div>
      </div>
    );
  }

  // --- VIEW: GROUPS STAGE ---
  if (tData.stage === 'groups') {
    return (
      <div className="animate-fade-in space-y-6 pb-20">
        <div className="flex justify-between items-center bg-black/40 backdrop-blur p-4 rounded-xl shadow-lg border border-white/10">
           <h2 className="text-xl md:text-2xl font-black text-white uppercase shadow-black drop-shadow-md">Fase de Grupos</h2>
           <button onClick={() => { if(confirm('Cancelar torneio?')) { setTData({...tData, stage:'setup'}); setSetupStep(0); } }} className="text-xs text-white/60 hover:text-white underline">Cancelar</button>
        </div>

        <div className={`grid grid-cols-1 ${tData.groups.length > 1 ? 'md:grid-cols-2' : ''} gap-6`}>
          {tData.groups.map(group => {
            const groupPlayers = getGroupStandings(group.id, group.players);
            return (
              <div key={group.id} className="glass-panel p-4 md:p-6 rounded-xl relative border-t-4 border-blue-500">
                <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                  {group.name}
                </div>
                
                <div className="mb-6">
                  <h3 className="font-bold text-slate-700 mb-3 uppercase tracking-wide">Classificação</h3>
                  {renderStandingsTable(groupPlayers)}
                </div>

                <div>
                  <h3 className="font-bold text-slate-700 mb-3 uppercase tracking-wide">Partidas</h3>
                  <div className="space-y-2 max-h-[250px] overflow-y-auto custom-scrollbar">
                     {tData.matches.filter(m => m.groupIndex === group.id).map(m => renderMatchCard(m, false))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {tData.groups.length > 1 && (
          <div className="fixed bottom-28 left-0 right-0 flex justify-center z-50 px-4 pointer-events-none">
             <button 
               onClick={advanceToFinals}
               className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-4 rounded-full font-black text-lg shadow-2xl border-4 border-white/20 hover:scale-105 transition transform flex items-center gap-2 pointer-events-auto"
             >
               <span>Ir para Finais</span>
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7-7 7m7-7H3" /></svg>
             </button>
          </div>
        )}
         
        {tData.groups.length === 1 && (
           <div className="fixed bottom-28 left-0 right-0 flex justify-center z-50 px-4 pointer-events-none">
            <button 
              onClick={() => {
                const winner = getGroupStandings(0, tData.groups[0].players)[0];
                triggerFullScreen();
                setTData(prev => ({ ...prev, stage: 'finished', finalPlayers: [winner.id] }));
              }}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-full font-black text-lg shadow-2xl border-4 border-white/20 hover:scale-105 transition transform pointer-events-auto"
            >
              Encerrar Torneio
            </button>
           </div>
        )}
      </div>
    );
  }

  // --- VIEW: FINALS ---
  if (tData.stage === 'finals') {
    return (
      <div className="animate-fade-in space-y-6 max-w-3xl mx-auto">
        <div className="text-center py-6">
          <h2 className="text-4xl font-black text-white uppercase drop-shadow-lg mb-2">Finais 🔥</h2>
          <p className="text-white/80 font-bold">O confronto dos campeões de grupo!</p>
        </div>

        <div className="glass-panel p-6 rounded-xl border-2 border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.3)]">
           <h3 className="font-bold text-slate-800 mb-4 text-center uppercase text-xl">Classificação Final</h3>
           {renderStandingsTable(getSortedPlayers(tData.finalPlayers))}
           
           <h3 className="font-bold text-slate-800 mt-8 mb-4 text-center uppercase text-xl">Jogos Decisivos</h3>
           <div className="space-y-3">
             {tData.finalMatches.map(m => renderMatchCard(m, true))}
           </div>
        </div>

        <div className="text-center mt-8 pb-20">
           <button 
             onClick={finishTournament}
             className="bg-yellow-400 text-yellow-900 px-10 py-4 rounded-xl font-black text-xl shadow-lg hover:bg-yellow-300 transition hover:-translate-y-1"
           >
             Encerrar e Ver Campeão
           </button>
        </div>
      </div>
    );
  }

  // --- VIEW: FINISHED (FULLSCREEN CELEBRATION) ---
  if (tData.stage === 'finished') {
    // Get Winner
    const sorted = tData.players
        .filter(p => tData.finalPlayers.includes(p.id) || (tData.groups.length === 1 && tData.groups[0].players.includes(p.id)))
        .sort((a,b) => b.points - a.points || b.wins - a.wins);

    const champion = sorted[0];
    
    return (
      <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col items-center justify-center text-center px-4 overflow-hidden">
         {/* Background effects */}
         <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-slate-900"></div>
         <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
         
         <div className="relative z-10 animate-scale-in flex flex-col items-center max-h-screen overflow-y-auto py-10 w-full custom-scrollbar">
             <div className="text-9xl mb-8 animate-bounce drop-shadow-[0_0_25px_rgba(255,215,0,0.5)]">🏆</div>
             
             <h2 className="text-3xl md:text-4xl font-bold text-yellow-400 uppercase tracking-[0.2em] mb-4 drop-shadow-md">
               Grande Campeão
             </h2>
             
             <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-300 px-4">
               {champion?.name}
             </h1>
             
             <div className="bg-white/10 backdrop-blur-md rounded-full px-8 py-3 text-white font-bold text-xl md:text-2xl border border-white/20 shadow-xl mb-12">
               {champion?.class} • {champion?.points} Pontos
             </div>

             <div className="glass-panel p-8 rounded-2xl w-full max-w-lg mx-auto bg-black/30 border-white/10 backdrop-blur-xl mb-12">
                <h3 className="font-bold text-white/80 mb-6 border-b border-white/10 pb-4 text-xl">Podium Final</h3>
                {sorted.slice(0, 3).map((p, i) => (
                  <div key={p.id} className="flex justify-between items-center py-4 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-4">
                      <span className={`w-10 h-10 flex items-center justify-center rounded-full font-bold text-white text-lg shadow-lg ${i===0?'bg-yellow-500':i===1?'bg-slate-400':'bg-orange-600'}`}>
                        {i+1}
                      </span>
                      <span className="font-bold text-white text-lg truncate max-w-[150px] md:max-w-[200px]">{p.name}</span>
                    </div>
                    <span className="font-mono font-bold text-blue-300 text-lg">{p.points} pts</span>
                  </div>
                ))}
             </div>

             <button 
               onClick={() => { 
                 exitFullScreen();
                 setTData({...tData, stage: 'setup', players: [], groups: [], matches: [], finalMatches: []}); 
                 setSetupStep(0); 
               }}
               className="px-8 py-4 bg-white text-slate-900 rounded-full font-black text-lg hover:bg-blue-50 transition transform hover:scale-105 shadow-2xl"
             >
               Criar Novo Torneio
             </button>
         </div>
      </div>
    );
  }

  return null;
};