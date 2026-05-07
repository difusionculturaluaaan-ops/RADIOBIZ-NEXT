/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useEffect, useState } from 'react';

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
  pin?: string;
  clientPin?: string;
}

interface EditClientModalProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: Client) => void;
}

interface FormData {
  name: string;
  driveFolder: string;
  plan: string;
  price: number;
  status: 'sin-pago' | 'pagado' | 'pendiente';
  paymentDate: string;
  clientPin?: string;
}

export default function EditClientModal({
  client,
  isOpen,
  onClose,
  onSave,
}: EditClientModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    driveFolder: '',
    plan: 'Estándar',
    price: 0,
    status: 'sin-pago',
    paymentDate: '',
    clientPin: '',
  });

  useEffect(() => {
    if (client) {
      const newFormData: FormData = {
        name: client.name || '',
        driveFolder: client.driveFolder || '',
        plan: client.plan || 'Estándar',
        price: client.price || 0,
        status: client.status || 'sin-pago',
        paymentDate: client.paymentDate || '',
        clientPin: (client as Record<string, unknown>).clientPin as string || '',
      };
      setFormData(newFormData);
    }
  }, [client]);

  if (!isOpen || !client) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'price' ? parseFloat(value) || 0 : value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: client.id,
      ...formData,
      pin: formData.clientPin,
      createdAt: client.createdAt || Date.now(),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">
          Editar Cliente
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Nombre *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-zinc-50 dark:bg-slate-900 border border-zinc-200 dark:border-slate-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              PIN del Cliente (4-6 dígitos)
            </label>
            <input
              type="text"
              name="clientPin"
              value={formData.clientPin || ''}
              onChange={handleChange}
              placeholder="Ej: 1234"
              maxLength={6}
              className="w-full px-4 py-2 bg-zinc-50 dark:bg-slate-900 border border-zinc-200 dark:border-slate-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm"
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Este PIN lo ingresará el cliente en el reproductor
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Carpeta de Google Drive
            </label>
            <input
              type="text"
              name="driveFolder"
              placeholder="ID de la carpeta (ej: 1A2B3C...)"
              value={formData.driveFolder}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-zinc-50 dark:bg-slate-900 border border-zinc-200 dark:border-slate-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Plan
              </label>
              <select
                name="plan"
                value={formData.plan}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-zinc-50 dark:bg-slate-900 border border-zinc-200 dark:border-slate-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                <option value="Básico">Básico</option>
                <option value="Estándar">Estándar</option>
                <option value="Premium">Premium</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Precio (MXN)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="10"
                className="w-full px-4 py-2 bg-zinc-50 dark:bg-slate-900 border border-zinc-200 dark:border-slate-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Estado de Pago
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-zinc-50 dark:bg-slate-900 border border-zinc-200 dark:border-slate-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              <option value="sin-pago">Sin pago</option>
              <option value="pendiente">Pendiente</option>
              <option value="pagado">Pagado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Fecha de Pago
            </label>
            <input
              type="date"
              name="paymentDate"
              value={formData.paymentDate}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-zinc-50 dark:bg-slate-900 border border-zinc-200 dark:border-slate-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 rounded-lg transition-colors"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-zinc-200 dark:bg-slate-700 hover:bg-zinc-300 dark:hover:bg-slate-600 text-zinc-900 dark:text-white font-medium py-2 rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
