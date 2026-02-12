import React, { useState } from 'react';
import { EmentaPrintModal } from './EmentaPrintModal';

interface EmentaViewProps {
  onBack: () => void;
}

export const EmentaView: React.FC<EmentaViewProps> = ({ onBack }) => {
  const [showPrintModal, setShowPrintModal] = useState(false);

  return (
    <>
    <div className="animate-fade-in max-w-5xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={onBack}
          className="px-5 py-2.5 bg-slate-900/80 backdrop-blur-md rounded-full text-white font-bold transition-all shadow-lg hover:bg-slate-800 flex items-center w-fit active:scale-95 border border-white/10"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Voltar
        </button>

        <button 
          onClick={() => setShowPrintModal(true)}
          className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-full shadow-lg hover:bg-blue-700 transition flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
          Imprimir Ementa
        </button>
      </div>

      {/* Document Container */}
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
        
        {/* Official Header */}
        <div className="bg-slate-50 border-b-4 border-blue-900 p-6 md:p-8 text-center space-y-2">
          <div className="flex justify-center mb-4">
             <span className="text-4xl">🏛️</span>
          </div>
          <h1 className="font-black text-slate-900 uppercase text-lg md:text-xl tracking-wider leading-tight">Governo do Estado do Rio de Janeiro</h1>
          <h2 className="font-bold text-slate-800 uppercase text-base md:text-lg tracking-wide">Prefeitura Municipal de Maricá</h2>
          <h3 className="font-bold text-slate-700 uppercase text-sm md:text-base">Secretaria de Municipal de Educação</h3>
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
        <div className="p-6 md:p-8 text-center bg-white border-b border-slate-100">
           <h2 className="text-2xl md:text-3xl font-black text-slate-800 uppercase mb-2 text-balance">
             Projeto de Iniciação ao Xadrez
           </h2>
           <p className="text-lg font-medium text-slate-500 uppercase tracking-widest">
             Ementa das Aulas
           </p>
        </div>

        {/* Info Grid - Responsive Stack */}
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
        <div className="p-4 md:p-12 space-y-10">
          
          {/* MÓDULO 1 */}
          <section>
            <div className="flex items-center gap-3 mb-4 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-600">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">1</div>
              <h3 className="text-lg md:text-2xl font-black text-blue-900 uppercase">Fundamentos do Xadrez</h3>
            </div>
            
            {/* Lista responsiva sem tabela fixa */}
            <div className="bg-white rounded-xl border border-slate-200">
                <div className="divide-y divide-slate-100">
                    {[
                        "Movimentos e Capturas – Conhecendo as peças e como elas se movem.",
                        "Lances Especiais – Roque, en passant e promoção.",
                        "Xeque e Xeque-Mate – Como identificar e finalizar uma partida.",
                        "Rei Afogado – Compreensão de situações de empate.",
                        "Notação Algébrica 1 – Introdução à anotação de partidas.",
                        "Notação Algébrica 2 – Exercícios práticos e leitura de partidas.",
                        "Empates e Regras Práticas – Diferentes formas de empate no xadrez.",
                        "Ataque e Defesa – Princípios básicos da estratégia."
                    ].map((item, idx) => (
                        <div key={idx} className="p-3 md:p-4 hover:bg-slate-50 transition-colors flex gap-3 items-start">
                            <span className="font-bold text-blue-600 min-w-[24px] text-center mt-0.5">{idx + 1}.</span>
                            <span className="text-slate-700 font-medium text-sm md:text-base leading-relaxed break-words">{item}</span>
                        </div>
                    ))}
                </div>
            </div>
          </section>

          {/* MÓDULO 2 */}
          <section>
            <div className="flex items-center gap-3 mb-4 bg-purple-50 p-4 rounded-lg border-l-4 border-purple-600">
              <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">2</div>
              <h3 className="text-lg md:text-2xl font-black text-purple-900 uppercase">Finais e Estratégias</h3>
            </div>
            
            <div className="bg-white rounded-xl border border-slate-200">
                <div className="divide-y divide-slate-100">
                    {[
                        "Mates Elementares – Escadinha e outros mates simples.",
                        "Como Iniciar uma Partida – Conceitos básicos de abertura.",
                        "Mate de Dama – Finalizações eficientes.",
                        "Esquemas de Mate - Parte 1 (Dama) – Padrões comuns.",
                        "Mate de Torre – Técnica de finalização.",
                        "Esquemas de Mate - Parte 2 – Práticas avançadas.",
                        "Mate com Par de Bispos – Técnicas específicas.",
                        "Esquemas de Mate - Parte 3 – Estudo aprofundado."
                    ].map((item, idx) => (
                        <div key={idx} className="p-3 md:p-4 hover:bg-slate-50 transition-colors flex gap-3 items-start">
                            <span className="font-bold text-purple-600 min-w-[24px] text-center mt-0.5">{idx + 1}.</span>
                            <span className="text-slate-700 font-medium text-sm md:text-base leading-relaxed break-words">{item}</span>
                        </div>
                    ))}
                </div>
            </div>
          </section>

          {/* MÓDULO 3 */}
          <section>
            <div className="flex items-center gap-3 mb-4 bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
              <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">3</div>
              <h3 className="text-lg md:text-2xl font-black text-orange-900 uppercase">Estratégias e Táticas</h3>
            </div>
            
            <div className="bg-white rounded-xl border border-slate-200">
                <div className="divide-y divide-slate-100">
                    {[
                        "Como Conseguir Vantagem Material – Estratégias para capturar peças com segurança.",
                        "Ataque Duplo e Cravada – Importância da tática no jogo.",
                        "A Cravada – Estudo detalhado e aplicações práticas."
                    ].map((item, idx) => (
                        <div key={idx} className="p-3 md:p-4 hover:bg-slate-50 transition-colors flex gap-3 items-start">
                            <span className="font-bold text-orange-600 min-w-[24px] text-center mt-0.5">{idx + 1}.</span>
                            <span className="text-slate-700 font-medium text-sm md:text-base leading-relaxed break-words">{item}</span>
                        </div>
                    ))}
                </div>
            </div>
          </section>

          {/* DETALHES GERAIS (Substituindo Tabela por Lista Flexível) */}
          <section className="pt-2">
             <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                 
                 {/* Metodologia */}
                 <div className="flex flex-col md:flex-row border-b border-slate-100">
                    <div className="p-4 bg-blue-50/50 md:w-1/4 border-b md:border-b-0 md:border-r border-slate-100">
                        <h4 className="font-bold uppercase text-blue-900 text-sm">Metodologia</h4>
                    </div>
                    <div className="p-4 md:w-3/4 space-y-2">
                       <div className="block md:flex md:gap-2"><span className="font-bold text-slate-900">Aulas Expositivas:</span> <span className="text-slate-700">Demonstração prática.</span></div>
                       <div className="block md:flex md:gap-2"><span className="font-bold text-slate-900">Exercícios Práticos:</span> <span className="text-slate-700">Tabuleiro físico e digital.</span></div>
                       <div className="block md:flex md:gap-2"><span className="font-bold text-slate-900">Análise de Partidas:</span> <span className="text-slate-700">Estudo de partidas históricas.</span></div>
                       <div className="block md:flex md:gap-2"><span className="font-bold text-slate-900">Partidas Entre Alunos:</span> <span className="text-slate-700">Feedback individual.</span></div>
                    </div>
                 </div>

                 {/* Avaliação */}
                 <div className="flex flex-col md:flex-row border-b border-slate-100">
                    <div className="p-4 bg-purple-50/50 md:w-1/4 border-b md:border-b-0 md:border-r border-slate-100">
                        <h4 className="font-bold uppercase text-purple-900 text-sm">Avaliação</h4>
                    </div>
                    <div className="p-4 md:w-3/4 space-y-2">
                       <div className="block md:flex md:gap-2"><span className="font-bold text-slate-900">Participação Ativa:</span> <span className="text-slate-700">Envolvimento nas aulas.</span></div>
                       <div className="block md:flex md:gap-2"><span className="font-bold text-slate-900">Registro de Partidas:</span> <span className="text-slate-700">Uso correto da notação.</span></div>
                       <div className="block md:flex md:gap-2"><span className="font-bold text-slate-900">Aplicação de Conceitos:</span> <span className="text-slate-700">Abertura, meio-jogo e final.</span></div>
                    </div>
                 </div>

                 {/* Recursos */}
                 <div className="flex flex-col md:flex-row">
                    <div className="p-4 bg-orange-50/50 md:w-1/4 border-b md:border-b-0 md:border-r border-slate-100">
                        <h4 className="font-bold uppercase text-orange-900 text-sm">Recursos Didáticos</h4>
                    </div>
                    <div className="p-4 md:w-3/4 space-y-2">
                       <div className="block md:flex md:gap-2"><span className="font-bold text-slate-900">Materiais:</span> <span className="text-slate-700">Tabuleiros, Peças, Relógios.</span></div>
                       <div className="block md:flex md:gap-2"><span className="font-bold text-slate-900">Digital:</span> <span className="text-slate-700">Softwares de análise, Projetor.</span></div>
                       <div className="block md:flex md:gap-2"><span className="font-bold text-slate-900">Conteúdo:</span> <span className="text-slate-700">Apostilas e Vídeos.</span></div>
                    </div>
                 </div>

             </div>
          </section>

          {/* Footer Note */}
          <div className="bg-slate-50 p-6 rounded-xl text-center border border-slate-200 mt-8">
            <h4 className="font-black text-slate-400 uppercase text-xs tracking-widest mb-2">Considerações Finais</h4>
            <p className="text-slate-600 font-medium italic text-sm md:text-base leading-relaxed">
              "Este curso visa não apenas ensinar as regras do xadrez, mas também desenvolver o pensamento estratégico dos alunos, tornando-os capazes de analisar partidas, criar planos e evoluir no jogo de forma consistente."
            </p>
          </div>

        </div>
      </div>
    </div>

    {/* Print Modal */}
    <EmentaPrintModal 
      isOpen={showPrintModal} 
      onClose={() => setShowPrintModal(false)} 
    />
    </>
  );
};