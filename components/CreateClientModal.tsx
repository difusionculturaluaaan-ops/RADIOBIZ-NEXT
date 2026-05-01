'use client';

import { useState } from 'react';
import { ref, push } from 'firebase/database';
import { db } from '@/lib/firebase';

interface CreateClientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  name: string;
  driveFolder: string;
  plan: string;
  price: number;
  status: 'sin-pago' | 'pagado' | 'pendiente';
  paymentDate: string;
}

export default function CreateClientModal({ isOpen, onClose }: CreateClientModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    driveFolder: '',
    plan: 'Estándar',
    price: 499,
    status: 'sin-pago',
    paymentDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'price' ? parseFloat(value) || 0 : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.name.trim()) {
      setError('El nombre es obligatorio');
      setLoading(false);
      return;
    }

    try {
      if (!db) throw new Error('Firebase no inicializado');

      const clientsRef = ref(db, 'clients');
      await push(clientsRef, {
        ...formData,
        createdAt: Date.now(),
      });

      setFormData({
        name: '',
        driveFolder: '',
        plan: 'Estándar',
        price: 499,
        status: 'sin-pago',
        paymentDate: '',
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al crear cliente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">
          Crear Nuevo Cliente
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
              disabled={loading}
              className="w-full px-4 py-2 bg-zinc-50 dark:bg-slate-900 border border-zinc-200 dark:border-slate-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Carpeta de Google Drive
            </label>
            <input
              type="text"
              name="driveFolder"
              placeholder="ID de la carpeta"
              value={formData.driveFolder}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-4 py-2 bg-zinc-50 dark:bg-slate-900 border border-zinc-200 dark:border-slate-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm disabled:opacity-50"
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
                disabled={loading}
                className="w-full px-4 py-2 bg-zinc-50 dark:bg-slate-900 border border-zinc-200 dark:border-slate-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600 disabled:opacity-50"
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
                disabled={loading}
                min="0"
                step="10"
                className="w-full px-4 py-2 bg-zinc-50 dark:bg-slate-900 border border-zinc-200 dark:border-slate-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600 disabled:opacity-50"
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
              disabled={loading}
              className="w-full px-4 py-2 bg-zinc-50 dark:bg-slate-900 border border-zinc-200 dark:border-slate-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600 disabled:opacity-50"
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
              disabled={loading}
              className="w-full px-4 py-2 bg-zinc-50 dark:bg-slate-900 border border-zinc-200 dark:border-slate-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600 disabled:opacity-50"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Creando...' : 'Crear Cliente'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-zinc-200 dark:bg-slate-700 hover:bg-zinc-300 dark:hover:bg-slate-600 text-zinc-900 dark:text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
