'use client';

import { useRef, useEffect, useState } from 'react';

interface PlayerCardProps {
  trackName: string;
  trackSource: string;
  playing: boolean;
  progress: number;
  currentTime: number;
  duration: number;
  musicVolume: number;
  adVolume: number;
  adPlaying: boolean;
  adTitle?: string;
  nextAdCountdown: number;
  onPlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onMusicVolumeChange: (volume: number) => void;
  onAdVolumeChange: (volume: number) => void;
  onForceAd: () => void;
  isFading?: boolean;
}

export default function PlayerCard({
  trackName,
  trackSource,
  playing,
  progress,
  currentTime,
  duration,
  musicVolume,
  adVolume,
  adPlaying,
  adTitle,
  nextAdCountdown,
  onPlayPause,
  onPrevious,
  onNext,
  onMusicVolumeChange,
  onAdVolumeChange,
  onForceAd,
  isFading,
}: PlayerCardProps) {
  const vinylRef = useRef<HTMLDivElement>(null);
  const [fadeProgress, setFadeProgress] = useState(0);

  // Animar vinilo cuando está reproduciendo
  useEffect(() => {
    if (playing && vinylRef.current) {
      vinylRef.current.style.animation = 'vspin 5s linear infinite';
    } else if (vinylRef.current) {
      vinylRef.current.style.animation = 'none';
    }
  }, [playing]);

  // Actualizar progreso de fade
  useEffect(() => {
    if (isFading) {
      const interval = setInterval(() => {
        setFadeProgress((prev) => (prev >= 100 ? 0 : prev + 1));
      }, 10);
      return () => clearInterval(interval);
    }
    setFadeProgress(0);
  }, [isFading]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const nextAdMins = Math.floor(nextAdCountdown / 60);
  const nextAdSecs = nextAdCountdown % 60;

  return (
    <div
      className={`relative bg-slate-800/50 rounded-3xl p-6 border transition-all overflow-hidden ${
        adPlaying ? 'border-orange-500/40 bg-orange-900/10' : 'border-slate-700 bg-slate-800/50'
      }`}
    >
      {/* Fondo gradiente de contexto */}
      <div
        className="absolute top-0 right-0 w-64 h-64 pointer-events-none transition-all"
        style={{
          borderRadius: '50%',
          background: adPlaying
            ? 'radial-gradient(circle, #ff6b351a 0%, transparent 70%)'
            : 'radial-gradient(circle, #7c6dfa0d 0%, transparent 70%)',
        }}
      />

      {/* Estilos para animación de vinilo */}
      <style>{`
        @keyframes vspin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div className="relative z-10">
        {/* Track Info */}
        <div className="flex items-center gap-4 mb-5">
          {/* Vinilo */}
          <div
            ref={vinylRef}
            className={`w-16 h-16 rounded-full border-2 flex items-center justify-center text-xl flex-shrink-0 transition-all ${
              adPlaying
                ? 'bg-conic-gradient border-orange-500/44 bg-orange-900/20'
                : 'bg-slate-700 border-slate-600'
            }`}
            style={{
              backgroundImage: !adPlaying
                ? 'conic-gradient(from 0deg, #1e293b, #0f172a, #1a1f2e, #1e293b)'
                : undefined,
            }}
          >
            {adPlaying ? '📢' : '🎵'}
          </div>

          {/* Metadatos */}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-white truncate">{trackName}</h2>
            <p className="text-xs text-zinc-400 font-mono">{trackSource}</p>
          </div>
        </div>

        {/* Fade bar */}
        {isFading && (
          <div className="h-1 bg-slate-700 rounded-full overflow-hidden mb-1">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-purple-600 transition-all"
              style={{ width: `${fadeProgress}%` }}
            />
          </div>
        )}

        {/* Progress bar */}
        <div className="bg-slate-700 h-1 rounded-full overflow-hidden mb-2">
          <div
            className={`h-full transition-all ${
              adPlaying
                ? 'bg-gradient-to-r from-orange-500 to-yellow-400'
                : 'bg-gradient-to-r from-purple-600 to-cyan-400'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Time display */}
        <div className="flex justify-between text-xs text-zinc-500 font-mono mb-4">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <button
            onClick={onPrevious}
            className="text-white hover:text-zinc-300 transition-colors p-2"
            title="Anterior"
          >
            ⏮
          </button>

          <button
            onClick={onPlayPause}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all ${
              adPlaying
                ? 'bg-gradient-to-br from-orange-500 to-yellow-400 text-white shadow-lg shadow-orange-500/50'
                : 'bg-gradient-to-br from-purple-600 to-purple-800 text-white shadow-lg shadow-purple-600/50'
            }`}
          >
            {playing ? '⏸' : '▶'}
          </button>

          <button
            onClick={onNext}
            className="text-white hover:text-zinc-300 transition-colors p-2"
            title="Siguiente"
          >
            ⏭
          </button>
        </div>

        {/* Volume Controls */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-zinc-500 w-16 flex-shrink-0 font-mono">
              Música
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={musicVolume}
              onChange={(e) => onMusicVolumeChange(Number(e.target.value))}
              className="flex-1 h-1 accent-purple-600 cursor-pointer"
            />
            <span className="text-xs text-zinc-500 w-8 text-right font-mono">{musicVolume}%</span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-zinc-500 w-16 flex-shrink-0 font-mono">
              Anuncio
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={adVolume}
              onChange={(e) => onAdVolumeChange(Number(e.target.value))}
              className="flex-1 h-1 accent-orange-500 cursor-pointer"
            />
            <span className="text-xs text-zinc-500 w-8 text-right font-mono">{adVolume}%</span>
          </div>
        </div>

        {/* Ad banner */}
        {adPlaying && (
          <div className="bg-gradient-to-r from-orange-500/20 to-yellow-400/10 border border-orange-500/40 rounded-2xl p-3 mb-3 flex items-center gap-3">
            <div className="text-xl flex-shrink-0">📢</div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-orange-400">{adTitle || 'ANUNCIO EN CURSO'}</h3>
              <p className="text-xs text-zinc-400 font-mono">Reproduciendo jingle...</p>
            </div>
          </div>
        )}

        {/* Next ad countdown */}
        <div className="flex items-center gap-2 bg-slate-700/50 rounded-lg p-3">
          <span className="text-xs text-zinc-400 font-mono">⏳ Próximo anuncio</span>
          <span className="text-sm font-bold text-amber-400 font-mono ml-auto">
            {nextAdMins}:{nextAdSecs.toString().padStart(2, '0')}
          </span>
          <button
            onClick={onForceAd}
            className="text-xs font-bold px-2 py-1 rounded border border-orange-500/40 text-orange-400 hover:bg-orange-500/10 transition-colors"
          >
            Forzar
          </button>
        </div>
      </div>
    </div>
  );
}
