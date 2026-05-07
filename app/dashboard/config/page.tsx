'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { ref, onValue, remove } from 'firebase/database';
import { auth, db } from '@/lib/firebase';

interface Session {
  [key: string]: {
    clientId: string;
    startedAt: string;
    lastPing: number;
  };
}

export default function ConfigPage() {
  const router = useRouter();
  const [firebaseConnected, setFirebaseConnected] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (!db) return;

    const sessionsRef = ref(db, 'sessions');
    const unsubscribe = onValue(
      sessionsRef,
      (snapshot) => {
        const data = snapshot.val() as Session | null;
        if (data) {
          setSessionCount(Object.keys(data).length);
        } else {
          setSessionCount(0);
        }
        setFirebaseConnected(true);
      },
      () => {
        setFirebaseConnected(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    try {
      if (auth) {
        await signOut(auth);
        router.push('/login');
      }
    } catch {
      setFeedback('Error al cerrar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleCleanOldSessions = async () => {
    if (!db) return;
    setLoading(true);

    try {
      const sessionsRef = ref(db, 'sessions');
      const snapshot = await (async () => {
        const { get } = await import('firebase/database');
        return get(sessionsRef);
      })();

      if (snapshot.exists?.()) {
        const sessions = snapshot.val() as Session;
        const tenDaysAgo = Date.now() - 10 * 24 * 60 * 60 * 1000;
        let deletedCount = 0;

        for (const [sessionId, sessionData] of Object.entries(sessions)) {
          if (sessionData.lastPing < tenDaysAgo) {
            await remove(ref(db, `sessions/${sessionId}`));
            deletedCount++;
          }
        }

        setFeedback(`✓ Se eliminaron ${deletedCount} sesiones viejas`);
        setTimeout(() => setFeedback(''), 3000);
      }
    } catch {
      setFeedback('✗ Error al limpiar sesiones');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllClients = async () => {
    if (!confirm('⚠️ ¿Estás completamente seguro? Esta acción eliminará TODOS los clientes y no se puede deshacer.')) {
      return;
    }

    if (!db) return;
    setLoading(true);

    try {
      const clientsRef = ref(db, 'clients');
      await remove(clientsRef);
      setFeedback('✓ Todos los clientes han sido eliminados');
      setTimeout(() => setFeedback(''), 3000);
    } catch {
      setFeedback('✗ Error al eliminar clientes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black min-h-screen w-full">
      <div className="w-full h-full px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Configuración</h1>
        </div>

        {/* Config Sections */}
        <div className="space-y-6 w-full max-w-4xl">
          {/* Security */}
          <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
            <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              🔒 Seguridad
            </h2>
            <p className="text-sm text-zinc-400 mb-4">
              Autenticado con Firebase Auth. Para cambiar contraseña usa la consola de Firebase.
            </p>
            <button
              onClick={handleLogout}
              disabled={loading}
              className="w-full bg-white hover:bg-zinc-100 text-black font-bold py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? '⏳ Cerrando sesión...' : '🔓 Cerrar sesión'}
            </button>
          </div>

          {/* Firebase */}
          <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              🔥 Firebase
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${firebaseConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className={`font-medium ${firebaseConnected ? 'text-green-400' : 'text-red-400'}`}>
                  {firebaseConnected ? 'Conectado a ProRadioBiz' : 'Desconectado'}
                </span>
              </div>
              <p className="text-sm text-zinc-400">
                Sesiones activas: <span className="font-bold text-white">{sessionCount}</span>
              </p>
              <p className="text-sm text-zinc-400">
                Los clientes se sincronizan en tiempo real entre todos los dispositivos automáticamente.
              </p>
            </div>
          </div>

          {/* Maintenance */}
          <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
            <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              ⚙️ Mantenimiento
            </h2>
            <p className="text-sm text-zinc-400 mb-4">
              Elimina sesiones de dispositivos que no se conectan hace 10 días.
            </p>
            <button
              onClick={handleCleanOldSessions}
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? '⏳ Limpiando...' : '🔧 Limpiar sesiones viejas'}
            </button>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-900/20 rounded-2xl p-8 border border-red-900/50">
            <h2 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
              ⚠️ Zona de Peligro
            </h2>
            <button
              onClick={handleDeleteAllClients}
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? '⏳ Eliminando...' : 'Eliminar todos los clientes'}
            </button>
          </div>

          {/* Feedback */}
          {feedback && (
            <div className={`p-4 rounded-lg border ${
              feedback.includes('✓')
                ? 'bg-green-900/30 border-green-700 text-green-400'
                : 'bg-red-900/30 border-red-700 text-red-400'
            }`}>
              {feedback}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
