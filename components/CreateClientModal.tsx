'use client';

import { useState } from 'react';
import { ref, set } from 'firebase/database';
import { db } from '@/lib/firebase';

interface CreateClientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  name: string;
  folder: string; // jingles
  musicfolder: string;
  radio: string;
  pin: string;
  intervalo: string;
  fade: string;
  plan: string;
  price: number;
}

// SHA-256 hash function
async function hashPin(pin: string): Promise<string> {
  const data = new TextEncoder().encode(pin);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function generateCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export default function CreateClientModal({ isOpen, onClose }: CreateClientModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    folder: '1tIXvw-hD2Vp2uDr-u5c919dxmbroPpi9', // default jingles folder
    musicfolder: '',
    radio: '',
    pin: '1234',
    intervalo: '10',
    fade: '2',
    plan: 'Estándar',
    price: 499,
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

  const extractFolderId = (val: string): string | null => {
    if (!val.trim()) return null;
    // Remove query params
    val = val.split('?')[0];
    // Extract ID from URL if present
    const match = val.match(/folders\/([a-zA-Z0-9_-]+)/);
    if (match) return match[1];
    // Use directly if it looks like a folder ID
    if (/^[a-zA-Z0-9_-]+$/.test(val)) return val;
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validation
      if (!formData.name.trim()) {
        setError('El nombre es obligatorio');
        setLoading(false);
        return;
      }

      const cleanFolder = extractFolderId(formData.folder);
      if (!cleanFolder) {
        setError('Folder ID de jingles inválido');
        setLoading(false);
        return;
      }

      if (!/^\d{4}$/.test(formData.pin)) {
        setError('El PIN debe ser exactamente 4 dígitos');
        setLoading(false);
        return;
      }

      const cleanMusicFolder = formData.musicfolder ? extractFolderId(formData.musicfolder) : '';
      if (formData.musicfolder && !cleanMusicFolder) {
        setError('Folder ID de música inválido');
        setLoading(false);
        return;
      }

      if (!db) throw new Error('Firebase no inicializado');

      // Hash PIN
      const pinHash = await hashPin(formData.pin);
      const code = generateCode();
      const clientId = `c_${Date.now()}`;

      // Save to Firebase
      const clientRef = ref(db, `clients/${clientId}`);
      await set(clientRef, {
        id: clientId,
        name: formData.name.trim(),
        folder: cleanFolder,
        musicfolder: cleanMusicFolder,
        radio: formData.radio.trim(),
        pin: pinHash,
        intervalo: parseInt(formData.intervalo),
        fade: parseInt(formData.fade),
        plan: formData.plan,
        price: formData.price,
        code,
        blocked: false,
        createdAt: Date.now(),
      });

      // Reset and close
      setFormData({
        name: '',
        folder: '1tIXvw-hD2Vp2uDr-u5c919dxmbroPpi9',
        musicfolder: '',
        radio: '',
        pin: '1234',
        intervalo: '10',
        fade: '2',
        plan: 'Estándar',
        price: 499,
      });
      onClose();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Error al crear cliente');
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
          {/* Nombre */}
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
              placeholder="Mi Negocio"
              className="w-full px-4 py-2 bg-zinc-50 dark:bg-slate-900 border border-zinc-200 dark:border-slate-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600 disabled:opacity-50"
            />
          </div>

          {/* PIN */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              PIN (4 dígitos) *
            </label>
            <input
              type="text"
              name="pin"
              value={formData.pin}
              onChange={handleChange}
              required
              disabled={loading}
              maxLength={4}
              pattern="\d{4}"
              placeholder="1234"
              className="w-full px-4 py-2 bg-zinc-50 dark:bg-slate-900 border border-zinc-200 dark:border-slate-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600 disabled:opacity-50 font-mono"
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              El cliente ingresará este PIN en el reproductor
            </p>
          </div>

          {/* Carpeta Jingles */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Carpeta Jingles (Google Drive) *
            </label>
            <input
              type="text"
              name="folder"
              value={formData.folder}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="ID o URL de carpeta"
              className="w-full px-4 py-2 bg-zinc-50 dark:bg-slate-900 border border-zinc-200 dark:border-slate-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600 disabled:opacity-50 text-sm font-mono"
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Donde están los jingles/anuncios (obligatorio)
            </p>
          </div>

          {/* Carpeta Música */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Carpeta Música (Google Drive)
            </label>
            <input
              type="text"
              name="musicfolder"
              value={formData.musicfolder}
              onChange={handleChange}
              disabled={loading}
              placeholder="ID o URL de carpeta (opcional)"
              className="w-full px-4 py-2 bg-zinc-50 dark:bg-slate-900 border border-zinc-200 dark:border-slate-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600 disabled:opacity-50 text-sm font-mono"
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Carpeta separada para música de fondo (opcional)
            </p>
          </div>

          {/* Radio URL */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Stream de Radio
            </label>
            <input
              type="url"
              name="radio"
              value={formData.radio}
              onChange={handleChange}
              disabled={loading}
              placeholder="https://..."
              className="w-full px-4 py-2 bg-zinc-50 dark:bg-slate-900 border border-zinc-200 dark:border-slate-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600 disabled:opacity-50 text-sm font-mono"
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              URL de stream de radio para música de fondo (opcional)
            </p>
          </div>

          {/* Grid: Intervalo, Fade */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Intervalo Anuncios
              </label>
              <select
                name="intervalo"
                value={formData.intervalo}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-4 py-2 bg-zinc-50 dark:bg-slate-900 border border-zinc-200 dark:border-slate-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600 disabled:opacity-50"
              >
                <option value="1">Cada 1 min</option>
                <option value="5">Cada 5 min</option>
                <option value="10">Cada 10 min</option>
                <option value="15">Cada 15 min</option>
                <option value="20">Cada 20 min</option>
                <option value="30">Cada 30 min</option>
                <option value="60">Cada 60 min</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Fade In/Out
              </label>
              <select
                name="fade"
                value={formData.fade}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-4 py-2 bg-zinc-50 dark:bg-slate-900 border border-zinc-200 dark:border-slate-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600 disabled:opacity-50"
              >
                <option value="0">Sin fade</option>
                <option value="1">1 seg</option>
                <option value="2">2 seg</option>
                <option value="3">3 seg</option>
                <option value="5">5 seg</option>
              </select>
            </div>
          </div>

          {/* Grid: Plan, Precio */}
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
                step="50"
                className="w-full px-4 py-2 bg-zinc-50 dark:bg-slate-900 border border-zinc-200 dark:border-slate-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600 disabled:opacity-50 font-mono"
              />
            </div>
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
              {loading ? 'Creando...' : '💾 Crear Cliente'}
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
