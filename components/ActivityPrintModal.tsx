import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ActivityLogData } from '../types';

interface ActivityPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ActivityLogData;
}

export const ActivityPrintModal: React.FC<ActivityPrintModalProps> = ({ isOpen, onClose, data }) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPdf = async () => {
    if (!printRef.current) return;
    setIsGenerating(true);

    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2, // Melhor resolução
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      
      // MUDANÇA: 'l' para Landscape (Paisagem)
      const pdf = new jsPDF('l', 'mm', 'a4'); 
      const pdfWidth = pdf.internal.pageSize.getWidth(); // ~297mm
      const pdfHeight = pdf.internal.pageSize.getHeight(); // ~210mm
      
      const imgProps = pdf.getImageProperties(imgData);
      const ratio = imgProps.width / imgProps.height;
      
      const margin = 10; // Margem menor para aproveitar a largura
      const contentWidth = pdfWidth - (2 * margin);
      const contentHeight = contentWidth / ratio;

      // Se o conteúdo calculado for mais alto que a página, ajusta pela altura
      if (contentHeight > pdfHeight - (2 * margin)) {
         const fitHeight = pdfHeight - (2 * margin);
         const fitWidth = fitHeight * ratio;
         // Centraliza horizontalmente
         const xOffset = (pdfWidth - fitWidth) / 2;
         pdf.addImage(imgData, 'PNG', xOffset, margin, fitWidth, fitHeight);
      } else {
         pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, contentHeight);
      }

      const safeDate = new Date().toLocaleDateString().replace(/\//g, '-');
      pdf.save(`Diario_Xadrez_${safeDate}.pdf`);
      
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
               <h2 className="text-xl font-bold">Impressão do Diário</h2>
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
                  {isGenerating ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      <span>Gerando...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      <span>Baixar PDF</span>
                    </>
                  )}
               </button>
             </div>
          </div>

          {/* Scrollable Preview - Wide for Landscape */}
          <div className="flex-1 overflow-auto bg-slate-200 p-8 flex justify-center">
             
             {/* THE PAPER (A4 Landscape: 297mm x 210mm) */}
             <div 
               ref={printRef} 
               className="bg-white shadow-2xl mx-auto flex flex-col relative" 
               style={{ width: '297mm', minHeight: '210mm', padding: '15mm', boxSizing: 'border-box' }}
             >
                {/* Document Header */}
                <div className="border-b-2 border-black pb-4 mb-4 text-center">
                   <h1 className="font-bold text-lg uppercase tracking-wide text-black">{data.header.government}</h1>
                   <h2 className="font-bold text-md uppercase text-black">{data.header.city}</h2>
                   <h3 className="text-sm font-semibold uppercase mt-1 text-black">{data.header.department}</h3>
                   <h3 className="text-sm font-bold uppercase mt-2 text-black">{data.header.school}</h3>
                </div>

                <div className="text-center mb-6 flex justify-between items-end border-b border-gray-300 pb-2">
                   <div className="text-left">
                     <p className="text-xs font-bold uppercase text-gray-600">Projeto</p>
                     <p className="font-bold uppercase text-black">{data.header.project}</p>
                   </div>
                   <div className="text-center">
                      <h2 className="font-black text-2xl uppercase underline text-black">Diário de Classe</h2>
                   </div>
                   <div className="text-right">
                     <p className="text-xs font-bold uppercase text-gray-600">Professor</p>
                     <p className="font-bold uppercase text-black">{data.header.professor}</p>
                   </div>
                </div>

                {/* Log Entries Grid for Landscape (Better use of width) */}
                <div className="w-full flex-1">
                  {data.log.map((entry, idx) => (
                    <div key={idx} className="mb-4 border border-black break-inside-avoid shadow-sm">
                       <div className="bg-gray-100 border-b border-black p-2 flex justify-between items-center">
                          <div className="flex gap-4">
                            <span className="font-bold text-sm text-black border-r border-gray-400 pr-4">DATA: {entry.date}</span>
                            <span className="text-xs font-bold uppercase text-black">
                              TURMAS: {entry.classes && entry.classes.length > 0 ? entry.classes.join(', ') : 'Geral'}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-gray-500">REGISTRO #{idx + 1}</span>
                       </div>
                       <div className="p-3 text-sm text-justify leading-relaxed text-black bg-white">
                          <ul className="list-none space-y-1">
                            {entry.activities.map((act, i) => (
                              <li key={i} className="text-black flex items-start">
                                <span className="mr-2 mt-1.5 w-1 h-1 bg-black rounded-full block shrink-0"></span>
                                {act}
                              </li>
                            ))}
                          </ul>
                       </div>
                    </div>
                  ))}
                </div>

                {/* Footer Signatures */}
                <div className="mt-auto pt-8 flex justify-between items-end">
                   <div className="text-center w-64">
                      <div className="border-b border-black mb-1"></div>
                      <p className="text-[10px] uppercase text-black font-bold">Assinatura do Professor</p>
                   </div>
                   <div className="text-center w-64">
                      <div className="border-b border-black mb-1"></div>
                      <p className="text-[10px] uppercase text-black font-bold">Coordenação Pedagógica</p>
                   </div>
                   <div className="text-center w-64">
                      <div className="border-b border-black mb-1"></div>
                      <p className="text-[10px] uppercase text-black font-bold">Direção</p>
                   </div>
                </div>

                <div className="absolute bottom-4 left-0 w-full text-center">
                   <p className="text-[8px] text-gray-500">Sistema Clube do Xadrez - Gerado em {new Date().toLocaleDateString()}</p>
                </div>
             </div>
          </div>
       </div>
    </div>
  )
};