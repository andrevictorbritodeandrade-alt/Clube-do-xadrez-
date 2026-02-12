import React from 'react';

interface NotationViewProps {
  onBack: () => void;
}

export const NotationView: React.FC<NotationViewProps> = ({ onBack }) => {
  return (
    <div className="animate-fade-in max-w-5xl mx-auto pb-20 space-y-8">
      <button 
        onClick={onBack}
        className="mb-6 px-5 py-2.5 bg-slate-900/80 backdrop-blur-md rounded-full text-white font-bold transition-all shadow-lg hover:bg-slate-800 flex items-center w-fit active:scale-95 border border-white/10"
      >
        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Voltar ao Menu
      </button>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-white uppercase tracking-tight drop-shadow-md">Notação Algébrica</h2>
        <p className="text-slate-200 mt-2 font-medium">Tabela de Referência para Anotação de Partidas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* TABELA DE PEÇAS E TRADUÇÃO */}
        <div className="glass-panel p-6 md:p-8 border-l-8 border-blue-600 md:col-span-2">
           <h3 className="text-xl font-black text-slate-800 uppercase mb-6 flex items-center gap-2">
             <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded flex items-center justify-center text-sm">1</span>
             Peças e Nomenclaturas
           </h3>
           
           <div className="overflow-x-auto">
             <table className="w-full text-sm md:text-base border-collapse">
               <thead>
                 <tr className="bg-slate-100 text-slate-600 uppercase text-xs font-bold">
                   <th className="p-3 text-center border-b border-slate-200">Símbolo</th>
                   <th className="p-3 text-left border-b border-slate-200">Inglês (Internacional)</th>
                   <th className="p-3 text-left border-b border-slate-200">Português</th>
                   <th className="p-3 text-center border-b border-slate-200">Peça</th>
                 </tr>
               </thead>
               <tbody className="text-slate-800 font-bold">
                 <tr className="border-b border-slate-50 hover:bg-blue-50/50">
                   <td className="p-3 text-center text-lg font-black text-blue-600">K</td>
                   <td className="p-3">KING</td>
                   <td className="p-3">REI</td>
                   <td className="p-3 text-center text-2xl">♔</td>
                 </tr>
                 <tr className="border-b border-slate-50 hover:bg-blue-50/50">
                   <td className="p-3 text-center text-lg font-black text-blue-600">Q</td>
                   <td className="p-3">QUEEN</td>
                   <td className="p-3">RAINHA / DAMA</td>
                   <td className="p-3 text-center text-2xl">♕</td>
                 </tr>
                 <tr className="border-b border-slate-50 hover:bg-blue-50/50">
                   <td className="p-3 text-center text-lg font-black text-blue-600">R</td>
                   <td className="p-3">ROOK</td>
                   <td className="p-3">TORRE</td>
                   <td className="p-3 text-center text-2xl">♖</td>
                 </tr>
                 <tr className="border-b border-slate-50 hover:bg-blue-50/50">
                   <td className="p-3 text-center text-lg font-black text-blue-600">B</td>
                   <td className="p-3">BISHOP</td>
                   <td className="p-3">BISPO</td>
                   <td className="p-3 text-center text-2xl">♗</td>
                 </tr>
                 <tr className="border-b border-slate-50 hover:bg-blue-50/50">
                   <td className="p-3 text-center text-lg font-black text-blue-600">N</td>
                   <td className="p-3">KNIGHT</td>
                   <td className="p-3">CAVALO</td>
                   <td className="p-3 text-center text-2xl">♘</td>
                 </tr>
                 <tr className="hover:bg-blue-50/50">
                   <td className="p-3 text-center text-lg text-slate-400">-</td>
                   <td className="p-3 text-slate-500">PAWN</td>
                   <td className="p-3">PEÃO</td>
                   <td className="p-3 text-center text-2xl">♙</td>
                 </tr>
               </tbody>
             </table>
           </div>
           <p className="text-xs text-slate-500 mt-3 bg-slate-100 p-2 rounded">
             <strong>Nota:</strong> Em torneios nacionais, usamos as iniciais em português (R, D, T, B, C). A notação internacional (K, Q, R, B, N) é usada em sites e livros estrangeiros.
           </p>
        </div>

        {/* SÍMBOLOS ESPECIAIS */}
        <div className="glass-panel p-6 md:p-8 border-l-8 border-orange-500">
           <h3 className="text-xl font-black text-slate-800 uppercase mb-6 flex items-center gap-2">
             <span className="bg-orange-100 text-orange-600 w-8 h-8 rounded flex items-center justify-center text-sm">2</span>
             Símbolos Especiais
           </h3>
           
           <div className="space-y-2">
             <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
               <span className="font-mono font-black text-lg text-slate-800">0-0</span>
               <span className="font-bold text-sm text-slate-600 uppercase">Roque Pequeno</span>
             </div>
             <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
               <span className="font-mono font-black text-lg text-slate-800">0-0-0</span>
               <span className="font-bold text-sm text-slate-600 uppercase">Roque Grande</span>
             </div>
             <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
               <span className="font-mono font-black text-lg text-red-500">x</span>
               <span className="font-bold text-sm text-slate-600 uppercase">Captura</span>
             </div>
             <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
               <span className="font-mono font-black text-lg text-blue-600">+</span>
               <span className="font-bold text-sm text-slate-600 uppercase">Xeque</span>
             </div>
             <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
               <span className="font-mono font-black text-lg text-purple-600">#</span>
               <span className="font-bold text-sm text-slate-600 uppercase">Xeque-Mate</span>
             </div>
           </div>
        </div>

        {/* EXEMPLO DE PARTIDA */}
        <div className="glass-panel p-6 md:p-8 border-l-8 border-green-500">
           <h3 className="text-xl font-black text-slate-800 uppercase mb-6 flex items-center gap-2">
             <span className="bg-green-100 text-green-600 w-8 h-8 rounded flex items-center justify-center text-sm">3</span>
             Exemplo de Anotação
           </h3>
           
           <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
             <table className="w-full text-center">
                <thead className="bg-slate-800 text-white uppercase text-xs">
                  <tr>
                    <th className="py-2">Nº</th>
                    <th className="py-2">Brancas</th>
                    <th className="py-2">Pretas</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-sm md:text-base">
                  <tr className="border-b border-slate-100">
                    <td className="py-2 font-bold text-slate-400">1</td>
                    <td className="py-2 font-bold text-slate-800">e4</td>
                    <td className="py-2 font-bold text-slate-800">e5</td>
                  </tr>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <td className="py-2 font-bold text-slate-400">2</td>
                    <td className="py-2 font-bold text-blue-700">Nf3</td>
                    <td className="py-2 font-bold text-slate-800">Nc6</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-2 font-bold text-slate-400">3</td>
                    <td className="py-2 font-bold text-blue-700">Bc4</td>
                    <td className="py-2 font-bold text-slate-800">Nf6</td>
                  </tr>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <td className="py-2 font-bold text-slate-400">4</td>
                    <td className="py-2 font-bold text-blue-700">Ng5</td>
                    <td className="py-2 text-slate-400 italic">...</td>
                  </tr>
                </tbody>
             </table>
           </div>
           <p className="text-[10px] text-center text-slate-400 mt-2 font-medium">Abertura Italiana / Defesa dos Dois Cavalos</p>
        </div>

      </div>
    </div>
  );
};