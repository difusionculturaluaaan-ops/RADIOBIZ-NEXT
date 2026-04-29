interface ClientCardProps {
  id: string;
  name: string;
  date: string;
  plan: string;
  price: string;
  status: 'sin-pago' | 'pagado' | 'pendiente';
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function ClientCard({ id, name, date, plan, price, status, onEdit, onDelete }: ClientCardProps) {
  const statusColor = {
    'sin-pago': 'bg-red-500',
    'pagado': 'bg-green-500',
    'pendiente': 'bg-yellow-500',
  };

  return (
    <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-8 border border-zinc-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-shadow">
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-1">
          {name}
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{date}</p>
      </div>

      <div className="mb-6 py-4 border-t border-b border-zinc-200 dark:border-slate-700">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          <span className="font-medium">{plan}</span> • <span className="font-semibold">${price}</span>
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${statusColor[status]}`}></span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">{status}</span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onEdit(id)}
            className="text-xs font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 px-3 py-1.5 rounded-lg transition-colors"
          >
            Editar
          </button>
          <button
            onClick={() => onDelete(id)}
            className="text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
