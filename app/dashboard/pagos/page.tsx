'use client';

import { useEffect, useState } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { db } from '@/lib/firebase';

interface Client {
  id: string;
  name: string;
  plan?: string;
  price?: number;
  pagos?: Array<{ fecha: string; monto: number }>;
}

interface PaymentStatus {
  status: 'al-corriente' | 'pendiente' | 'vencido' | 'sin-pago';
  diasDesde: number;
  ultimoPago?: string;
}

export default function PagosPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ alCorriente: 0, pendientes: 0, vencidos: 0 });
  const [totalMensual, setTotalMensual] = useState(0);
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);

  useEffect(() => {
    if (!db) return;

    const clientsRef = ref(db, 'clients');
    const unsubscribe = onValue(
      clientsRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const clientList = Object.entries(data as Record<string, Record<string, unknown>>)
            .map(([id, clientData]) => ({
              id,
              name: (clientData.name as string) || 'Sin nombre',
              plan: (clientData.plan as string) || 'Estándar',
              price: (clientData.price as number) || 499,
              pagos: (clientData.pagos as Array<{ fecha: string; monto: number }>) || [],
            }))
            .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

          setClients(clientList);

          // Calculate stats
          let alCorriente = 0;
          let pendientes = 0;
          let vencidos = 0;
          let total = 0;

          clientList.forEach((client) => {
            const status = getPaymentStatus(client.pagos || []);
            if (status.status === 'al-corriente') alCorriente++;
            else if (status.status === 'pendiente') pendientes++;
            else if (status.status === 'vencido') vencidos++;
            total += client.price || 0;
          });

          setStats({ alCorriente, pendientes, vencidos });
          setTotalMensual(total);
        } else {
          setClients([]);
          setStats({ alCorriente: 0, pendientes: 0, vencidos: 0 });
          setTotalMensual(0);
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

  const getPaymentStatus = (pagos: Array<{ fecha: string; monto: number }>): PaymentStatus => {
    if (!pagos || pagos.length === 0) {
      return { status: 'sin-pago', diasDesde: 999 };
    }

    const ultimoPago = new Date(pagos[pagos.length - 1].fecha);
    const hoy = new Date();
    const diasDesde = Math.floor((hoy.getTime() - ultimoPago.getTime()) / (1000 * 60 * 60 * 24));

    let status: 'al-corriente' | 'pendiente' | 'vencido' | 'sin-pago';
    if (diasDesde <= 35) status = 'al-corriente';
    else if (diasDesde <= 45) status = 'pendiente';
    else status = 'vencido';

    return {
      status,
      diasDesde,
      ultimoPago: ultimoPago.toLocaleDateString('es-MX'),
    };
  };

  const handleRegistrarPago = async (clientId: string) => {
    setProcessingPayment(clientId);
    try {
      if (!db) return;

      const client = clients.find((c) => c.id === clientId);
      if (!client) return;

      const hoy = new Date().toISOString().split('T')[0];
      const nuevosPagos = [
        ...(client.pagos || []),
        { fecha: hoy, monto: client.price || 0 },
      ];

      const clientRef = ref(db, `clients/${clientId}`);
      await update(clientRef, { pagos: nuevosPagos });
      alert(`✅ Pago registrado para ${client.name}`);
    } catch (error) {
      console.error('Error registering payment:', error);
      alert('Error al registrar pago');
    } finally {
      setProcessingPayment(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'al-corriente':
        return 'bg-green-900/20 text-green-400';
      case 'pendiente':
        return 'bg-orange-900/20 text-orange-400';
      case 'vencido':
        return 'bg-red-900/20 text-red-400';
      default:
        return 'bg-gray-900/20 text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'al-corriente':
        return '✅';
      case 'pendiente':
        return '⏳';
      case 'vencido':
        return '🚫';
      default:
        return '⚪';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'al-corriente':
        return 'Al corriente';
      case 'pendiente':
        return 'Pendiente';
      case 'vencido':
        return 'Vencido';
      default:
        return 'Sin pago';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-zinc-400">Cargando datos de pagos...</div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-black min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-1 flex items-center gap-2">
            💳 Pagos y Facturación
          </h1>
          <p className="text-sm text-zinc-400">Registro de cobros y estado de cuenta</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-zinc-400">Ingresos mensual</p>
          <p className="text-3xl font-bold text-cyan-400">${totalMensual.toLocaleString('es-MX')}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-6 mb-12">
        <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
          <div className="text-5xl font-bold text-green-400 mb-2">{stats.alCorriente}</div>
          <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">✅ AL CORRIENTE</div>
        </div>
        <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
          <div className="text-5xl font-bold text-orange-400 mb-2">{stats.pendientes}</div>
          <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">⏳ PENDIENTES</div>
        </div>
        <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
          <div className="text-5xl font-bold text-red-400 mb-2">{stats.vencidos}</div>
          <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">🚫 VENCIDOS</div>
        </div>
      </div>

      {/* Clients Payment Status */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Estado de cuenta por cliente</h2>
        {clients.length === 0 ? (
          <div className="text-center py-12 bg-slate-800/30 rounded-2xl border border-slate-700">
            <p className="text-zinc-400">No hay clientes registrados aún</p>
          </div>
        ) : (
          <div className="space-y-6">
            {clients.map((client) => {
              const paymentStatus = getPaymentStatus(client.pagos || []);
              return (
                <div
                  key={client.id}
                  className={`rounded-2xl p-8 border ${
                    paymentStatus.status === 'vencido'
                      ? 'bg-red-900/10 border-red-500/20'
                      : 'bg-slate-800/50 border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">📻</span>
                        <h3 className="text-lg font-bold text-white">{client.name}</h3>
                      </div>
                      <p className="text-xs text-zinc-400">
                        {client.plan} • ${client.price?.toLocaleString('es-MX')}/mes
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(paymentStatus.status)}`}>
                      {getStatusIcon(paymentStatus.status)} {getStatusLabel(paymentStatus.status)}
                    </span>
                  </div>

                  <div className="mb-4 py-3 border-t border-b border-slate-700">
                    <p className="text-xs text-zinc-400 uppercase mb-1">Último pago</p>
                    {paymentStatus.ultimoPago ? (
                      <>
                        <p className="text-sm text-zinc-300">{paymentStatus.ultimoPago}</p>
                        <p className="text-xs text-zinc-500 mt-1">
                          Hace {paymentStatus.diasDesde} día{paymentStatus.diasDesde !== 1 ? 's' : ''}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-zinc-400">Sin pagos registrados</p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleRegistrarPago(client.id)}
                      disabled={processingPayment === client.id}
                      className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {processingPayment === client.id ? '⏳ Guardando...' : '💳 Registrar Pago'}
                    </button>
                    <button className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
                      ⚙️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
