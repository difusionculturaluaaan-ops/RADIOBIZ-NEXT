/* eslint-disable react-hooks/refs */
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ref, get, set, remove, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';

interface Client {
  id: string;
  name: string;
  pin: string;
  folder: string;
  musicfolder?: string;
  radio?: string;
  intervalo: number;
  fade?: number;
  code: string;
}

export default function PlayerPage() {
  const params = useParams();
  const clientId = params.clientId as string;

  const [client, setClient] = useState<Client | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Cargar cliente desde Firebase
  useEffect(() => {
    const loadClient = async () => {
      try {
        if (!db) {
          setError('Firebase no inicializado');
          setLoading(false);
          return;
        }
        const snapshot = await get(ref(db, `clients/${clientId}`));
        if (snapshot.exists()) {
          setClient(snapshot.val());
        } else {
          setError('Cliente no encontrado');
        }
      } catch {
        setError('Error al cargar cliente');
      } finally {
        setLoading(false);
      }
    };

    if (clientId) {
      loadClient();
    }
  }, [clientId]);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (client && pinInput === client.pin) {
      setAuthenticated(true);
      setPinInput('');
    } else {
      setError('PIN incorrecto');
      setPinInput('');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-white">Cargando...</div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-red-500 text-center">
          <div className="text-2xl font-bold mb-2">Error</div>
          <div>{error || 'Cliente no encontrado'}</div>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <form onSubmit={handlePinSubmit} className="bg-gray-900 p-8 rounded-lg border border-gray-800 w-full max-w-sm">
          <h1 className="text-2xl font-bold text-white mb-2">{client.name}</h1>
          <p className="text-gray-400 mb-6">Ingresa el PIN para continuar</p>

          <input
            type="password"
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            placeholder="PIN"
            maxLength={4}
            className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded mb-4 text-center text-2xl tracking-widest"
            autoFocus
          />

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <button
            type="submit"
            className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded transition"
          >
            Entrar
          </button>
        </form>
      </div>
    );
  }

  return <PlayerContent client={client} />;
}

function PlayerContent({ client }: { client: Client }) {
  const player = useAudioPlayer(client);
  const params = useParams();
  const clientId = params.clientId as string;

  // Session management and remote commands
  useEffect(() => {
    if (!clientId || !db) return;

    const sessionId = `s_${clientId}_${Date.now()}`;
    const sessionRef = ref(db, `sessions/${sessionId}`);
    const commandRef = ref(db, `commands/${clientId}`);
    const bootTs = Date.now();

    // Register session
    set(sessionRef, {
      clientId,
      startedAt: new Date().toISOString(),
      lastPing: Date.now(),
    });

    // Ping every 30 seconds to keep session alive
    const pingInterval = setInterval(() => {
      if (db) set(ref(db, `sessions/${sessionId}/lastPing`), Date.now());
    }, 30000);

    // Listen for remote commands
    const unsubscribeCommands = onValue(commandRef, (snapshot) => {
      const cmd = snapshot.val();
      if (!cmd || cmd.ts <= bootTs) return;

      switch (cmd.action) {
        case 'play_pause':
          player.togglePlay();
          break;
        case 'force_ad':
          if (player.playing) {
            player.playAd();
          }
          break;
        case 'set_volume':
          if (typeof cmd.value === 'number') {
            player.setVolume(cmd.value);
          }
          break;
        case 'sync_drive':
          player.syncJingles();
          break;
        case 'stop':
          if (player.musicRef.current && player.playing) {
            player.musicRef.current.pause();
          }
          break;
      }

      // Clear command after processing
      remove(commandRef);
    });

    // Check if client is blocked
    const unsubscribeBlock = onValue(ref(db, `clients/${clientId}/blocked`), (snapshot) => {
      if (snapshot.val() === true) {
        if (player.musicRef.current) {
          player.musicRef.current.pause();
        }
        // Optionally show a blocked message or redirect
      }
    });

    return () => {
      clearInterval(pingInterval);
      unsubscribeCommands();
      unsubscribeBlock();
      remove(sessionRef);
    };
  }, [clientId, player]);

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">{client.name}</h1>
          <p className="text-gray-400">Reproductor v1.0</p>
        </div>

        {/* Player Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 mb-8">
          {/* Audio Elements (hidden) */}
          <audio
            ref={player.musicRef}
            onEnded={() => {
              if (player.adPlaying) {
                player.scheduleAd();
              }
            }}
          />
          <audio
            ref={player.adRef}
            onEnded={() => {
              // Resume music
              if (player.musicRef.current && player.adPlaying) {
                player.fadeIn();
                player.musicRef.current.play();
              }
            }}
          />

          {/* Now Playing */}
          <div className="mb-6">
            <p className="text-gray-400 text-sm mb-1">{player.currentTrack.name}</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-400">{player.sourceMode === 'radio' ? 'Radio' : 'Música'}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="bg-gray-800 h-1 rounded-full overflow-hidden">
              <div
                className="bg-purple-600 h-full transition-all"
                style={{ width: `${player.progress}%` }}
              ></div>
            </div>
          </div>

          {/* Play Button */}
          <div className="flex justify-center mb-6">
            <button
              onClick={player.togglePlay}
              className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition ${
                player.playing
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              {player.playing ? '⏸' : '▶'}
            </button>
          </div>

          {/* Volume Controls */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="text-xs text-gray-400 block mb-2">Volumen: {player.volume}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={player.volume}
                onChange={(e) => player.setVolume(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          {/* Next Ad */}
          <div className="text-center">
            <p className="text-sm text-gray-400">
              Próximo anuncio en: {Math.floor(player.nextAdSecs / 60)}:{String(player.nextAdSecs % 60).padStart(2, '0')}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded p-4">
            <p className="text-xs text-gray-400 mb-1">Jingles</p>
            <p className="text-2xl font-bold">{player.jingles.length}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded p-4">
            <p className="text-xs text-gray-400 mb-1">Intervalo</p>
            <p className="text-2xl font-bold">{client.intervalo} min</p>
          </div>
        </div>
      </div>
    </div>
  );
}
