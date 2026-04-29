'use client';

import Sidebar from '@/components/Sidebar';

export default function ConfigPage() {
  return (
    <div className="flex bg-black min-h-screen">
      <Sidebar />

      <main className="flex-1 ml-48 p-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white">Configuración</h1>
        </div>

        {/* Config Sections */}
        <div className="space-y-6 max-w-2xl">
          {/* Security */}
          <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
            <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              🔒 Seguridad
            </h2>
            <p className="text-sm text-zinc-400 mb-4">
              Autenticado con Firebase Auth. Para cambiar contraseña usa la consola de Firebase.
            </p>
            <button className="w-full bg-white hover:bg-zinc-100 text-black font-bold py-2 rounded-lg transition-colors">
              🔓 Cerrar sesión
            </button>
          </div>

          {/* Player URL */}
          <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
            <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              📱 URL del Reproductor
            </h2>
            <p className="text-xs text-zinc-400 uppercase mb-4">URL del reproductor del cliente (player url)</p>
            <input
              type="text"
              defaultValue="https://radiobiz-pro.vercel.app/player/cliente"
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-purple-600"
              readOnly
            />
            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded-lg transition-colors">
              ⬇️ Guardar URL
            </button>
          </div>

          {/* Firebase */}
          <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
            <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              🔥 Firebase
            </h2>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-white font-medium">Conectado a ProRadioBiz</span>
            </div>
            <p className="text-sm text-zinc-400">
              Los clientes se sincronizan en tiempo real entre todos los dispositivos automáticamente.
            </p>
          </div>

          {/* Maintenance */}
          <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
            <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              ⚙️ Mantenimiento
            </h2>
            <p className="text-sm text-zinc-400 mb-4">
              Última sesiones de dispositivos que no se conectan hace 10 días.
            </p>
            <button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 rounded-lg transition-colors">
              🔧 Limpiar sesiones viejas
            </button>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-900/20 rounded-2xl p-8 border border-red-900/50">
            <h2 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
              ⚠️ Zona de Peligro
            </h2>
            <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg transition-colors">
              Eliminar todos los clientes
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
