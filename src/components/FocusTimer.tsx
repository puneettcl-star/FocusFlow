import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  CheckCircle, 
  Maximize2, 
  Minimize2, 
  Volume2, 
  VolumeX, 
  BookOpen, 
  CheckSquare, 
  Sparkles, 
  Coffee,
  Brain,
  Timer as TimerIcon,
  Flame,
  Clock
} from 'lucide-react';
import { Subject, Task, FocusMode } from '../types';
import { playFocusCompleteSound } from '../utils/audio';
import { safeRequestNotificationPermission, safeSendNotification } from '../utils/notification';

interface FocusTimerProps {
  subjects: Subject[];
  tasks: Task[];
  initialTaskId?: string;
  initialSubjectId?: string;
  onSessionCompleted: (sessionData: {
    durationMinutes: number;
    mode: FocusMode;
    taskId?: string;
    taskTitle?: string;
    subjectId?: string;
    subjectName?: string;
    notes?: string;
  }) => Promise<void>;
  onRunningChange?: (isRunning: boolean, secondsRemaining: number) => void;
}

const PRESET_MODES: { mode: FocusMode; label: string; defaultMinutes: number; isBreak?: boolean }[] = [
  { mode: 'pomodoro', label: 'Pomodoro (25m)', defaultMinutes: 25 },
  { mode: 'deep_work', label: 'Focus Session (50m)', defaultMinutes: 50 },
  { mode: 'short_break', label: 'Short Break (5m)', defaultMinutes: 5, isBreak: true },
  { mode: 'long_break', label: 'Long Break (15m)', defaultMinutes: 15, isBreak: true },
  { mode: 'custom', label: 'Custom Timer', defaultMinutes: 30 },
  { mode: 'stopwatch', label: 'Stopwatch', defaultMinutes: 0 },
];

