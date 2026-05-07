'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function SetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleCreateDemoUser = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (!auth) {
        throw new Error('Firebase no inicializado');
      }

      const email = 'demo@radiobiz.com';
      const password = 'Demo123456!';

      await createUserWithEmailAndPassword(auth, email, password);

      setMessage(`✅ ¡Usuario creado exitosamente!`);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string };
      if (firebaseError.code === 'auth/email-already-in-use') {
        setMessage('✅ El usuario de prueba ya existe. Redirigiendo...');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(firebaseError.message || 'Error al crear usuario');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <span className="text-5xl block mb-4">📻</span>
          <h1 className="text-3xl font-bold text-white mb-2">RadioBiz Setup</h1>
          <p className="text-zinc-400">Bienvenido a RadioBiz Next</p>
        </div>

        <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-200">
            <strong>Primera vez aquí?</strong> Crea un usuario de prueba para explorar el dashboard.
          </p>
        </div>

        <button
          onClick={handleCreateDemoUser}
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-50 mb-4"
        >
          {loading ? '⏳ Creando usuario...' : '✨ Crear Usuario de Prueba'}
        </button>

        {message && (
          <div className="bg-green-900/30 border border-green-700 rounded-lg p-4 text-green-400 text-sm text-center mb-4">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 text-red-400 text-sm text-center mb-4">
            {error}
          </div>
        )}

        <div className="border-t border-zinc-700 pt-6 mt-6">
          <h3 className="font-bold text-white mb-3">📝 Credenciales de Prueba</h3>
          <div className="bg-zinc-800/50 rounded-lg p-4 space-y-2 text-sm">
            <div>
              <span className="text-zinc-400">Email:</span>
              <p className="text-white font-mono">demo@radiobiz.com</p>
            </div>
            <div>
              <span className="text-zinc-400">Contraseña:</span>
              <p className="text-white font-mono">Demo123456!</p>
            </div>
          </div>
        </div>

        <a
          href="/login"
          className="block text-center mt-6 text-purple-400 hover:text-purple-300 transition"
        >
          Ya tengo una cuenta →
        </a>
      </div>
    </div>
  );
}
