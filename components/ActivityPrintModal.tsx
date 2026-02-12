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
      const pdf = new jsPDF('p', 'mm', 'a4'); // Portrait
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgProps = pdf.getImageProperties(imgData);
      const ratio = imgProps.width / imgProps.height;
      
      const margin = 15; // Margem de 15mm
      const contentWidth = pdfWidth - (2 * margin);
      const contentHeight = contentWidth / ratio;

      // Se o conteúdo for maior que uma página, ajusta (simples scale to fit para este caso,
      // ou apenas imprime o que cabe. Para relatórios longos, seria ideal paginação,
      // mas html2canvas gera uma imagem única).
      if (contentHeight > pdfHeight - (2 * margin)) {
         // Ajusta para caber na altura se for muito longo (pode ficar pequeno)
         // Ou imprime multipágina (complexo com jsPDF puro sem quebrar texto).
         // Vamos priorizar a largura e deixar o PDF cortar se for gigante, 
         // ou o usuário imprime por partes.
         pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, contentHeight);
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
       <div className="flex flex-col h-full w-full max-w-5xl bg-white rounded-xl overflow-hidden shadow-2xl">
          
          {/* Header Toolbar */}
          <div className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-md z-10 shrink-0">
             <div>
               <h2 className="text-xl font-bold">Impressão do Diário</h2>
               <p className="text-xs text-slate-400">Verifique o layout antes de baixar.</p>
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

          {/* Scrollable Preview */}
          <div className="flex-1 overflow-auto bg-slate-200 p-8 flex justify-center">
             
             {/* THE PAPER (A4 Portrait) */}
             <div 
               ref={printRef} 
               className="bg-white shadow-2xl mx-auto flex flex-col relative" 
               style={{ width: '210mm', minHeight: '297mm', padding: '15mm', boxSizing: 'border-box' }}
             >
                {/* Document Header */}
                <div className="border-b-2 border-black pb-4 mb-4 text-center">
                   <h1 className="font-bold text-sm uppercase tracking-wide text-black">{data.header.government}</h1>
                   <h2 className="font-bold text-xs uppercase text-black">{data.header.city}</h2>
                   <h3 className="text-[10px] font-semibold uppercase mt-1 text-black">{data.header.department}</h3>
                   <h3 className="text-[10px] font-bold uppercase mt-2 text-black">{data.header.school}</h3>
                </div>

                <div className="text-center mb-6">
                   <h2 className="font-black text-xl uppercase underline mb-2 text-black">Diário de Classe - Xadrez</h2>
                   <p className="text-sm font-bold uppercase text-black">Prof. {data.header.professor}</p>
                </div>

                {/* Log Entries */}
                <div className="w-full flex-1">
                  {data.log.map((entry, idx) => (
                    <div key={idx} className="mb-4 border border-black break-inside-avoid">
                       <div className="bg-gray-100 border-b border-black p-2 flex justify-between items-center">
                          <span className="font-bold text-sm text-black">DATA: {entry.date}</span>
                          <span className="text-xs font-bold uppercase text-black">
                            TURMAS: {entry.classes && entry.classes.length > 0 ? entry.classes.join(', ') : 'Geral'}
                          </span>
                       </div>
                       <div className="p-3 text-sm text-justify leading-relaxed text-black">
                          {entry.activities.map((act, i) => (
                            <p key={i} className="mb-1 last:mb-0 text-black">• {act}</p>
                          ))}
                       </div>
                    </div>
                  ))}
                </div>

                {/* Footer Signatures */}
                <div className="mt-8 flex justify-between items-end pt-4">
                   <div className="text-center w-1/3">
                      <div className="border-b border-black mb-1"></div>
                      <p className="text-[10px] uppercase text-black">Assinatura do Professor</p>
                   </div>
                   <div className="text-center w-1/3">
                      <div className="border-b border-black mb-1"></div>
                      <p className="text-[10px] uppercase text-black">Coordenação Pedagógica</p>
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