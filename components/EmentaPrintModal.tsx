import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface EmentaPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmentaPrintModal: React.FC<EmentaPrintModalProps> = ({ isOpen, onClose }) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPdf = async () => {
    if (!printRef.current) return;
    setIsGenerating(true);

    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('l', 'mm', 'a4'); // Paisagem
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgProps = pdf.getImageProperties(imgData);
      const ratio = imgProps.width / imgProps.height;
      
      const margin = 10;
      const contentWidth = pdfWidth - (2 * margin);
      const contentHeight = contentWidth / ratio;

      // Se for maior que uma página, ajusta (básico) ou deixa multipágina (avançado).
      // Para este caso, vamos ajustar para caber ou adicionar página se muito longo
      if (contentHeight <= pdfHeight - (2 * margin)) {
         pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, contentHeight);
      } else {
         // Simples: Fit to page (pode ficar pequeno) ou corta. 
         // Melhor UX para MVP: Scale to fit width, allow multipage logic if needed usually requires complex splitting.
         // Vamos ajustar a escala para caber na altura se for muito alto, ou apenas imprimir o que der.
         // Dado o conteúdo da ementa, em paisagem costuma caber bem se o CSS for compacto.
         // Vamos forçar o ajuste na largura e deixar a altura fluir (creates multipage manually is hard with html2canvas single shot).
         // Fallback: Scale to fit height if too tall.
         
         if (contentHeight > pdfHeight - (2*margin)) {
             const fitHeight = pdfHeight - (2 * margin);
             const fitWidth = fitHeight * ratio;
             const xOffset = (pdfWidth - fitWidth) / 2;
             pdf.addImage(imgData, 'PNG', xOffset, margin, fitWidth, fitHeight);
         } else {
             pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, contentHeight);
         }
      }

      pdf.save('Ementa_Clube_Xadrez.pdf');
      
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Houve um erro ao gerar o PDF. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
       <div className="flex flex-col h-full w-full max-w-7xl bg-white rounded-xl overflow-hidden shadow-2xl">
          
          {/* Header Toolbar */}
          <div className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-md z-10 shrink-0">
             <div>
               <h2 className="text-xl font-bold">Imprimir Ementa</h2>
               <p className="text-xs text-slate-400">Layout Paisagem (A4)</p>
             </div>
             <div className="flex space-x-3">
               <button 
                 onClick={onClose} 
                 className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
               >
                 Cancelar
               </button>
               <button 
                 onClick={handleDownloadPdf} 
                 disabled={isGenerating} 
                 className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg flex items-center space-x-2 transition-transform transform active:scale-95 disabled:opacity-50"
               >
                  {isGenerating ? <span>Gerando...</span> : <span>Baixar PDF</span>}
               </button>
             </div>
          </div>

          {/* Scrollable Preview Area */}
          <div className="flex-1 overflow-auto bg-slate-200 p-8 flex justify-center">
             
             {/* THE PAPER (A4 Landscape) */}
             <div 
               ref={printRef} 
               className="bg-white shadow-2xl mx-auto flex flex-col relative" 
               style={{ width: '297mm', minHeight: '210mm', padding: '10mm', boxSizing: 'border-box' }}
             >
                {/* Official Header */}
                <div className="border-b-2 border-black pb-2 mb-4 text-center">
                   <h1 className="font-bold text-sm uppercase text-black">Governo do Estado do Rio de Janeiro</h1>
                   <h2 className="font-bold text-sm uppercase text-black">Prefeitura Municipal de Maricá</h2>
                   <h3 className="text-xs font-bold uppercase text-black">Secretaria Municipal de Educação • E.M. Joana Benedicta Rangel</h3>
                </div>

                <div className="text-center mb-4">
                   <h2 className="font-black text-xl uppercase underline text-black">Ementa do Curso de Xadrez</h2>
                   <p className="text-xs font-bold uppercase mt-1 text-black">Prof. André Brito • Projeto de Iniciação</p>
                </div>

                {/* Content Grid (Compact for Print) */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="border border-black p-2">
                        <h4 className="font-bold text-[10px] uppercase text-black">Público-Alvo</h4>
                        <p className="text-[10px] text-black leading-tight">Iniciantes e nível básico.</p>
                    </div>
                    <div className="border border-black p-2">
                        <h4 className="font-bold text-[10px] uppercase text-black">Pré-Requisito</h4>
                        <p className="text-[10px] text-black leading-tight">Matrícula regular na escola.</p>
                    </div>
                    <div className="border border-black p-2">
                        <h4 className="font-bold text-[10px] uppercase text-black">Objetivo Geral</h4>
                        <p className="text-[10px] text-black leading-tight">Desenvolver raciocínio lógico, planejamento e compreensão dos fundamentos do jogo.</p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 flex-1">
                    {/* Module 1 */}
                    <div className="border border-black p-2">
                        <div className="bg-gray-200 p-1 mb-2 font-bold text-xs uppercase text-black text-center">1. Fundamentos</div>
                        <ul className="text-[9px] list-disc list-inside space-y-1 text-black">
                            <li>Movimentos e Capturas</li>
                            <li>Lances Especiais (Roque, En Passant)</li>
                            <li>Xeque e Xeque-Mate</li>
                            <li>Rei Afogado e Empates</li>
                            <li>Notação Algébrica (Intro e Prática)</li>
                            <li>Princípios de Ataque e Defesa</li>
                        </ul>
                    </div>

                    {/* Module 2 */}
                    <div className="border border-black p-2">
                        <div className="bg-gray-200 p-1 mb-2 font-bold text-xs uppercase text-black text-center">2. Finais Básicos</div>
                        <ul className="text-[9px] list-disc list-inside space-y-1 text-black">
                            <li>Mates Elementares (Escadinha)</li>
                            <li>Mate de Dama e Rei</li>
                            <li>Mate de Torre e Rei</li>
                            <li>Conceitos de Abertura</li>
                            <li>Esquemas de Mate (Padrões)</li>
                            <li>Mate com par de Bispos (Intro)</li>
                        </ul>
                    </div>

                    {/* Module 3 */}
                    <div className="border border-black p-2">
                        <div className="bg-gray-200 p-1 mb-2 font-bold text-xs uppercase text-black text-center">3. Tática e Estratégia</div>
                        <ul className="text-[9px] list-disc list-inside space-y-1 text-black">
                            <li>Vantagem Material</li>
                            <li>O Ataque Duplo (Garfo)</li>
                            <li>A Cravada (Absoluta e Relativa)</li>
                            <li>O Espeto (Raio-X)</li>
                            <li>Desvio e Atração</li>
                            <li>Análise de Partidas Curtas</li>
                        </ul>
                    </div>
                </div>

                {/* Methodology & Evaluation */}
                <div className="mt-4 border-t border-black pt-2 grid grid-cols-2 gap-4">
                    <div>
                        <h4 className="font-bold text-xs uppercase mb-1 text-black">Metodologia e Recursos</h4>
                        <p className="text-[9px] text-justify text-black">
                            Aulas expositivas com tabuleiro mural, prática em tabuleiros físicos e uso de softwares/apps. Exercícios de fixação e torneios internos.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold text-xs uppercase mb-1 text-black">Avaliação</h4>
                        <p className="text-[9px] text-justify text-black">
                            Participação ativa, resolução de exercícios, uso correto da notação e aplicação dos conceitos em partidas práticas.
                        </p>
                    </div>
                </div>

                <div className="absolute bottom-4 left-0 w-full text-center">
                   <p className="text-[8px] text-gray-500">Documento gerado pelo sistema Clube do Xadrez em {new Date().toLocaleDateString()}</p>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};