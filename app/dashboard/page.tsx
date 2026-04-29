'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import StatsCard from '@/components/StatsCard';
import ClientCard from '@/components/ClientCard';
import EditClientModal from '@/components/EditClientModal';

interface Client {
  id: string;
  name: string;
  date: string;
  plan: string;
  price: string;
  status: 'sin-pago' | 'pagado' | 'pendiente';
}

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clients, setClients] = useState<Client[]>([
    {
      id: '1',
      name: 'LA CABAÑA',
      date: '26/7/2025',
      plan: 'Estándar',
      price: '499',
      status: 'sin-pago',
    },
    {
      id: '2',
      name: 'AUTOZONE',
      date: '26/7/2025',
      plan: 'Estándar',
      price: '499',
      status: 'sin-pago',
    },
    {
      id: '3',
      name: 'GYM',
      date: '26/7/2025',
      plan: 'Estándar',
      price: '499',
      status: 'sin-pago',
    },
    {
      id: '4',
      name: 'CARNES LA CALZADA',
      date: '26/7/2025',
      plan: 'Estándar',
      price: '499',
      status: 'sin-pago',
    },
    {
      id: '5',
      name: 'DEMO GENERAL',
      date: '26/7/2025',
      plan: 'Estándar',
      price: '499',
      status: 'sin-pago',
    },
  ]);

  const getFormattedDate = () => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date().toLocaleDateString('es-ES', options);
    return today.charAt(0).toUpperCase() + today.slice(1);
  };

  const handleEdit = (id: string) => {
    const client = clients.find((c) => c.id === id);
    if (client) {
      setSelectedClient(client);
      setIsModalOpen(true);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
      setClients(clients.filter((c) => c.id !== id));
    }
  };

  const handleSaveClient = (updatedClient: Client) => {
    setClients(
      clients.map((c) => (c.id === updatedClient.id ? updatedClient : c))
    );
  };

  return (
    <div className="flex bg-zinc-50 dark:bg-black min-h-screen">
      <Sidebar />

      <main className="flex-1 ml-48 p-8">
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
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full font-medium transition-colors">
            + Nuevo cliente
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-6 mb-12">
          <StatsCard number={clients.length} label="Clientes" />
          <StatsCard number={0} label="Conectados ahora" />
          <StatsCard number={5} label="Jingles activos" />
          <StatsCard number={5} label="Links generados" />
        </div>

        {/* Clients Section */}
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">
            Clientes Recientes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((client) => (
              <ClientCard
                key={client.id}
                id={client.id}
                name={client.name}
                date={client.date}
                plan={client.plan}
                price={client.price}
                status={client.status}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      </main>

      <EditClientModal
        client={selectedClient}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedClient(null);
        }}
        onSave={handleSaveClient}
      />
    </div>
  );
}
