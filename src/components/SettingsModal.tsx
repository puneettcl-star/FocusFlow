import React, { useState } from 'react';
import { 
  X, 
  User, 
  Palette, 
  Bell, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle, 
  Volume2, 
  Play, 
  LogOut, 
  Trash2, 
  Sparkles, 
  Target, 
  Mail, 
  Check, 
  Lock,
  ShieldCheck,
  FileText,
  LifeBuoy,
  Scale,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { AppTheme, NotificationPreferences } from '../types';
import { THEMES, THEME_LIST } from '../utils/theme';
import { AVATAR_OPTIONS } from '../utils/avatars';
import { UserAvatar } from './UserAvatar';
import { soundEngine } from '../utils/audio';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { safeRequestNotificationPermission, isNotificationSupported } from '../utils/notification';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: SettingsTab;
  onNavigate?: (path: string) => void;
}

type SettingsTab = 'profile' | 'themes-sounds' | 'account' | 'legal-support';

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, initialTab = 'profile', onNavigate }) => {
  const { currentUser, userProfile, updateUserPreferences, logout, resetPassword, deleteAccount } = useAuth();
  const { theme: currentTheme, setTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);

  // Sync initialTab when modal opens or initialTab changes
  React.useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Form states
  const [displayName, setDisplayName] = useState(userProfile?.displayName || currentUser?.displayName || '');
  const [avatarId, setAvatarId] = useState(userProfile?.avatarId || 'scholar');
  const [photoURL, setPhotoURL] = useState(userProfile?.photoURL || '');
  const [goalMinutes, setGoalMinutes] = useState(userProfile?.dailyGoalMinutes || 120);

  // Sync states when profile loads or updates
  React.useEffect(() => {
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

  // Notification states
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    timerSound: userProfile?.notificationPreferences?.timerSound ?? true,
    soundType: userProfile?.notificationPreferences?.soundType ?? 'chime',
    browserNotifications: userProfile?.notificationPreferences?.browserNotifications ?? false,
    breakAlerts: userProfile?.notificationPreferences?.breakAlerts ?? true,
    dailyReminder: userProfile?.notificationPreferences?.dailyReminder ?? false,
    dailyReminderTime: userProfile?.notificationPreferences?.dailyReminderTime ?? '18:00',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Password reset state
  const [resetSent, setResetSent] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Logout confirmation state
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!isOpen) return null;

  const handleSaveAll = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMessage('');
    try {
      await updateUserPreferences({
        displayName: displayName.trim(),
        avatarId,
        photoURL: photoURL.trim() || null,
        dailyGoalMinutes: Number(goalMinutes),
        notificationPreferences: notifications,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setErrorMessage('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectTheme = async (themeKey: AppTheme) => {
    await setTheme(themeKey);
  };

  const handleSoundTest = (type: 'chime' | 'bell' | 'digital' | 'wood') => {
    soundEngine.playByType(type);
  };

  const handleRequestBrowserNotifications = async () => {
    if (!isNotificationSupported()) {
      setErrorMessage('Browser desktop notifications are not supported or are restricted in this window/tab.');
      setTimeout(() => setErrorMessage(''), 4000);
      setNotifications((prev) => ({ ...prev, browserNotifications: false }));
      return;
    }
    try {
      const permission = await safeRequestNotificationPermission();
      if (permission === 'granted') {
        setNotifications((prev) => ({ ...prev, browserNotifications: true }));
      } else {
        setNotifications((prev) => ({ ...prev, browserNotifications: false }));
        setErrorMessage('Browser notification permission was not granted.');
        setTimeout(() => setErrorMessage(''), 4000);
      }
    } catch {
      setNotifications((prev) => ({ ...prev, browserNotifications: false }));
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
      setErrorMessage('Could not send reset email. Please try again later.');
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
      onClose();
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
      onClose();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
        <div 
          id="user-settings-modal"
          className="w-full max-w-2xl theme-bg-card rounded-2xl border theme-border shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b theme-border">
            <div className="flex items-center gap-3">
              <UserAvatar avatarId={avatarId} photoURL={photoURL} size="md" />
              <div>
                <h2 className="text-base font-bold theme-text-primary">Personal Settings</h2>
                <p className="text-xs theme-text-muted">Manage your profile, theme, and workspace preferences</p>
              </div>
            </div>
            <button
              id="btn-close-settings"
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl theme-text-muted hover:theme-text-primary hover:theme-bg-subtle transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b theme-border px-6 gap-2 bg-[var(--bg-subtle)]/50 overflow-x-auto">
            <button
              id="settings-tab-profile"
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'profile'
                  ? 'border-[var(--accent-primary)] theme-accent-text font-bold'
                  : 'border-transparent theme-text-muted hover:theme-text-primary'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Profile & Avatar</span>
            </button>

            <button
              id="settings-tab-themes-sounds"
              type="button"
              onClick={() => setActiveTab('themes-sounds')}
              className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'themes-sounds'
                  ? 'border-[var(--accent-primary)] theme-accent-text font-bold'
                  : 'border-transparent theme-text-muted hover:theme-text-primary'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>Themes, Styles & Sounds</span>
            </button>

            <button
              id="settings-tab-account"
              type="button"
              onClick={() => setActiveTab('account')}
              className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'account'
                  ? 'border-[var(--accent-primary)] theme-accent-text font-bold'
                  : 'border-transparent theme-text-muted hover:theme-text-primary'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Account & Security</span>
            </button>

            <button
              id="settings-tab-legal"
              type="button"
              onClick={() => setActiveTab('legal-support')}
              className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'legal-support'
                  ? 'border-[var(--accent-primary)] theme-accent-text font-bold'
                  : 'border-transparent theme-text-muted hover:theme-text-primary'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Legal, Privacy & Support</span>
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {/* Feedback banners */}
            {saveSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium rounded-xl flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Settings saved and synchronized with your account!</span>
              </div>
            )}
            {errorMessage && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* TAB 1: PROFILE & AVATAR */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold theme-text-secondary uppercase tracking-wider mb-2">
                    Select Profile Avatar
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
                              ? 'border-[var(--accent-primary)] ring-2 ring-[var(--accent-primary)]/20 theme-bg-subtle scale-105'
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="settings-display-name" className="block text-xs font-semibold theme-text-secondary mb-1.5">
                      Display Name
                    </label>
                    <input
                      id="settings-display-name"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Alex Morgan"
                      className="w-full px-3.5 py-2.5 theme-bg-subtle border theme-border rounded-xl theme-text-primary text-sm focus:outline-hidden focus:ring-2 focus:ring-[var(--accent-primary)]/30 focus:border-[var(--accent-primary)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold theme-text-secondary mb-1.5 flex items-center justify-between">
                      <span>Email Address</span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Private & Isolated</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        disabled
                        value={currentUser?.email || 'student@focusflow.local'}
                        className="w-full px-3.5 py-2.5 theme-bg-subtle border theme-border rounded-xl theme-text-muted text-sm cursor-not-allowed opacity-80"
                      />
                      <Mail className="w-4 h-4 absolute right-3 top-3 theme-text-muted" />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="settings-photo-url" className="block text-xs font-semibold theme-text-secondary mb-1.5 flex items-center justify-between">
                    <span>Custom Image URL (Optional)</span>
                    <span className="text-[10px] theme-text-muted">Overrides icon avatar</span>
                  </label>
                  <input
                    id="settings-photo-url"
                    type="url"
                    value={photoURL}
                    onChange={(e) => setPhotoURL(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2.5 theme-bg-subtle border theme-border rounded-xl theme-text-primary text-sm focus:outline-hidden focus:ring-2 focus:ring-[var(--accent-primary)]/30"
                  />
                </div>

                {/* Daily Study Target */}
                <div className="pt-2 border-t theme-border">
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="settings-goal-slider" className="text-xs font-semibold theme-text-secondary flex items-center gap-1.5">
                      <Target className="w-4 h-4 theme-accent-text" />
                      <span>Daily Study Target</span>
                    </label>
                    <span className="text-xs font-bold theme-accent-text px-2.5 py-0.5 rounded-lg theme-accent-subtle">
                      {goalMinutes} mins ({Math.floor(goalMinutes / 60)}h {goalMinutes % 60}m)
                    </span>
                  </div>
                  <input
                    id="settings-goal-slider"
                    type="range"
                    min="30"
                    max="480"
                    step="15"
                    value={goalMinutes}
                    onChange={(e) => setGoalMinutes(Number(e.target.value))}
                    className="w-full accent-[var(--accent-primary)] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] theme-text-muted mt-1">
                    <span>30m</span>
                    <span>2 hours</span>
                    <span>4 hours</span>
                    <span>6 hours</span>
                    <span>8 hours</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: THEMES, STYLES & SOUNDS */}
            {activeTab === 'themes-sounds' && (
              <div className="space-y-6">
                {/* Visual Themes & Styles */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Palette className="w-4 h-4 theme-accent-text" />
                    <h3 className="text-xs font-bold theme-text-primary uppercase tracking-wider">
                      Workspace Visual Themes & Styles
                    </h3>
                  </div>
                  <p className="text-xs theme-text-muted mb-4">
                    Select a curated visual design system. All colors, contrast, timer rings, and charts adapt cohesively across the entire application.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {THEME_LIST.map((themeKey) => {
                      const t = THEMES[themeKey];
                      const isSelected = currentTheme === themeKey;

                      return (
                        <button
                          key={themeKey}
                          id={`theme-select-${themeKey}`}
                          type="button"
                          onClick={() => handleSelectTheme(themeKey)}
                          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between relative group ${
                            isSelected
                              ? 'border-[var(--accent-primary)] ring-2 ring-[var(--accent-primary)]/20 theme-bg-subtle shadow-md'
                              : 'theme-border hover:theme-border-hover theme-bg-card'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold theme-text-primary">
                                  {t.name}
                                </span>
                                {t.isDark ? (
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-slate-800 text-slate-300">
                                    Dark
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-slate-200 text-slate-700">
                                    Light
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] theme-text-muted mt-0.5">
                                {t.tagline}
                              </p>
                            </div>

                            {isSelected && (
                              <div className="w-6 h-6 rounded-full theme-accent-bg text-white flex items-center justify-center shrink-0">
                                <Check className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </div>

                          {/* Palette preview swatches */}
                          <div className="flex items-center gap-2 p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                            <div
                              className="w-5 h-5 rounded-lg shadow-2xs border border-black/10"
                              style={{ backgroundColor: t.preview.bg }}
                              title="Background"
                            />
                            <div
                              className="w-5 h-5 rounded-lg shadow-2xs border border-black/10"
                              style={{ backgroundColor: t.preview.card }}
                              title="Card Surface"
                            />
                            <div
                              className="w-5 h-5 rounded-lg shadow-2xs"
                              style={{ backgroundColor: t.preview.accent }}
                              title="Accent"
                            />
                            <div
                              className="text-[10px] font-bold px-2 py-0.5 rounded-md ml-auto"
                              style={{
                                backgroundColor: t.preview.bg,
                                color: t.preview.text,
                                border: `1px solid ${t.preview.accent}40`,
                              }}
                            >
                              Aa Preview
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Acoustic & Timer Sounds */}
                <div className="pt-4 border-t theme-border space-y-4">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 theme-accent-text" />
                    <h3 className="text-xs font-bold theme-text-primary uppercase tracking-wider">
                      Timer Audio & Focus Sounds
                    </h3>
                  </div>

                  {/* Timer Sound Toggle & Selector */}
                  <div className="p-4 rounded-2xl border theme-border theme-bg-card space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl theme-accent-subtle theme-accent-text">
                          <Volume2 className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold theme-text-primary">Timer Sound Alerts</h4>
                          <p className="text-xs theme-text-muted">Play acoustic chime when focus session or break completes</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.timerSound}
                          onChange={(e) => setNotifications((p) => ({ ...p, timerSound: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent-primary)]" />
                      </label>
                    </div>

                    {notifications.timerSound && (
                      <div className="pt-3 border-t theme-border">
                        <label className="block text-xs font-semibold theme-text-secondary mb-2">
                          Select Audio Sound Tone
                        </label>
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
                                title="Play Sample Sound"
                                onClick={() => handleSoundTest(tone)}
                                className="p-1 rounded-lg hover:theme-bg-card theme-accent-text transition-colors cursor-pointer"
                              >
                                <Play className="w-3.5 h-3.5 fill-current" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Browser Push Notifications */}
                  <div className="p-4 rounded-2xl border theme-border theme-bg-card space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl theme-accent-subtle theme-accent-text">
                          <Bell className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold theme-text-primary">Browser Notifications</h4>
                          <p className="text-xs theme-text-muted">Receive desktop notifications when study tab is in background</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRequestBrowserNotifications}
                        className="px-3 py-1.5 text-xs font-semibold rounded-xl theme-accent-bg text-white hover:opacity-90 transition-opacity cursor-pointer"
                      >
                        {notifications.browserNotifications ? 'Active' : 'Enable'}
                      </button>
                    </div>
                  </div>

                  {/* Daily Study Reminder */}
                  <div className="p-4 rounded-2xl border theme-border theme-bg-card space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold theme-text-primary">Daily Study Reminder</h4>
                        <p className="text-xs theme-text-muted">Remind you to start your daily study streak</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.dailyReminder}
                          onChange={(e) => setNotifications((p) => ({ ...p, dailyReminder: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent-primary)]" />
                      </label>
                    </div>

                    {notifications.dailyReminder && (
                      <div className="pt-3 border-t theme-border flex items-center justify-between">
                        <span className="text-xs font-semibold theme-text-secondary">Reminder Time:</span>
                        <input
                          type="time"
                          value={notifications.dailyReminderTime}
                          onChange={(e) => setNotifications((p) => ({ ...p, dailyReminderTime: e.target.value }))}
                          className="px-3 py-1.5 theme-bg-subtle border theme-border rounded-xl text-xs theme-text-primary font-bold"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: ACCOUNT & SECURITY */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                {/* Account details */}
                <div className="p-4 rounded-2xl border theme-border theme-bg-card space-y-3">
                  <h4 className="text-xs font-bold theme-text-secondary uppercase tracking-wider">
                    Account Identity
                  </h4>
                  <div className="text-xs space-y-1.5">
                    <p className="flex items-center justify-between">
                      <span className="theme-text-muted">Account Email:</span>
                      <strong className="theme-text-primary">{currentUser?.email || 'Guest User'}</strong>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="theme-text-muted">Account ID:</span>
                      <code className="text-[11px] theme-text-muted bg-[var(--bg-subtle)] px-2 py-0.5 rounded font-mono">
                        {currentUser?.uid ? `${currentUser.uid.slice(0, 14)}...` : 'Local Student'}
                      </code>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="theme-text-muted">Member Since:</span>
                      <span className="theme-text-secondary">
                        {(() => {
                          const val = userProfile?.createdAt;
                          if (!val) return 'Active Member';
                          try {
                            if (typeof val === 'string') {
                              const d = new Date(val);
                              return isNaN(d.getTime()) ? 'Active Member' : d.toLocaleDateString();
                            }
                            if (val && typeof (val as any).toDate === 'function') {
                              return (val as any).toDate().toLocaleDateString();
                            }
                            if (val && typeof (val as any).seconds === 'number') {
                              return new Date((val as any).seconds * 1000).toLocaleDateString();
                            }
                            return 'Active Member';
                          } catch {
                            return 'Active Member';
                          }
                        })()}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Password reset */}
                <div className="p-4 rounded-2xl border theme-border theme-bg-card space-y-3">
                  <h4 className="text-xs font-bold theme-text-secondary uppercase tracking-wider">
                    Password & Security
                  </h4>
                  <p className="text-xs theme-text-muted leading-relaxed">
                    Send a verified password reset dispatch directly to your registered email address.
                  </p>
                  {resetSent && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-xl flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Password reset email dispatched to {currentUser?.email}. Check your inbox.</span>
                    </div>
                  )}
                  <button
                    id="btn-send-reset-from-settings"
                    type="button"
                    onClick={handleSendResetPassword}
                    disabled={isSendingReset || !currentUser?.email}
                    className="px-4 py-2 text-xs font-semibold theme-text-primary theme-bg-subtle hover:theme-border rounded-xl transition-colors cursor-pointer"
                  >
                    {isSendingReset ? 'Sending Email...' : 'Send Password Reset Email'}
                  </button>
                </div>

                {/* Sign Out Button */}
                <div className="p-4 rounded-2xl border theme-border theme-bg-card flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold theme-text-primary">Sign Out</h4>
                    <p className="text-xs theme-text-muted">Sign out of this device safely</p>
                  </div>
                  <button
                    id="btn-logout-from-settings"
                    type="button"
                    disabled={isLoggingOut}
                    onClick={handleLogoutConfirm}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-xl hover:bg-rose-100 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{isLoggingOut ? 'Signing out...' : 'Sign Out'}</span>
                  </button>
                </div>

                {/* Danger Zone: Delete Account */}
                <div className="p-4 rounded-2xl border border-rose-300 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20 space-y-2.5">
                  <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs uppercase tracking-wider">
                    <ShieldAlert className="w-4 h-4" />
                    Danger Zone
                  </div>
                  <p className="text-xs text-rose-700 dark:text-rose-300/80 leading-relaxed">
                    Permanently delete your Focus Flow account, all your saved tasks, study planner entries, subjects, study streaks, and focus session records. This action cannot be undone.
                  </p>
                  <button
                    id="btn-open-delete-account-modal"
                    type="button"
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-rose-700 dark:text-rose-400 bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-xl transition-colors shadow-2xs cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Account
                  </button>
                </div>
              </div>
            )}

            {/* TAB 4: LEGAL, PRIVACY & SUPPORT */}
            {activeTab === 'legal-support' && (
              <div className="space-y-6 animate-in fade-in">
                {/* Security Overview */}
                <div className="p-4 rounded-2xl border theme-border theme-bg-card space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold theme-text-primary">Data Security & Isolation</h4>
                      <p className="text-[11px] theme-text-muted">Cloud Firestore database rules enforce user-exclusive access</p>
                    </div>
                  </div>
                  <p className="text-xs theme-text-secondary leading-relaxed">
                    All study notes, tasks, and timer records are authenticated against your Google / Email credentials. We never monetize or broker student data.
                  </p>
                </div>

                {/* Legal Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Privacy Policy */}
                  <div className="p-4 rounded-2xl border theme-border theme-bg-card flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <div className="w-7 h-7 rounded-lg theme-accent-subtle theme-accent-text flex items-center justify-center mb-2">
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                      <h5 className="text-xs font-bold theme-text-primary">Privacy Policy</h5>
                      <p className="text-[11px] theme-text-muted leading-relaxed">
                        Data collection details, encryption, cookies, and student privacy rights.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onNavigate) onNavigate('/privacy');
                        else window.location.href = '/privacy';
                      }}
                      className="inline-flex items-center justify-between w-full pt-2 text-xs font-bold theme-accent-text hover:underline cursor-pointer"
                    >
                      <span>Read Policy</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Terms of Service */}
                  <div className="p-4 rounded-2xl border theme-border theme-bg-card flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <div className="w-7 h-7 rounded-lg theme-accent-subtle theme-accent-text flex items-center justify-center mb-2">
                        <Scale className="w-3.5 h-3.5" />
                      </div>
                      <h5 className="text-xs font-bold theme-text-primary">Terms of Service</h5>
                      <p className="text-[11px] theme-text-muted leading-relaxed">
                        Academic usage terms, intellectual property ownership, and platform agreement.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onNavigate) onNavigate('/terms');
                        else window.location.href = '/terms';
                      }}
                      className="inline-flex items-center justify-between w-full pt-2 text-xs font-bold theme-accent-text hover:underline cursor-pointer"
                    >
                      <span>Read Terms</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Contact / Support */}
                  <div className="p-4 rounded-2xl border theme-border theme-bg-card flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <div className="w-7 h-7 rounded-lg theme-accent-subtle theme-accent-text flex items-center justify-center mb-2">
                        <LifeBuoy className="w-3.5 h-3.5" />
                      </div>
                      <h5 className="text-xs font-bold theme-text-primary">Contact & Help Desk</h5>
                      <p className="text-[11px] theme-text-muted leading-relaxed">
                        Get technical help, report a bug, or request a new student feature.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onNavigate) onNavigate('/support');
                        else window.location.href = '/support';
                      }}
                      className="inline-flex items-center justify-between w-full pt-2 text-xs font-bold theme-accent-text hover:underline cursor-pointer"
                    >
                      <span>Contact Desk</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Direct Support Email Box */}
                <div className="p-4 rounded-2xl theme-bg-subtle border theme-border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-bold theme-text-primary block">Need immediate assistance?</span>
                    <span className="theme-text-muted">Direct Email: support@focusflow.in</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onNavigate) onNavigate('/support');
                      else window.location.href = '/support';
                    }}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Open Support Ticket
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer with Save Action */}
          <div className="px-6 py-4 border-t theme-border flex items-center justify-between bg-[var(--bg-subtle)]/40">
            <span className="text-xs theme-text-muted">
              Current Theme: <strong className="theme-text-primary capitalize">{currentTheme}</strong>
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold theme-text-secondary hover:theme-text-primary rounded-xl cursor-pointer"
              >
                Close
              </button>
              <button
                id="btn-save-settings"
                type="button"
                disabled={isSaving}
                onClick={() => handleSaveAll()}
                className="px-5 py-2 theme-accent-bg text-white text-xs font-bold rounded-xl shadow-xs hover:opacity-95 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
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
              id="delete-account-password-input"
              type="password"
              placeholder="Your password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              className="w-full px-3 py-2 theme-bg-subtle border theme-border rounded-lg text-xs theme-text-primary"
            />
          </div>
        </div>
      </DeleteConfirmModal>
    </>
  );
};
