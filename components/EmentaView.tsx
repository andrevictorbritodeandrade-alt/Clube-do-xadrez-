import React from 'react';

interface EmentaViewProps {
  onBack: () => void;
}

export const EmentaView: React.FC<EmentaViewProps> = ({ onBack }) => {
  return (
    <div className="animate-fade-in max-w-5xl mx-auto pb-20">
      <button 
        onClick={onBack}
        className="mb-6 flex items-center text-white/90 hover:text-white font-bold transition drop-shadow-md"
      >
        <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Voltar ao Menu
      </button>

      {/* Document Container */}
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden print:shadow-none">
        
        {/* Official Header */}
        <div className="bg-slate-50 border-b-4 border-blue-900 p-6 md:p-8 text-center space-y-2">
          <div className="flex justify-center mb-4">
             <span className="text-4xl">🏛️</span>
          </div>
          <h1 className="font-black text-slate-900 uppercase text-lg md:text-xl tracking-wider leading-tight">Governo do Estado do Rio de Janeiro</h1>
          <h2 className="font-bold text-slate-800 uppercase text-base md:text-lg tracking-wide">Prefeitura Municipal de Maricá</h2>
          <h3 className="font-bold text-slate-700 uppercase text-sm md:text-base">Secretaria Municipal de Educação</h3>
          <h3 className="font-bold text-slate-900 uppercase text-sm md:text-base mt-1">Escola Municipal Joana Benedicta Rangel</h3>
          
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <div className="inline-block bg-blue-100 text-blue-800 px-4 py-1 rounded-full text-xs font-bold uppercase">
              Eixo III – Atividades Esportivas e Motoras
            </div>
            <div className="inline-block bg-slate-200 text-slate-800 px-4 py-1 rounded-full text-xs font-bold uppercase">
              Prof. André Brito
            </div>
          </div>
        </div>

        {/* Title Section */}
        <div className="p-8 text-center bg-white border-b border-slate-100">
           <h2 className="text-2xl md:text-4xl font-black text-slate-800 uppercase mb-2 text-balance">
             Projeto de Iniciação ao Xadrez
           </h2>
           <p className="text-lg font-medium text-slate-500 uppercase tracking-widest">
             Ementa das Aulas
           </p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-200 border-b border-slate-200">
          <div className="bg-white p-6">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Nome do Curso</h4>
            <p className="font-bold text-slate-800">Curso de Xadrez – Nível Iniciante e Intermediário</p>
          </div>
          <div className="bg-white p-6">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Público-Alvo</h4>
            <p className="font-medium text-slate-700">Iniciantes e jogadores com conhecimento básico que desejam aprimorar suas habilidades.</p>
          </div>
          <div className="bg-white p-6">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Pré-Requisito</h4>
            <p className="font-medium text-slate-700">Matriculado regularmente na Escola Joana Benedicta Rangel.</p>
          </div>
           <div className="bg-white p-6">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Objetivo Geral</h4>
            <p className="font-medium text-slate-700 text-sm leading-relaxed">
              Capacitar os alunos a compreenderem os fundamentos do xadrez, desde os movimentos básicos até estratégias mais avançadas, permitindo que desenvolvam habilidades de raciocínio lógico, planejamento e tomada de decisão.
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-12 space-y-12">
          
          {/* MÓDULO 1 */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xl">1</div>
              <h3 className="text-2xl font-black text-blue-900 uppercase">Fundamentos do Xadrez</h3>
            </div>
            
            <div className="space-y-6 pl-4 md:pl-12 border-l-2 border-slate-100">
              {/* Topic 1 */}
              <div className="group">
                <h4 className="font-bold text-slate-800 text-lg mb-2">1. Movimentos e Capturas</h4>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <p className="text-slate-700 text-sm mb-2"><strong className="text-blue-700">1.0 Peão, Torre e Cavalo:</strong> Ensinar através do método global e atividades práticas (mini-partidas).</p>
                  <p className="text-slate-700 text-sm"><strong className="text-blue-700">1.1 Bispo, Rei e Rainha:</strong> Ensinar movimentos e passar a montar o tabuleiro completo.</p>
                </div>
              </div>

              {/* Topic 2 */}
              <div className="group">
                <h4 className="font-bold text-slate-800 text-lg mb-2">2. Lances Especiais</h4>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-3">
                  <p className="text-slate-700 text-sm"><strong className="text-blue-700">Roque (Pequeno e Grande):</strong> Regras de segurança do Rei, linha de ataque e peças não tocadas.</p>
                  <p className="text-slate-700 text-sm"><strong className="text-blue-700">En Passant:</strong> Captura especial quando o peão avança duas casas para "fugir" da captura.</p>
                  <p className="text-slate-700 text-sm"><strong className="text-blue-700">Promoção:</strong> Quando o peão chega ao outro lado e se torna Rainha, Torre, Bispo ou Cavalo.</p>
                </div>
              </div>

              {/* Topic 3 */}
              <div className="group">
                <h4 className="font-bold text-slate-800 text-lg mb-2">3. Xeque e Xeque-Mate</h4>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <p className="text-slate-700 text-sm mb-2">Identificação de ataque ao Rei (Xeque) e finalização sem saída (Mate).</p>
                  <p className="text-slate-600 text-xs italic">Prática intensiva: Exercícios de ataque e defesa por duas aulas.</p>
                </div>
              </div>

               {/* Topic 4 */}
               <div className="group">
                <h4 className="font-bold text-slate-800 text-lg mb-2">4. Rei Afogado</h4>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <p className="text-slate-700 text-sm">Compreensão de situações de empate onde o Rei não está em xeque mas não tem movimentos legais.</p>
                </div>
              </div>

              {/* Topic 5 - Notação */}
              <div className="group">
                <h4 className="font-bold text-slate-800 text-lg mb-2">5. Notação Algébrica</h4>
                <div className="bg-slate-800 text-slate-200 p-5 rounded-xl space-y-4 text-sm font-mono">
                  <p>Sistema universal para registrar partidas, comunicar jogadas e estudar xadrez.</p>
                  <div className="grid grid-cols-2 gap-4 border-t border-slate-700 pt-3">
                    <div>
                      <span className="block text-blue-400 font-bold mb-1">Peças:</span>
                      <ul className="space-y-1 text-xs">
                        <li>R - Rei (King)</li>
                        <li>D - Dama (Queen)</li>
                        <li>T - Torre (Rook)</li>
                        <li>B - Bispo (Bishop)</li>
                        <li>C - Cavalo (Knight)</li>
                      </ul>
                    </div>
                    <div>
                      <span className="block text-green-400 font-bold mb-1">Exemplos:</span>
                      <ul className="space-y-1 text-xs">
                        <li>e4 (Peão move)</li>
                        <li>Cf3 (Cavalo move)</li>
                        <li>Dxf3 (Captura)</li>
                        <li>+ (Xeque) / # (Mate)</li>
                        <li>0-0 (Roque Curto)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Topic 6 */}
              <div className="group">
                <h4 className="font-bold text-slate-800 text-lg mb-2">6. Empates e Regras Práticas</h4>
                <ul className="list-disc list-inside text-sm text-slate-700 space-y-1 ml-2">
                   <li>Rei vs Rei (Material insuficiente).</li>
                   <li>Regra das 50 jogadas sem captura ou movimento de peão.</li>
                   <li>Repetição de posição (3 vezes) e Xeque Perpétuo.</li>
                </ul>
              </div>

               {/* Topic 7 */}
               <div className="group">
                <h4 className="font-bold text-slate-800 text-lg mb-2">7. Ataque e Defesa</h4>
                <p className="text-sm text-slate-700">Princípios básicos com tabuleiro aberto para visualização de possibilidades.</p>
              </div>

            </div>
          </section>

          {/* MÓDULO 2 */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-black text-xl">2</div>
              <h3 className="text-2xl font-black text-purple-900 uppercase">Finais e Estratégias Básicas</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 md:pl-12">
               {[
                 { title: "Mates Elementares", desc: "Mate da escadinha (2 Torres ou Torre e Dama)." },
                 { title: "Iniciação", desc: "Conceitos de abertura e controle do centro." },
                 { title: "Mate de Dama", desc: "Técnica de encurralar o Rei sem afogá-lo." },
                 { title: "Mate de Torre", desc: "Técnica de finalização com Rei e Torre." },
                 { title: "Esquemas de Mate", desc: "Padrões comuns (Corredor, Peças presas)." },
                 { title: "Par de Bispos", desc: "Técnicas específicas de finalização." },
               ].map((item, i) => (
                 <div key={i} className="bg-purple-50 p-4 rounded-lg border border-purple-100 hover:shadow-md transition">
                    <h5 className="font-bold text-purple-800 mb-1">{item.title}</h5>
                    <p className="text-sm text-slate-600">{item.desc}</p>
                 </div>
               ))}
            </div>
          </section>

          {/* MÓDULO 3 */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-black text-xl">3</div>
              <h3 className="text-2xl font-black text-orange-900 uppercase">Estratégias e Táticas</h3>
            </div>
            
            <div className="pl-4 md:pl-12 space-y-4">
               <div className="flex items-start gap-4 p-4 border rounded-xl bg-orange-50/50 border-orange-100">
                  <div className="text-2xl">💎</div>
                  <div>
                    <h4 className="font-bold text-slate-800">Vantagem Material</h4>
                    <p className="text-sm text-slate-600">Estratégias para capturar peças com segurança e valorizar trocas.</p>
                  </div>
               </div>
               <div className="flex items-start gap-4 p-4 border rounded-xl bg-orange-50/50 border-orange-100">
                  <div className="text-2xl">⚔️</div>
                  <div>
                    <h4 className="font-bold text-slate-800">Ataque Duplo (Garfo)</h4>
                    <p className="text-sm text-slate-600">Quando uma peça ataca duas ou mais peças adversárias simultaneamente.</p>
                  </div>
               </div>
               <div className="flex items-start gap-4 p-4 border rounded-xl bg-orange-50/50 border-orange-100">
                  <div className="text-2xl">📌</div>
                  <div>
                    <h4 className="font-bold text-slate-800">A Cravada</h4>
                    <p className="text-sm text-slate-600">Impedir o movimento de uma peça adversária pois exporia uma peça de maior valor (como o Rei).</p>
                  </div>
               </div>
            </div>
          </section>

          {/* Methodology & Resources */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-slate-200">
             
             <div className="space-y-4">
                <h4 className="font-black text-slate-800 uppercase border-b-2 border-blue-500 inline-block pb-1">Metodologia</h4>
                <ul className="text-sm text-slate-700 space-y-2">
                  <li>• Aulas Expositivas e Demonstrações.</li>
                  <li>• Exercícios em Tabuleiro Físico e Digital.</li>
                  <li>• Análise de Partidas Históricas.</li>
                  <li>• Partidas entre alunos com Feedback.</li>
                </ul>
             </div>

             <div className="space-y-4">
                <h4 className="font-black text-slate-800 uppercase border-b-2 border-green-500 inline-block pb-1">Avaliação</h4>
                <ul className="text-sm text-slate-700 space-y-2">
                  <li>• Participação Ativa.</li>
                  <li>• Registro correto (Notação).</li>
                  <li>• Aplicação de conceitos táticos.</li>
                  <li>• Desempenho em partidas simuladas.</li>
                </ul>
             </div>

             <div className="space-y-4">
                <h4 className="font-black text-slate-800 uppercase border-b-2 border-purple-500 inline-block pb-1">Recursos</h4>
                <ul className="text-sm text-slate-700 space-y-2">
                  <li>• Tabuleiros e Peças Físicas.</li>
                  <li>• Softwares e Apps de Xadrez.</li>
                  <li>• Material Impresso e Digital.</li>
                  <li>• Vídeos de Partidas Comentadas.</li>
                </ul>
             </div>

          </div>

          {/* Footer Note */}
          <div className="bg-slate-50 p-6 rounded-xl text-center border border-slate-200 mt-8">
            <p className="text-slate-600 font-medium italic">
              "Este curso visa não apenas ensinar as regras do xadrez, mas também desenvolver o pensamento estratégico dos alunos, tornando-os capazes de analisar partidas, criar planos e evoluir no jogo de forma consistente."
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};