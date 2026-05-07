'use client';

interface DriveFile {
  id: string;
  name: string;
  modifiedTime?: string;
}

interface JingleQueueProps {
  jingles: DriveFile[];
  currentJingleId?: string;
  nextJingleId?: string;
  loading?: boolean;
  onSync?: () => void;
  driveStatus?: 'connected' | 'connecting' | 'error';
  lastSync?: string;
  driveFolder?: string;
}

export default function JingleQueue({
  jingles,
  currentJingleId,
  nextJingleId,
  loading = false,
  onSync,
  driveStatus = 'connecting',
  lastSync,
  driveFolder,
}: JingleQueueProps) {
  const statusColors = {
    connected: 'text-green-400 bg-green-900/20',
    connecting: 'text-blue-400 bg-blue-900/20',
    error: 'text-red-400 bg-red-900/20',
  };

  return (
    <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wide">☁️ Cola de jingles</h3>
        <button
          onClick={onSync}
          disabled={loading}
          className="px-3 py-1 text-xs font-bold bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors disabled:opacity-50"
        >
          {loading ? '⏳ Sincronizando...' : '🔄 Sync'}
        </button>
      </div>

      {/* Drive Status */}
      <div className="space-y-2 mb-4 pb-4 border-b border-slate-700">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-500 font-mono">Drive</span>
          <span className={`px-2 py-1 rounded font-mono text-xs font-bold ${statusColors[driveStatus]}`}>
            {driveStatus === 'connected' && '✓ Conectado'}
            {driveStatus === 'connecting' && '⏳ Conectando...'}
            {driveStatus === 'error' && '✕ Error'}
          </span>
        </div>

        {driveFolder && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500 font-mono">Carpeta</span>
            <span className="text-zinc-300 font-mono truncate text-right">{driveFolder.substring(0, 20)}...</span>
          </div>
        )}

        {lastSync && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500 font-mono">Última sync</span>
            <span className="text-zinc-300 font-mono">{lastSync}</span>
          </div>
        )}
      </div>

      {/* Jingles List */}
      {loading ? (
        <div className="text-center py-6 text-zinc-400 text-xs">
          <div className="inline-block animate-spin">⏳</div>
          <p>Cargando jingles...</p>
        </div>
      ) : jingles.length === 0 ? (
        <div className="text-center py-6 text-zinc-400 text-xs">
          <p>Sin jingles disponibles</p>
          <p className="text-zinc-500 text-xs mt-1">Sube archivos MP3 a tu carpeta de Drive</p>
        </div>
      ) : (
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {jingles.map((jingle, index) => (
            <div
              key={jingle.id}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all ${
                jingle.id === currentJingleId
                  ? 'bg-orange-900/20 border border-orange-500/40 text-orange-300'
                  : jingle.id === nextJingleId
                    ? 'bg-purple-900/20 border border-purple-500/40 text-purple-300'
                    : 'bg-slate-700/50 border border-slate-600 text-zinc-400 hover:border-slate-500'
              }`}
            >
              {/* Icon */}
              <span className="flex-shrink-0">
                {jingle.id === currentJingleId && '🎙️'}
                {jingle.id === nextJingleId && '⏭️'}
                {jingle.id !== currentJingleId && jingle.id !== nextJingleId && '🎵'}
              </span>

              {/* Name */}
              <span className="flex-1 truncate font-mono">{jingle.name}</span>

              {/* Badge */}
              {(jingle.id === currentJingleId || jingle.id === nextJingleId) && (
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-black/40">
                  {jingle.id === currentJingleId && 'EN CURSO'}
                  {jingle.id === nextJingleId && 'PRÓXIMO'}
                </span>
              )}

              {/* Index */}
              {jingle.id !== currentJingleId && jingle.id !== nextJingleId && (
                <span className="px-1.5 text-xs text-zinc-600 font-mono">#{index + 1}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
