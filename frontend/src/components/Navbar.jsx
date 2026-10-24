import React from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Flame,
  Smartphone,
  Lock,
  KeyRound
} from 'lucide-react';
import {
  formatLocalDate,
  parseLocalDate,
  getTodayStr,
  formatDateTitle
} from '../utils/dateUtils';

export default function Navbar({
  selectedDate,
  onDateChange,
  streak,
  completionPercent,
  isSynced,
  onOpenPhoneModal,
  onOpenPinModal,
  onLock,
}) {
  const handlePrevDay = () => {
    const d = parseLocalDate(selectedDate);
    d.setDate(d.getDate() - 1);
    onDateChange(formatLocalDate(d));
  };

  const handleNextDay = () => {
    const d = parseLocalDate(selectedDate);
    d.setDate(d.getDate() + 1);
    onDateChange(formatLocalDate(d));
  };

  const handleGoToday = () => {
    onDateChange(getTodayStr());
  };

  const isToday = selectedDate === getTodayStr();

  return (
    <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Stats */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-md shadow-indigo-500/20 text-white font-bold text-lg">
              D
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white block leading-tight">DayFlow</span>
              <span className="text-[10px] text-slate-400 font-medium">Daily Focus & Review</span>
            </div>
          </div>

          {/* Streak pill */}
          <div
            title="Серия дней продуктивности"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold"
          >
            <Flame className="h-3.5 w-3.5 fill-amber-400" />
            <span>{streak} дн.</span>
          </div>

          {/* Live Sync Indicator */}
          <div
            title={isSynced ? 'Мгновенная синхронизация активна' : 'Подключение к серверу...'}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300"
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isSynced ? 'bg-emerald-400 shadow-sm shadow-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="text-[11px] text-slate-400">{isSynced ? 'Live Sync' : 'Connecting'}</span>
          </div>
        </div>

        {/* Date Navigator */}
        <div className="flex items-center gap-1 rounded-2xl bg-slate-800/90 border border-slate-700/80 p-1 shadow-inner">
          <button
            type="button"
            onClick={handlePrevDay}
            title="Предыдущий день"
            className="p-1.5 rounded-xl hover:bg-slate-700/70 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <span className="px-3 text-xs sm:text-sm font-semibold text-slate-100 min-w-[130px] text-center capitalize">
            {formatDateTitle(selectedDate)}
          </span>

          <button
            type="button"
            onClick={handleNextDay}
            title="Следующий день"
            className="p-1.5 rounded-xl hover:bg-slate-700/70 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {!isToday && (
            <button
              type="button"
              onClick={handleGoToday}
              className="ml-1 px-2.5 py-1 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/30 text-indigo-300 text-xs font-medium transition-colors cursor-pointer"
            >
              Сегодня
            </button>
          )}

          <div className="relative flex items-center">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                if (e.target.value) {
                  onDateChange(e.target.value);
                }
              }}
              className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
              id="hidden-date-picker"
            />
            <label
              htmlFor="hidden-date-picker"
              className="p-1.5 rounded-xl hover:bg-slate-700/70 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              title="Выбрать любую дату в календаре"
            >
              <Calendar className="h-4 w-4" />
            </label>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenPhoneModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-medium transition-colors cursor-pointer"
            title="Открыть на смартфоне"
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Телефон</span>
          </button>

          <button
            type="button"
            onClick={onOpenPinModal}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Сменить PIN"
          >
            <KeyRound className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={onLock}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 hover:text-rose-400 text-slate-300 transition-colors cursor-pointer"
            title="Заблокировать"
          >
            <Lock className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
