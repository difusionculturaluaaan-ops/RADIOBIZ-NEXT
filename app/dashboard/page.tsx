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
  driveFolder?: string;
  plan?: string;
  price?: number;
  status?: 'sin-pago' | 'pagado' | 'pendiente';
  paymentDate?: string;
  createdAt?: number;
  blocked?: boolean;
}

export default function Dashboard() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectedCount, setConnectedCount] = useState(0);

  useEffect(() => {
    if (!db) return;

    const clientsRef = ref(db, 'clients');
    const unsubscribe = onValue(
      clientsRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const clientList = Object.entries(data).map(([id, clientData]: [string, any]) => ({
            id,
            name: clientData.name || 'Sin nombre',
            driveFolder: clientData.driveFolder || '',
            plan: clientData.plan || 'Estándar',
            price: clientData.price || 0,
            status: clientData.status || 'sin-pago',
            paymentDate: clientData.paymentDate || '',
            createdAt: clientData.createdAt || Date.now(),
            blocked: clientData.blocked || false,
          }));
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

  useEffect(() => {
    if (!db) return;

    const sessionsRef = ref(db, 'sessions');
    const unsubscribe = onValue(sessionsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const count = Object.keys(data).length;
        setConnectedCount(count);
      } else {
        setConnectedCount(0);
      }
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
    if (confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
      if (!db) return;
      const clientRef = ref(db, `clients/${id}`);
      remove(clientRef).catch((error) => {
        console.error('Error deleting client:', error);
      });
    }
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
            Bienvenido
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
        <StatsCard number={clients.length} label="Clientes" />
        <StatsCard number={connectedCount} label="Conectados ahora" />
        <StatsCard number={5} label="Jingles activos" />
        <StatsCard number={5} label="Links generados" />
      </div>

      {/* Clients Section */}
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">
          Clientes Recientes
        </h2>
        {clients.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-500 dark:text-zinc-400">
              No hay clientes. ¡Crea uno nuevo!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((client) => (
              <ClientCard
                key={client.id}
                id={client.id}
                name={client.name}
                date={new Date(client.createdAt || Date.now()).toLocaleDateString('es-ES')}
                plan={client.plan || 'Estándar'}
                price={String(client.price || 0)}
                status={client.status || 'sin-pago'}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
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
