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
      url: '/quadro_horarios.png',
      description: 'Cronograma semanal das aulas de Xadrez.'
    },
    {
      id: 'abc',
      title: 'O ABC do Xadrez',
      url: '/abc_xadrez.png',
      description: 'Movimentos, regras básicas e notação.'
    },
    {
      id: 'rules_vibrant',
      title: 'Regras da Aula (Colorido)',
      url: '/regras_vibrante.png',
      description: 'Silêncio absoluto e regras de vitória.'
    },
    {
      id: 'rules_brown',
      title: 'Regras da Sala (Clássico)',
      url: '/regras_marrom.png',
      description: 'Proibições e combinados em Libras.'
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-24">
      {/* Header Estilo Samsung */}
      <div className="flex flex-col space-y-4 mb-8">
        <div className="flex items-center justify-between">
          <button 
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all active:scale-90"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="flex space-x-2">
            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></button>
            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg></button>
          </div>
        </div>
        <h2 className="text-4xl font-light text-white tracking-tight px-2">Galeria</h2>
      </div>

      {/* Grid de Fotos */}
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1 md:gap-2">
        {images.map((img) => (
          <div 
            key={img.id}
            onClick={() => setSelectedImage(img)}
            className="aspect-square relative overflow-hidden cursor-pointer group active:opacity-70 transition-opacity"
          >
            <img 
              src={img.url} 
              alt={img.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://placehold.co/400x400/1e293b/ffffff?text=Pendente+Upload";
              }}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
          </div>
        ))}
      </div>

      {/* Visualizador Fullscreen (Estilo Samsung) */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in fade-in zoom-in-95 duration-200">
          {/* Top Bar */}
          <div className="flex items-center justify-between p-4 z-10 bg-gradient-to-b from-black/50 to-transparent">
            <button 
              onClick={() => setSelectedImage(null)}
              className="w-10 h-10 flex items-center justify-center text-white"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div className="flex space-x-4">
              <button className="text-white"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg></button>
              <button className="text-white"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
              <button className="text-white"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
            </div>
          </div>
          
          {/* Imagem Central */}
          <div className="flex-1 flex items-center justify-center overflow-hidden">
            <img 
              src={selectedImage.url} 
              alt={selectedImage.title}
              className="max-w-full max-h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Bottom Info */}
          <div className="p-6 bg-gradient-to-t from-black/80 to-transparent text-center">
            <h3 className="text-xl font-bold text-white mb-1">{selectedImage.title}</h3>
            <p className="text-slate-400 text-sm">{selectedImage.description}</p>
          </div>
        </div>
      )}
    </div>
  );
};
