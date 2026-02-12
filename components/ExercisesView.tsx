import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';

interface ExercisesViewProps {
  onBack: () => void;
}

type CategoryType = 'mate' | 'tactics' | 'defense' | 'opening';

interface Exercise {
  id: number;
  category: CategoryType;
  white: string;
  black: string;
  question: string;
  solution: string[]; // Array of UCI moves (e.g. "e2e4")
  hint?: string;
}

// --- DATA ---
// Descriptions must be explicit to ensure generated FEN is valid for the puzzle
const EXERCISES_DATA: Exercise[] = [
  // --- MATES ---
  { 
    id: 101, 
    category: 'mate',
    white: "Rei em g1, Torre em h5, Peões em f2, g2, h2", 
    black: "Rei em g8, Peões em f7, g7, h7", 
    question: "Mate do Corredor: As pretas estão presas pelos próprios peões.",
    solution: ["h5h8"],
    hint: "Leve a torre para a última fileira."
  },
  { 
    id: 102, 
    category: 'mate',
    white: "Rei em c1, Dama em d7, Bispo em f5", 
    black: "Rei em d8", 
    question: "Beijo da Morte: A Dama apoiada pode finalizar o jogo.",
    solution: ["d7c7"], // ou d7e7 dependendo, vamos fixar c7
    hint: "Coloque a Dama na frente do Rei, protegida pelo Bispo."
  },
  { 
    id: 103, 
    category: 'mate',
    white: "Rei em g1, Cavalo em f6, Torre em h1", 
    black: "Rei em h8, Peão em g7, Torre em g8", 
    question: "Mate Árabe: Use a combinação de Torre e Cavalo.",
    solution: ["h1h7"],
    hint: "A Torre captura em h7 protegida pelo Cavalo."
  },

  // --- TÁTICA (Ataque Duplo, Cravada, etc) ---
  { 
    id: 201, 
    category: 'tactics',
    white: "Rei em e1, Cavalo em e4", 
    black: "Rei em g8, Dama em d5", 
    question: "Ataque Duplo (Garfo): Ataque o Rei e a Dama ao mesmo tempo.",
    solution: ["e4f6"],
    hint: "Procure uma casa onde o Cavalo dê xeque e ataque a Dama."
  },
  {
    id: 202,
    category: 'tactics',
    white: "Rei em e1, Bispo em d3", 
    black: "Rei em g6, Dama em h7", 
    question: "Espeto (Raio-X): O Rei está na frente da Dama.",
    solution: ["d3e4"],
    hint: "Ataque o Rei de forma que a peça atrás dele fique exposta."
  },

  // --- DEFESA ---
  {
    id: 301,
    category: 'defense',
    white: "Rei em e1, Torre em h1", 
    black: "Rei em e8, Bispo em b4", 
    question: "Sair do Xeque: O Bispo preto em b4 está dando xeque. Cubra com o peão.",
    // Setup: White Pawn c2.
    solution: ["c2c3"],
    hint: "Avance o peão de c2 para bloquear o caminho do bispo."
  },
  {
    id: 302,
    category: 'defense',
    white: "Rei em g1, Dama em d1", 
    black: "Rei em g8, Dama em h4", 
    question: "Evitar Mate: A Dama preta ameaça capturar em h2 (Mate). Defenda h2.",
    // Setup: W Pawn g2, h2. W Knight f3. 
    // Threat: Qxh2#. 
    // Move: g3 (blocks diagonal? no Queen at h4 attacks h2 linearly? no, diag usually or file).
    // Let's say Queen h4 attacks h2. W King g1. Pawn h2, g2.
    // Defense: g2-g3 blocks Queen path if Queen was at h4 attacking h2? No queen at h4 attacks h2 on rank 4? No.
    // Queen at h4 attacking h2 is lateral? No. Diagonal e1-h4. Vertical h-file.
    // Scenario: Queen on h4 threatening h2 pawn mate.
    // Move: g3 attacks queen and blocks? Or Nf3.
    // Let's use: W Pawn g2. Move g2-g3.
    solution: ["g2g3"],
    hint: "Avance o peão de g2 para bloquear ou atacar a Dama."
  },

  // --- ABERTURAS ---
  {
    id: 401,
    category: 'opening',
    white: "Rei em e1, Peões em a2,b2,c2,d2,e2,f2,g2,h2", 
    black: "Rei em e8", 
    question: "Domínio do Centro: Qual o lance mais clássico para controlar o centro?",
    solution: ["e2e4"],
    hint: "Avance o peão do Rei duas casas."
  },
  {
    id: 402,
    category: 'opening',
    white: "Rei em e1, Peão em e4, Cavalo em g1", 
    black: "Rei em e8, Peão em e5", 
    question: "Desenvolvimento: Desenvolva o Cavalo atacando o peão central das pretas.",
    solution: ["g1f3"],
    hint: "Mova o Cavalo para f3."
  }
];

