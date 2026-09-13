import React, { useEffect } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Scale, 
  HelpCircle, 
  ArrowLeft, 
  Sparkles,
  UserCheck,
  Shield,
  Mail
} from 'lucide-react';
import { updatePageSeo } from '../../utils/seo';
import { PublicHeader } from '../public/PublicHeader';
import { PublicFooter } from '../public/PublicFooter';

interface TermsOfServicePageProps {
  onNavigate: (path: string) => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  isAuthenticated?: boolean;
  onEnterWorkspace?: () => void;
}

export const TermsOfServicePage: React.FC<TermsOfServicePageProps> = ({
  onNavigate,
  onOpenAuth,
  isAuthenticated = false,
  onEnterWorkspace,
}) => {
  useEffect(() => {
    updatePageSeo({
      title: 'Terms of Service | Academic Usage & Platform Agreement | Focus Flow',
      description: 'Review the terms and conditions for utilizing the Focus Flow student productivity workspace, Pomodoro timers, and cloud synchronization services.',
      path: '/terms',
      keywords: ['focus flow terms of service', 'study timer user agreement', 'student app legal terms'],
      ogType: 'article'
    });
  }, []);

  return (
    <div className="min-h-screen theme-bg-app flex flex-col theme-text-primary transition-colors">
      <PublicHeader 
        currentPath="/terms"
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
            <Scale className="w-4 h-4" />
            <span>Platform Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black theme-text-primary tracking-tight">
            Terms of Service
          </h1>
          <p className="text-sm theme-text-muted mt-2 max-w-2xl leading-relaxed">
            Effective Date: <span className="font-semibold theme-text-primary">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>. 
            Welcome to Focus Flow. By accessing or using our student workspace, website, or services, you agree to be bound by these Terms of Service.
          </p>
        </div>

        {/* Summary Card */}
        <div className="p-6 theme-bg-card rounded-2xl border theme-border shadow-xs mb-10">
          <h3 className="text-sm font-bold theme-text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 theme-accent-text" />
            <span>Key Terms Summary</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs theme-text-secondary">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold theme-text-primary block">Your Content Stays Yours</strong>
                <span>You retain full intellectual property ownership of all notes, task descriptions, and study plans entered into Focus Flow.</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold theme-text-primary block">Academic & Personal Use</strong>
                <span>Focus Flow is intended for educational, personal productivity, and self-improvement purposes.</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold theme-text-primary block">No Abusive Behavior</strong>
                <span>Users must not attempt to reverse engineer, inject malicious scripts, or disrupt service stability for other students.</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold theme-text-primary block">Account Termination Anytime</strong>
                <span>You may terminate your account and wipe your records at any time without fees or penalties.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Legal Sections */}
        <div className="space-y-10 text-sm theme-text-secondary leading-relaxed">
          
          {/* Section 1: Acceptance of Terms */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold theme-text-primary tracking-tight flex items-center gap-2">
              <FileText className="w-5 h-5 theme-accent-text" />
              <span>1. Acceptance of Terms</span>
            </h2>
            <p>
              By accessing or using Focus Flow at focusflow.in, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you are using the service on behalf of an educational institution or student organization, you represent that you have the authority to accept these terms on their behalf.
            </p>
          </section>

          {/* Section 2: Account Registration & Security */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold theme-text-primary tracking-tight flex items-center gap-2">
              <UserCheck className="w-5 h-5 theme-accent-text" />
              <span>2. Account Responsibilities & Security</span>
            </h2>
            <p>
              To access personalized cloud synchronization, you may create an account using email credentials or supported OAuth providers (Google). You agree to:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-xs sm:text-sm">
              <li>Provide accurate, current registration information.</li>
              <li>Maintain the confidentiality of your account credentials and passwords.</li>
              <li>Immediately notify Focus Flow if you suspect unauthorized access to your account.</li>
              <li>Take responsibility for all activities occurring under your authenticated account.</li>
            </ul>
          </section>

          {/* Section 3: User Content and Intellectual Property */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold theme-text-primary tracking-tight flex items-center gap-2">
              <Shield className="w-5 h-5 theme-accent-text" />
              <span>3. User Content & Intellectual Property</span>
            </h2>
            <p>
              Focus Flow claims no ownership over any academic coursework, notes, task titles, or goals you create. You grant Focus Flow only the limited, non-exclusive license necessary to host, store, back up, and display your content to you across your authorized devices.
            </p>
            <p>
              All Focus Flow software interfaces, visual brand identities, sound assets, custom timer algorithms, and visual themes are the intellectual property of Focus Flow and protected by copyright and intellectual property laws.
            </p>
          </section>

          {/* Section 4: Prohibited Conduct */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold theme-text-primary tracking-tight flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 theme-accent-text" />
              <span>4. Prohibited Conduct</span>
            </h2>
            <p>
              When interacting with the Focus Flow platform, you agree not to:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-xs sm:text-sm">
              <li>Deploy automated bots, scrapers, or excessive API calls that impair server availability.</li>
              <li>Attempt to gain unauthorized access to any other user accounts or Firestore collections.</li>
              <li>Upload malicious code, viruses, or cross-site scripting vectors into task titles or notes.</li>
              <li>Resell, sublicense, or commercially exploit the Focus Flow application without written authorization.</li>
            </ul>
          </section>

          {/* Section 5: Service Availability & Disclaimer */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold theme-text-primary tracking-tight flex items-center gap-2">
              <HelpCircle className="w-5 h-5 theme-accent-text" />
              <span>5. Service Availability & Disclaimers</span>
            </h2>
            <p>
              Focus Flow is provided on an "AS IS" and "AS AVAILABLE" basis. While we strive for 99.9% uptime and reliable cloud synchronization, Focus Flow makes no warranties, express or implied, regarding uninterrupted operation, timely delivery, or complete absence of minor bugs. We strongly encourage students to maintain backup copies of critical academic schedules and study materials.
            </p>
          </section>

          {/* Section 6: Modifications to Terms */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold theme-text-primary tracking-tight flex items-center gap-2">
              <Scale className="w-5 h-5 theme-accent-text" />
              <span>6. Modifications to Terms</span>
            </h2>
            <p>
              We reserve the right to revise or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice via prominent in-app notification prior to any new terms taking effect. Continued use of Focus Flow after changes constitute acceptance of the updated terms.
            </p>
          </section>

          {/* Section 7: Contact Information */}
          <section className="space-y-3 pt-4 border-t theme-border">
            <h2 className="text-xl font-bold theme-text-primary tracking-tight flex items-center gap-2">
              <Mail className="w-5 h-5 theme-accent-text" />
              <span>7. Contact & Legal Inquiries</span>
            </h2>
            <p>
              For legal inquiries, terms interpretation, or compliance questions, please contact our legal desk at:
            </p>
            <div className="p-4 theme-bg-subtle rounded-xl border theme-border font-mono text-xs">
              <p className="theme-text-primary font-bold">Focus Flow Legal & Operations</p>
              <p className="theme-text-muted mt-0.5">Email: legal@focusflow.in</p>
              <p className="theme-text-muted">Website: https://focusflow.in/terms</p>
            </div>
          </section>

        </div>
      </main>

      <PublicFooter onNavigate={onNavigate} onOpenAuth={onOpenAuth} />
    </div>
  );
};
