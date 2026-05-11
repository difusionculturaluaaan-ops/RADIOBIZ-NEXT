'use client';

import { useEffect, useState } from 'react';
import { ref, onValue, remove, update } from 'firebase/database';
import { db } from '@/lib/firebase';
import StatsCard from '@/components/StatsCard';
import ClientCard from '@/components/ClientCard';
import EditClientModal from '@/components/EditClientModal';
import CreateClientModal from '@/components/CreateClientModal';

interface Client {
  id: string;
  name: string;
  folder: string;
  musicfolder?: string;
  radio?: string;
  pin: string;
  intervalo: number;
  fade: number;
  plan?: string;
  price?: number;
  blocked?: boolean;
  createdAt?: number;
}

interface Session {
  clientId: string;
  lastPing: number;
}

// Force rebuild
export default function Dashboard() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [sessionCounts, setSessionCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [totalConnected, setTotalConnected] = useState(0);

  // Load clients
  useEffect(() => {
    if (!db) return;

    const clientsRef = ref(db, 'clients');
    const unsubscribe = onValue(
      clientsRef,
      (snapshot) => {
        const data = snapshot.val() as any;
        if (data && typeof data === 'object') {
          const clientList: Client[] = [];
          for (const id in data) {
            const clientData = data[id];
            clientList.push({
              id,
              name: clientData.name as string || 'Sin nombre',
              folder: clientData.folder as string || '',
              musicfolder: (clientData.musicfolder as string) || undefined,
              radio: (clientData.radio as string) || undefined,
              pin: clientData.pin as string || '',
              intervalo: (clientData.intervalo as number) || 10,
              fade: (clientData.fade as number) || 2,
              plan: (clientData.plan as string) || 'Estándar',
              price: (clientData.price as number) || 0,
              blocked: (clientData.blocked as boolean) || false,
              createdAt: (clientData.createdAt as number) || Date.now(),
            });
          }
          clientList.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          setClients(clientList);
        } else {
          setClients([]);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error loading clients:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Load sessions and count per client
  useEffect(() => {
    if (!db) return;

    const sessionsRef = ref(db, 'sessions');
    const unsubscribe = onValue(sessionsRef, (snapshot) => {
      const data = snapshot.val();
      const counts: Record<string, number> = {};
      const now = Date.now();
      const threeMinutesAgo = now - 3 * 60 * 1000;

      if (data) {
        Object.values(data).forEach((session) => {
          const s = session as Session;
          // Only count active sessions (last ping < 3 minutes ago)
          if (s.clientId && s.lastPing && s.lastPing > threeMinutesAgo) {
            counts[s.clientId] = (counts[s.clientId] || 0) + 1;
          }
        });
      }

      setSessionCounts(counts);
      const total = Object.values(counts).reduce((a, b) => a + b, 0);
      setTotalConnected(total);
    });

    return () => unsubscribe();
  }, []);

  const getFormattedDate = () => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    const today = new Date().toLocaleDateString('es-ES', options);
    return today.charAt(0).toUpperCase() + today.slice(1);
  };

  const handleEdit = (id: string) => {
    const client = clients.find((c) => c.id === id);
    if (client) {
      setSelectedClient(client);
      setIsEditModalOpen(true);
    }
  };

  const handleDelete = (id: string) => {
    const client = clients.find((c) => c.id === id);
    if (!client) return;

    if (confirm(`¿Estás seguro de que deseas eliminar a ${client.name}?\n\nSu link dejará de funcionar inmediatamente.`)) {
      if (!db) return;

      // Delete client
      const clientRef = ref(db, `clients/${id}`);
      remove(clientRef).catch((error) => {
        console.error('Error deleting client:', error);
      });

      // Also remove sessions for this client
      const sessionsRef = ref(db!, 'sessions');
      onValue(sessionsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          Object.entries(data).forEach(([sessionId, sessionData]) => {
            const s = sessionData as Session;
            if (s.clientId === id) {
              remove(ref(db!, `sessions/${sessionId}`));
            }
          });
        }
      });
    }
  };

  const handleToggleBlock = (clientId: string, currentBlocked: boolean) => {
    if (!db) return;
    const clientRef = ref(db, `clients/${clientId}`);
    update(clientRef, { blocked: !currentBlocked }).catch((error) => {
      console.error('Error toggling block:', error);
    });
  };

  const handleControl = (clientId: string) => {
    // Navigate to control page with client ID
    window.location.href = `/dashboard/control?client=${clientId}`;
  };

  const handleSaveClient = (updatedClient: Client) => {
    if (!db) return;
    const { id, ...clientData } = updatedClient;
    const clientRef = ref(db, `clients/${id}`);
    update(clientRef, clientData).catch((error) => {
      console.error('Error updating client:', error);
    });
    setIsEditModalOpen(false);
    setSelectedClient(null);
  };

  const handleCreateClient = () => {
    setIsCreateModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-black">
        <div className="text-zinc-500 dark:text-zinc-400">Cargando clientes...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 bg-zinc-50 dark:bg-black">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-1">
            Dashboard
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {getFormattedDate()}
          </p>
        </div>
        <button
          onClick={handleCreateClient}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full font-medium transition-colors"
        >
          + Nuevo cliente
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6 mb-12">
        <StatsCard number={clients.length} label="Total Clientes" />
        <StatsCard number={totalConnected} label="Conectados ahora" />
        <StatsCard number={clients.filter((c) => !c.blocked).length} label="Activos" />
        <StatsCard number={clients.filter((c) => c.blocked).length} label="Bloqueados" />
      </div>

      {/* Clients Section */}
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">
          Clientes
        </h2>
        {clients.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-500 dark:text-zinc-400 mb-4">
              No hay clientes. ¡Crea uno nuevo!
            </p>
            <button
              onClick={handleCreateClient}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Crear primer cliente
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((client) => {
              const sessionCount = sessionCounts[client.id] || 0;
              return (
                <ClientCard
                  key={client.id}
                  id={client.id}
                  name={client.name}
                  driveFolder={client.folder}
                  plan={client.plan || 'Estándar'}
                  price={client.price || 0}
                  status="sin-pago"
                  blocked={client.blocked || false}
                  sessionCount={sessionCount}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onControl={handleControl}
                  onToggleBlock={() => handleToggleBlock(client.id, client.blocked || false)}
                />
              );
            })}
          </div>
        )}
      </div>

      <EditClientModal
        client={selectedClient}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedClient(null);
        }}
        onSave={handleSaveClient}
      />

      <CreateClientModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
