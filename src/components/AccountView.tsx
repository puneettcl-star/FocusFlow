import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  ShieldCheck, 
  Copy, 
  Check, 
  Calendar, 
  Flame, 
  Clock, 
  Target, 
  Palette, 
  Volume2, 
  Bell, 
  Play, 
  Lock, 
  LogOut, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  ArrowLeft,
  Settings,
  BookOpen
} from 'lucide-react';
import { UserProfile, StudyStatistics, AppTheme, NotificationPreferences } from '../types';
import { UserAvatar } from './UserAvatar';
import { AVATAR_OPTIONS } from '../utils/avatars';
import { THEMES, THEME_LIST } from '../utils/theme';
import { soundEngine } from '../utils/audio';
import { formatMinutes } from '../utils/date';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { safeRequestNotificationPermission, isNotificationSupported } from '../utils/notification';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface AccountViewProps {
  userProfile: UserProfile | null;
  statistics: StudyStatistics | null;
  onBackToDashboard: () => void;
  onOpenSettingsTab?: (tab: 'profile' | 'themes-sounds' | 'account') => void;
}

export const AccountView: React.FC<AccountViewProps> = ({
  userProfile,
  statistics,
  onBackToDashboard,
  onOpenSettingsTab,
}) => {
  const { currentUser, updateUserPreferences, logout, resetPassword, deleteAccount } = useAuth();
  const { theme: currentTheme, setTheme } = useTheme();

  // Local editable form state
  const [displayName, setDisplayName] = useState(userProfile?.displayName || currentUser?.displayName || '');
  const [avatarId, setAvatarId] = useState(userProfile?.avatarId || 'scholar');
  const [photoURL, setPhotoURL] = useState(userProfile?.photoURL || '');
  const [goalMinutes, setGoalMinutes] = useState(userProfile?.dailyGoalMinutes || 120);

  // Notifications
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    timerSound: userProfile?.notificationPreferences?.timerSound ?? true,
    soundType: userProfile?.notificationPreferences?.soundType ?? 'chime',
    browserNotifications: userProfile?.notificationPreferences?.browserNotifications ?? false,
    breakAlerts: userProfile?.notificationPreferences?.breakAlerts ?? true,
    dailyReminder: userProfile?.notificationPreferences?.dailyReminder ?? false,
    dailyReminderTime: userProfile?.notificationPreferences?.dailyReminderTime ?? '18:00',
  });

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedId, setCopiedId] = useState(false);

  // Password reset
  const [resetSent, setResetSent] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);

  // Delete modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Logout state
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Sync state if userProfile updates
  useEffect(() => {
    if (userProfile) {
      if (userProfile.displayName !== undefined) setDisplayName(userProfile.displayName || '');
      if (userProfile.avatarId) setAvatarId(userProfile.avatarId);
      if (userProfile.photoURL !== undefined) setPhotoURL(userProfile.photoURL || '');
      if (userProfile.dailyGoalMinutes) setGoalMinutes(userProfile.dailyGoalMinutes);
      if (userProfile.notificationPreferences) {
        setNotifications(userProfile.notificationPreferences);
      }
    } else if (currentUser?.displayName) {
      setDisplayName(currentUser.displayName);
    }
  }, [userProfile, currentUser]);

  const handleCopyAccountId = () => {
    if (!currentUser?.uid) return;
    navigator.clipboard.writeText(currentUser.uid);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2500);
  };

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMessage('');
    try {
      await updateUserPreferences({
        displayName: displayName.trim() || 'Student',
        avatarId,
        photoURL: photoURL.trim() || null,
        dailyGoalMinutes: Number(goalMinutes),
        notificationPreferences: notifications,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save profile:', err);
      setErrorMessage('Could not update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSoundTest = (tone: 'chime' | 'bell' | 'digital' | 'wood') => {
    soundEngine.playByType(tone);
  };

  const handleRequestBrowserNotifications = async () => {
    if (!isNotificationSupported()) {
      setErrorMessage('Browser notifications are not supported or restricted in this view.');
      setTimeout(() => setErrorMessage(''), 4000);
      setNotifications(prev => ({ ...prev, browserNotifications: false }));
      return;
    }
    try {
      const permission = await safeRequestNotificationPermission();
      if (permission === 'granted') {
        setNotifications(prev => ({ ...prev, browserNotifications: true }));
      } else {
        setNotifications(prev => ({ ...prev, browserNotifications: false }));
        setErrorMessage('Browser notification permission was not granted.');
        setTimeout(() => setErrorMessage(''), 4000);
      }
    } catch {
      setNotifications(prev => ({ ...prev, browserNotifications: false }));
    }
  };

  const handleSendResetPassword = async () => {
    if (!currentUser?.email) return;
    setIsSendingReset(true);
    setResetSent(false);
    try {
      await resetPassword(currentUser.email);
      setResetSent(true);
      setTimeout(() => setResetSent(false), 4000);
    } catch (err) {
      console.error(err);
      setErrorMessage('Could not send password reset email. Please try again later.');
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleDeleteAccountConfirm = async () => {
    setIsDeleting(true);
    setDeleteError('');
    try {
      await deleteAccount(deletePassword || undefined);
      setIsDeleteModalOpen(false);
    } catch (err: unknown) {
      const e = err as Error;
      setDeleteError(e.message || 'Failed to delete account. You may need to sign in again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Safe formatting for created date
  const formatCreatedDate = (dateVal: any) => {
    if (!dateVal) return 'Active Member';
    try {
      if (typeof dateVal === 'string') {
        const d = new Date(dateVal);
        return isNaN(d.getTime()) ? 'Active Member' : d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
      }
      if (dateVal && typeof dateVal.toDate === 'function') {
        return dateVal.toDate().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
      }
      if (dateVal && typeof dateVal.seconds === 'number') {
        return new Date(dateVal.seconds * 1000).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
      }
      return 'Active Member';
    } catch {
      return 'Active Member';
    }
  };

  const userEmail = currentUser?.email || 'puneet.tcl@gmail.com';
  const effectiveName = displayName || userProfile?.displayName || currentUser?.displayName || 'Student';
  const effectiveUid = currentUser?.uid || 'user-account';
  const streakCount = userProfile?.currentStreak || statistics?.currentStreak || 1;
  const totalMinutes = userProfile?.totalStudyMinutes || statistics?.totalStudyMinutes || 0;
  const totalSessionsCount = statistics?.totalSessions || 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-150">
      
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b theme-border">
        <div className="flex items-center gap-3">
          <button
            id="btn-account-back-to-dashboard"
            type="button"
            onClick={onBackToDashboard}
            className="p-2 rounded-xl theme-bg-card border theme-border hover:theme-border-hover hover:theme-bg-subtle transition-colors cursor-pointer text-xs font-semibold theme-text-secondary flex items-center gap-1.5 shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black theme-text-primary tracking-tight">
              My Student Account
            </h1>
            <p className="text-xs theme-text-muted">
              Manage your personal student profile, study preferences, theme, and credentials
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenSettingsTab && (
            <button
              id="btn-account-open-settings-modal"
              type="button"
              onClick={() => onOpenSettingsTab('profile')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border theme-border theme-bg-card hover:theme-bg-subtle text-xs font-semibold theme-text-secondary transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4" />
              <span>Modal View</span>
            </button>
          )}

          <button
            id="btn-save-account-top"
            type="button"
            disabled={isSaving}
            onClick={() => handleSaveProfile()}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl theme-accent-bg text-white text-xs font-bold shadow-xs hover:opacity-95 disabled:opacity-50 transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isSaving ? 'Saving Changes...' : 'Save Profile'}</span>
          </button>
        </div>
      </div>

      {/* Notifications / Feedback Banners */}
      {saveSuccess && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium rounded-xl flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Your student account settings have been saved and synchronized with the cloud!</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium rounded-xl flex items-center gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT COLUMN: Identity Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="theme-bg-card rounded-2xl border theme-border shadow-xs p-6 space-y-6">
            
            {/* Avatar & Display Hero */}
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-3">
                <UserAvatar 
                  avatarId={avatarId} 
                  photoURL={photoURL} 
                  name={effectiveName} 
                  size="xl" 
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-[var(--bg-card)] flex items-center justify-center text-white" title="Verified Account">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              </div>

              <h2 className="text-lg font-bold theme-text-primary truncate max-w-full">
                {effectiveName}
              </h2>
              <p className="text-xs theme-text-muted mt-0.5 truncate max-w-full">
                {userEmail}
              </p>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 mt-2.5 rounded-full theme-accent-subtle text-xs font-semibold theme-accent-text">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Active Learner</span>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t theme-border">
              <div className="p-3 rounded-xl theme-bg-subtle text-center">
                <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
                  <Flame className="w-4 h-4 fill-current" />
                  <span className="text-base font-black">{streakCount}</span>
                </div>
                <p className="text-[11px] theme-text-muted font-medium">Day Streak</p>
              </div>

              <div className="p-3 rounded-xl theme-bg-subtle text-center">
                <div className="flex items-center justify-center gap-1 theme-accent-text mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-base font-black">{formatMinutes(totalMinutes)}</span>
                </div>
                <p className="text-[11px] theme-text-muted font-medium">Total Focus</p>
              </div>
            </div>

            {/* Account Metadata Details */}
            <div className="space-y-3 pt-4 border-t theme-border text-xs">
              <div className="flex items-center justify-between">
                <span className="theme-text-muted">Account Email</span>
                <span className="theme-text-primary font-medium truncate max-w-[170px]" title={userEmail}>
                  {userEmail}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="theme-text-muted">Account ID</span>
                <div className="flex items-center gap-1.5">
                  <code className="px-2 py-0.5 rounded bg-[var(--bg-subtle)] text-[10px] theme-text-secondary font-mono">
                    {effectiveUid.slice(0, 10)}...
                  </code>
                  <button
                    id="btn-copy-account-id"
                    type="button"
                    title="Copy Account ID"
                    onClick={handleCopyAccountId}
                    className="p-1 rounded hover:theme-bg-subtle theme-text-muted hover:theme-text-primary transition-colors cursor-pointer"
                  >
                    {copiedId ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="theme-text-muted">Member Since</span>
                <span className="theme-text-secondary font-medium">
                  {formatCreatedDate(userProfile?.createdAt)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="theme-text-muted">Completed Sprints</span>
                <span className="theme-text-secondary font-bold">
                  {totalSessionsCount} sessions
                </span>
              </div>
            </div>

            {/* Sign Out Action */}
            <div className="pt-4 border-t theme-border">
              <button
                id="btn-account-page-sign-out"
                type="button"
                disabled={isLoggingOut}
                onClick={handleLogoutConfirm}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-100 transition-colors cursor-pointer shadow-2xs"
              >
                <LogOut className="w-4 h-4" />
                <span>{isLoggingOut ? 'Signing out...' : 'Sign Out of Focus Flow'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT 2 COLUMNS: Profile Settings & Customization */}
        <div className="lg:col-span-2 space-y-6">

          {/* Section 1: Edit Profile Information */}
          <div className="theme-bg-card rounded-2xl border theme-border shadow-xs p-6 space-y-6">
            <div className="flex items-center gap-2.5 pb-3 border-b theme-border">
              <div className="p-2 rounded-xl theme-accent-subtle theme-accent-text">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold theme-text-primary">Personal Profile Information</h3>
                <p className="text-xs theme-text-muted">Update your display name, avatar icon, and daily study targets</p>
              </div>
            </div>

            {/* Avatar Selector Grid */}
            <div>
              <label className="block text-xs font-bold theme-text-secondary uppercase tracking-wider mb-2.5">
                Choose Profile Avatar
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
                {AVATAR_OPTIONS.map((opt) => {
                  const isSelected = avatarId === opt.id && !photoURL;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setAvatarId(opt.id);
                        setPhotoURL('');
                      }}
                      className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[var(--accent-primary)] ring-2 ring-[var(--accent-primary)]/25 theme-bg-subtle scale-105'
                          : 'theme-border hover:theme-border-hover theme-bg-card'
                      }`}
                    >
                      <UserAvatar avatarId={opt.id} size="md" />
                      <span className="text-[10px] font-semibold theme-text-secondary text-center truncate max-w-full">
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Name & Photo URL inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="account-view-display-name" className="block text-xs font-semibold theme-text-secondary mb-1.5">
                  Display Name
                </label>
                <input
                  id="account-view-display-name"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full px-3.5 py-2.5 theme-bg-subtle border theme-border rounded-xl theme-text-primary text-sm focus:outline-hidden focus:ring-2 focus:ring-[var(--accent-primary)]/30 focus:border-[var(--accent-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold theme-text-secondary mb-1.5 flex items-center justify-between">
                  <span>Registered Email</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Verified</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    disabled
                    value={userEmail}
                    className="w-full px-3.5 py-2.5 theme-bg-subtle border theme-border rounded-xl theme-text-muted text-sm cursor-not-allowed opacity-80"
                  />
                  <Mail className="w-4 h-4 absolute right-3 top-3 theme-text-muted" />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="account-view-photo-url" className="block text-xs font-semibold theme-text-secondary mb-1.5 flex items-center justify-between">
                <span>Custom Avatar Image URL (Optional)</span>
                <span className="text-[10px] theme-text-muted">Overrides icon avatar</span>
              </label>
              <input
                id="account-view-photo-url"
                type="url"
                value={photoURL}
                onChange={(e) => setPhotoURL(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2.5 theme-bg-subtle border theme-border rounded-xl theme-text-primary text-sm focus:outline-hidden focus:ring-2 focus:ring-[var(--accent-primary)]/30"
              />
            </div>

            {/* Daily Target Slider */}
            <div className="pt-4 border-t theme-border space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="account-view-goal-slider" className="text-xs font-semibold theme-text-secondary flex items-center gap-1.5">
                  <Target className="w-4 h-4 theme-accent-text" />
                  <span>Daily Study Target Goal</span>
                </label>
                <span className="text-xs font-bold theme-accent-text px-2.5 py-0.5 rounded-lg theme-accent-subtle">
                  {goalMinutes} mins ({Math.floor(goalMinutes / 60)}h {goalMinutes % 60}m)
                </span>
              </div>
              <input
                id="account-view-goal-slider"
                type="range"
                min="30"
                max="480"
                step="15"
                value={goalMinutes}
                onChange={(e) => setGoalMinutes(Number(e.target.value))}
                className="w-full accent-[var(--accent-primary)] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] theme-text-muted">
                <span>30 mins</span>
                <span>2 hours</span>
                <span>4 hours</span>
                <span>6 hours</span>
                <span>8 hours</span>
              </div>
            </div>
          </div>

          {/* Section 2: Workspace Theme Switcher */}
          <div className="theme-bg-card rounded-2xl border theme-border shadow-xs p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b theme-border">
              <div className="p-2 rounded-xl theme-accent-subtle theme-accent-text">
                <Palette className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold theme-text-primary">Theme & Visual Atmosphere</h3>
                <p className="text-xs theme-text-muted">Select your preferred color palette tailored for eye comfort</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {THEME_LIST.map((themeKey) => {
                const t = THEMES[themeKey];
                const isSelected = currentTheme === themeKey;
                return (
                  <button
                    key={themeKey}
                    id={`account-theme-${themeKey}`}
                    type="button"
                    onClick={() => setTheme(themeKey)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-[var(--accent-primary)] ring-2 ring-[var(--accent-primary)]/20 theme-bg-subtle shadow-xs'
                        : 'theme-border hover:theme-border-hover theme-bg-card'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold theme-text-primary">{t.name}</span>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full theme-accent-bg text-white flex items-center justify-center text-[10px]">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: t.preview.bg }} />
                      <div className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: t.preview.card }} />
                      <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: t.preview.accent }} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Audio & Notifications */}
          <div className="theme-bg-card rounded-2xl border theme-border shadow-xs p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b theme-border">
              <div className="p-2 rounded-xl theme-accent-subtle theme-accent-text">
                <Volume2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold theme-text-primary">Focus Sounds & Alerts</h3>
                <p className="text-xs theme-text-muted">Acoustic chimes and notifications when Pomodoro sessions complete</p>
              </div>
            </div>

            {/* Timer Sound Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border theme-border theme-bg-subtle">
              <div>
                <h4 className="text-xs font-bold theme-text-primary">Timer Acoustic Chime</h4>
                <p className="text-[11px] theme-text-muted">Play sound tone when timer ends</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.timerSound}
                  onChange={(e) => setNotifications((p) => ({ ...p, timerSound: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent-primary)]" />
              </label>
            </div>

            {notifications.timerSound && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['chime', 'bell', 'digital', 'wood'] as const).map((tone) => (
                  <div
                    key={tone}
                    className={`p-2.5 rounded-xl border flex items-center justify-between ${
                      notifications.soundType === tone
                        ? 'border-[var(--accent-primary)] theme-bg-subtle ring-1 ring-[var(--accent-primary)]'
                        : 'theme-border'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setNotifications((p) => ({ ...p, soundType: tone }))}
                      className="text-xs font-semibold capitalize theme-text-primary text-left cursor-pointer flex-1"
                    >
                      {tone}
                    </button>
                    <button
                      type="button"
                      title="Play Preview"
                      onClick={() => handleSoundTest(tone)}
                      className="p-1 rounded-lg hover:theme-bg-card theme-accent-text cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Desktop Notification Button */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border theme-border theme-bg-subtle">
              <div>
                <h4 className="text-xs font-bold theme-text-primary">Desktop Notifications</h4>
                <p className="text-[11px] theme-text-muted">Receive alerts when study tab is minimized</p>
              </div>
              <button
                type="button"
                onClick={handleRequestBrowserNotifications}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-xl theme-accent-bg text-white hover:opacity-90 transition-opacity cursor-pointer shadow-2xs"
              >
                {notifications.browserNotifications ? 'Active' : 'Enable'}
              </button>
            </div>
          </div>

          {/* Section 4: Password & Security */}
          <div className="theme-bg-card rounded-2xl border theme-border shadow-xs p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b theme-border">
              <div className="p-2 rounded-xl theme-accent-subtle theme-accent-text">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold theme-text-primary">Password & Security</h3>
                <p className="text-xs theme-text-muted">Manage your login credentials and security tokens</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border theme-border theme-bg-subtle">
              <div>
                <h4 className="text-xs font-bold theme-text-primary">Reset Password</h4>
                <p className="text-[11px] theme-text-muted">
                  Send a password reset dispatch to <strong>{userEmail}</strong>
                </p>
              </div>
              <button
                id="btn-account-page-send-reset"
                type="button"
                disabled={isSendingReset || !currentUser?.email}
                onClick={handleSendResetPassword}
                className="px-4 py-2 text-xs font-semibold theme-bg-card border theme-border hover:theme-border-hover rounded-xl theme-text-primary transition-colors cursor-pointer shadow-2xs self-start sm:self-auto"
              >
                {isSendingReset ? 'Sending...' : 'Send Reset Email'}
              </button>
            </div>

            {resetSent && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Password reset email dispatched to {userEmail}. Check your inbox.</span>
              </div>
            )}

            {/* Danger Zone */}
            <div className="pt-2">
              <div className="p-4 rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                    Danger Zone
                  </h4>
                  <button
                    id="btn-account-page-delete-modal"
                    type="button"
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-700 dark:text-rose-400 bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Account</span>
                  </button>
                </div>
                <p className="text-[11px] text-rose-700/80 dark:text-rose-300/70">
                  Permanently erase your account, study streaks, focus sessions, and tasks.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Save Action */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onBackToDashboard}
              className="px-4 py-2.5 rounded-xl border theme-border theme-bg-card hover:theme-bg-subtle text-xs font-semibold theme-text-secondary transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="btn-save-account-bottom"
              type="button"
              disabled={isSaving}
              onClick={() => handleSaveProfile()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl theme-accent-bg text-white text-xs font-bold shadow-sm hover:opacity-95 disabled:opacity-50 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSaving ? 'Saving Profile...' : 'Save All Changes'}</span>
            </button>
          </div>

        </div>
      </div>

      {/* Delete Account Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Focus Flow Account?"
        message="Are you sure you want to permanently delete your account? All your personal study data, task lists, subjects, and focus history will be permanently erased."
        confirmLabel="Permanently Delete Account"
        isDangerous={true}
        loading={isDeleting}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setDeleteError('');
        }}
        onConfirm={handleDeleteAccountConfirm}
      >
        <div className="space-y-3">
          {deleteError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
              {deleteError}
            </div>
          )}
          <div>
            <label className="block text-xs font-medium theme-text-secondary mb-1">
              Enter your password to confirm (if signed up with email):
            </label>
            <input
              id="account-view-delete-password"
              type="password"
              placeholder="Your password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              className="w-full px-3 py-2 theme-bg-subtle border theme-border rounded-lg text-xs theme-text-primary"
            />
          </div>
        </div>
      </DeleteConfirmModal>

    </div>
  );
};
