'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';

interface MenuItem {
  label: string;
  href: string;
  count?: number;
}

export default function Sidebar() {
  const pathname = usePathname();
  const [clientCount, setClientCount] = useState(0);
  const [paymentCount, setPaymentCount] = useState(0);
  const [firebaseConnected, setFirebaseConnected] = useState(false);

  useEffect(() => {
    if (!db) return;

    const clientsRef = ref(db, 'clients');
    const unsubscribe = onValue(
      clientsRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setClientCount(Object.keys(data).length);
          const pendingPayments = Object.values(data).filter(
            (client: any) => client.status !== 'pagado'
          ).length;
          setPaymentCount(pendingPayments);
        } else {
          setClientCount(0);
          setPaymentCount(0);
        }
        setFirebaseConnected(true);
      },
      () => {
        setFirebaseConnected(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const menuItems: MenuItem[] = [
    { label: 'Inicio', href: '/dashboard' },
    { label: 'Clientes', href: '/dashboard/clientes', count: clientCount },
    { label: 'Pagos', href: '/dashboard/pagos', count: paymentCount },
    { label: 'Control remoto', href: '/dashboard/control' },
    { label: 'Configuración', href: '/dashboard/config' },
  ];

  return (
    <aside className="w-48 bg-black text-white h-screen fixed left-0 top-0 p-6 border-r border-zinc-800">
      <div className="mb-12">
        <h1 className="text-2xl font-bold">RadioBiz</h1>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-purple-600 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <span className="text-base font-bold">{item.label}</span>
              {item.count !== undefined && item.count > 0 && (
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  isActive ? 'bg-purple-700' : 'bg-zinc-700 text-zinc-300'
                }`}>
                  {item.count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-6 left-6 right-6 space-y-3 text-xs">
        <div className={`flex items-center gap-2 ${firebaseConnected ? 'text-green-400' : 'text-red-400'}`}>
          <span className={`w-2 h-2 rounded-full ${firebaseConnected ? 'bg-green-400' : 'bg-red-400'}`}></span>
          <span>{firebaseConnected ? 'Firebase conectado' : 'Firebase desconectado'}</span>
        </div>
        <div className="flex items-center gap-2 text-blue-400">
          <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
          <span>Modo oscuro</span>
        </div>
      </div>
    </aside>
  );
}
