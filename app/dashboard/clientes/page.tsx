'use client';

import Sidebar from '@/components/Sidebar';

export default function ClientesPage() {
  const clients = [
    {
      id: '1',
      name: 'LA CABAÑA',
      driveFolder: '15UE3bqLgv95_LIF...',
      intervalo: 'Cada 5 min',
      estado: 'Sin conexiones',
      googleDriveUrl: 'https://i.co/aMvDyja',
      bloqueador: true,
    },
    {
      id: '2',
      name: 'AUTOZONE',
      driveFolder: '18_LFBbg1LBcR5...',
      intervalo: 'Cada 1 min',
      estado: 'Sin conexiones',
      googleDriveUrl: 'https://i.co/Y6dqp',
      bloqueador: false,
    },
    {
      id: '3',
      name: 'GYM',
      driveFolder: '1kvTDGG_cGDJMk...',
      intervalo: 'Cada 1 min',
      estado: 'Sin conexiones',
      googleDriveUrl: 'https://i.co/85sJqB',
      bloqueador: false,
    },
    {
      id: '4',
      name: 'CARNES LA CALZADA',
      driveFolder: '1ns5_DEJi-yBuYA...',
      intervalo: 'Cada 1 min',
      estado: 'Sin conexiones',
      googleDriveUrl: 'https://i.co/u0s',
      bloqueador: false,
    },
    {
      id: '5',
      name: 'DEMO GENERAL',
      driveFolder: '1ns5_DEJi-yBuYA...',
      intervalo: 'Cada 5 min',
      estado: 'Sin conexiones',
      googleDriveUrl: 'https://i.co/zDTmB',
      bloqueador: false,
    },
  ];

  return (
    <div className="flex bg-black min-h-screen">
      <Sidebar />

      <main className="flex-1 ml-48 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-1">Clientes</h1>
            <p className="text-sm text-zinc-400">Gestiona todos tus negocios</p>
          </div>
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full font-medium transition-colors">
            + Nuevo cliente
          </button>
        </div>

        {/* Clients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => (
            <div
              key={client.id}
              className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700 shadow-lg hover:shadow-xl transition-shadow"
            >
              {/* Client Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">📻</span>
                    <h3 className="text-xl font-bold text-white">{client.name}</h3>
                  </div>
                  <p className="text-xs text-zinc-400">26/7/2025</p>
                </div>
                {client.bloqueador && (
                  <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                    Bloqueador
                  </span>
                )}
              </div>

              {/* Drive Folder */}
              <div className="mb-4 pb-4 border-t border-b border-slate-700">
                <p className="text-xs text-zinc-400 uppercase mb-1">Drive Folder</p>
                <p className="text-xs text-zinc-300 font-mono">{client.driveFolder}</p>
              </div>

              {/* Intervalo */}
              <div className="mb-4">
                <p className="text-xs text-zinc-400 uppercase">Intervalo</p>
                <p className="text-sm text-white">{client.intervalo}</p>
              </div>

              {/* Estado */}
              <div className="mb-6">
                <p className="text-xs text-zinc-400 uppercase">Disponibles Correctados</p>
                <p className="text-sm text-zinc-300">🔴 {client.estado}</p>
              </div>

              {/* Google Drive URL */}
              <div className="mb-6">
                <a href="#" className="text-xs text-cyan-400 hover:text-cyan-300">
                  {client.googleDriveUrl}
                </a>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mb-4">
                <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium py-2 rounded-lg transition-colors">
                  Copiar
                </button>
                <button className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 rounded-lg transition-colors">
                  WA
                </button>
                <button className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-medium py-2 rounded-lg transition-colors">
                  QR
                </button>
                <button className="flex-1 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium py-2 rounded-lg transition-colors">
                  ⋮
                </button>
              </div>

              {/* Toggles */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked={false}
                    className="w-4 h-4 rounded bg-slate-700 border-slate-600"
                  />
                  <span className="text-xs text-cyan-400">Restablecer link</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked={false}
                    className="w-4 h-4 rounded bg-slate-700 border-slate-600"
                  />
                  <span className="text-xs text-zinc-400">Control remoto</span>
                </label>
              </div>
            </div>
          ))}

          {/* New Client Card */}
          <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700 border-dashed hover:border-slate-600 shadow-lg hover:shadow-xl transition-all cursor-pointer flex flex-col items-center justify-center gap-4 min-h-96">
            <span className="text-4xl">+</span>
            <h3 className="text-lg font-bold text-white">Nuevo cliente</h3>
            <p className="text-xs text-zinc-400">Agregar negocio</p>
          </div>
        </div>
      </main>
    </div>
  );
}
