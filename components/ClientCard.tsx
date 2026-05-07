'use client';

import { useState } from 'react';
import { ref, update, remove } from 'firebase/database';
import { db } from '@/lib/firebase';

interface ClientCardProps {
  id: string;
  name: string;
  driveFolder: string;
  plan: string;
  price: number;
  status: 'sin-pago' | 'pagado' | 'pendiente';
  blocked?: boolean;
  sessionCount: number;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onControl: (id: string) => void;
}

export default function ClientCard({
  id,
  name,
  driveFolder,
  plan,
  price,
  status,
  blocked = false,
  sessionCount,
  onEdit,
  onDelete,
  onControl,
}: ClientCardProps) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [shortUrl, setShortUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const statusColors = {
    'sin-pago': 'text-red-400',
    'pagado': 'text-green-400',
    'pendiente': 'text-yellow-400',
  };

  const statusBg = {
    'sin-pago': 'bg-red-900/20',
    'pagado': 'bg-green-900/20',
    'pendiente': 'bg-yellow-900/20',
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/player/${id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleBlock = async () => {
    if (!db) return;
    try {
      await update(ref(db, `clients/${id}`), { blocked: !blocked });
    } catch (error) {
      console.error('Error toggling block:', error);
    }
  };

  const handleGenerateQR = () => {
    const url = `${window.location.origin}/player/${id}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
    setShortUrl(qrUrl);
    setShowQR(true);
  };

  const handleOpenPlayer4 = () => {
    window.open(`/player/${id}?mode=v4`, '_blank');
  };

  const handleGenerateShortUrl = async () => {
    setLoading(true);
    try {
      const longUrl = `${window.location.origin}/player/${id}`;
      const response = await fetch(`https://is.gd/create.php?format=json&url=${encodeURIComponent(longUrl)}`);
      const data = await response.json();
      if (data.shorturl) {
        setShortUrl(data.shorturl);
        if (db) {
          await update(ref(db, `clients/${id}`), { shortUrl: data.shorturl });
        }
      }
    } catch (error) {
      console.error('Error generating short URL:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClient = () => {
    if (confirm(`¿Estás seguro de que deseas eliminar a ${name}?`)) {
      onDelete(id);
    }
  };

  return (
    <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 hover:border-slate-600 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white">{name}</h3>
          <p className="text-xs text-zinc-400 mt-1">PIN: {id.substring(0, 8)}...</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold ${statusBg[status]}`}>
          <span className={statusColors[status]}>{status}</span>
        </div>
      </div>

      {/* Drive & Interval */}
      {driveFolder && (
        <div className="mb-3 text-xs text-zinc-400">
          <p>📁 {driveFolder.substring(0, 30)}...</p>
        </div>
      )}

      {/* Plan & Price */}
      <div className="mb-4 py-3 border-t border-b border-slate-700">
        <div className="flex justify-between items-center">
          <span className="text-sm text-zinc-400">{plan}</span>
          <span className="text-sm font-bold text-white">MXN {price}</span>
        </div>
      </div>

      {/* Sessions */}
      <div className="mb-4 text-xs">
        <span className={sessionCount > 0 ? 'text-green-400' : 'text-zinc-400'}>
          {sessionCount > 0 ? `🟢 ${sessionCount} conectado${sessionCount > 1 ? 's' : ''}` : '⚫ Sin conexiones'}
        </span>
      </div>

      {/* Player Link */}
      <div
        onClick={handleCopyLink}
        className="mb-4 p-2 bg-slate-900/50 rounded-lg cursor-pointer hover:bg-slate-900 transition-colors"
      >
        <p className="text-xs text-cyan-400 break-all">is.gd/xxxxx</p>
      </div>

      {/* Action Buttons Row 1 */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        <button
          onClick={() => onEdit(id)}
          className="text-xs font-bold py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors"
          title="Editar cliente"
        >
          ✏️ Editar
        </button>
        <button
          onClick={handleOpenPlayer4}
          className="text-xs font-bold py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors"
          title="Abrir Player V4"
        >
          🎛️ V4
        </button>
        <button
          onClick={handleGenerateQR}
          className="text-xs font-bold py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors"
          title="Ver código QR"
        >
          📷 QR
        </button>
        <button
          onClick={handleDeleteClient}
          className="text-xs font-bold py-2 rounded-lg bg-red-900/30 hover:bg-red-900/50 text-red-400 transition-colors"
          title="Eliminar cliente"
        >
          🗑️
        </button>
      </div>

      {/* Reset Link Button */}
      <button
        onClick={handleGenerateShortUrl}
        disabled={loading}
        className="w-full text-xs font-bold py-2 rounded-lg mb-3 bg-slate-900 hover:bg-slate-800 text-cyan-400 transition-colors disabled:opacity-50"
      >
        {loading ? '⏳ Generando...' : '🔗 Resetear link'}
      </button>

      {/* Control Remoto Button */}
      <button
        onClick={() => onControl(id)}
        className="w-full text-xs font-bold py-2 rounded-lg bg-blue-900/30 hover:bg-blue-900/50 text-blue-400 transition-colors"
      >
        🎛️ Control remoto
      </button>

      {/* QR Modal */}
      {showQR && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-sm w-full border border-slate-700">
            <h3 className="text-white font-bold mb-4">Código QR - {name}</h3>
            <img src={shortUrl} alt="QR" className="w-full mb-4" />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/player/${id}`);
                  alert('Link copiado');
                }}
                className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-bold transition-colors"
              >
                📋 Copiar Link
              </button>
              <button
                onClick={() => setShowQR(false)}
                className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-bold transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
