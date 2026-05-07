/* eslint-disable react-hooks/refs */
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ref, get, set, remove, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import PinScreen from '@/components/PinScreen';
import PlayerCard from '@/components/PlayerCard';
import MusicTabs from '@/components/MusicTabs';

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
    const handlePinSubmit = (pin: string) => {
      if (client && pin === client.pin) {
        setAuthenticated(true);
        setError('');
      } else {
        setError('PIN incorrecto');
      }
    };

    return <PinScreen clientName={client.name} onSubmit={handlePinSubmit} error={error} />;
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
    <div className="min-h-screen bg-black text-white">
      {/* Audio Elements (hidden) */}
      <audio
        ref={player.musicRef}
        crossOrigin="anonymous"
        onEnded={() => {
          if (player.adPlaying) {
            player.scheduleAd();
          }
        }}
      />
      <audio
        ref={player.adRef}
        crossOrigin="anonymous"
        onEnded={() => {
          if (player.musicRef.current && player.adPlaying) {
            player.fadeIn();
            player.musicRef.current.play();
          }
        }}
      />

      <div className="flex flex-col h-screen">
        {/* Topbar */}
        <div className="border-b border-slate-700 bg-black/80 backdrop-blur-md sticky top-0 z-10 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">📻</div>
            <div>
              <h1 className="text-lg font-bold text-white">{client.name}</h1>
              <p className="text-xs text-zinc-400 font-mono">Reproductor v4</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono ${
              player.playing ? 'bg-green-900/20 text-green-400 border border-green-500/30' : 'bg-slate-800 text-zinc-400 border border-slate-700'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${player.playing ? 'bg-green-400' : 'bg-zinc-400'}`} />
              <span>{player.playing ? 'En vivo' : 'Inactivo'}</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Player Card */}
            <PlayerCard
              trackName={player.currentTrack.name}
              trackSource={player.currentTrack.source}
              playing={player.playing}
              progress={player.progress}
              currentTime={player.currentTime}
              duration={player.duration}
              musicVolume={player.musicVolume}
              adVolume={player.adVolume}
              adPlaying={player.adPlaying}
              nextAdCountdown={player.nextAdSecs}
              onPlayPause={player.togglePlay}
              onPrevious={player.previousTrack}
              onNext={player.nextTrack}
              onMusicVolumeChange={player.setMusicVolume}
              onAdVolumeChange={player.setAdVolume}
              onForceAd={player.playAd}
              isFading={player.isFading}
            />

            {/* Music Tabs */}
            <div>
              <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                <span>🎧 Música</span>
              </h2>
              <MusicTabs
                onSelectMp3={(file) => {
                  const url = URL.createObjectURL(file);
                  if (player.musicRef.current) {
                    player.musicRef.current.src = url;
                  }
                }}
                onSelectRadio={(url, name) => {
                  if (player.musicRef.current) {
                    player.musicRef.current.src = url;
                  }
                }}
                onSelectDrive={(fileId) => {
                  if (player.musicRef.current) {
                    player.musicRef.current.src = `/api/drive/stream/${fileId}`;
                  }
                }}
              />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 text-center">
                <div className="text-2xl font-bold text-purple-400 mb-1">0</div>
                <p className="text-xs text-zinc-400 font-mono">Anuncios hoy</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 text-center">
                <div className="text-xl font-bold text-orange-400 mb-1">—</div>
                <p className="text-xs text-zinc-400 font-mono">Jingle actual</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 text-center">
                <div className="text-2xl font-bold text-cyan-400 mb-1">{player.jingles.length}</div>
                <p className="text-xs text-zinc-400 font-mono">En Drive</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
