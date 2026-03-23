import React, { useState } from 'react';
import { GalleryImage, GalleryData } from '../types';

interface GalleryViewProps {
  onBack: () => void;
  data: GalleryData;
  setData: React.Dispatch<React.SetStateAction<GalleryData>>;
}

export const GalleryView: React.FC<GalleryViewProps> = ({ onBack, data, setData }) => {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const defaultImages: GalleryImage[] = [
    {
      id: 'schedule',
      title: 'Quadro de Horários',
      url: '/quadro_horarios.png',
      description: 'Cronograma semanal das aulas de Xadrez.',
      createdAt: Date.now()
    },
    {
      id: 'abc',
      title: 'O ABC do Xadrez',
      url: '/abc_xadrez.png',
      description: 'Movimentos, regras básicas e notação.',
      createdAt: Date.now()
    },
    {
      id: 'rules_vibrant',
      title: 'Regras da Aula (Colorido)',
      url: '/regras_vibrante.png',
      description: 'Silêncio absoluto e regras de vitória.',
      createdAt: Date.now()
    },
    {
      id: 'rules_brown',
      title: 'Regras da Sala (Clássico)',
      url: '/regras_marrom.png',
      description: 'Proibições e combinados em Libras.',
      createdAt: Date.now()
    }
  ];

  const images = data.images && data.images.length > 0 ? data.images : defaultImages;

  const handleAddImage = () => {
    if (!newTitle || !newUrl) {
      alert("Por favor, preencha o título e selecione uma imagem.");
      return;
    }

    const newImage: GalleryImage = {
      id: Date.now().toString(),
      title: newTitle,
      url: newUrl,
      description: newDesc,
      createdAt: Date.now()
    };

    const currentImages = data.images && data.images.length > 0 ? data.images : defaultImages;

    setData({
      images: [...currentImages, newImage]
    });

    setNewTitle('');
    setNewUrl('');
    setNewDesc('');
    setIsAddModalOpen(false);
  };

  const handleDeleteImage = (id: string) => {
    if (window.confirm("Deseja realmente excluir esta imagem da galeria?")) {
      const currentImages = data.images && data.images.length > 0 ? data.images : defaultImages;
      setData({
        images: currentImages.filter(img => img.id !== id)
      });
      setSelectedImage(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("A imagem é muito grande. Por favor, escolha uma imagem menor que 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-24">
      <div className="flex flex-col space-y-4 mb-8">
        <div className="flex items-center justify-between">
          <button 
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all active:scale-90"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="flex space-x-2">
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white shadow-lg active:scale-95 transition-transform"
              title="Adicionar Foto"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></button>
          </div>
        </div>
        <h2 className="text-4xl font-light text-white tracking-tight px-2">Galeria</h2>
      </div>

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
                (e.target as HTMLImageElement).src = "https://placehold.co/400x400/1e293b/ffffff?text=Erro+Imagem";
              }}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
          </div>
        ))}
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-white/10 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-bold text-white">Adicionar à Galeria</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Título</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-800 border border-white/10 rounded-lg p-3 text-white outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Foto da Turma 601"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Imagem</label>
                  <div className="flex flex-col space-y-2">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="gallery-file-input"
                    />
                    <label 
                      htmlFor="gallery-file-input"
                      className="w-full bg-slate-800 border-2 border-dashed border-white/10 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500/50 transition-colors"
                    >
                      {newUrl ? (
                        <div className="flex items-center justify-center space-x-2 text-green-400">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          <span className="text-sm font-medium">Imagem selecionada</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center space-y-1 text-slate-400">
                          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          <span className="text-sm">Clique para escolher foto</span>
                        </div>
                      )}
                    </label>
                    <div className="text-center text-slate-500 text-[10px]">OU COLE UMA URL ABAIXO</div>
                    <input 
                      type="text" 
                      className="w-full bg-slate-800 border border-white/10 rounded-lg p-2 text-xs text-white outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://exemplo.com/imagem.png"
                      value={newUrl}
                      onChange={e => setNewUrl(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Descrição (Opcional)</label>
                  <textarea 
                    className="w-full bg-slate-800 border border-white/10 rounded-lg p-3 text-white outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                    placeholder="Breve descrição da foto..."
                    value={newDesc}
                    onChange={e => setNewDesc(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-400 hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleAddImage}
                  className="flex-1 px-4 py-3 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg transition-colors"
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedImage && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in fade-in zoom-in-95 duration-200">
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
              <button 
                onClick={() => handleDeleteImage(selectedImage.id)}
                className="text-red-500"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          </div>
          
          <div className="flex-1 flex items-center justify-center overflow-hidden">
            <img 
              src={selectedImage.url} 
              alt={selectedImage.title}
              className="max-w-full max-h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="p-6 bg-gradient-to-t from-black/80 to-transparent text-center">
            <h3 className="text-xl font-bold text-white mb-1">{selectedImage.title}</h3>
            <p className="text-slate-400 text-sm">{selectedImage.description}</p>
          </div>
        </div>
      )}
    </div>
  );
};
