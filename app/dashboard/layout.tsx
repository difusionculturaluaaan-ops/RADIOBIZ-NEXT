/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  const isDevelopment = typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      if (!isDevelopment) {
        router.push('/login');
      }
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthenticated(true);
        setLoading(false);
      } else {
        if (isDevelopment) {
          // Allow access in development
          setAuthenticated(true);
          setLoading(false);
        } else {
          router.push('/login');
        }
      }
    });

    return () => unsubscribe();
  }, [router, isDevelopment]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-black">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {isDevelopment && (
          <div className="fixed top-0 right-0 bg-yellow-900/30 border-l border-b border-yellow-700 px-4 py-2 text-yellow-400 text-xs z-40">
            🔓 Modo Desarrollo (Sin Autenticación)
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
