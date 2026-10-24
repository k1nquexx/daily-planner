import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import TaskSection from './components/TaskSection';
import DailyReviewSection from './components/DailyReviewSection';
import PinModal from './components/PinModal';
import ConnectPhoneModal from './components/ConnectPhoneModal';
import ChangePinModal from './components/ChangePinModal';
import { api, getAuthToken, setAuthToken, clearAuthToken } from './services/api';
import { wsService } from './services/websocket';
import { getTodayStr, getYesterdayStr } from './utils/dateUtils';
import { CheckSquare, BookOpen, Smartphone } from 'lucide-react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [selectedDate, setSelectedDate] = useState(getTodayStr);

  // Data
  const [tasks, setTasks] = useState([]);
  const [summary, setSummary] = useState(null);
  const [yesterdayIncompleteCount, setYesterdayIncompleteCount] = useState(0);

  // UI state
  const [isSynced, setIsSynced] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState('tasks'); // 'tasks', 'review'

  // Load tasks and summary for selected date
  const loadData = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const [tasksData, summaryData] = await Promise.all([
        api.getTasks(selectedDate),
        api.getDailySummary(selectedDate),
      ]);
      setTasks(tasksData || []);
      setSummary(summaryData || null);

      // Check yesterday incomplete tasks if we are viewing today
      const today = getTodayStr();
      if (selectedDate === today) {
        const yStr = getYesterdayStr();
        const yTasks = await api.getTasks(yStr);
        const incomplete = (yTasks || []).filter((t) => !t.completed).length;
        setYesterdayIncompleteCount(incomplete);
      } else {
        setYesterdayIncompleteCount(0);
      }
    } catch (err) {
      console.error('Failed to load daily data:', err);
    }
  }, [selectedDate, isAuthenticated]);

  // Initial Auth Check
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setIsAuthenticated(false);
      setIsCheckingAuth(false);
      return;
    }

    api.verifyAuth()
      .then(() => {
        setIsAuthenticated(true);
      })
      .catch(() => {
        clearAuthToken();
        setIsAuthenticated(false);
      })
      .finally(() => {
        setIsCheckingAuth(false);
      });

    const handleUnauthorized = () => {
      setIsAuthenticated(false);
    };
    window.addEventListener('dayflow_unauthorized', handleUnauthorized);
    return () => window.removeEventListener('dayflow_unauthorized', handleUnauthorized);
  }, []);

  // Connect WebSocket & subscribe when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    wsService.connect();
    const unsubStatus = wsService.onStatusChange((connected) => {
      setIsSynced(connected);
    });

    const unsubSync = wsService.subscribe((event) => {
      // Whenever another device triggers sync, reload current view data
      loadData();
    });

    return () => {
      unsubStatus();
      unsubSync();
    };
  }, [isAuthenticated, loadData]);

  // Load data when date or auth changes
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, selectedDate, loadData]);

  const handleUnlock = async (pin) => {
    const res = await api.login(pin);
    if (res && res.token) {
      setAuthToken(res.token);
      setIsAuthenticated(true);
    }
  };

  const handleLock = () => {
    clearAuthToken();
    setIsAuthenticated(false);
  };

  const handleRolloverYesterday = async () => {
    const yStr = getYesterdayStr();
    const todayStr = getTodayStr();

    try {
      await api.rolloverTasks(yStr, todayStr);
      loadData();
    } catch (err) {
      console.error('Failed to rollover tasks:', err);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs">Загрузка DayFlow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-20 md:pb-6">
      {/* Auth PIN Screen if not authenticated */}
      {!isAuthenticated && <PinModal onUnlock={handleUnlock} />}

      {/* Header */}
      <Navbar
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        streak={summary?.currentStreakDays || 0}
        completionPercent={summary?.completionPercentage || 0}
        isSynced={isSynced}
        onOpenPhoneModal={() => setShowPhoneModal(true)}
        onOpenPinModal={() => setShowPinModal(true)}
        onLock={handleLock}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-5">
        {/* Desktop 2-Column Grid */}
        <div className="hidden md:grid md:grid-cols-12 gap-6 items-start">
          {/* Left Column: Tasks / Planner (7 cols) */}
          <div className="md:col-span-7">
            <TaskSection
              tasks={tasks}
              selectedDate={selectedDate}
              onTasksChanged={loadData}
              yesterdayIncompleteCount={yesterdayIncompleteCount}
              onRolloverYesterday={handleRolloverYesterday}
            />
          </div>

          {/* Right Column: Daily Review & Results (5 cols) */}
          <div className="md:col-span-5 sticky top-20">
            <DailyReviewSection
              selectedDate={selectedDate}
              onReviewUpdated={loadData}
            />
          </div>
        </div>

        {/* Mobile View with Tabs */}
        <div className="md:hidden">
          {activeMobileTab === 'tasks' && (
            <TaskSection
              tasks={tasks}
              selectedDate={selectedDate}
              onTasksChanged={loadData}
              yesterdayIncompleteCount={yesterdayIncompleteCount}
              onRolloverYesterday={handleRolloverYesterday}
            />
          )}

          {activeMobileTab === 'review' && (
            <DailyReviewSection
              selectedDate={selectedDate}
              onReviewUpdated={loadData}
            />
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-6 py-2.5 flex items-center justify-around shadow-2xl">
        <button
          type="button"
          onClick={() => setActiveMobileTab('tasks')}
          className={`flex flex-col items-center gap-1 text-xs cursor-pointer ${
            activeMobileTab === 'tasks' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <CheckSquare className="h-5 w-5" />
          <span>Дела ({tasks.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMobileTab('review')}
          className={`flex flex-col items-center gap-1 text-xs cursor-pointer ${
            activeMobileTab === 'review' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <BookOpen className="h-5 w-5" />
          <span>Итоги дня</span>
        </button>

        <button
          type="button"
          onClick={() => setShowPhoneModal(true)}
          className="flex flex-col items-center gap-1 text-xs text-slate-400 cursor-pointer hover:text-slate-200"
        >
          <Smartphone className="h-5 w-5" />
          <span>Телефон</span>
        </button>
      </nav>

      {/* Modals */}
      {showPhoneModal && (
        <ConnectPhoneModal onClose={() => setShowPhoneModal(false)} />
      )}

      {showPinModal && (
        <ChangePinModal
          onClose={() => setShowPinModal(false)}
          onSuccess={() => alert('PIN успешно обновлен!')}
        />
      )}
    </div>
  );
}
