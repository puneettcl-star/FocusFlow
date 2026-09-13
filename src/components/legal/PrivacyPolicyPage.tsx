import React, { useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Database, 
  EyeOff, 
  UserCheck, 
  Trash2, 
  Cookie, 
  ArrowLeft, 
  Sparkles,
  CheckCircle2,
  Mail
} from 'lucide-react';
import { SEO_PAGES, updatePageSeo } from '../../utils/seo';
import { PublicHeader } from '../public/PublicHeader';
import { PublicFooter } from '../public/PublicFooter';

interface PrivacyPolicyPageProps {
  onNavigate: (path: string) => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  isAuthenticated?: boolean;
  onEnterWorkspace?: () => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({
  onNavigate,
  onOpenAuth,
  isAuthenticated = false,
  onEnterWorkspace,
}) => {
  useEffect(() => {
    updatePageSeo({
      title: 'Privacy Policy | Student Data Security & Privacy Commitment | Focus Flow',
      description: 'Learn how Focus Flow protects your study data, homework checklists, focus session analytics, and user account with zero tracking ads and encrypted cloud storage.',
      path: '/privacy',
      keywords: ['focus flow privacy policy', 'student data privacy', 'encrypted study timer', 'gdpr compliance focus flow'],
      ogType: 'article'
    });
  }, []);

  return (
    <div className="min-h-screen theme-bg-app flex flex-col theme-text-primary transition-colors">
      <PublicHeader 
        currentPath="/privacy"
        onNavigate={onNavigate}
        onOpenAuth={onOpenAuth}
        isAuthenticated={isAuthenticated}
        onEnterWorkspace={onEnterWorkspace}
      />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        {/* Breadcrumb / Back button */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold theme-text-muted hover:theme-text-primary transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </button>
        </div>

        {/* Header Title Section */}
        <div className="pb-8 border-b theme-border mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl theme-accent-subtle theme-accent-text text-xs font-bold mb-4">
            <ShieldCheck className="w-4 h-4" />
            <span>Student Privacy Commitment</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black theme-text-primary tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm theme-text-muted mt-2 max-w-2xl leading-relaxed">
            Last Updated: <span className="font-semibold theme-text-primary">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>. 
            Focus Flow is built with a student-first privacy principle: your study notes, tasks, and timers belong exclusively to you.
          </p>
        </div>

        {/* Quick Highlights Box */}
        <div className="p-6 theme-bg-card rounded-2xl border theme-border shadow-xs mb-10">
          <h3 className="text-sm font-bold theme-text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 theme-accent-text" />
            <span>Privacy Highlights at a Glance</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs theme-text-secondary">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold theme-text-primary block">Zero Tracking Ads & Data Brokers</strong>
                <span>We never sell, monetize, or broker your personal study logs to third-party ad networks.</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold theme-text-primary block">Per-User Data Isolation</strong>
                <span>Database security rules strictly enforce that only your authenticated account can access your tasks.</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold theme-text-primary block">Full Account & Data Deletion</strong>
                <span>You can export or permanently delete your account and all associated study data anytime from Settings.</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold theme-text-primary block">Encrypted Transmission & Storage</strong>
                <span>All communication is TLS-encrypted with cloud database security powered by Google Cloud.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Text Sections */}
        <div className="space-y-10 text-sm theme-text-secondary leading-relaxed">
          
          {/* Section 1: Information We Collect */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold theme-text-primary tracking-tight flex items-center gap-2">
              <Database className="w-5 h-5 theme-accent-text" />
              <span>1. Information We Collect</span>
            </h2>
            <p>
              When you use Focus Flow, we collect only the minimal data required to provide you with study planning, task tracking, and timer synchronization features:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-xs sm:text-sm">
              <li>
                <strong className="theme-text-primary font-semibold">Account Information:</strong> When you register via email or Google OAuth, we receive your email address, display name, and unique authentication identifier.
              </li>
              <li>
                <strong className="theme-text-primary font-semibold">Study Workspace Content:</strong> Subject titles, homework task descriptions, due dates, task priority levels, completed study session durations, and goal targets created by you.
              </li>
              <li>
                <strong className="theme-text-primary font-semibold">Preferences & Customizations:</strong> Chosen UI theme (e.g., Calm Sage, Obsidian Night), ambient sound volume preferences, notification toggles, and customized timer interval settings.
              </li>
            </ul>
          </section>

          {/* Section 2: How We Use Your Information */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold theme-text-primary tracking-tight flex items-center gap-2">
              <UserCheck className="w-5 h-5 theme-accent-text" />
              <span>2. How We Use Your Information</span>
            </h2>
            <p>
              Your data is used solely to deliver the service and calculate your personalized study metrics:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-xs sm:text-sm">
              <li>To synchronize your tasks and timers seamlessly across your mobile, tablet, and desktop devices.</li>
              <li>To calculate your study streaks, subject hour breakdowns, and milestone completion percentages.</li>
              <li>To preserve your visual preferences and study workflow settings across browser sessions.</li>
              <li>To ensure service stability, prevent malicious abuse, and authenticate authorized account sessions.</li>
            </ul>
          </section>

          {/* Section 3: Data Security and Encryption */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold theme-text-primary tracking-tight flex items-center gap-2">
              <Lock className="w-5 h-5 theme-accent-text" />
              <span>3. Data Storage & Security Safeguards</span>
            </h2>
            <p>
              We implement enterprise-grade security protocols to protect your academic records. All database interactions occur over HTTPS/TLS encrypted connections. User documents in Google Cloud Firestore are protected by strict server-side authorization security rules ensuring that only your verified user token has permission to read or modify your data.
            </p>
          </section>

          {/* Section 4: Cookies and Local Storage */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold theme-text-primary tracking-tight flex items-center gap-2">
              <Cookie className="w-5 h-5 theme-accent-text" />
              <span>4. Cookies and Local Storage</span>
            </h2>
            <p>
              Focus Flow uses standard browser Local Storage and essential authentication tokens to remember your login session and active theme preference offline. We do not use third-party behavioral advertising cookies or cross-site fingerprinting scripts.
            </p>
          </section>

          {/* Section 5: Data Retention & User Rights */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold theme-text-primary tracking-tight flex items-center gap-2">
              <Trash2 className="w-5 h-5 theme-accent-text" />
              <span>5. Your Rights & Data Deletion</span>
            </h2>
            <p>
              You maintain total ownership of your study records. You have the right at any time to:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-xs sm:text-sm">
              <li>Export your study logs and tasks as formatted reports from the Progress & Analytics tab.</li>
              <li>Edit or delete any specific task, study subject, goal, or completed focus session.</li>
              <li>Permanently delete your entire user profile and all associated data through the Account tab in Settings.</li>
            </ul>
          </section>

          {/* Section 6: Contact Information */}
          <section className="space-y-3 pt-4 border-t theme-border">
            <h2 className="text-xl font-bold theme-text-primary tracking-tight flex items-center gap-2">
              <Mail className="w-5 h-5 theme-accent-text" />
              <span>6. Contact Us Regarding Privacy</span>
            </h2>
            <p>
              If you have any questions, inquiries, or privacy concerns regarding how Focus Flow handles student data, please contact our support team at:
            </p>
            <div className="p-4 theme-bg-subtle rounded-xl border theme-border font-mono text-xs">
              <p className="theme-text-primary font-bold">Focus Flow Privacy & Data Protection</p>
              <p className="theme-text-muted mt-0.5">Email: support@focusflow.in</p>
              <p className="theme-text-muted">Website: https://focusflow.in</p>
            </div>
          </section>

        </div>
      </main>

      <PublicFooter onNavigate={onNavigate} onOpenAuth={onOpenAuth} />
    </div>
  );
};
