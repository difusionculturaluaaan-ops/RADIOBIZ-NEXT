'use client';

import { useState, useEffect } from 'react';

interface PinScreenProps {
  clientName: string;
  onSubmit: (pin: string) => void;
  error?: string;
}

export default function PinScreen({ clientName, onSubmit, error }: PinScreenProps) {
  const [pinInput, setPinInput] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('rbz_theme');
    if (saved) setTheme(saved as 'dark' | 'light');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('rbz_theme', newTheme);
  };

  const handleKeyPress = (key: string) => {
    if (key === '⌫') {
      setPinInput(pinInput.slice(0, -1));
    } else if (key === '✓') {
      if (pinInput.length >= 4) {
        onSubmit(pinInput);
      }
    } else if (pinInput.length < 6) {
      setPinInput(pinInput + key);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.length >= 4) {
      onSubmit(pinInput);
    }
  };

  const themeIcon = theme === 'dark' ? '☀️' : '🌙';
  const themeLabel = theme === 'dark' ? 'Modo claro' : 'Modo oscuro';

  return (
    <div
      className={`fixed inset-0 flex flex-col items-center justify-center gap-6 transition-colors duration-350 ${
        theme === 'dark' ? 'bg-[#060608]' : 'bg-[#f0f0f7]'
      }`}
      data-theme={theme}
    >
      {/* Fondo gradiente */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            theme === 'dark'
              ? 'radial-gradient(ellipse 60% 40% at 20% 0%, #7c6dfa0a 0%, transparent 60%), radial-gradient(ellipse 40% 30% at 80% 100%, #c8f1350a 0%, transparent 60%)'
              : 'radial-gradient(ellipse 60% 40% at 20% 0%, #5b4de808 0%, transparent 60%), radial-gradient(ellipse 40% 30% at 80% 100%, #5a9e0008 0%, transparent 60%)',
        }}
      />

      {/* Contenido */}
      <div className="relative z-10">
        {/* Marca */}
        <div className="flex flex-col items-center gap-2 mb-8">
          <div
            className={`w-14 h-14 rounded-[18px] flex items-center justify-center text-2xl transition-all ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-[#7c6dfa] to-[#c8f135] shadow-[0_0_30px_#7c6dfa44]'
                : 'bg-gradient-to-br from-[#5b4de8] to-[#5a9e00] shadow-[0_0_30px_#5b4de808]'
            }`}
          >
            📻
          </div>
          <h1
            className={`text-2xl font-bold tracking-tighter transition-colors ${
              theme === 'dark' ? 'text-[#eeeef5]' : 'text-[#12121e]'
            }`}
          >
            Radio<span className={theme === 'dark' ? 'text-[#c8f135]' : 'text-[#5a9e00]'}>Biz</span>
          </h1>
          <div
            className={`text-xs font-bold px-3.5 py-1 rounded-full transition-colors ${
              theme === 'dark'
                ? 'bg-[#14141c] border border-[#ffffff14] text-[#b0b0cc]'
                : 'bg-[#dddde8] border border-[#00000018] text-[#3a3a58]'
            }`}
          >
            {clientName || 'Cargando...'}
          </div>
          <p className={`text-xs transition-colors ${theme === 'dark' ? 'text-[#5a5a78]' : 'text-[#7070a0]'}`}>
            Sistema de audio para negocios
          </p>
        </div>

        {/* Botón de tema */}
        <div className="flex justify-center mb-6">
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-mono text-xs font-bold transition-all cursor-pointer ${
              theme === 'dark'
                ? 'bg-[#14141c] border border-[#ffffff14] text-[#b0b0cc] hover:border-[#ffffff24] hover:text-[#eeeef5]'
                : 'bg-[#eaeaf4] border border-[#00000018] text-[#3a3a58] hover:border-[#00000028] hover:text-[#12121e]'
            }`}
          >
            <span>{themeIcon}</span>
            <span>{themeLabel}</span>
          </button>
        </div>

        {/* Tarjeta PIN */}
        <form
          onSubmit={handleSubmit}
          className={`px-7 py-8 rounded-3xl transition-colors ${
            theme === 'dark'
              ? 'bg-[#0d0d12] border border-[#ffffff14] shadow-[0_4px_24px_#00000055]'
              : 'bg-white border border-[#00000018] shadow-[0_4px_24px_#0000001a]'
          }`}
          style={{ width: 'min(340px, 92vw)' }}
        >
          <h2 className={`text-base font-bold text-center mb-1 transition-colors ${theme === 'dark' ? 'text-[#eeeef5]' : 'text-[#12121e]'}`}>
            Acceso al reproductor
          </h2>
          <p className={`text-xs text-center mb-5.5 font-mono transition-colors ${theme === 'dark' ? 'text-[#5a5a78]' : 'text-[#7070a0]'}`}>
            Ingresa tu PIN de acceso
          </p>

          {/* Puntos PIN */}
          <div className="flex justify-center gap-3.25 mb-5.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className={`w-3.5 h-3.5 rounded-full transition-all ${
                  i < pinInput.length
                    ? theme === 'dark'
                      ? 'bg-[#7c6dfa] border border-[#7c6dfa] shadow-[0_0_10px_#7c6dfa55]'
                      : 'bg-[#5b4de8] border border-[#5b4de8] shadow-[0_0_10px_#5b4de808]'
                    : theme === 'dark'
                      ? 'bg-[#1c1c27] border border-[#ffffff14]'
                      : 'bg-[#dddde8] border border-[#00000018]'
                }`}
              />
            ))}
          </div>

          {/* Teclado numérico */}
          <div className="grid grid-cols-3 gap-2 mb-2.5">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeyPress(num)}
                className={`py-3.75 px-2 text-xl font-bold rounded-2xl transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-[#14141c] border border-[#ffffff14] text-[#eeeef5] hover:bg-[#1c1c27] active:scale-90'
                    : 'bg-[#eaeaf4] border border-[#00000018] text-[#12121e] hover:bg-[#dddde8] active:scale-90'
                }`}
              >
                {num}
              </button>
            ))}

            {/* Fila inferior: Backspace, 0, Submit */}
            <button
              type="button"
              onClick={() => handleKeyPress('⌫')}
              className={`py-3.75 px-2 text-xl font-bold rounded-2xl transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'bg-[#14141c] border border-[#ffffff14] text-[#eeeef5] hover:bg-[#1c1c27] active:scale-90'
                  : 'bg-[#eaeaf4] border border-[#00000018] text-[#12121e] hover:bg-[#dddde8] active:scale-90'
              }`}
            >
              ⌫
            </button>

            <button
              type="button"
              onClick={() => handleKeyPress('0')}
              className={`py-3.75 px-2 text-xl font-bold rounded-2xl transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'bg-[#14141c] border border-[#ffffff14] text-[#eeeef5] hover:bg-[#1c1c27] active:scale-90'
                  : 'bg-[#eaeaf4] border border-[#00000018] text-[#12121e] hover:bg-[#dddde8] active:scale-90'
              }`}
            >
              0
            </button>

            <button
              type="button"
              onClick={() => handleKeyPress('✓')}
              className={`py-3.75 px-2 text-xl font-bold rounded-2xl transition-all cursor-pointer bg-gradient-to-br from-[#7c6dfa] to-[#6358e8] text-white hover:shadow-lg active:scale-90`}
              disabled={pinInput.length < 4}
            >
              ✓
            </button>
          </div>

          {/* Mensaje de error */}
          <div className={`text-xs text-center font-mono min-h-3.5 transition-colors ${error ? (theme === 'dark' ? 'text-[#ff6b35]' : 'text-[#e05a1a]') : ''}`}>
            {error && error}
          </div>

          {/* Hint */}
          <p className={`text-xs text-center mt-3 font-mono transition-colors ${theme === 'dark' ? 'text-[#3a3a52]' : 'text-[#a0a0c0]'}`}>
            Contacta a RadioBiz para tu PIN
          </p>
        </form>
      </div>
    </div>
  );
}
