import React, { useState, useEffect, useRef } from 'react';
import { Award, Sparkles, BatteryCharging, Smile, Check, Loader2, BookOpen } from 'lucide-react';
import { api } from '../services/api';

const MOODS = [
  { score: 1, emoji: '😫', label: 'Тяжело' },
  { score: 2, emoji: '😕', label: 'Слабо' },
  { score: 3, emoji: '😐', label: 'Норма' },
  { score: 4, emoji: '🙂', label: 'Хорошо' },
  { score: 5, emoji: '🚀', label: 'Огонь!' },
];

const ENERGIES = [
  { score: 1, icon: '🪫', label: '1 - Спад' },
  { score: 2, icon: '🔋', label: '2 - Мало' },
  { score: 3, icon: '⚡', label: '3 - Норм' },
  { score: 4, icon: '⚡⚡', label: '4 - Бодро' },
  { score: 5, icon: '🔥', label: '5 - Макс' },
];

export default function DailyReviewSection({ selectedDate, onReviewUpdated }) {
  const [moodScore, setMoodScore] = useState(3);
  const [energyScore, setEnergyScore] = useState(3);
  const [wins, setWins] = useState('');
  const [reflections, setReflections] = useState('');
  const [savingStatus, setSavingStatus] = useState('idle'); // idle, saving, saved
  const saveTimeoutRef = useRef(null);

  // Load review when selectedDate changes
  useEffect(() => {
    let active = true;
    api.getReview(selectedDate)
      .then((review) => {
        if (!active) return;
        if (review) {
          setMoodScore(review.moodScore || 3);
          setEnergyScore(review.energyScore || 3);
          setWins(review.wins || '');
          setReflections(review.reflections || '');
        } else {
          setMoodScore(3);
          setEnergyScore(3);
          setWins('');
          setReflections('');
        }
      })
      .catch((err) => console.error('Failed to load review:', err));

    return () => {
      active = false;
    };
  }, [selectedDate]);

  const triggerAutoSave = (newMood, newEnergy, newWins, newReflections) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    setSavingStatus('saving');
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await api.saveReview({
          reviewDate: selectedDate,
          moodScore: newMood !== undefined ? newMood : moodScore,
          energyScore: newEnergy !== undefined ? newEnergy : energyScore,
          wins: newWins !== undefined ? newWins : wins,
          reflections: newReflections !== undefined ? newReflections : reflections,
        });
        setSavingStatus('saved');
        onReviewUpdated();
        setTimeout(() => setSavingStatus('idle'), 2500);
      } catch (err) {
        console.error('Failed to auto-save review:', err);
        setSavingStatus('idle');
      }
    }, 800);
  };

  const handleMoodSelect = (score) => {
    setMoodScore(score);
    triggerAutoSave(score, energyScore, wins, reflections);
  };

  const handleEnergySelect = (score) => {
    setEnergyScore(score);
    triggerAutoSave(moodScore, score, wins, reflections);
  };

  return (
    <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Итоги дня и рефлексия</h3>
            <p className="text-xs text-slate-400">Зафиксируйте результаты и выводы</p>
          </div>
        </div>

        {/* Auto-save indicator */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          {savingStatus === 'saving' && (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400" />
              <span>Сохранение...</span>
            </>
          )}
          {savingStatus === 'saved' && (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Сохранено</span>
            </>
          )}
        </div>
      </div>

      {/* Mood Selector - Full Width */}
      <div className="rounded-2xl bg-slate-800/40 border border-slate-700/50 p-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <div className="flex items-center gap-1.5">
            <Smile className="h-4 w-4 text-amber-400" />
            <span>Настроение дня:</span>
          </div>
          <span className="text-indigo-400 font-medium">
            {MOODS.find((m) => m.score === moodScore)?.label}
          </span>
        </div>
        <div className="grid grid-cols-5 gap-1.5 pt-1">
          {MOODS.map((m) => (
            <button
              key={m.score}
              type="button"
              onClick={() => handleMoodSelect(m.score)}
              title={m.label}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all cursor-pointer ${
                moodScore === m.score
                  ? 'bg-indigo-600/30 border border-indigo-500 text-white shadow-md shadow-indigo-600/30 scale-105'
                  : 'bg-slate-900/50 hover:bg-slate-700/50 text-slate-400 border border-slate-800/80'
              }`}
            >
              <span className="text-xl sm:text-2xl">{m.emoji}</span>
              <span className="text-[10px] mt-1 font-medium truncate max-w-full">
                {m.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Energy Selector - Full Width */}
      <div className="rounded-2xl bg-slate-800/40 border border-slate-700/50 p-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <div className="flex items-center gap-1.5">
            <BatteryCharging className="h-4 w-4 text-emerald-400" />
            <span>Уровень энергии:</span>
          </div>
          <span className="text-emerald-400 font-medium">
            {ENERGIES.find((e) => e.score === energyScore)?.label}
          </span>
        </div>
        <div className="grid grid-cols-5 gap-1.5 pt-1">
          {ENERGIES.map((e) => (
            <button
              key={e.score}
              type="button"
              onClick={() => handleEnergySelect(e.score)}
              title={e.label}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all cursor-pointer ${
                energyScore === e.score
                  ? 'bg-emerald-600/30 border border-emerald-500 text-emerald-200 shadow-md shadow-emerald-600/30 scale-105'
                  : 'bg-slate-900/50 hover:bg-slate-700/50 text-slate-400 border border-slate-800/80'
              }`}
            >
              <span className="text-base sm:text-lg">{e.icon}</span>
              <span className="text-[10px] mt-0.5 font-medium truncate max-w-full">
                {e.score}/5
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Wins of the Day */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
          <Award className="h-4 w-4 text-amber-400" />
          <span>Главные победы и результаты дня:</span>
        </label>
        <textarea
          rows={3}
          placeholder="Что сегодня получилось здорово? Какие результаты достигнуты? Чем гордишься?"
          value={wins}
          onChange={(e) => {
            setWins(e.target.value);
            triggerAutoSave(moodScore, energyScore, e.target.value, reflections);
          }}
          className="w-full rounded-2xl bg-slate-800/60 border border-slate-700/80 p-3 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
        />
      </div>

      {/* Reflections / Free Notes */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
          <Sparkles className="h-4 w-4 text-indigo-400" />
          <span>Мысли, инсайты и заметки:</span>
        </label>
        <textarea
          rows={3}
          placeholder="Свободные мысли, что можно улучшить завтра, идеи или заметки дня..."
          value={reflections}
          onChange={(e) => {
            setReflections(e.target.value);
            triggerAutoSave(moodScore, energyScore, wins, e.target.value);
          }}
          className="w-full rounded-2xl bg-slate-800/60 border border-slate-700/80 p-3 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
        />
      </div>
    </div>
  );
}
