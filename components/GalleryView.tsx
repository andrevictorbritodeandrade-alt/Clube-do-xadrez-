import React, { useState } from 'react';

interface GalleryImage {
  id: string;
  title: string;
  url: string;
  description: string;
}

interface GalleryViewProps {
  onBack: () => void;
}

export const GalleryView: React.FC<GalleryViewProps> = ({ onBack }) => {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  const images: GalleryImage[] = [
    {
      id: 'schedule',
      title: 'Quadro de Horários',
      url: 'https://ais-dev-3ggu3a6a2x6uszjtczam6k-70841264505.us-east1.run.app/schedule_board.png',
      description: 'Cronograma semanal das aulas de Xadrez.'
    },
    {
      id: 'rules1',
      title: 'Regras da Aula',
      url: 'https://ais-dev-3ggu3a6a2x6uszjtczam6k-70841264505.us-east1.run.app/rules_lesson.png',
      description: 'Silêncio absoluto e regras de vitória.'
    },
    {
      id: 'rules2',
      title: 'Regras da Sala',
      url: 'https://ais-dev-3ggu3a6a2x6uszjtczam6k-70841264505.us-east1.run.app/rules_room.png',
      description: 'Proibições e combinados em Libras.'
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={onBack}
          className="px-5 py-2.5 bg-slate-900/80 backdrop-blur-md rounded-full text-white font-bold transition-all shadow-lg hover:bg-slate-800 flex items-center w-fit active:scale-95 border border-white/10"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Voltar
        </button>
        <h2 className="text-2xl font-black text-white uppercase tracking-tight drop-shadow-md">Galeria</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((img) => (
          <div 
            key={img.id}
            onClick={() => setSelectedImage(img)}
            className="glass-panel overflow-hidden rounded-2xl cursor-pointer group hover:scale-[1.02] transition-all duration-300 border border-white/20 shadow-xl"
          >
            <div className="aspect-video w-full overflow-hidden bg-slate-800">
              <img 
                src={img.url} 
                alt={img.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-4 bg-white/90 backdrop-blur-md">
              <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">{img.title}</h3>
              <p className="text-slate-500 text-sm font-medium">{img.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox / Fullscreen Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
          <button 
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-10"
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          
          <div className="relative w-full max-w-6xl h-full flex flex-col items-center justify-center">
            <img 
              src={selectedImage.url} 
              alt={selectedImage.title}
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
              referrerPolicy="no-referrer"
            />
            <div className="mt-8 text-center space-y-2">
              <h3 className="text-3xl font-black text-white uppercase tracking-widest">{selectedImage.title}</h3>
              <p className="text-slate-300 text-lg font-medium">{selectedImage.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
