'use client';

import Sidebar from '@/components/Sidebar';

export default function ControlRemotoPage() {
  const clients = ['LA CABAÑA', 'AUTOZONE', 'GYM', 'CARNES LA CALZADA', 'DEMO GENERAL'];
  const selectedClient = 'LA CABAÑA';

  return (
    <div className="flex bg-black min-h-screen">
      <Sidebar />

      <main className="flex-1 ml-48 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-1">Control remoto</h1>
          <p className="text-sm text-zinc-400">Desde la transmisión en vivo ppal</p>
        </div>

        {/* Client Selector */}
        <div className="mb-8">
          <p className="text-xs text-zinc-400 uppercase mb-4">Selecciona un cliente</p>
          <div className="flex gap-3 flex-wrap">
            {clients.map((client) => (
              <button
                key={client}
                className={`px-6 py-2 rounded-full font-medium transition-colors ${
                  client === selectedClient
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-zinc-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                📻 {client}
              </button>
            ))}
          </div>
        </div>

        {/* Play Button */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">▶ Reproducir</h2>
        </div>

        {/* Control Buttons */}
        <div className="grid grid-cols-2 gap-6 mb-12">
          <button className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 hover:bg-slate-700/50 transition-colors text-center">
            <span className="text-4xl mb-2 block">▶️</span>
            <span className="text-green-400 font-bold">Play/Pause</span>
          </button>
          <button className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 hover:bg-slate-700/50 transition-colors text-center">
            <span className="text-4xl mb-2 block">🔊</span>
            <span className="text-red-400 font-bold">Forzar anuncio</span>
          </button>
          <button className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 hover:bg-slate-700/50 transition-colors text-center">
            <span className="text-4xl mb-2 block">🔄</span>
            <span className="text-gray-400 font-bold">Sync Drive</span>
          </button>
          <button className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 hover:bg-slate-700/50 transition-colors text-center">
            <span className="text-4xl mb-2 block">🔴</span>
            <span className="text-red-400 font-bold">Bloquear</span>
          </button>
        </div>

        {/* Sliders */}
        <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700 mb-8">
          {/* Volume */}
          <div className="mb-8">
            <div className="flex justify-between mb-3">
              <p className="text-xs text-zinc-400 uppercase">Volumen</p>
              <span className="text-sm text-zinc-300">85%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              defaultValue="85"
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
          </div>

          {/* Intervalo Anuncios */}
          <div className="mb-8">
            <div className="flex justify-between mb-3">
              <p className="text-xs text-zinc-400 uppercase">Intervalo anuncios</p>
              <span className="text-sm text-zinc-300">10 min</span>
            </div>
            <input
              type="range"
              min="1"
              max="60"
              defaultValue="10"
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
          </div>

          <button className="w-full bg-white hover:bg-zinc-100 text-black font-bold py-2 rounded-lg transition-colors">
            Aplicar
          </button>
        </div>

        {/* Activity */}
        <div>
          <p className="text-xs text-zinc-400 uppercase mb-3">Actividad</p>
          <a href="#" className="text-cyan-400 hover:text-cyan-300 text-sm">
            Dashboard Firebase listo
          </a>
        </div>
      </main>
    </div>
  );
}
