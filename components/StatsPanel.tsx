'use client';

interface StatsPanelProps {
  adsToday: number;
  currentJingle?: string;
  driveFileCount: number;
  adInterval: number;
}

export default function StatsPanel({
  adsToday,
  currentJingle,
  driveFileCount,
  adInterval,
}: StatsPanelProps) {
  return (
    <div>
      <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wide mb-3 flex items-center gap-2">
        <span>📊 Estadísticas</span>
      </h2>

      <div className="grid grid-cols-3 gap-3">
        {/* Ads Today */}
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 text-center">
          <div className="text-3xl font-bold text-purple-400 mb-1">{adsToday}</div>
          <p className="text-xs text-zinc-400 font-mono">Anuncios hoy</p>
        </div>

        {/* Current Jingle */}
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 text-center">
          <div className="text-lg font-bold text-orange-400 mb-1 truncate px-2">
            {currentJingle ? currentJingle.substring(0, 15) : '—'}
          </div>
          <p className="text-xs text-zinc-400 font-mono">Jingle actual</p>
        </div>

        {/* Drive Files */}
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 text-center">
          <div className="text-3xl font-bold text-cyan-400 mb-1">{driveFileCount}</div>
          <p className="text-xs text-zinc-400 font-mono">En Drive</p>
        </div>
      </div>

      {/* Ad Interval Info */}
      <div className="mt-3 bg-slate-700/30 rounded-lg p-3 border border-slate-700/50">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-400 font-mono">Intervalo de anuncios</span>
          <span className="font-bold text-white">{adInterval} min</span>
        </div>
      </div>
    </div>
  );
}
