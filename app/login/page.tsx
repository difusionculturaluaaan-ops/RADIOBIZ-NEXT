'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(true);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!auth) throw new Error('Firebase no inicializado');
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (err: any) {
      const message = err?.code === 'auth/invalid-credential'
        ? 'Email o contraseña incorrectos'
        : 'Error al iniciar sesión';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={isDark ? 'bg-black' : 'bg-white'}>
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-8 w-full max-w-md px-4">
          {/* Logo */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-orange-400 rounded-3xl flex items-center justify-center">
              <span className="text-3xl">📻</span>
            </div>
            <h1 className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>RadioBiz</h1>
            <p className={isDark ? 'text-zinc-500' : 'text-zinc-400'}>Dashboard de administración</p>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-colors ${
              isDark
                ? 'bg-zinc-900 hover:bg-zinc-800 text-orange-400'
                : 'bg-zinc-100 hover:bg-zinc-200 text-purple-600'
            }`}
          >
            <span>{isDark ? '🌙' : '☀️'}</span>
            <span>{isDark ? 'Modo claro' : 'Modo oscuro'}</span>
          </button>

          {/* Login Card */}
          <div className={`w-full rounded-2xl p-8 ${
            isDark
              ? 'bg-zinc-900/50 border border-zinc-800'
              : 'bg-white border border-zinc-200 shadow-lg'
          }`}>
            <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>Acceso al dashboard</h2>
            <p className={`text-sm mb-6 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Ingresa tus credenciales</p>

            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 transition-colors ${
                  isDark
                    ? 'bg-zinc-800/50 border border-zinc-700 text-white placeholder-zinc-500'
                    : 'bg-zinc-50 border border-zinc-300 text-black placeholder-zinc-400'
                } disabled:opacity-50`}
              />
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 transition-colors ${
                  isDark
                    ? 'bg-zinc-800/50 border border-zinc-700 text-white placeholder-zinc-500'
                    : 'bg-zinc-50 border border-zinc-300 text-black placeholder-zinc-400'
                } disabled:opacity-50`}
              />

              {error && (
                <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-200 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Entrando...' : 'Entrar →'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
