'use client';

interface LogEntry {
  timestamp: string;
  message: string;
  type: 'ok' | 'warn' | 'error' | 'info' | 'ad';
}

interface ActivityLogProps {
  entries?: LogEntry[];
  maxEntries?: number;
}

export default function ActivityLog({ entries = [], maxEntries = 20 }: ActivityLogProps) {
  const displayEntries = entries.slice(0, maxEntries);

  const typeStyles = {
    ok: 'text-green-400',
    warn: 'text-yellow-400',
    error: 'text-red-400',
    info: 'text-blue-400',
    ad: 'text-orange-400',
  };

  const typeIcons = {
    ok: '✓',
    warn: '⚠',
    error: '✕',
    info: 'ℹ',
    ad: '📢',
  };

  return (
    <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
      {/* Header */}
      <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wide mb-4">📋 Actividad</h2>

      {/* Log Entries */}
      <div className="space-y-1 max-h-48 overflow-y-auto font-mono text-xs">
        {displayEntries.length === 0 ? (
          <div className="text-center text-zinc-500 py-6">
            <p>Sin eventos</p>
          </div>
        ) : (
          displayEntries.map((entry, index) => (
            <div key={index} className="flex items-start gap-2 text-zinc-400 pb-1 border-b border-slate-700/50 last:border-0">
              <span className="text-xs flex-shrink-0 text-zinc-600 min-w-[60px]">{entry.timestamp}</span>
              <span className={`flex-shrink-0 ${typeStyles[entry.type]}`}>
                {typeIcons[entry.type]}
              </span>
              <span className="flex-1 text-zinc-300 break-words">{entry.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
