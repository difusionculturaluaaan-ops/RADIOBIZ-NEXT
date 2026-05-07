'use client';

import { useState, useEffect } from 'react';

interface SettingsPanelProps {
  clientName: string;
  adInterval: number;
  fadeDuration: number;
  isLocked?: boolean;
  onSave?: (settings: { clientName: string; adInterval: number; fadeDuration: number }) => void;
}

export default function SettingsPanel({
  clientName,
  adInterval,
  fadeDuration,
  isLocked = false,
  onSave,
}: SettingsPanelProps) {
  const [name, setName] = useState(clientName);
  const [interval, setInterval] = useState(adInterval);
  const [fade, setFade] = useState(fadeDuration);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setHasChanges(
      name !== clientName ||
      interval !== adInterval ||
      fade !== fadeDuration
    );
  }, [name, interval, fade, clientName, adInterval, fadeDuration]);

  const handleSave = () => {
    if (onSave) {
      onSave({
        clientName: name,
        adInterval: interval,
        fadeDuration: fade,
      });
      setHasChanges(false);
    }
  };

  const handleReset = () => {
    setName(clientName);
    setInterval(adInterval);
    setFade(fadeDuration);
    setHasChanges(false);
  };

  return (
    <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wide flex items-center gap-2">
          <span>⚙️ Configuración</span>
          {isLocked && <span className="text-xs px-2 py-0.5 bg-yellow-900/30 text-yellow-400 rounded">🔒 Bloqueado</span>}
        </h2>
      </div>

      {/* Settings Form */}
      <div className="space-y-4">
        {/* Client Name */}
        <div>
          <label className="text-xs font-bold text-zinc-400 block mb-2 uppercase tracking-wide">
            Nombre del cliente
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLocked}
            className={`w-full px-3 py-2 rounded-lg text-sm font-mono transition-colors ${
              isLocked
                ? 'bg-slate-700 border border-slate-600 text-zinc-500 cursor-not-allowed opacity-60'
                : 'bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-purple-500'
            }`}
            placeholder="Mi Negocio"
          />
        </div>

        {/* Ad Interval */}
        <div>
          <label className="text-xs font-bold text-zinc-400 block mb-2 uppercase tracking-wide">
            Intervalo de anuncios
          </label>
          <select
            value={interval}
            onChange={(e) => setInterval(Number(e.target.value))}
            disabled={isLocked}
            className={`w-full px-3 py-2 rounded-lg text-sm font-mono transition-colors ${
              isLocked
                ? 'bg-slate-700 border border-slate-600 text-zinc-500 cursor-not-allowed opacity-60'
                : 'bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-purple-500'
            }`}
          >
            {[1, 5, 10, 15, 20, 30, 60].map((min) => (
              <option key={min} value={min}>
                Cada {min} minuto{min !== 1 ? 's' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Fade Duration */}
        <div>
          <label className="text-xs font-bold text-zinc-400 block mb-2 uppercase tracking-wide">
            Fade in/out
          </label>
          <select
            value={fade}
            onChange={(e) => setFade(Number(e.target.value))}
            disabled={isLocked}
            className={`w-full px-3 py-2 rounded-lg text-sm font-mono transition-colors ${
              isLocked
                ? 'bg-slate-700 border border-slate-600 text-zinc-500 cursor-not-allowed opacity-60'
                : 'bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-purple-500'
            }`}
          >
            {[0, 1, 2, 3, 5].map((sec) => (
              <option key={sec} value={sec}>
                {sec === 0 ? 'Sin fade' : `${sec} seg${sec !== 1 ? 's' : ''}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Actions */}
      {!isLocked && hasChanges && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-slate-700">
          <button
            onClick={handleSave}
            className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded transition-colors"
          >
            💾 Guardar
          </button>
          <button
            onClick={handleReset}
            className="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-bold rounded transition-colors"
          >
            ↶ Descartar
          </button>
        </div>
      )}

      {isLocked && (
        <div className="mt-4 pt-4 border-t border-slate-700 text-xs text-zinc-400 text-center font-mono">
          Configurado por RadioBiz — no se puede modificar
        </div>
      )}
    </div>
  );
}
