import React from 'react';
import { 
  Sparkles, 
  Clock, 
  Timer, 
  CalendarDays, 
  Compass, 
  ShieldCheck, 
  Heart, 
  ExternalLink,
  ArrowUpRight,
  BookOpen,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { PRODUCTION_DOMAIN } from '../../utils/seo';

interface PublicFooterProps {
  onNavigate: (path: string) => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
}

export const PublicFooter: React.FC<PublicFooterProps> = ({ onNavigate, onOpenAuth }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 transition-colors" role="contentinfo">
      {/* Top Pre-Footer Banner */}
      <div className="border-b border-slate-800/80 bg-slate-950/40 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-[11px] font-bold tracking-wider uppercase text-indigo-400">
              Student Productivity Ecosystem
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
              Ready to reclaim your academic focus?
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Focus Flow is completely free for students. No subscription paywalls, no forced ads, and no distracting notifications.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onOpenAuth('signup')}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              Start Studying Free
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/pomodoro-timer')}
              className="px-4 py-2.5 rounded-xl border border-slate-700 hover:border-slate-500 text-white text-xs font-semibold hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              Try Pomodoro Online
            </button>
          </div>
        </div>
      </div>

      {/* Main Multi-Column Internal Links Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-2 md:grid-cols-5 gap-8 text-xs">
        {/* Brand column */}
        <div className="col-span-2 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-base tracking-tight text-white">
              Focus Flow
            </span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
            Personalized, distraction-free study operating system crafted specifically for students, researchers, and self-directed learners worldwide.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Encrypted cloud synchronization via Google Firebase</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Canonical URL: <span className="text-indigo-400">{PRODUCTION_DOMAIN}</span>
          </div>
        </div>

        {/* Column 2: Free Online Study Tools */}
        <div className="space-y-3">
          <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">
            Free Online Tools
          </h4>
          <ul className="space-y-2 text-slate-400">
            <li>
              <button 
                type="button" 
                onClick={() => onNavigate('/study-timer')}
                className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer text-left"
              >
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Online Study Timer</span>
              </button>
            </li>
            <li>
              <button 
                type="button" 
                onClick={() => onNavigate('/pomodoro-timer')}
                className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer text-left"
              >
                <Timer className="w-3.5 h-3.5 text-rose-400" />
                <span>Pomodoro 25/5 Timer</span>
              </button>
            </li>
            <li>
              <button 
                type="button" 
                onClick={() => onNavigate('/study-planner')}
                className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer text-left"
              >
                <CalendarDays className="w-3.5 h-3.5 text-emerald-400" />
                <span>Study Planner & Schedules</span>
              </button>
            </li>
            <li>
              <button 
                type="button" 
                onClick={() => onNavigate('/focus-timer')}
                className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer text-left"
              >
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                <span>Minimalist Focus Timer</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Column 3: Study Workflows & Science */}
        <div className="space-y-3">
          <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">
            Methodology & Science
          </h4>
          <ul className="space-y-2 text-slate-400">
            <li>
              <button
                type="button"
                onClick={() => onNavigate('/pomodoro-timer')}
                className="hover:text-white transition-colors cursor-pointer text-left"
              >
                The 25/5 Pomodoro Protocol
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigate('/study-timer')}
                className="hover:text-white transition-colors cursor-pointer text-left"
              >
                The 50/10 Rule for Deep Work
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigate('/study-planner')}
                className="hover:text-white transition-colors cursor-pointer text-left"
              >
                Spaced Repetition Timetables
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigate('/focus-timer')}
                className="hover:text-white transition-colors cursor-pointer text-left"
              >
                Ultradian Rhythms (90m Cycles)
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigate('/study-timer')}
                className="hover:text-white transition-colors cursor-pointer text-left"
              >
                Binaural Gamma Audio (40Hz)
              </button>
            </li>
          </ul>
        </div>

        {/* Column 4: Platform & SEO Resources */}
        <div className="space-y-3">
          <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">
            Platform & Index
          </h4>
          <ul className="space-y-2 text-slate-400">
            <li>
              <a 
                href="/sitemap.xml" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-white transition-colors flex items-center gap-1 text-slate-400"
              >
                <span>XML Sitemap</span>
                <ArrowUpRight className="w-3 h-3 text-slate-500" />
              </a>
            </li>
            <li>
              <a 
                href="/robots.txt" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-white transition-colors flex items-center gap-1 text-slate-400"
              >
                <span>Robots.txt</span>
                <ArrowUpRight className="w-3 h-3 text-slate-500" />
              </a>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigate('/')}
                className="hover:text-white transition-colors cursor-pointer text-left"
              >
                Theme Showcase (7 Styles)
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigate('/support')}
                className="hover:text-white transition-colors cursor-pointer text-left"
              >
                Contact & Student Support
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigate('/privacy')}
                className="hover:text-white transition-colors cursor-pointer text-left"
              >
                Privacy Policy
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigate('/terms')}
                className="hover:text-white transition-colors cursor-pointer text-left"
              >
                Terms of Service
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onOpenAuth('signup')}
                className="text-indigo-400 hover:text-indigo-300 transition-colors font-semibold cursor-pointer text-left"
              >
                Create Free Account
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Legal & Copyright Bar */}
      <div className="border-t border-slate-800 py-6 px-4 sm:px-6 lg:px-8 text-[11px] text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span>© {new Date().getFullYear()} Focus Flow (focusflow.in). Built for focused students.</span>
            <span>•</span>
            <button type="button" onClick={() => onNavigate('/privacy')} className="text-slate-400 hover:text-white transition-colors cursor-pointer">Privacy</button>
            <span>•</span>
            <button type="button" onClick={() => onNavigate('/terms')} className="text-slate-400 hover:text-white transition-colors cursor-pointer">Terms</button>
            <span>•</span>
            <button type="button" onClick={() => onNavigate('/support')} className="text-slate-400 hover:text-white transition-colors cursor-pointer">Support</button>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-400">
              Made with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for lifelong learning
            </span>
            <span className="hidden sm:inline text-slate-700">•</span>
            <span className="text-slate-400">v1.2 Production Release</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
