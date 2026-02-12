import React, { useState } from 'react';
import { saveConfig } from '../services/firebaseService';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({ isOpen, onClose }) => {
  const [jsonConfig, setJsonConfig] = useState('');

  const handleSave = () => {
    try {
      // Tenta limpar o input caso o usuário cole o objeto JS em vez de JSON puro
      let cleanJson = jsonConfig;
      if (!cleanJson.startsWith('{') && cleanJson.includes('apiKey')) {
         // Tentativa básica de extrair objeto de um snippet de código
         alert("Por favor, cole apenas o objeto JSON de configuração entre { }.");
         return;
      }

      const config = JSON.parse(cleanJson);
      saveConfig(config);
      onClose();
    } catch (e) {
      alert("Erro ao ler JSON. Certifique-se de que é um formato JSON válido.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden">
        <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
          <h2 className="text-xl font-bold">Conectar Banco de Dados</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600">
            Para ativar a sincronização em tempo real entre dispositivos, crie um projeto no <a href="https://console.firebase.google.com" target="_blank" className="text-blue-600 underline">Firebase Console</a>, crie um Web App e cole o objeto <code>firebaseConfig</code> abaixo.
          </p>
          <p className="text-xs text-slate-500 bg-slate-100 p-2 rounded">
            Dica: Certifique-se de habilitar o <strong>Firestore Database</strong> e a <strong>Authentication (Anonymous)</strong> no painel do Firebase.
          </p>
          <textarea
            className="w-full h-48 p-4 font-mono text-xs border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder='{
  "apiKey": "AIzaSy...",
  "authDomain": "seu-projeto.firebaseapp.com",
  "projectId": "seu-projeto",
  "storageBucket": "seu-projeto.appspot.com",
  "messagingSenderId": "...",
  "appId": "..."
}'
            value={jsonConfig}
            onChange={(e) => setJsonConfig(e.target.value)}
          />
          <div className="flex justify-end space-x-3">
            <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
            <button onClick={handleSave} className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-md transition-transform transform active:scale-95">
              Salvar e Conectar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};