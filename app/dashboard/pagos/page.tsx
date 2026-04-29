'use client';

import Sidebar from '@/components/Sidebar';

export default function PagosPage() {
  const statsCards = [
    { icon: '✅', number: 0, label: 'AL CORRIENTE', color: 'green' },
    { icon: '⏳', number: 5, label: 'PENDIENTES', color: 'gray' },
    { icon: '❌', number: 0, label: 'VENCIDOS', color: 'red' },
  ];

  const clients = [
    { name: 'LA CABAÑA', plan: 'Estándar', price: '$499/mes', status: 'Pendiente', lastPayment: 'Sin pagos registrados' },
    { name: 'AUTOZONE', plan: 'Estándar', price: '$499/mes', status: 'Pendiente', lastPayment: 'Sin pagos registrados' },
    { name: 'GYM', plan: 'Estándar', price: '$499/mes', status: 'Pendiente', lastPayment: 'Sin pagos registrados' },
    { name: 'CARNES LA CALZADA', plan: 'Estándar', price: '$499/mes', status: 'Pendiente', lastPayment: 'Sin pagos registrados' },
  ];

  return (
    <div className="flex bg-black min-h-screen">
      <Sidebar />

      <main className="flex-1 ml-48 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-1 flex items-center gap-2">
              💳 Pagos
            </h1>
            <p className="text-sm text-zinc-400">Registro de cobros y mensualidades</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-zinc-400">Total mensual</p>
            <p className="text-3xl font-bold text-cyan-400">$2,495</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-6 mb-12">
          {statsCards.map((stat, idx) => (
            <div key={idx} className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
              <div className="text-5xl font-bold text-white mb-2">{stat.number}</div>
              <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Clients Payment Status */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Estado de cuenta por cliente</h2>
          <div className="space-y-6">
            {clients.map((client, idx) => (
              <div key={idx} className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">📻</span>
                      <h3 className="text-lg font-bold text-white">{client.name}</h3>
                    </div>
                    <p className="text-xs text-zinc-400">
                      {client.plan} • {client.price}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full font-medium">
                    🔴 {client.status}
                  </span>
                </div>

                <div className="mb-4 py-3 border-t border-b border-slate-700">
                  <p className="text-xs text-zinc-400 uppercase mb-1">Último pago</p>
                  <p className="text-sm text-zinc-300">{client.lastPayment}</p>
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-lg transition-colors">
                    💳 Cobrar con CoDi
                  </button>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4 rounded" />
                    <span className="text-xs text-green-400">Pago manual</span>
                  </div>
                  <button className="px-4 py-3 hover:bg-slate-700 text-white rounded-lg transition-colors">
                    ⚙️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