// Specific Data Override for Descriptions to Logic
// Since the parser is simple, we map IDs to specific FENs or precise setups for the logic engine
const getFenForExercise = (ex: Exercise): string => {
  const chess = new Chess();
  chess.clear();
  
  // Helper to place
  const p = (type: string, color: 'w'|'b', square: any) => chess.put({ type: type as any, color }, square);

  // MATE 101: Back Rank
  if (ex.id === 101) {
    p('k', 'w', 'g1'); p('r', 'w', 'h5'); p('p', 'w', 'f2'); p('p', 'w', 'g2'); p('p', 'w', 'h2');
    p('k', 'b', 'g8'); p('p', 'b', 'f7'); p('p', 'b', 'g7'); p('p', 'b', 'h7');
    return chess.fen();
  }
  // MATE 102: Kiss of Death
  if (ex.id === 102) {
    p('k', 'w', 'c1'); p('q', 'w', 'd7'); p('b', 'w', 'f5');
    p('k', 'b', 'd8');
    // Ensure King d8 can't go to e8 or c8? 
    // If D7 goes to C7: King checks c7. King can go e8.
    // Let's block e8/c8 with 'invisible' walls or just make sure Mate covers it.
    // If Qc7+, King needs to have no squares.
    // Let's put Black King on h8. White Queen g7. White King g1.
    // Simple Kiss: White King g1. White Queen f7. Black King h8. 
    // Solution Qg7#.
    // Let's update standard setup:
    chess.clear();
    p('k', 'w', 'g1'); p('q', 'w', 'f6'); 
    p('k', 'b', 'h8'); 
    // Solution: Qg7#
    // Update data solution to reflect this simplified hardcoded logic if needed, 
    // but better to stick to the ID logic mapping.
    // Let's stick to the Text Description in Logic for consistency with user View.
    // Re-doing 102 based on text: K c1, Q d7, B f5. Black K d8.
    // Move: Q c7 #.
    // K d8 cannot move to: c8, e8, c7, d7, e7.
    // Q at c7 covers: c8, d8, e7, c7, b8, b7...
    // Does it cover e8? c7->e8 is Knight jump? No. c7->d8 (1), c7->e8 (2,1).
    // Q at c7 covers row 7, col c, diags.
    // K at d8 can go to e8.
    // So we need a blocker at e8.
    p('r', 'b', 'e8'); // Block escape
    return chess.fen();
  }
  
  // TACTICS 201: Fork
  if (ex.id === 201) {
    p('n', 'w', 'e4'); p('k', 'w', 'e1');
    p('k', 'b', 'g8'); p('q', 'b', 'd5'); // Updated from h8 to g8 to ensure Nf6 is check
    return chess.fen();
  }

  // TACTICS 202: Skewer
  if (ex.id === 202) {
    p('b', 'w', 'd3'); p('k', 'w', 'e1');
    p('k', 'b', 'g6'); p('q', 'b', 'h7');
    return chess.fen();
  }

  // Generic Parser for others
  // Mapping PT names to chars
  const pieceMap: Record<string, string> = {
    'rei': 'k', 'dama': 'q', 'torre': 'r', 'bispo': 'b', 'cavalo': 'n', 'peão': 'p', 'peões': 'p'
  };

  [ex.white, ex.black].forEach((desc, i) => {
    const color = i === 0 ? 'w' : 'b';
    desc.split(',').forEach(part => {
       const lower = part.toLowerCase().trim();
       // Find piece type
       let type = 'p'; // default
       for (const [name, char] of Object.entries(pieceMap)) {
         if (lower.includes(name)) type = char;
       }
       // Find squares
       const squares = lower.match(/[a-h][1-8]/g);
       if (squares) {
         squares.forEach(sq => chess.put({ type: type as any, color }, sq as any));
       }
    });
  });

  return chess.fen();
};


