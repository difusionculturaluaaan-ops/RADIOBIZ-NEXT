'use client';

import { useEffect, useState } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { db } from '@/lib/firebase';
import CreateClientModal from '@/components/CreateClientModal';

interface Client {
  id: string;
  name: string;
  driveFolder: string;
  plan: string;
  price: number;
  status: 'sin-pago' | 'pagado' | 'pendiente';
  paymentDate: string;
  createdAt: number;
  blocked?: boolean;
}

interface SessionData {
  [key: string]: {
    clientId: string;
    lastPing: number;
  };
}

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [sessionCounts, setSessionCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState('');

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
              driveFolder: clientData.driveFolder || '',
              plan: clientData.plan || 'Estándar',
              price: clientData.price || 0,
              status: clientData.status || 'sin-pago',
              paymentDate: clientData.paymentDate || '',
              createdAt: clientData.createdAt || Date.now(),
              blocked: clientData.blocked || false,
            });
          }
          setClients(clientList);
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
  }, []);

  useEffect(() => {
    if (!db) return;

    const sessionsRef = ref(db, 'sessions');
    const unsubscribe = onValue(sessionsRef, (snapshot) => {
      const data = snapshot.val() as SessionData | null;
      const counts: Record<string, number> = {};

      if (data) {
        Object.values(data).forEach((session) => {
          const clientId = session.clientId;
          counts[clientId] = (counts[clientId] || 0) + 1;
        });
      }

      setSessionCounts(counts);
    });

    return () => unsubscribe();
  }, []);

  const handleCopyUrl = (clientId: string) => {
    const url = `${window.location.origin}/player/${clientId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(clientId);
      setTimeout(() => setCopiedId(''), 2000);
    });
  };

  const handleControlRemote = (clientId: string) => {
    // Navigate to control page with client ID
    window.location.href = `/dashboard/control?client=${clientId}`;
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!db) return;
    try {
      await (await import('firebase/database')).remove((await import('firebase/database')).ref(db, `clients/${clientId}`));
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };

  const handleWhatsApp = (clientId: string) => {
    const url = `${window.location.origin}/player/${clientId}`;
    const message = `🎵 Hola, aquí está el enlace de tu reproductor RadioBiz: ${url}`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  const handleQR = (clientId: string) => {
    const url = `${window.location.origin}/player/${clientId}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
    window.open(qrUrl, '_blank');
  };

  const handleToggleBlock = (clientId: string, currentBlocked: boolean) => {
    if (!db) return;
    const clientRef = ref(db, `clients/${clientId}`);
    update(clientRef, { blocked: !currentBlocked }).catch((error) => {
      console.error('Error toggling block:', error);
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-zinc-400">Cargando clientes...</div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen">
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-1">Clientes</h1>
            <p className="text-sm text-zinc-400">Gestiona todos tus negocios</p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full font-medium transition-colors"
          >
            + Nuevo cliente
          </button>
        </div>

        {/* Clients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => {
            const connectedCount = sessionCounts[client.id] || 0;
            const playerUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/player/${client.id}`;
            const isCopied = copiedId === client.id;

            return (
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
                    <p className="text-xs text-zinc-400">
                      {new Date(client.createdAt).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  {client.blocked && (
                    <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                      Bloqueado
                    </span>
                  )}
                </div>

                {/* Drive Folder */}
                <div className="mb-4 pb-4 border-t border-b border-slate-700">
                  <p className="text-xs text-zinc-400 uppercase mb-1">Drive Folder</p>
                  <p className="text-xs text-zinc-300 font-mono break-all">
                    {client.driveFolder || 'No configurado'}
                  </p>
                </div>

                {/* Plan */}
                <div className="mb-4">
                  <p className="text-xs text-zinc-400 uppercase">Plan</p>
                  <p className="text-sm text-white">{client.plan}</p>
                </div>

                {/* Conexiones */}
                <div className="mb-6">
                  <p className="text-xs text-zinc-400 uppercase">Conectados</p>
                  <p className="text-sm text-zinc-300">
                    {connectedCount > 0 ? `✅ ${connectedCount}` : '🔴 Sin conexiones'}
                  </p>
                </div>

                {/* Player URL */}
                <div className="mb-6">
                  <p className="text-xs text-zinc-400 uppercase mb-2">URL del Reproductor</p>
                  <p className="text-xs text-cyan-400 hover:text-cyan-300 break-all font-mono">
                    {playerUrl}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => handleCopyUrl(client.id)}
                    className={`flex-1 text-white text-sm font-medium py-2 rounded-lg transition-colors ${
                      isCopied
                        ? 'bg-green-600'
                        : 'bg-purple-600 hover:bg-purple-700'
                    }`}
                  >
                    {isCopied ? '✓ Copiado' : 'Copiar'}
                  </button>
                  <button
                    onClick={() => handleWhatsApp(client.id)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 rounded-lg transition-colors"
                  >
                    WA
                  </button>
                  <button
                    onClick={() => handleQR(client.id)}
                    className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-medium py-2 rounded-lg transition-colors"
                  >
                    QR
                  </button>
                </div>

                {/* Toggles */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={client.blocked || false}
                      onChange={() => handleToggleBlock(client.id, client.blocked || false)}
                      className="w-4 h-4 rounded bg-slate-700 border-slate-600 cursor-pointer accent-red-600"
                    />
                    <span className="text-xs text-red-400">Bloquear cliente</span>
                  </label>
                </div>
              </div>
            );
          })}

          {/* New Client Card */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700 border-dashed hover:border-slate-600 shadow-lg hover:shadow-xl transition-all cursor-pointer flex flex-col items-center justify-center gap-4 min-h-96"
          >
            <span className="text-4xl">+</span>
            <h3 className="text-lg font-bold text-white">Nuevo cliente</h3>
            <p className="text-xs text-zinc-400">Agregar negocio</p>
          </button>
        </div>
      </div>

      <CreateClientModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
