'use client';

import { useEffect, useState } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { db } from '@/lib/firebase';

interface Client {
  id: string;
  name: string;
  blocked?: boolean;
}

interface Session {
  clientId: string;
  lastPing: number;
  startedAt: string;
}

export default function ControlRemotoPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [volume, setVolume] = useState(85);
  const [adInterval, setAdInterval] = useState(10);
  const [loading, setLoading] = useState(true);
  const [commandFeedback, setCommandFeedback] = useState('');

  // Load clients from Firebase
  useEffect(() => {
    if (!db) {
      return;
    }

    const clientsRef = ref(db, 'clients');
    const unsubscribe = onValue(
      clientsRef,
      (snapshot) => {
        const data = snapshot.val() as any;
        if (data && typeof data === 'object') {
          const clientList: any[] = [];
          for (const id in data) {
            const clientData = data[id];
            clientList.push({
              id,
              name: clientData.name || 'Sin nombre',
              blocked: clientData.blocked || false,
            });
          }
          setClients(clientList);
          if (clientList.length > 0 && !selectedClientId) {
            setSelectedClientId(clientList[0].id);
          }
        } else {
          setClients([]);
        }
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [selectedClientId]);

  // Load sessions for selected client
  useEffect(() => {
    if (!db || !selectedClientId) return;

    const sessionsRef = ref(db, 'sessions');
    const unsubscribe = onValue(sessionsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const clientSessions = Object.values(data).filter(
          (session: unknown) => (session as Partial<Session>).clientId === selectedClientId
        ) as Session[];
        setSessions(clientSessions);
      } else {
        setSessions([]);
      }
    });

    return () => unsubscribe();
  }, [selectedClientId]);

  const sendCommand = async (action: string, value?: unknown) => {
    if (!db || !selectedClientId) return;

    try {
      const commandRef = ref(db, `commands/${selectedClientId}`);
      await set(commandRef, {
        action,
        value,
        ts: Date.now(),
      });
      setCommandFeedback(`✓ Comando enviado: ${action}`);
      setTimeout(() => setCommandFeedback(''), 2000);
    } catch {
      setCommandFeedback('✗ Error al enviar comando');
    }
  };

  const handlePlayPause = () => {
    sendCommand('play_pause');
  };

  const handleForceAd = () => {
    sendCommand('force_ad');
  };

  const handleSyncDrive = () => {
    sendCommand('sync_drive');
  };

  const handleBlock = async () => {
    if (!db || !selectedClientId) return;
    const currentClient = clients.find((c) => c.id === selectedClientId);
    if (currentClient) {
      try {
        const clientRef = ref(db, `clients/${selectedClientId}/blocked`);
        await set(clientRef, !(currentClient.blocked || false));
        setCommandFeedback(`✓ Cliente ${!(currentClient.blocked || false) ? 'bloqueado' : 'desbloqueado'}`);
        setTimeout(() => setCommandFeedback(''), 2000);
      } catch {
        setCommandFeedback('✗ Error al bloquear cliente');
      }
    }
  };

  const handleApplySettings = () => {
    if (!selectedClientId) return;
    sendCommand('set_volume', volume / 100);
    sendCommand('set_ad_interval', adInterval);
  };

  const selectedClient = clients.find((c) => c.id === selectedClientId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-zinc-400">Cargando clientes...</div>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="bg-black min-h-screen p-8">
        <h1 className="text-4xl font-bold text-white mb-4">Control remoto</h1>
        <p className="text-zinc-400">No hay clientes disponibles</p>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-1">Control remoto</h1>
          <p className="text-sm text-zinc-400">Administra los reproductores de tus clientes</p>
        </div>

        {/* Client Selector */}
        <div className="mb-8">
          <p className="text-xs text-zinc-400 uppercase mb-4">Selecciona un cliente</p>
          <div className="flex gap-3 flex-wrap">
            {clients.map((client) => (
              <button
                key={client.id}
                onClick={() => setSelectedClientId(client.id)}
                className={`px-6 py-2 rounded-full font-medium transition-colors ${
                  client.id === selectedClientId
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-zinc-400 hover:text-white hover:bg-slate-700'
                } ${client.blocked ? 'opacity-50' : ''}`}
              >
                📻 {client.name} {client.blocked && '🔴'}
              </button>
            ))}
          </div>
        </div>

        {/* Client Status */}
        {selectedClient && (
          <div className="mb-8 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <p className="text-sm text-zinc-400 mb-2">
              <span className="font-bold">Estado:</span>{' '}
              <span className={selectedClient.blocked ? 'text-red-400' : 'text-green-400'}>
                {selectedClient.blocked ? 'Bloqueado' : 'Activo'}
              </span>
            </p>
            <p className="text-sm text-zinc-400">
              <span className="font-bold">Sesiones activas:</span> {sessions.length}
            </p>
          </div>
        )}

        {/* Play Status */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">▶ Reproducir</h2>
        </div>

        {/* Control Buttons */}
        <div className="grid grid-cols-2 gap-6 mb-12">
          <button
            onClick={handlePlayPause}
            disabled={!selectedClientId}
            className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 hover:bg-slate-700/50 transition-colors text-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-4xl mb-2 block">▶️</span>
            <span className="text-green-400 font-bold">Play/Pause</span>
          </button>
          <button
            onClick={handleForceAd}
            disabled={!selectedClientId}
            className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 hover:bg-slate-700/50 transition-colors text-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-4xl mb-2 block">🔊</span>
            <span className="text-red-400 font-bold">Forzar anuncio</span>
          </button>
          <button
            onClick={handleSyncDrive}
            disabled={!selectedClientId}
            className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 hover:bg-slate-700/50 transition-colors text-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-4xl mb-2 block">🔄</span>
            <span className="text-gray-400 font-bold">Sync Drive</span>
          </button>
          <button
            onClick={handleBlock}
            disabled={!selectedClientId}
            className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 hover:bg-slate-700/50 transition-colors text-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-4xl mb-2 block">{selectedClient?.blocked ? '✅' : '🔴'}</span>
            <span className={selectedClient?.blocked ? 'text-green-400' : 'text-red-400'} style={{ fontWeight: 'bold' }}>
              {selectedClient?.blocked ? 'Desbloquear' : 'Bloquear'}
            </span>
          </button>
        </div>

        {/* Sliders */}
        <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700 mb-8">
          {/* Volume */}
          <div className="mb-8">
            <div className="flex justify-between mb-3">
              <p className="text-xs text-zinc-400 uppercase">Volumen</p>
              <span className="text-sm text-zinc-300">{volume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(parseInt(e.target.value))}
              disabled={!selectedClientId}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600 disabled:opacity-50"
            />
          </div>

          {/* Intervalo Anuncios */}
          <div className="mb-8">
            <div className="flex justify-between mb-3">
              <p className="text-xs text-zinc-400 uppercase">Intervalo anuncios</p>
              <span className="text-sm text-zinc-300">{adInterval} min</span>
            </div>
            <input
              type="range"
              min="1"
              max="60"
              value={adInterval}
              onChange={(e) => setAdInterval(parseInt(e.target.value))}
              disabled={!selectedClientId}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600 disabled:opacity-50"
            />
          </div>

          <button
            onClick={handleApplySettings}
            disabled={!selectedClientId}
            className="w-full bg-white hover:bg-zinc-100 text-black font-bold py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Aplicar
          </button>
        </div>

        {/* Feedback */}
        {commandFeedback && (
          <div className="mb-8 p-4 bg-slate-800/50 rounded-lg border border-slate-700 text-center">
            <p className="text-white">{commandFeedback}</p>
          </div>
        )}

        {/* Active Sessions */}
        {sessions.length > 0 && (
          <div>
            <p className="text-xs text-zinc-400 uppercase mb-3">Sesiones activas</p>
            <div className="space-y-2">
              {sessions.slice(0, 5).map((session, idx) => (
                <p key={idx} className="text-sm text-green-400">
                  ✓ Conectado desde {new Date(session.startedAt).toLocaleTimeString('es-ES')}
                </p>
              ))}
              {sessions.length > 5 && (
                <p className="text-sm text-zinc-400">... y {sessions.length - 5} más</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
