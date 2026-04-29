'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { label: 'Inicio', href: '/dashboard' },
    { label: 'Clientes', href: '/dashboard/clientes', count: '5' },
    { label: 'Pagos', href: '/dashboard/pagos', count: '1' },
    { label: 'Control remoto', href: '/dashboard/control' },
    { label: 'Configuración', href: '/dashboard/config' },
  ];

  return (
    <aside className="w-48 bg-black text-white h-screen fixed left-0 top-0 p-6 border-r border-zinc-800">
      <div className="mb-12">
        <h1 className="text-2xl font-bold">RadioBiz-Pro</h1>
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
              {item.count && (
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
        <div className="flex items-center gap-2 text-green-400">
          <span className="w-2 h-2 bg-green-400 rounded-full"></span>
          <span>Firebase conectado</span>
        </div>
        <div className="flex items-center gap-2 text-orange-400">
          <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
          <span>Jolo claro</span>
        </div>
      </div>
    </aside>
  );
}
