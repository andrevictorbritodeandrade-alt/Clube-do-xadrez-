import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ClassData, Student } from '../types';

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  classData: ClassData;
  dateStr: string;
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({ isOpen, onClose, classData, dateStr }) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Stats helper
  const getStats = (student: Student) => {
    const totalDays = Object.keys(student.attendance).length;
    if (totalDays === 0) return { pCount: 0, pPercent: 0 };
    const pCount = Object.values(student.attendance).filter(v => v === 'P').length;
    return {
      pCount,
      pPercent: Math.round((pCount / totalDays) * 100)
    };
  };

  const handleDownloadPdf = async () => {
    if (!printRef.current) return;
    setIsGenerating(true);

    try {
      // Create canvas from the print element
      const canvas = await html2canvas(printRef.current, {
        scale: 2, // High resolution
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      
      // Landscape A4
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgProps = pdf.getImageProperties(imgData);
      const ratio = imgProps.width / imgProps.height;
      
      // Calculate dimensions to fill page with margins
      const margin = 10;
      const contentWidth = pdfWidth - (2 * margin);
      const contentHeight = contentWidth / ratio;

      pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, contentHeight);
      pdf.save(`Relatorio_${classData.name.replace(/\s/g, '_')}_${dateStr.replace('/', '-')}.pdf`);
      
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
        
        {/* Toolbar */}
        <div className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-md z-10 shrink-0">
          <div>
            <h2 className="text-xl font-bold">Visualização de Impressão</h2>
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
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg flex items-center space-x-2 transition-transform transform active:scale-95 disabled:opacity-50 disabled:cursor-wait"
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Gerando PDF...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  <span>Baixar PDF (Paisagem)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Scrollable Preview Area */}
        <div className="flex-1 overflow-auto bg-slate-200 p-8 flex justify-center">
          {/* THE PAPER */}
          <div 
            ref={printRef}
            className="bg-white shadow-2xl mx-auto flex flex-col relative"
            style={{ 
              width: '297mm', // A4 Landscape width
              minHeight: '210mm', // A4 Landscape height
              padding: '15mm',
              boxSizing: 'border-box'
            }}
          >
             {/* DOCUMENT HEADER */}
             <div className="border-b-2 border-black pb-4 mb-4 text-center">
                <h1 className="font-bold text-lg uppercase tracking-wide">Governo do Estado do Rio de Janeiro</h1>
                <h2 className="font-bold text-md uppercase">Prefeitura Municipal de Maricá</h2>
                <h3 className="text-sm font-semibold uppercase mt-1">Secretaria Municipal de Educação</h3>
                <h3 className="text-sm font-bold uppercase mt-2">Escola Municipal Joana Benedicta Rangel</h3>
             </div>

             {/* INFO BAR */}
             <div className="flex justify-between items-center bg-gray-100 border border-gray-300 p-3 mb-6">
                <div className="text-sm">
                   <span className="font-bold">PROJETO:</span> INICIAÇÃO AO XADREZ
                </div>
                <div className="text-sm">
                   <span className="font-bold">PROFESSOR:</span> ANDRÉ BRITO
                </div>
                <div className="text-sm">
                   <span className="font-bold">TURMA:</span> {classData.name.toUpperCase()}
                </div>
                <div className="text-sm">
                   <span className="font-bold">DATA IMPRESSÃO:</span> {dateStr}
                </div>
             </div>

             <h2 className="text-center font-black text-xl uppercase mb-6 underline">Relatório de Frequência e Performance</h2>

             {/* TABLE */}
             <div className="flex-grow">
               <table className="w-full text-sm border-collapse border border-black">
                 <thead>
                   <tr className="bg-gray-200 text-black uppercase text-xs font-bold">
                     <th className="border border-black px-2 py-2 w-16 text-center">Nº</th>
                     <th className="border border-black px-4 py-2 text-left">Nome do Aluno</th>
                     <th className="border border-black px-2 py-2 w-24 text-center">Presenças</th>
                     <th className="border border-black px-2 py-2 w-24 text-center">% Freq.</th>
                     <th className="border border-black px-2 py-2 w-32 text-center">Assinatura / Obs</th>
                   </tr>
                 </thead>
                 <tbody>
                   {classData.students.map((student, index) => {
                     const stats = getStats(student);
                     return (
                       <tr key={student.id} className="even:bg-gray-50">
                         <td className="border border-black px-2 py-1.5 text-center font-bold">{index + 1}</td>
                         <td className="border border-black px-4 py-1.5 uppercase font-medium">{student.name}</td>
                         <td className="border border-black px-2 py-1.5 text-center">{stats.pCount}</td>
                         <td className="border border-black px-2 py-1.5 text-center font-bold">
                           {stats.pPercent}%
                         </td>
                         <td className="border border-black px-2 py-1.5"></td>
                       </tr>
                     );
                   })}
                 </tbody>
               </table>
             </div>

             {/* FOOTER STATS SUMMARY */}
             <div className="mt-8 flex justify-between items-end border-t border-black pt-4">
                <div className="text-xs">
                   <p className="font-bold mb-1">RESUMO DA TURMA:</p>
                   <p>Total de Alunos: {classData.students.length}</p>
                   <p>Média de Frequência: {Math.round(classData.students.reduce((acc, s) => acc + getStats(s).pPercent, 0) / classData.students.length)}%</p>
                </div>
                
                <div className="text-center">
                   <div className="w-64 border-b border-black mb-1"></div>
                   <p className="text-xs font-bold uppercase">Assinatura do Professor</p>
                </div>
             </div>

             <div className="absolute bottom-4 left-0 w-full text-center">
                <p className="text-[10px] text-gray-500">Sistema Clube do Xadrez - Gerado em {new Date().toLocaleDateString()} às {new Date().toLocaleTimeString()}</p>
             </div>

          </div>
        </div>
      </div>
    </div>
  );
};