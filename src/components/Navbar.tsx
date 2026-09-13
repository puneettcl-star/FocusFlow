import React, { useState, useRef, useEffect } from 'react';
import { 
  Flame, 
  Clock, 
  CheckSquare, 
  LayoutDashboard, 
  BookOpen, 
  Timer, 
  Settings, 
  LogOut, 
  ChevronDown, 
  Sparkles,
  CalendarDays,
  Target,
  BarChart3,
  Palette,
  Globe,
  User,
  Lock,
  ArrowRight,
  MoreHorizontal,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { formatMinutes } from '../utils/date';
import { UserAvatar } from './UserAvatar';
import { NavigationTab } from '../types';

interface NavbarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  pendingTasksCount: number;
  overdueTasksCount: number;
  todayStudyMinutes: number;
  isTimerRunning: boolean;
  timerSecondsRemaining: number;
  onOpenSettings: (tab?: 'profile' | 'themes-sounds' | 'account') => void;
  onOpenLandingPage?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  pendingTasksCount,
  overdueTasksCount,
  todayStudyMinutes,
  isTimerRunning,
  timerSecondsRemaining,
  onOpenSettings,
  onOpenLandingPage,
}) => {
  const { currentUser, userProfile, logout } = useAuth();
  const { theme, themeConfig } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const streak = userProfile?.currentStreak || 1;

  const formatTimerPreview = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <>
      {/* Accessible Skip Link for Keyboard Navigation */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2.5 focus:rounded-xl focus:bg-indigo-600 focus:text-white focus:text-xs focus:font-bold focus:shadow-xl focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Skip to main study content
      </a>

      <header className="sticky top-0 z-40 theme-bg-card/90 backdrop-blur-md border-b theme-border transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <button
              id="brand-logo-btn"
              type="button"
              onClick={() => onSelectTab('dashboard')}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl theme-accent-bg flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold theme-text-primary tracking-tight text-base sm:text-lg">
                    Focus Flow
                  </span>
                  <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-bold theme-accent-subtle theme-accent-text border border-current/10 capitalize">
                    {themeConfig.name}
                  </span>
                </div>
              </div>
            </button>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                id="nav-tab-dashboard"
                type="button"
                onClick={() => onSelectTab('dashboard')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  currentTab === 'dashboard'
                    ? 'theme-accent-subtle theme-accent-text font-bold'
                    : 'theme-text-secondary hover:theme-text-primary hover:theme-bg-subtle'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>

              <button
                id="nav-tab-tasks"
                type="button"
                onClick={() => onSelectTab('tasks')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors relative cursor-pointer ${
                  currentTab === 'tasks'
                    ? 'theme-accent-subtle theme-accent-text font-bold'
                    : 'theme-text-secondary hover:theme-text-primary hover:theme-bg-subtle'
                }`}
              >
                <CheckSquare className="w-4 h-4" />
                <span>Tasks</span>
                {overdueTasksCount > 0 ? (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                    {overdueTasksCount}
                  </span>
                ) : pendingTasksCount > 0 ? (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold theme-bg-subtle theme-text-secondary">
                    {pendingTasksCount}
                  </span>
                ) : null}
              </button>

              <button
                id="nav-tab-planner"
                type="button"
                onClick={() => onSelectTab('planner')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  currentTab === 'planner'
                    ? 'theme-accent-subtle theme-accent-text font-bold'
                    : 'theme-text-secondary hover:theme-text-primary hover:theme-bg-subtle'
                }`}
              >
                <CalendarDays className="w-4 h-4" />
                <span>Planner</span>
              </button>

              <button
                id="nav-tab-goals"
                type="button"
                onClick={() => onSelectTab('goals')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  currentTab === 'goals'
                    ? 'theme-accent-subtle theme-accent-text font-bold'
                    : 'theme-text-secondary hover:theme-text-primary hover:theme-bg-subtle'
                }`}
              >
                <Target className="w-4 h-4" />
                <span>Goals</span>
              </button>

              <button
                id="nav-tab-progress"
                type="button"
                onClick={() => onSelectTab('progress')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  currentTab === 'progress'
                    ? 'theme-accent-subtle theme-accent-text font-bold'
                    : 'theme-text-secondary hover:theme-text-primary hover:theme-bg-subtle'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Progress</span>
              </button>

              <button
                id="nav-tab-timer"
                type="button"
                onClick={() => onSelectTab('timer')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  currentTab === 'timer'
                    ? 'theme-accent-subtle theme-accent-text font-bold'
                    : 'theme-text-secondary hover:theme-text-primary hover:theme-bg-subtle'
                }`}
              >
                <Timer className={`w-4 h-4 ${isTimerRunning ? 'text-amber-500 animate-pulse' : ''}`} />
                <span>Timer</span>
                {isTimerRunning && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                    {formatTimerPreview(timerSecondsRemaining)}
                  </span>
                )}
              </button>

              <button
                id="nav-tab-subjects"
                type="button"
                onClick={() => onSelectTab('subjects')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  currentTab === 'subjects'
                    ? 'theme-accent-subtle theme-accent-text font-bold'
                    : 'theme-text-secondary hover:theme-text-primary hover:theme-bg-subtle'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Subjects</span>
              </button>

              <button
                id="nav-tab-themes"
                type="button"
                onClick={() => onOpenSettings('themes-sounds')}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer theme-text-secondary hover:theme-text-primary hover:theme-bg-subtle"
              >
                <Palette className="w-4 h-4" />
                <span>Themes & Sounds</span>
              </button>
            </nav>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Today Focus Pill */}
            <div 
              title="Today's Total Focus Time"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 theme-bg-subtle border theme-border rounded-xl text-xs font-medium theme-text-secondary"
            >
              <Clock className="w-3.5 h-3.5 theme-accent-text" />
              <span>Today: <strong className="theme-text-primary">{formatMinutes(todayStudyMinutes)}</strong></span>
            </div>

            {/* Streak Pill */}
            <div 
              title="Consecutive Daily Study Streak"
              className="flex items-center gap-1 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 rounded-xl text-xs font-semibold shadow-2xs"
            >
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>{streak} {streak === 1 ? 'day' : 'days'}</span>
            </div>

            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                id="user-profile-menu-button"
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border theme-border hover:theme-border-hover hover:theme-bg-subtle transition-colors cursor-pointer"
              >
                <UserAvatar 
                  avatarId={userProfile?.avatarId} 
                  photoURL={userProfile?.photoURL} 
                  name={userProfile?.displayName} 
                  size="sm" 
                />
                <span className="hidden md:inline-block text-xs font-semibold theme-text-primary max-w-[100px] truncate">
                  {userProfile?.displayName || currentUser?.displayName || 'Student'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 theme-text-muted" />
              </button>

              {dropdownOpen && (
                <div 
                  id="user-dropdown-menu"
                  className="absolute right-0 mt-2 w-72 theme-bg-card rounded-2xl border theme-border shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-100"
                >
                  {/* Clickable user profile banner */}
                  <button
                    id="btn-menu-account-card"
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      onSelectTab('account');
                    }}
                    className="w-full text-left px-4 py-3 border-b theme-border hover:theme-bg-subtle transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <UserAvatar 
                          avatarId={userProfile?.avatarId} 
                          photoURL={userProfile?.photoURL} 
                          name={userProfile?.displayName} 
                          size="md" 
                        />
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold theme-text-primary truncate group-hover:theme-accent-text transition-colors">
                            {userProfile?.displayName || currentUser?.displayName || 'Student'}
                          </p>
                          <p className="text-[11px] theme-text-muted truncate">
                            {currentUser?.email || 'puneet.tcl@gmail.com'}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 theme-text-muted group-hover:translate-x-0.5 group-hover:theme-accent-text transition-all" />
                    </div>

                    <div className="mt-2 text-[10px] theme-accent-subtle theme-accent-text px-2 py-1 rounded-md font-medium flex items-center justify-between">
                      <span>Daily Target:</span>
                      <strong>{userProfile?.dailyGoalMinutes || 120} mins/day</strong>
                    </div>
                  </button>

                  <div className="py-1">
                    <button
                      id="btn-menu-student-account"
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        onSelectTab('account');
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs theme-text-primary font-semibold hover:theme-bg-subtle flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <User className="w-4 h-4 theme-accent-text" />
                        <span>My Student Account</span>
                      </div>
                      <span className="text-[10px] theme-accent-subtle theme-accent-text px-1.5 py-0.5 rounded font-bold">
                        Full View
                      </span>
                    </button>

                    <button
                      id="btn-menu-account-settings"
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        onOpenSettings('account');
                      }}
                      className="w-full text-left px-4 py-2 text-xs theme-text-secondary hover:theme-text-primary hover:theme-bg-subtle flex items-center gap-2.5 cursor-pointer"
                    >
                      <Lock className="w-4 h-4 theme-text-muted" />
                      <span>Account & Security Modal</span>
                    </button>

                    <button
                      id="btn-menu-theme"
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        onOpenSettings('themes-sounds');
                      }}
                      className="w-full text-left px-4 py-2 text-xs theme-text-secondary hover:theme-text-primary hover:theme-bg-subtle flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <Palette className="w-4 h-4 theme-text-muted" />
                        <span>Themes, Styles & Sounds</span>
                      </div>
                      <span className="w-2.5 h-2.5 rounded-full theme-accent-bg shrink-0" />
                    </button>

                    <button
                      id="btn-menu-settings"
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        onOpenSettings('profile');
                      }}
                      className="w-full text-left px-4 py-2 text-xs theme-text-secondary hover:theme-text-primary hover:theme-bg-subtle flex items-center gap-2.5 cursor-pointer"
                    >
                      <Settings className="w-4 h-4 theme-text-muted" />
                      <span>Profile & Avatar Quick Edit</span>
                    </button>

                    {onOpenLandingPage && (
                      <button
                        id="btn-menu-landing"
                        type="button"
                        onClick={() => {
                          setDropdownOpen(false);
                          onOpenLandingPage();
                        }}
                        className="w-full text-left px-4 py-2 text-xs theme-text-secondary hover:theme-text-primary hover:theme-bg-subtle flex items-center gap-2.5 cursor-pointer"
                      >
                        <Globe className="w-4 h-4 theme-text-muted" />
                        <span>Public Landing Page</span>
                      </button>
                    )}

                    <div className="my-1 border-t theme-border" />

                    <button
                      id="btn-menu-logout"
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 flex items-center gap-2.5 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </header>

    {/* Mobile Fixed Bottom Navigation Dock */}
    <nav 
      aria-label="Mobile Bottom Navigation" 
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t theme-border theme-bg-card/95 backdrop-blur-md px-2 py-1.5 flex items-center justify-around shadow-2xl safe-area-bottom"
    >
      <button
        id="mobile-nav-dashboard"
        type="button"
        aria-label="Go to Home Dashboard"
        onClick={() => {
          setMobileMoreOpen(false);
          onSelectTab('dashboard');
        }}
        className={`touch-target-44 flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold rounded-xl transition-colors ${
          currentTab === 'dashboard' ? 'theme-accent-text' : 'theme-text-muted hover:theme-text-primary'
        }`}
      >
        <LayoutDashboard className="w-5 h-5" />
        <span>Home</span>
      </button>

      <button
        id="mobile-nav-tasks"
        type="button"
        aria-label={`View Study Tasks ${overdueTasksCount > 0 ? `(${overdueTasksCount} overdue)` : ''}`}
        onClick={() => {
          setMobileMoreOpen(false);
          onSelectTab('tasks');
        }}
        className={`touch-target-44 flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold rounded-xl relative transition-colors ${
          currentTab === 'tasks' ? 'theme-accent-text' : 'theme-text-muted hover:theme-text-primary'
        }`}
      >
        <div className="relative">
          <CheckSquare className="w-5 h-5" />
          {overdueTasksCount > 0 && (
            <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
          )}
        </div>
        <span>Tasks</span>
      </button>

      {/* Focus Timer Hero Button */}
      <button
        id="mobile-nav-timer"
        type="button"
        aria-label={isTimerRunning ? "Focus Session in progress, tap to view" : "Start Focus Timer"}
        onClick={() => {
          setMobileMoreOpen(false);
          onSelectTab('timer');
        }}
        className={`touch-target-44 -mt-3.5 px-3 py-1.5 rounded-2xl flex flex-col items-center justify-center gap-0.5 shadow-lg transition-transform active:scale-95 ${
          currentTab === 'timer'
            ? 'theme-accent-bg text-white shadow-indigo-600/30'
            : isTimerRunning
            ? 'bg-amber-500 text-white animate-pulse shadow-amber-500/30'
            : 'theme-bg-subtle theme-text-primary border theme-border'
        }`}
      >
        <Timer className="w-5 h-5" />
        <span className="text-[10px] font-extrabold">
          {isTimerRunning ? formatTimerPreview(timerSecondsRemaining) : 'Focus'}
        </span>
      </button>

      <button
        id="mobile-nav-planner"
        type="button"
        aria-label="Open Study Timetable & Planner"
        onClick={() => {
          setMobileMoreOpen(false);
          onSelectTab('planner');
        }}
        className={`touch-target-44 flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold rounded-xl transition-colors ${
          currentTab === 'planner' ? 'theme-accent-text' : 'theme-text-muted hover:theme-text-primary'
        }`}
      >
        <CalendarDays className="w-5 h-5" />
        <span>Planner</span>
      </button>

      <button
        id="mobile-nav-more"
        type="button"
        aria-label="Open more study tools and settings"
        aria-expanded={mobileMoreOpen}
        onClick={() => setMobileMoreOpen(!mobileMoreOpen)}
        className={`touch-target-44 flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold rounded-xl transition-colors ${
          ['subjects', 'goals', 'progress', 'account'].includes(currentTab) || mobileMoreOpen
            ? 'theme-accent-text'
            : 'theme-text-muted hover:theme-text-primary'
        }`}
      >
        <MoreHorizontal className="w-5 h-5" />
        <span>More</span>
      </button>
    </nav>

    {/* Mobile "More" Bottom Sheet Drawer */}
    {mobileMoreOpen && (
      <div 
        role="dialog"
        aria-modal="true"
        aria-label="More study workspace options"
        className="md:hidden fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
      >
        {/* Backdrop dismiss */}
        <div 
          className="absolute inset-0"
          onClick={() => setMobileMoreOpen(false)}
        />

        <div className="relative w-full max-w-lg theme-bg-card rounded-t-3xl border-t border-x theme-border shadow-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center justify-between pb-3 border-b theme-border">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 theme-accent-text" />
              <span className="text-xs font-bold uppercase tracking-wider theme-text-primary">
                Workspace Tools & Settings
              </span>
            </div>
            <button
              type="button"
              onClick={() => setMobileMoreOpen(false)}
              aria-label="Close menu"
              className="p-1.5 rounded-xl theme-text-muted hover:theme-text-primary hover:theme-bg-subtle transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Subjects */}
            <button
              type="button"
              onClick={() => {
                setMobileMoreOpen(false);
                onSelectTab('subjects');
              }}
              className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-colors ${
                currentTab === 'subjects'
                  ? 'theme-accent-subtle theme-accent-text border-current font-bold'
                  : 'theme-bg-subtle theme-border hover:theme-border-hover'
              }`}
            >
              <BookOpen className="w-5 h-5 shrink-0 mt-0.5 theme-accent-text" />
              <div>
                <p className="text-xs font-bold theme-text-primary">Subjects</p>
                <p className="text-[11px] theme-text-muted">Courses & color tags</p>
              </div>
            </button>

            {/* Goals */}
            <button
              type="button"
              onClick={() => {
                setMobileMoreOpen(false);
                onSelectTab('goals');
              }}
              className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-colors ${
                currentTab === 'goals'
                  ? 'theme-accent-subtle theme-accent-text border-current font-bold'
                  : 'theme-bg-subtle theme-border hover:theme-border-hover'
              }`}
            >
              <Target className="w-5 h-5 shrink-0 mt-0.5 theme-accent-text" />
              <div>
                <p className="text-xs font-bold theme-text-primary">Study Goals</p>
                <p className="text-[11px] theme-text-muted">Targets & milestones</p>
              </div>
            </button>

            {/* Progress */}
            <button
              type="button"
              onClick={() => {
                setMobileMoreOpen(false);
                onSelectTab('progress');
              }}
              className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-colors ${
                currentTab === 'progress'
                  ? 'theme-accent-subtle theme-accent-text border-current font-bold'
                  : 'theme-bg-subtle theme-border hover:theme-border-hover'
              }`}
            >
              <BarChart3 className="w-5 h-5 shrink-0 mt-0.5 theme-accent-text" />
              <div>
                <p className="text-xs font-bold theme-text-primary">Progress</p>
                <p className="text-[11px] theme-text-muted">Analytics & charts</p>
              </div>
            </button>

            {/* Themes & Sounds */}
            <button
              type="button"
              onClick={() => {
                setMobileMoreOpen(false);
                onOpenSettings('themes-sounds');
              }}
              className="p-3.5 rounded-2xl border theme-bg-subtle theme-border hover:theme-border-hover text-left flex items-start gap-3 transition-colors"
            >
              <Palette className="w-5 h-5 shrink-0 mt-0.5 theme-accent-text" />
              <div>
                <p className="text-xs font-bold theme-text-primary">Themes & Sounds</p>
                <p className="text-[11px] theme-text-muted">Audio & appearance</p>
              </div>
            </button>
          </div>

          {/* Account Profile Card */}
          <button
            type="button"
            onClick={() => {
              setMobileMoreOpen(false);
              onSelectTab('account');
            }}
            className="w-full p-3.5 rounded-2xl border theme-border theme-bg-subtle text-left flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-3">
              <UserAvatar 
                avatarId={userProfile?.avatarId} 
                photoURL={userProfile?.photoURL} 
                name={userProfile?.displayName} 
                size="md" 
              />
              <div className="overflow-hidden">
                <p className="text-xs font-bold theme-text-primary truncate">
                  {userProfile?.displayName || currentUser?.displayName || 'Student'}
                </p>
                <p className="text-[11px] theme-text-muted truncate">
                  {currentUser?.email || 'puneet.tcl@gmail.com'}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold theme-accent-subtle theme-accent-text px-2 py-1 rounded-md">
              View Profile
            </span>
          </button>

          {/* Logout button */}
          <button
            type="button"
            onClick={() => {
              setMobileMoreOpen(false);
              logout();
            }}
            className="w-full py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center justify-center gap-2 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of Focus Flow</span>
          </button>
        </div>
      </div>
    )}
  </>
  );
};
