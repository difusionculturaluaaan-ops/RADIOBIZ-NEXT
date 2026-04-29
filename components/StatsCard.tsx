interface StatsCardProps {
  number: string | number;
  label: string;
}

export default function StatsCard({ number, label }: StatsCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-8 border border-zinc-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-shadow">
      <div className="text-4xl font-bold text-zinc-900 dark:text-white mb-2">
        {number}
      </div>
      <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
        {label}
      </div>
    </div>
  );
}
