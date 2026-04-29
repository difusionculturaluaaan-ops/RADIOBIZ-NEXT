'use client';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-8 w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-orange-400 rounded-3xl flex items-center justify-center">
            <span className="text-3xl">📻</span>
          </div>
          <h1 className="text-4xl font-bold text-white">RadioBiz</h1>
          <p className="text-sm text-zinc-500">Dashboard de administración</p>
        </div>

        {/* Theme Toggle */}
        <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-orange-400 rounded-full text-sm transition-colors">
          <span>🌙</span>
          <span>Modo claro</span>
        </button>

        {/* Login Card */}
        <div className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-2">Acceso al dashboard</h2>
          <p className="text-zinc-400 text-sm mb-6">Ingresa tus credenciales</p>

          <form className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            <input
              type="password"
              placeholder="Contraseña"
              className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-colors"
            >
              Entrar →
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
