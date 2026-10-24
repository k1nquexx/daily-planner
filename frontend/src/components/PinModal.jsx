import React, { useState, useEffect, useRef } from 'react';
import { Lock, ArrowRight, Delete, KeyRound, Sparkles } from 'lucide-react';

export default function PinModal({ onUnlock }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const submitPin = async (pinToTest) => {
    setLoading(true);
    setError('');
    try {
      await onUnlock(pinToTest);
    } catch (err) {
      setError(err.message || 'Неверный PIN-код (по умолчанию: 1234)');
      setPin('');
      if (inputRef.current) inputRef.current.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleDigit = (digit) => {
    if (pin.length < 6) {
      const newPin = pin + digit;
      setPin(newPin);
      setError('');
      if (newPin.length === 4) {
        submitPin(newPin);
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError('');
  };

  // Keyboard listener for physical keyboard and numpad
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (loading) return;

      if (/^[0-9]$/.test(e.key)) {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === 'Enter') {
        if (pin.length >= 4) {
          submitPin(pin);
        } else if (pin.length === 0) {
          // Auto-submit default pin on Enter if empty
          submitPin('1234');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin, loading]);

  const handleQuickEnter = () => {
    submitPin('1234');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 select-none">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-2xl text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20">
          <Lock className="h-8 w-8" />
        </div>

        <h2 className="text-2xl font-bold text-white tracking-tight">DayFlow</h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-400">
          Введите PIN на клавиатуре или кнопками ниже
        </p>

        {/* PIN Dots */}
        <div className="my-5 flex justify-center gap-3">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`h-4 w-4 rounded-full transition-all duration-200 ${
                pin.length > idx
                  ? 'bg-indigo-500 scale-125 shadow-lg shadow-indigo-500/50'
                  : 'bg-slate-800 border border-slate-700'
              }`}
            />
          ))}
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 p-2.5 text-xs text-rose-400 animate-pulse">
            {error}
          </div>
        )}

        {/* Quick 1-click enter button for convenience */}
        <button
          type="button"
          onClick={handleQuickEnter}
          disabled={loading}
          className="w-full mb-4 py-2.5 px-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-600/30"
        >
          <Sparkles className="h-4 w-4" />
          <span>{loading ? 'Вход...' : 'Войти в 1 клик (PIN: 1234)'}</span>
        </button>

        {/* Digital Numpad */}
        <div className="grid grid-cols-3 gap-2.5 mb-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleDigit(num.toString())}
              disabled={loading}
              className="h-12 rounded-2xl bg-slate-800/70 hover:bg-slate-800 active:bg-indigo-600 active:text-white border border-slate-700/50 text-lg font-medium text-slate-200 transition-all flex items-center justify-center cursor-pointer"
            >
              {num}
            </button>
          ))}
          <div />
          <button
            type="button"
            onClick={() => handleDigit('0')}
            disabled={loading}
            className="h-12 rounded-2xl bg-slate-800/70 hover:bg-slate-800 active:bg-indigo-600 active:text-white border border-slate-700/50 text-lg font-medium text-slate-200 transition-all flex items-center justify-center cursor-pointer"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="h-12 rounded-2xl bg-slate-800/40 hover:bg-slate-800 active:bg-slate-700 text-slate-400 hover:text-slate-200 transition-all flex items-center justify-center cursor-pointer"
          >
            <Delete className="h-4 w-4" />
          </button>
        </div>

        <p className="text-[11px] text-slate-500">
          Работает как с клавиатуры (цифры 0-9), так и кликами мыши
        </p>
      </div>
    </div>
  );
}