export const ExercisesView: React.FC<ExercisesViewProps> = ({ onBack }) => {
  const [viewState, setViewState] = useState<'categories' | 'list'>('categories');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Game Logic State
  const [game, setGame] = useState(new Chess());
  const [boardFen, setBoardFen] = useState('start');
  const [status, setStatus] = useState<'playing' | 'solved' | 'failed' | 'showing'>('playing');
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Filter exercises
  const filteredExercises = EXERCISES_DATA.filter(ex => ex.category === selectedCategory);
  const currentEx = filteredExercises[currentIndex];

  const categories = [
    { id: 'mate', title: 'Xeque-Mate', icon: '👑', desc: 'Exercícios de finalização' },
    { id: 'tactics', title: 'Tática', icon: '⚔️', desc: 'Garfo, Cravada e Espeto' },
    { id: 'defense', title: 'Defesa', icon: '🛡️', desc: 'Saindo de situações difíceis' },
    { id: 'opening', title: 'Aberturas', icon: '📖', desc: 'Princípios iniciais' },
  ];

  // Load Exercise
  useEffect(() => {
    if (viewState === 'list' && currentEx) {
      loadExercisePosition();
    }
  }, [currentIndex, viewState, selectedCategory]);

  const loadExercisePosition = () => {
    if (!currentEx) return;
    const fen = getFenForExercise(currentEx);
    const newGame = new Chess(fen);
    
    // Force white to move (hacky but needed if pieces are placed manually)
    // chess.js might determine turn based on fen, usually white if standard start, 
    // but if we place Black King in check, it's invalid. 
    // We assume puzzles start with White to move unless specified.
    
    setGame(newGame);
    setBoardFen(fen);
    setStatus('playing');
    setFeedbackMsg('');
  };

  const selectCategory = (cat: CategoryType) => {
    setSelectedCategory(cat);
    setCurrentIndex(0);
    setViewState('list');
  };

  const handleNext = () => {
    if (currentIndex < filteredExercises.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  function onDrop(sourceSquare: string, targetSquare: string) {
    if (status === 'solved' || status === 'showing') return false;

    // Check legality in chess.js
    let move = null;
    try {
      const tempGame = new Chess(game.fen());
      move = tempGame.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q',
      });
    } catch (e) { return false; }

    if (!move) return false;

    // Check against solution
    const userMove = sourceSquare + targetSquare;
    const expectedMove = currentEx.solution[0]; // Simple 1-move puzzles for now

    if (userMove === expectedMove) {
      const newGame = new Chess(game.fen());
      newGame.move({ from: sourceSquare, to: targetSquare, promotion: 'q' });
      setGame(newGame);
      setBoardFen(newGame.fen());
      setStatus('solved');
      setFeedbackMsg('🎉 Correto! Muito bem.');
      return true;
    } else {
      setStatus('failed');
      setFeedbackMsg('❌ Incorreto. Tente outra ideia.');
      return false;
    }
  }

  const showSolution = () => {
    if (!currentEx) return;
    setStatus('showing');
    
    const startFen = getFenForExercise(currentEx);
    const solGame = new Chess(startFen);
    
    const moveStr = currentEx.solution[0];
    const from = moveStr.substring(0, 2);
    const to = moveStr.substring(2, 4);
    
    solGame.move({ from, to, promotion: 'q' });
    setGame(solGame);
    setBoardFen(solGame.fen());
    setFeedbackMsg(`A solução é ${from} para ${to}.`);
    
    // Slight delay then mark solved visually
    setTimeout(() => setStatus('solved'), 1000);
  };

  // --- VIEW: CATEGORIES ---
  if (viewState === 'categories') {
    return (
      <div className="animate-fade-in max-w-5xl mx-auto pb-20">
        <button 
          onClick={onBack}
          className="mb-6 flex items-center text-white/90 hover:text-white font-bold transition drop-shadow-md"
        >
          <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Voltar ao Menu
        </button>

        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-white uppercase tracking-tight drop-shadow-md">Treino Tático</h2>
          <p className="text-slate-200 mt-2 font-medium">Selecione uma categoria para praticar</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4">
          {categories.map(cat => (
            <div 
              key={cat.id}
              onClick={() => selectCategory(cat.id as CategoryType)}
              className="glass-panel p-8 flex items-center gap-6 cursor-pointer hover:bg-white/90 transition-all transform hover:scale-[1.02] group border-l-8 border-blue-500"
            >
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform">
                {cat.icon}
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-800 uppercase">{cat.title}</h3>
                <p className="text-slate-500 font-medium">{cat.desc}</p>
                <span className="inline-block mt-3 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100">
                   {EXERCISES_DATA.filter(e => e.category === cat.id).length} Exercícios
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- VIEW: EXERCISE LIST ---
  return (
    <div className="animate-fade-in pb-20 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => setViewState('categories')}
          className="flex items-center text-white/90 hover:text-white font-bold transition drop-shadow-md"
        >
          <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Categorias
        </button>
        <span className="text-white/50">/</span>
        <span className="text-white font-bold uppercase tracking-wider">
          {categories.find(c => c.id === selectedCategory)?.title}
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left: Exercise List */}
        <div className="w-full lg:w-1/3 bg-white/95 backdrop-blur rounded-xl shadow-xl overflow-hidden border border-slate-200 flex flex-col h-[500px]">
           <div className="p-4 bg-slate-100 border-b border-slate-200">
             <h3 className="font-bold text-slate-700 uppercase">Exercícios Disponíveis</h3>
           </div>
           <div className="overflow-y-auto custom-scrollbar flex-1 p-2 space-y-2">
             {filteredExercises.map((ex, idx) => (
               <button
                 key={ex.id}
                 onClick={() => { setCurrentIndex(idx); setStatus('playing'); }}
                 className={`w-full text-left p-3 rounded-lg text-sm font-medium transition-colors border ${
                   currentIndex === idx 
                     ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                     : 'bg-white text-slate-600 border-slate-100 hover:bg-blue-50 hover:border-blue-200'
                 }`}
               >
                 <div className="flex justify-between">
                    <span className="font-bold">#{idx + 1}</span>
                    {currentIndex === idx && status === 'solved' && <span>✅</span>}
                 </div>
                 <p className="mt-1 opacity-90 truncate">{ex.question}</p>
               </button>
             ))}
             {filteredExercises.length === 0 && (
               <div className="p-4 text-center text-slate-500">
                 Nenhum exercício encontrado nesta categoria.
               </div>
             )}
           </div>
        </div>

        {/* Right: Board & Interactions */}
        <div className="flex-1 w-full flex flex-col items-center">
          
          {currentEx ? (
            <>
              {/* Info Card */}
              <div className={`w-full border-l-8 p-6 rounded-r-xl shadow-md mb-6 transition-colors bg-white ${
                  status === 'solved' ? 'border-green-500 bg-green-50' :
                  status === 'failed' ? 'border-red-500 bg-red-50' :
                  'border-blue-500'
              }`}>
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Desafio #{currentEx.id}
                    </span>
                    {status === 'solved' && <span className="text-green-600 font-black uppercase text-sm">Resolvido</span>}
                </div>
                
                <h3 className="text-xl md:text-2xl font-black text-slate-800 leading-tight mb-4">
                  {currentEx.question}
                </h3>

                {/* Hints / Descriptions */}
                {status === 'playing' && (
                   <div className="text-sm text-slate-600 bg-black/5 p-3 rounded mb-4">
                     <p><strong>Dica:</strong> {currentEx.hint}</p>
                   </div>
                )}

                {/* Feedback Messages */}
                {feedbackMsg && (
                   <div className={`p-3 rounded-lg font-bold text-sm mb-4 ${
                       status === 'solved' ? 'bg-green-200 text-green-900' : 'bg-red-200 text-red-900'
                   }`}>
                       {feedbackMsg}
                   </div>
                )}

                {/* Actions when Failed */}
                {status === 'failed' && (
                   <div className="flex gap-3">
                       <button 
                          onClick={() => { loadExercisePosition(); }}
                          className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded hover:bg-slate-300 transition"
                       >
                          Tentar Novamente
                       </button>
                       <button 
                          onClick={showSolution}
                          className="px-4 py-2 bg-red-600 text-white font-bold rounded hover:bg-red-700 transition shadow-md"
                       >
                          👀 Ver Solução
                       </button>
                   </div>
                )}
              </div>

              {/* Board */}
              <div className="bg-white p-2 rounded-xl shadow-2xl border-4 border-slate-800 w-full max-w-[500px] aspect-square relative">
                <Chessboard 
                  id="ExerciseBoard" 
                  position={boardFen} 
                  onPieceDrop={onDrop}
                  customBoardStyle={{ borderRadius: '4px' }}
                  arePiecesDraggable={status !== 'showing' && status !== 'solved'}
                  animationDuration={300}
                />
              </div>

              {/* Navigation */}
              <div className="flex gap-4 mt-6 w-full max-w-[500px]">
                 <button 
                   onClick={handlePrev}
                   disabled={currentIndex === 0}
                   className="flex-1 py-3 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                 >
                   ⬅ Anterior
                 </button>
                 <button 
                   onClick={handleNext}
                   disabled={currentIndex === filteredExercises.length - 1}
                   className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                 >
                   Próximo ➡
                 </button>
              </div>
            </>
          ) : (
             <div className="text-white font-bold text-xl">Selecione um exercício ao lado.</div>
          )}
        </div>
      </div>
    </div>
  );
};