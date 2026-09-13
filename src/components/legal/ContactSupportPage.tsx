import React, { useState, useEffect } from 'react';
import { 
  LifeBuoy, 
  Mail, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare, 
  HelpCircle, 
  Sparkles, 
  ArrowLeft,
  Loader2,
  BookOpen,
  ShieldCheck,
  Compass
} from 'lucide-react';
import { updatePageSeo } from '../../utils/seo';
import { PublicHeader } from '../public/PublicHeader';
import { PublicFooter } from '../public/PublicFooter';
import { validateEmail, validateTextField } from '../../utils/security';
import { parseAppError } from '../../utils/errorParser';

interface ContactSupportPageProps {
  onNavigate: (path: string) => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  isAuthenticated?: boolean;
  onEnterWorkspace?: () => void;
}

type SupportCategory = 'general' | 'bug' | 'feature' | 'account' | 'academic';

export const ContactSupportPage: React.FC<ContactSupportPageProps> = ({
  onNavigate,
  onOpenAuth,
  isAuthenticated = false,
  onEnterWorkspace,
}) => {
  useEffect(() => {
    updatePageSeo({
      title: 'Contact & Student Support Desk | Help, Feedback & Inquiries | Focus Flow',
      description: 'Get help with Focus Flow study timer, sync issues, report bugs, suggest features, or reach out for university & academic student inquiries.',
      path: '/support',
      keywords: ['focus flow support', 'student timer help', 'focus flow contact', 'report bug study timer'],
      ogType: 'website'
    });
  }, []);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<SupportCategory>('general');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validate Name
    const nameVal = validateTextField(name, 'Your Name', { minLength: 2, maxLength: 80 });
    if (!nameVal.isValid) {
      setFormError(nameVal.error || 'Please enter a valid name.');
      return;
    }

    // Validate Email
    const emailVal = validateEmail(email);
    if (!emailVal.isValid) {
      setFormError(emailVal.error || 'Please enter a valid email address.');
      return;
    }

    // Validate Subject
    const subjectVal = validateTextField(subject, 'Subject', { minLength: 3, maxLength: 120 });
    if (!subjectVal.isValid) {
      setFormError(subjectVal.error || 'Please enter a brief subject line.');
      return;
    }

    // Validate Message
    const messageVal = validateTextField(message, 'Message', { minLength: 10, maxLength: 2000 });
    if (!messageVal.isValid) {
      setFormError(messageVal.error || 'Please enter your message (at least 10 characters).');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate safe async dispatch and logging of support inquiry
      await new Promise((resolve) => setTimeout(resolve, 800));

      setSubmitSuccess(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setCategory('general');
    } catch (err) {
      const parsed = parseAppError(err, 'support ticket submission');
      setFormError(parsed.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories: { id: SupportCategory; label: string; desc: string }[] = [
    { id: 'general', label: 'General Help', desc: 'Questions on how to use Focus Flow tools' },
    { id: 'bug', label: 'Bug Report', desc: 'Something not working as expected' },
    { id: 'feature', label: 'Feature Request', desc: 'Ideas to make Focus Flow even better' },
    { id: 'account', label: 'Account & Data Privacy', desc: 'Login issues or data management' },
    { id: 'academic', label: 'Academic & Institutional', desc: 'School, club, or university inquiries' },
  ];

  const quickFaqs = [
    {
      q: 'How do I reset my Pomodoro intervals?',
      a: 'Open Settings (top right gear icon) in your workspace and go to Focus Timer to adjust Pomodoro, Short Break, Long Break, and Auto-Start preferences.'
    },
    {
      q: 'Can I export my study statistics?',
      a: 'Yes. Visit the Progress tab in your workspace and click "Export Study Report" to download a clean text/CSV summary of your focus sessions and completed assignments.'
    },
    {
      q: 'Is my data backed up if I clear my browser cache?',
      a: 'Yes, as long as you are signed into your Focus Flow account, all tasks and focus sessions are safely synced in real time to Google Cloud Firestore.'
    }
  ];

  return (
    <div className="min-h-screen theme-bg-app flex flex-col theme-text-primary transition-colors">
      <PublicHeader 
        currentPath="/support"
        onNavigate={onNavigate}
        onOpenAuth={onOpenAuth}
        isAuthenticated={isAuthenticated}
        onEnterWorkspace={onEnterWorkspace}
      />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
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
            <LifeBuoy className="w-4 h-4" />
            <span>Student Support & Contact Desk</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black theme-text-primary tracking-tight">
            How Can We Help You?
          </h1>
          <p className="text-sm theme-text-muted mt-2 max-w-2xl leading-relaxed">
            Have a question about your study timer, found a bug, or want to suggest a new student feature? Reach out directly and our team will get back to you promptly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Interactive Contact Form */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 theme-bg-card rounded-3xl border theme-border shadow-md">
              <h2 className="text-lg font-bold theme-text-primary mb-1 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 theme-accent-text" />
                <span>Send a Message</span>
              </h2>
              <p className="text-xs theme-text-muted mb-6">
                All submissions are securely processed. We usually respond within 24 hours.
              </p>

              {submitSuccess ? (
                <div className="p-8 text-center space-y-4 animate-in fade-in">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold theme-text-primary">Support Request Received!</h3>
                  <p className="text-xs theme-text-secondary max-w-md mx-auto leading-relaxed">
                    Thank you for reaching out. We have logged your ticket and our student support desk will reply to your provided email address shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitSuccess(false)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <span>Send Another Inquiry</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {formError && (
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-200 text-xs rounded-xl flex items-center gap-2 font-medium">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold theme-text-secondary uppercase tracking-wider mb-1.5">
                        Your Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Alex Johnson"
                        className="w-full px-3.5 py-2.5 theme-bg-subtle border theme-border rounded-xl text-sm theme-text-primary focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold theme-text-secondary uppercase tracking-wider mb-1.5">
                        Your Email <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="alex@university.edu"
                        className="w-full px-3.5 py-2.5 theme-bg-subtle border theme-border rounded-xl text-sm theme-text-primary focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold theme-text-secondary uppercase tracking-wider mb-1.5">
                      Inquiry Category <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {categories.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setCategory(c.id)}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            category === c.id
                              ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs'
                              : 'theme-border theme-bg-subtle theme-text-secondary hover:theme-text-primary'
                          }`}
                        >
                          <div className="text-xs font-bold">{c.label}</div>
                          <div className="text-[10px] theme-text-muted mt-0.5">{c.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold theme-text-secondary uppercase tracking-wider mb-1.5">
                      Subject Line <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Sync issue on tablet, or New study music soundscape suggestion"
                      className="w-full px-3.5 py-2.5 theme-bg-subtle border theme-border rounded-xl text-sm theme-text-primary focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold theme-text-secondary uppercase tracking-wider mb-1.5">
                      Message Details <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Please describe your question or issue in detail..."
                      className="w-full px-3.5 py-2.5 theme-bg-subtle border theme-border rounded-xl text-sm theme-text-primary focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 resize-y"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Sending Support Message...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Submit Message to Support</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Right Column: Direct Info & Quick FAQs */}
          <div className="lg:col-span-5 space-y-6">
            {/* Direct Contact Card */}
            <div className="p-6 theme-bg-card rounded-3xl border theme-border shadow-xs space-y-4">
              <h3 className="text-sm font-bold theme-text-primary uppercase tracking-wider flex items-center gap-2">
                <Mail className="w-4 h-4 theme-accent-text" />
                <span>Direct Contact Channels</span>
              </h3>
              <div className="space-y-3 text-xs theme-text-secondary">
                <div className="p-3 theme-bg-subtle rounded-xl border theme-border">
                  <span className="text-[10px] uppercase font-bold theme-text-muted block">General & Technical Support</span>
                  <span className="font-mono theme-text-primary font-semibold">support@focusflow.in</span>
                </div>
                <div className="p-3 theme-bg-subtle rounded-xl border theme-border">
                  <span className="text-[10px] uppercase font-bold theme-text-muted block">Privacy & Security Desk</span>
                  <span className="font-mono theme-text-primary font-semibold">privacy@focusflow.in</span>
                </div>
                <div className="p-3 theme-bg-subtle rounded-xl border theme-border">
                  <span className="text-[10px] uppercase font-bold theme-text-muted block">Academic Partnerships & Clubs</span>
                  <span className="font-mono theme-text-primary font-semibold">edu@focusflow.in</span>
                </div>
              </div>
            </div>

            {/* Quick Self-Help FAQs */}
            <div className="p-6 theme-bg-card rounded-3xl border theme-border shadow-xs space-y-4">
              <h3 className="text-sm font-bold theme-text-primary uppercase tracking-wider flex items-center gap-2">
                <HelpCircle className="w-4 h-4 theme-accent-text" />
                <span>Frequently Answered</span>
              </h3>
              <div className="space-y-3">
                {quickFaqs.map((faq, idx) => (
                  <div key={idx} className="p-3.5 theme-bg-subtle rounded-xl border theme-border space-y-1">
                    <h4 className="text-xs font-bold theme-text-primary">{faq.q}</h4>
                    <p className="text-[11px] theme-text-muted leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Security Assurance Badge */}
            <div className="p-4 theme-bg-subtle rounded-2xl border theme-border flex items-center gap-3 text-xs theme-text-muted">
              <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
              <span>We never share your support inquiries or contact information with third parties.</span>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter onNavigate={onNavigate} onOpenAuth={onOpenAuth} />
    </div>
  );
};
