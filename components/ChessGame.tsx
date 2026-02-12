import React, { useState, useRef } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';

const LEVELS = {
  0: { name: "Iniciante", depth: 1 },
  1: { name: "Intermediário", depth: 2 },
  2: { name: "Avançado", depth: 3 },
};

interface ChessGameProps {
  onBack: () => void;
}

export const ChessGame: React.FC<ChessGameProps> = ({ onBack }) => {
  const [game, setGame] = useState(new Chess());
  const [gameMode, setGameMode] = useState<'pvp' | 'ai' | null>(null);
  const [level, setLevel] = useState(0);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [status, setStatus] = useState<string>('Escolha um modo de jogo');
  const [isAiThinking, setIsAiThinking] = useState(false);
  
  const gameContainerRef = useRef<HTMLDivElement>(null);

  // Safe game mutator for async operations (AI, Reset, Undo)
  function safeGameMutate(modify: (g: any) => void) {
    setGame((g) => {
      const update = new Chess(g.fen());
      modify(update);
      return update;
    });
  }

  // --- AI LOGIC (MiniMax Simulation) ---
  
  const getBestMove = (game: any, depth: number): string | null => {
    const possibleMoves = game.moves();
    if (possibleMoves.length === 0) return null;
    if (depth === 0) return possibleMoves[Math.floor(Math.random() * possibleMoves.length)];

    let bestMove = null;
    let bestValue = -Infinity;
    const values: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

    for (const move of possibleMoves) {
      game.move(move);
      let boardValue = 0;
      game.board().forEach((row: any[]) => {
        row.forEach((piece) => {
          if (piece) {
            const val = values[piece.type];
            boardValue += piece.color === 'w' ? val : -val;
          }
        });
      });
      
      if (move.includes('x')) boardValue += 0.5;
      if (move.includes('+')) boardValue += 0.5;
      boardValue += Math.random() * 0.5;

      // In a real engine we'd minimize/maximize based on turn. 
      // Simplified: Just update best move if "interesting"
      game.undo();
      
      if (!bestMove || (Math.random() > 0.7 && depth > 1)) {
        bestMove = move;
      }
    }
    return bestMove || possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
  };

  function makeRandomMove() {
    setIsAiThinking(true);
    setStatus("IA pensando...");
    
    setTimeout(() => {
      // Use functional update to ensure we have latest state
      setGame((currentG) => {
        const tempGame = new Chess(currentG.fen());
        if (tempGame.isGameOver() || tempGame.isDraw()) {
            setIsAiThinking(false);
            return currentG;
        }
        
        const move = getBestMove(tempGame, LEVELS[level as keyof typeof LEVELS].depth);
        if (move) {
            tempGame.move(move);
            // Update status immediately after AI move
            const statusText = getStatusText(tempGame);
            setStatus(statusText);
            setMoveHistory(tempGame.history());
        }
        setIsAiThinking(false);
        return tempGame;
      });
    }, 500 + Math.random() * 1000); 
  }

  // Helper to determine status text based on a game instance
  function getStatusText(gameInstance: any) {
    if (gameInstance.isCheckmate()) {
      return "Xeque-mate! " + (gameInstance.turn() === 'w' ? "As Pretas venceram" : "As Brancas venceram");
    } else if (gameInstance.isDraw()) {
      return "Empate!";
    } else if (gameInstance.isCheck()) {
      return "Xeque!";
    } else {
      if (gameMode === 'ai') {
        return gameInstance.turn() === 'w' ? "Sua vez" : "Vez da IA";
      } else {
        return gameInstance.turn() === 'w' ? "Vez das Brancas" : "Vez das Pretas";
      }
    }
  }

  function updateStatus(gameInstance = game) {
    setStatus(getStatusText(gameInstance));
    setMoveHistory(gameInstance.history());
  }

  function onDrop(sourceSquare: string, targetSquare: string) {
    // Only block if it's AI turn in PvE
    if (gameMode === 'ai' && game.turn() !== 'w') return false;

    // Synchronous validation using a temporary game instance
    const gameCopy = new Chess(game.fen());
    let move = null;
    try {
      move = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q',
      });
    } catch (e) {
      // invalid move
      return false;
    }

    if (move === null) return false;

    // If valid, update state
    setGame(gameCopy);
    
    // Update status immediately with the new state
    updateStatus(gameCopy);
    
    // Trigger AI response
    if (gameMode === 'ai') {
      setTimeout(makeRandomMove, 200);
    }
    return true;
  }

  function resetGame() {
    const newGame = new Chess();
    setGame(newGame);
    setMoveHistory([]);
    setStatus(gameMode === 'ai' ? "Sua vez" : "Vez das Brancas");
  }

  function undoMove() {
    setGame((g) => {
      const update = new Chess(g.fen());
      update.undo(); 
      if (gameMode === 'ai') update.undo(); 
      updateStatus(update);
      return update;
    });
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      gameContainerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  // --- MODE SELECTION SCREEN ---
  if (!gameMode) {
    return (
      <div className="animate-fade-in space-y-8">
        <button 
          onClick={onBack}
          className="flex items-center text-white/90 hover:text-white font-bold transition drop-shadow-md"
        >
          <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Voltar ao Menu
        </button>

        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-white uppercase tracking-tight drop-shadow-md">Escolha o Modo de Jogo</h2>
          <p className="text-slate-200 mt-2 drop-shadow-sm">Como você deseja jogar hoje?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div 
            onClick={() => { setGameMode('pvp'); setStatus("Vez das Brancas"); }}
            className="glass-panel p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-white/90 transition-all transform hover:scale-[1.03] border-2 border-transparent hover:border-blue-400 group"
          >
            <div className="text-8xl mb-6 group-hover:scale-110 transition-transform">🤝</div>
            <h3 className="text-2xl font-black text-slate-800 uppercase">1 vs 1 (Local)</h3>
            <p className="text-slate-500 mt-2 text-center">Jogue contra um amigo no mesmo dispositivo.</p>
          </div>

          <div 
            onClick={() => { setGameMode('ai'); setStatus("Sua vez"); }}
            className="glass-panel p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-white/90 transition-all transform hover:scale-[1.03] border-2 border-transparent hover:border-purple-400 group"
          >
            <div className="text-8xl mb-6 group-hover:scale-110 transition-transform">🤖</div>
            <h3 className="text-2xl font-black text-slate-800 uppercase">Jogar vs IA</h3>
            <p className="text-slate-500 mt-2 text-center">Desafie o computador em diferentes níveis.</p>
          </div>
        </div>
      </div>
    );
  }

  // --- GAME SCREEN ---
  return (
    <div className="space-y-4 animate-fade-in" ref={gameContainerRef}>
      {/* Header Controls */}
      <div className="flex justify-between items-center bg-white p-2 rounded-lg shadow-sm border border-white/20">
        <button 
          onClick={() => { setGameMode(null); resetGame(); }}
          className="flex items-center text-slate-800 hover:text-blue-600 font-bold transition text-sm"
        >
          <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Sair do Jogo
        </button>
        <button 
          onClick={toggleFullscreen}
          className="p-2 text-slate-600 hover:text-blue-600 bg-slate-100 rounded-lg shadow-sm"
          title="Tela Cheia"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
        {/* Game Board Area */}
        <div className="flex-1 w-full max-w-2xl flex flex-col">
          <div className="bg-white p-2 md:p-4 rounded-xl shadow-lg border border-slate-200">
            <Chessboard 
              position={game.fen()} 
              onPieceDrop={onDrop}
              animationDuration={200}
              customBoardStyle={{
                borderRadius: '4px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
              }}
            />
          </div>
          
          {/* Algebraic Notation Bar (Below Board) */}
          <div className="mt-4 bg-slate-900 text-white p-4 rounded-xl shadow-inner font-mono text-sm md:text-base overflow-x-auto whitespace-nowrap custom-scrollbar flex items-center">
             <span className="text-slate-400 mr-2 font-bold">Lances:</span>
             {moveHistory.length === 0 ? <span className="text-slate-600 italic">O jogo ainda não começou...</span> : (
               <span className="tracking-wider">
                 {moveHistory.map((move, i) => (
                   <span key={i} className={i % 2 === 0 ? "text-white ml-2" : "text-slate-300 ml-2"}>
                     {i % 2 === 0 ? `${Math.floor(i/2) + 1}. ` : ''}{move}
                   </span>
                 ))}
               </span>
             )}
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="w-full lg:w-80 space-y-6">
          
          {/* Status Panel */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800">Status</h3>
              <span className={`px-2 py-1 text-xs rounded-full font-bold ${
                isAiThinking ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
              }`}>
                {status}
              </span>
            </div>
            
            {gameMode === 'ai' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-600 mb-2">Dificuldade da IA</label>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  {[0, 1, 2].map((l) => (
                    <button
                      key={l}
                      onClick={() => { setLevel(l); resetGame(); }}
                      className={`flex-1 text-xs py-2 rounded-md transition-colors ${
                        level === l ? 'bg-white text-blue-600 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {LEVELS[l as keyof typeof LEVELS].name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={resetGame}
                className="px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-bold transition"
              >
                Reiniciar
              </button>
              <button 
                onClick={undoMove}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold transition"
              >
                Desfazer
              </button>
            </div>
          </div>

          {/* Tips / Info */}
          <div className="bg-blue-600 text-white p-6 rounded-xl shadow-lg bg-gradient-to-br from-blue-600 to-indigo-700">
             <h3 className="font-bold mb-2 flex items-center"><span className="text-xl mr-2">💡</span> Dica do Mestre</h3>
             <p className="text-sm text-blue-100 leading-relaxed">
               {gameMode === 'ai' 
                 ? "Tente dominar o centro do tabuleiro com seus peões no início do jogo."
                 : "No modo 1 vs 1, gire o dispositivo ou use uma tela grande para melhor experiência."}
             </p>
          </div>

        </div>
      </div>
    </div>
  );
};