export const FocusTimer: React.FC<FocusTimerProps> = ({
  subjects,
  tasks,
  initialTaskId,
  initialSubjectId,
  onSessionCompleted,
  onRunningChange,
}) => {
  const [selectedMode, setSelectedMode] = useState<FocusMode>('pomodoro');
  const [customMinutes, setCustomMinutes] = useState(30);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(initialSubjectId || '');
  const [selectedTaskId, setSelectedTaskId] = useState<string>(initialTaskId || '');

  // Timer duration and remaining
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);

  // Absolute timestamp refs for background/tab-switch immunity
  const targetEndTimeRef = useRef<number | null>(null);
  const stopwatchStartTimeRef = useRef<number | null>(null);
  const stopwatchAccumulatedRef = useRef<number>(0);

  // Settings & Modes
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isZenMode, setIsZenMode] = useState(false);

  // Completion modal state
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [loggedMinutes, setLoggedMinutes] = useState(0);
  const [sessionNotes, setSessionNotes] = useState('');
  const [isSavingSession, setIsSavingSession] = useState(false);

  // Sync initial task / subject
  useEffect(() => {
    if (initialTaskId) {
      setSelectedTaskId(initialTaskId);
      const foundTask = tasks.find(t => t.id === initialTaskId);
      if (foundTask?.subjectId) {
        setSelectedSubjectId(foundTask.subjectId);
      }
    }
    if (initialSubjectId) {
      setSelectedSubjectId(initialSubjectId);
    }
  }, [initialTaskId, initialSubjectId, tasks]);

  // Request browser notification permission politely when user starts timer
  const requestNotificationPermission = () => {
    safeRequestNotificationPermission().catch(() => {});
  };

  // Completion handler
  const triggerSessionCompletion = useCallback((elapsedSecs?: number) => {
    setIsRunning(false);
    targetEndTimeRef.current = null;
    stopwatchStartTimeRef.current = null;

    if (soundEnabled) {
      playFocusCompleteSound();
    }

    // Desktop notification if in background
    if (document.hidden) {
      safeSendNotification('Focus Flow: Session Complete!', {
        body: 'Your focus session has finished. Take a moment to record your notes!',
        icon: '/favicon.ico',
      });
    }

    const duration = elapsedSecs !== undefined
      ? Math.max(1, Math.round(elapsedSecs / 60))
      : Math.max(1, Math.round(totalSeconds / 60));

    setLoggedMinutes(duration);
    setShowCompletionModal(true);
  }, [soundEnabled, totalSeconds]);

  // Handle Mode Selection
  const handleModeSelect = (mode: FocusMode) => {
    setIsRunning(false);
    targetEndTimeRef.current = null;
    stopwatchStartTimeRef.current = null;
    stopwatchAccumulatedRef.current = 0;
    setSelectedMode(mode);

    if (mode === 'stopwatch') {
      setStopwatchSeconds(0);
      setTotalSeconds(0);
      setSecondsRemaining(0);
    } else if (mode === 'custom') {
      const secs = customMinutes * 60;
      setTotalSeconds(secs);
      setSecondsRemaining(secs);
    } else {
      const preset = PRESET_MODES.find(p => p.mode === mode);
      const mins = preset?.defaultMinutes || 25;
      const secs = mins * 60;
      setTotalSeconds(secs);
      setSecondsRemaining(secs);
    }
  };

  // Update timer via absolute timestamp (Immune to browser tab backgrounding and throttling)
  const syncTimerFromTimestamp = useCallback(() => {
    if (!isRunning) return;

    if (selectedMode === 'stopwatch') {
      if (stopwatchStartTimeRef.current) {
        const elapsed = stopwatchAccumulatedRef.current + (Date.now() - stopwatchStartTimeRef.current);
        setStopwatchSeconds(Math.floor(elapsed / 1000));
      }
    } else {
      if (targetEndTimeRef.current) {
        const remaining = Math.max(0, Math.ceil((targetEndTimeRef.current - Date.now()) / 1000));
        setSecondsRemaining(remaining);

        if (remaining <= 0) {
          triggerSessionCompletion();
        }
      }
    }
  }, [isRunning, selectedMode, triggerSessionCompletion]);

  // Interval ticker and Page Visibility event listener
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning) {
      interval = setInterval(syncTimerFromTimestamp, 500);

      const handleVisibilityChange = () => {
        if (!document.hidden) {
          syncTimerFromTimestamp();
        }
      };

      const handleWindowFocus = () => {
        syncTimerFromTimestamp();
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('focus', handleWindowFocus);

      return () => {
        if (interval) clearInterval(interval);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('focus', handleWindowFocus);
      };
    }
  }, [isRunning, syncTimerFromTimestamp]);

  // Notify parent of running state
  useEffect(() => {
    if (onRunningChange) {
      onRunningChange(
        isRunning, 
        selectedMode === 'stopwatch' ? stopwatchSeconds : secondsRemaining
      );
    }
  }, [isRunning, secondsRemaining, stopwatchSeconds, selectedMode, onRunningChange]);

  // Start / Pause / Resume
  const handleStartPause = () => {
    if (!isRunning) {
      // Starting or Resuming
      requestNotificationPermission();
      if (selectedMode === 'stopwatch') {
        stopwatchStartTimeRef.current = Date.now();
      } else {
        targetEndTimeRef.current = Date.now() + secondsRemaining * 1000;
      }
      setIsRunning(true);
    } else {
      // Pausing
      if (selectedMode === 'stopwatch') {
        if (stopwatchStartTimeRef.current) {
          stopwatchAccumulatedRef.current += Date.now() - stopwatchStartTimeRef.current;
          stopwatchStartTimeRef.current = null;
        }
      } else {
        if (targetEndTimeRef.current) {
          const remaining = Math.max(0, Math.ceil((targetEndTimeRef.current - Date.now()) / 1000));
          setSecondsRemaining(remaining);
          targetEndTimeRef.current = null;
        }
      }
      setIsRunning(false);
    }
  };

  // Reset
  const handleReset = () => {
    setIsRunning(false);
    targetEndTimeRef.current = null;
    stopwatchStartTimeRef.current = null;
    stopwatchAccumulatedRef.current = 0;

    if (selectedMode === 'stopwatch') {
      setStopwatchSeconds(0);
    } else if (selectedMode === 'custom') {
      const secs = customMinutes * 60;
      setSecondsRemaining(secs);
    } else {
      const preset = PRESET_MODES.find(p => p.mode === selectedMode);
      const secs = (preset?.defaultMinutes || 25) * 60;
      setSecondsRemaining(secs);
    }
  };

  // Skip feature (User requirement: Skip)
  const handleSkip = () => {
    setIsRunning(false);
    targetEndTimeRef.current = null;
    stopwatchStartTimeRef.current = null;

    if (selectedMode === 'pomodoro' || selectedMode === 'deep_work') {
      // Skip focus into short break
      handleModeSelect('short_break');
    } else if (selectedMode === 'short_break' || selectedMode === 'long_break') {
      // Skip break back into pomodoro focus
      handleModeSelect('pomodoro');
    } else {
      // For custom or stopwatch, reset
      handleReset();
    }
  };

  // Finish early and record session
  const handleCompleteEarly = () => {
    let elapsed = 0;
    if (selectedMode === 'stopwatch') {
      elapsed = stopwatchSeconds;
    } else {
      elapsed = totalSeconds - secondsRemaining;
    }
    triggerSessionCompletion(elapsed);
  };

  // Save session to history
  const handleSaveSession = async () => {
    setIsSavingSession(true);
    const chosenSubject = subjects.find(s => s.id === selectedSubjectId);
    const chosenTask = tasks.find(t => t.id === selectedTaskId);

    try {
      await onSessionCompleted({
        durationMinutes: loggedMinutes,
        mode: selectedMode,
        taskId: chosenTask?.id,
        taskTitle: chosenTask?.title,
        subjectId: chosenSubject?.id,
        subjectName: chosenSubject?.name,
        notes: sessionNotes.trim() || undefined,
      });

      setShowCompletionModal(false);
      setSessionNotes('');
      handleReset();
    } catch (err) {
      console.error('Failed to save focus session:', err);
    } finally {
      setIsSavingSession(false);
    }
  };

  // Time display math
  const displaySeconds = selectedMode === 'stopwatch' ? stopwatchSeconds : secondsRemaining;
  const minutes = Math.floor(displaySeconds / 60);
  const seconds = displaySeconds % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Progress percentage
  const progressPercent = selectedMode === 'stopwatch'
    ? 100
    : totalSeconds > 0
    ? ((totalSeconds - secondsRemaining) / totalSeconds) * 100
    : 0;

  const currentSubject = subjects.find(s => s.id === selectedSubjectId);
  const currentTask = tasks.find(t => t.id === selectedTaskId);

  return (
    <div 
      id="focus-timer-container" 
      className={`transition-all duration-300 ${
        isZenMode 
          ? 'fixed inset-0 z-50 bg-slate-950 text-white flex flex-col justify-between p-8' 
          : 'max-w-4xl mx-auto py-6 px-4 sm:px-6'
      }`}
    >
      {/* Top Header Controls in Zen Mode */}
      {isZenMode && (
        <div className="flex items-center justify-between max-w-4xl mx-auto w-full">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Zen Focus Active</span>
          </div>

          <button
            type="button"
            onClick={() => setIsZenMode(false)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Exit Zen Mode</span>
          </button>
        </div>
      )}

      {/* Main Standard View Layout */}
      <div className={`space-y-6 ${isZenMode ? 'my-auto max-w-xl mx-auto w-full' : ''}`}>
        
        {/* Optional Subject & Task Selection Bar (Allowed before starting a session) */}
        {!isZenMode && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-indigo-600" />
                <span>Session Target (Optional)</span>
              </span>
              {(selectedSubjectId || selectedTaskId) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSubjectId('');
                    setSelectedTaskId('');
                  }}
                  className="text-[11px] font-semibold text-slate-400 hover:text-slate-600"
                >
                  Clear Selection
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Select Subject */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Attach Subject
                </label>
                <select
                  id="select-focus-subject"
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">No subject attached (General Study)</option>
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Task */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Attach Task
                </label>
                <select
                  id="select-focus-task"
                  value={selectedTaskId}
                  onChange={(e) => {
                    const tId = e.target.value;
                    setSelectedTaskId(tId);
                    const task = tasks.find(t => t.id === tId);
                    if (task?.subjectId && !selectedSubjectId) {
                      setSelectedSubjectId(task.subjectId);
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">No specific task selected</option>
                  {tasks
                    .filter(t => !t.completed)
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title} {t.subjectName ? `(${t.subjectName})` : ''}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Focus Timer Main Card */}
        <div className={`rounded-3xl border transition-all ${
          isZenMode 
            ? 'bg-slate-900/60 border-slate-800 shadow-2xl p-8' 
            : 'bg-white border-slate-200/80 shadow-xs p-6 sm:p-10'
        }`}>
          
          {/* Mode Selector Chips */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mb-8">
            {PRESET_MODES.map((preset) => {
              const isSelected = selectedMode === preset.mode;
              return (
                <button
                  key={preset.mode}
                  id={`btn-mode-${preset.mode}`}
                  type="button"
                  onClick={() => handleModeSelect(preset.mode)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? isZenMode
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-indigo-600 text-white shadow-xs'
                      : isZenMode
                      ? 'bg-slate-800 text-slate-400 hover:text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          {/* Custom timer duration input if custom mode selected */}
          {selectedMode === 'custom' && !isRunning && (
            <div className="flex items-center justify-center gap-3 mb-6 animate-in fade-in">
              <span className={`text-xs font-semibold ${isZenMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Custom Minutes:
              </span>
              <input
                type="number"
                min="1"
                max="240"
                value={customMinutes}
                onChange={(e) => {
                  const val = Math.max(1, Math.min(240, Number(e.target.value) || 1));
                  setCustomMinutes(val);
                  setTotalSeconds(val * 60);
                  setSecondsRemaining(val * 60);
                }}
                className={`w-20 px-3 py-1.5 rounded-xl text-center font-mono font-bold text-sm border ${
                  isZenMode 
                    ? 'bg-slate-800 border-slate-700 text-white' 
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              />
            </div>
          )}

          {/* Active Context Banner */}
          {(currentSubject || currentTask) && (
            <div className={`mb-6 p-2.5 rounded-xl text-center text-xs font-medium max-w-md mx-auto truncate ${
              isZenMode ? 'bg-slate-800/80 text-slate-300' : 'bg-indigo-50/60 text-indigo-950 border border-indigo-100/60'
            }`}>
              {currentSubject && (
                <span className="font-bold mr-1.5" style={{ color: currentSubject.color }}>
                  ● {currentSubject.name}
                </span>
              )}
              {currentTask && (
                <span className="text-slate-600">
                  {currentSubject ? '— ' : ''}{currentTask.title}
                </span>
              )}
            </div>
          )}

          {/* Timer Display Display (Circular or Linear visual indicator) */}
          <div className="flex flex-col items-center justify-center py-4">
            <div className={`text-6xl sm:text-8xl font-black font-mono tracking-tight select-none tabular-nums ${
              isZenMode ? 'text-white' : 'text-slate-900'
            }`}>
              {timeFormatted}
            </div>

            {/* Subtitle status */}
            <div className="flex items-center gap-2 mt-3">
              <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
              <span className={`text-xs font-bold uppercase tracking-wider ${isZenMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {isRunning ? 'Session in progress' : 'Timer paused / ready'}
              </span>
            </div>

            {/* Subtle Progress Bar */}
            {selectedMode !== 'stopwatch' && (
              <div className="w-full max-w-md bg-slate-100 rounded-full h-2 mt-6 overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            )}
          </div>

          {/* Controls: Start, Pause, Resume, Reset, Skip */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            
            {/* Reset Button */}
            <button
              id="btn-timer-reset"
              type="button"
              onClick={handleReset}
              title="Reset Timer"
              className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                isZenMode
                  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            {/* Primary Start / Pause / Resume Button */}
            <button
              id="btn-timer-start-pause"
              type="button"
              onClick={handleStartPause}
              className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-extrabold rounded-2xl shadow-lg shadow-indigo-600/25 flex items-center gap-2.5 transition-all transform active:scale-95 cursor-pointer"
            >
              {isRunning ? (
                <>
                  <Pause className="w-5 h-5 fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span>{secondsRemaining < totalSeconds && selectedMode !== 'stopwatch' ? 'Resume' : 'Start Focus'}</span>
                </>
              )}
            </button>

            {/* Skip Button (Required by user prompt) */}
            <button
              id="btn-timer-skip"
              type="button"
              onClick={handleSkip}
              title="Skip Session / Break"
              className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                isZenMode
                  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <SkipForward className="w-5 h-5" />
            </button>

            {/* Complete Early Button (Save Session) */}
            {(isRunning || secondsRemaining < totalSeconds || stopwatchSeconds > 0) && (
              <button
                id="btn-timer-complete-early"
                type="button"
                onClick={handleCompleteEarly}
                className={`px-4 py-3 rounded-2xl border text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  isZenMode
                    ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300 hover:bg-emerald-900/50'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                <span>Finish & Log</span>
              </button>
            )}
          </div>

          {/* Bottom Zen Mode & Audio Toggles */}
          {!isZenMode && (
            <div className="flex items-center justify-between pt-8 mt-8 border-t border-slate-100 text-xs text-slate-500">
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="flex items-center gap-1.5 hover:text-slate-800 transition-colors"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                <span>Sound Chime: {soundEnabled ? 'Enabled' : 'Muted'}</span>
              </button>

              <button
                id="btn-enter-zen-mode"
                type="button"
                onClick={() => setIsZenMode(true)}
                className="flex items-center gap-1.5 font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
              >
                <Maximize2 className="w-4 h-4" />
                <span>Distraction-Free Zen Mode</span>
              </button>
            </div>
          )}

        </div>

      </div>

      {/* Session Completion Modal (Logs to user's study history) */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-5 text-slate-900">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-2">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">
                Focus Session Completed!
              </h3>
              <p className="text-xs text-slate-500">
                Excellent focus! Save this session to your study history.
              </p>
            </div>

            {/* Session Stats Summary */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Session Duration:</span>
                <span className="font-bold text-indigo-600 font-mono text-sm">
                  {loggedMinutes} {loggedMinutes === 1 ? 'minute' : 'minutes'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Subject:</span>
                <span className="font-bold text-slate-800">
                  {currentSubject?.name || 'General Study'}
                </span>
              </div>

              {currentTask && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Task:</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[200px]">
                    {currentTask.title}
                  </span>
                </div>
              )}
            </div>

            {/* Optional Reflection Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Study Reflection / Notes (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g., Reviewed chapter 4 notes, solved 10 calculus problems..."
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowCompletionModal(false);
                  handleReset();
                }}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Discard
              </button>

              <button
                id="btn-save-focus-session"
                type="button"
                disabled={isSavingSession}
                onClick={handleSaveSession}
                className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs disabled:opacity-50"
              >
                {isSavingSession ? 'Saving...' : 'Save to Study History'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
