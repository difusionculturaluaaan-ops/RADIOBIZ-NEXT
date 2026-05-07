'use client';

import { useState, useRef } from 'react';

interface MusicTabsProps {
  onSelectMp3: (file: File) => void;
  onSelectRadio: (url: string, name: string) => void;
  onSelectDrive: (folderId: string) => void;
  driveFiles?: Array<{ id: string; name: string }>;
  driveFolderId?: string;
  onLoadDrive?: (folderId: string) => void;
}

const RADIO_PRESETS = [
  { name: 'Groove Salad', url: 'https://ice1.somafm.com/groovesalad-256-mp3', emoji: '🌱' },
  { name: 'Drone Zone', url: 'https://ice1.somafm.com/dronezone-256-mp3', emoji: '🌙' },
  { name: '70s', url: 'https://ice1.somafm.com/seventies-128-mp3', emoji: '🕺' },
  { name: 'Rock', url: 'https://ice1.somafm.com/illstreet-128-mp3', emoji: '🎸' },
  { name: 'Folk', url: 'https://ice1.somafm.com/folkfwd-128-mp3', emoji: '🪕' },
  { name: 'Suave', url: 'https://ice1.somafm.com/lush-128-mp3', emoji: '🌸' },
];

type TabType = 'mp3' | 'radio' | 'drive';

export default function MusicTabs({
  onSelectMp3,
  onSelectRadio,
  onSelectDrive,
  driveFiles = [],
  driveFolderId = '',
  onLoadDrive,
}: MusicTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('mp3');
  const [radioUrl, setRadioUrl] = useState('');
  const [driveFolderInput, setDriveFolderInput] = useState(driveFolderId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMp3Upload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files[0]) {
      onSelectMp3(files[0]);
    }
  };

  const handleRadioPreset = (url: string, name: string) => {
    onSelectRadio(url, name);
  };

  const handleLoadRadio = () => {
    if (radioUrl.trim()) {
      onSelectRadio(radioUrl, radioUrl.split('/').pop() || 'Radio');
    }
  };

  const handleLoadDrive = () => {
    if (driveFolderInput.trim()) {
      onLoadDrive?.(driveFolderInput);
      onSelectDrive(driveFolderInput);
    }
  };

  return (
    <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('mp3')}
          className={`px-3 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'mp3'
              ? 'bg-purple-600/30 border border-purple-500/50 text-purple-300'
              : 'bg-slate-700 border border-slate-600 text-zinc-400 hover:text-white'
          }`}
        >
          📁 MP3
        </button>
        <button
          onClick={() => setActiveTab('radio')}
          className={`px-3 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'radio'
              ? 'bg-purple-600/30 border border-purple-500/50 text-purple-300'
              : 'bg-slate-700 border border-slate-600 text-zinc-400 hover:text-white'
          }`}
        >
          📡 Radio
        </button>
        <button
          onClick={() => setActiveTab('drive')}
          className={`px-3 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'drive'
              ? 'bg-purple-600/30 border border-purple-500/50 text-purple-300'
              : 'bg-slate-700 border border-slate-600 text-zinc-400 hover:text-white'
          }`}
        >
          ☁️ Drive
        </button>
      </div>

      {/* MP3 Panel */}
      {activeTab === 'mp3' && (
        <div className="space-y-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-lg transition-colors"
          >
            + Agregar MP3
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            multiple
            onChange={handleMp3Upload}
            style={{ display: 'none' }}
          />
          <div className="text-center text-xs text-zinc-400 py-4">
            Selecciona archivos de audio desde tu dispositivo
          </div>
        </div>
      )}

      {/* Radio Panel */}
      {activeTab === 'radio' && (
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400 block">Presets SomaFM</label>
            <div className="flex flex-wrap gap-2">
              {RADIO_PRESETS.map((preset) => (
                <button
                  key={preset.url}
                  onClick={() => handleRadioPreset(preset.url, preset.name)}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-zinc-300 text-xs font-bold rounded transition-colors"
                >
                  {preset.emoji} {preset.name}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-700 pt-3">
            <label className="text-xs font-bold text-zinc-400 block mb-2">URL personalizada</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={radioUrl}
                onChange={(e) => setRadioUrl(e.target.value)}
                placeholder="https://..."
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={handleLoadRadio}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-bold rounded transition-colors"
              >
                Cargar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Drive Panel */}
      {activeTab === 'drive' && (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-zinc-400 block mb-2">ID de carpeta de Drive</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={driveFolderInput}
                onChange={(e) => setDriveFolderInput(e.target.value)}
                placeholder="Pega el ID de tu carpeta..."
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-purple-500 font-mono"
              />
              <button
                onClick={handleLoadDrive}
                className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded transition-colors whitespace-nowrap"
              >
                🔍 Cargar
              </button>
            </div>
            <p className="text-xs text-zinc-500 mt-1">Pega el ID de tu carpeta con archivos MP3</p>
          </div>

          {driveFiles.length > 0 && (
            <div>
              <label className="text-xs font-bold text-zinc-400 block mb-2">
                Archivos · {driveFiles.length} canción{driveFiles.length !== 1 ? 's' : ''}
              </label>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {driveFiles.map((file) => (
                  <div
                    key={file.id}
                    className="px-3 py-2 bg-slate-700 rounded text-sm text-zinc-300 hover:bg-slate-600 cursor-pointer transition-colors truncate"
                    onClick={() => onSelectDrive(file.id)}
                  >
                    🎵 {file.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
