/**
 * SEO & Meta Management Utility for Focus Flow
 * Production Domain: https://focusflow.in
 */

export interface PageSeoConfig {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  ogType?: 'website' | 'article';
  ogImage?: string;
  structuredData?: Record<string, any>;
}

export const PRODUCTION_DOMAIN = 'https://focusflow.in';

export const SEO_PAGES: Record<string, PageSeoConfig> = {
  home: {
    title: 'Focus Flow | Free Personalized Study Workspace, Timer & Planner for Students',
    description: 'All-in-one student workspace designed to plan studies, manage tasks, focus with science-backed timers, organize subjects, and track academic stamina. 100% free for students.',
    path: '/',
    keywords: [
      'study timer',
      'pomodoro timer',
      'study planner',
      'student productivity workspace',
      'exam preparation tracker',
      'spaced repetition planner',
      'adhd study timer',
      'homework organizer'
    ],
    ogType: 'website',
    ogImage: `${PRODUCTION_DOMAIN}/assets/og-cover.png`,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Focus Flow',
      url: PRODUCTION_DOMAIN,
      description: 'Personalized study workspace for students to plan studies, manage tasks, focus with a timer, organize subjects, and track progress.',
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Any modern browser',
      offers: {
        '@type': 'Offer',
        price: '0.00',
        priceCurrency: 'USD'
      },
      featureList: [
        'Customizable Pomodoro & interval study timers',
        'Visual interactive study planner & calendar',
        'Hierarchical subject & homework task manager',
        'Daily study streaks & progress analytics',
        '7 student-crafted aesthetic themes & focus soundscapes'
      ]
    }
  },
  studyTimer: {
    title: 'Online Study Timer | Free Deep Work & Revision Interval Timer | Focus Flow',
    description: 'Free online study timer designed for students. Choose between 50/10 intervals, 90-minute ultradian rhythms, or custom sessions. Includes ambient focus audio and session tracking.',
    path: '/study-timer',
    keywords: [
      'study timer online',
      'free study timer',
      'study timer with breaks',
      '50 10 study timer',
      'deep work timer for students',
      'revision interval timer'
    ],
    ogType: 'article',
    ogImage: `${PRODUCTION_DOMAIN}/assets/og-study-timer.png`,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Focus Flow Study Timer',
      url: `${PRODUCTION_DOMAIN}/study-timer`,
      description: 'Online interval study timer with 50/10 intervals, 90-minute ultradian rhythm cycles, and customizable study blocks.',
      applicationCategory: 'ProductivityApplication',
      operatingSystem: 'All',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD'
      }
    }
  },
  pomodoroTimer: {
    title: 'Free Pomodoro Timer Online | 25/5 Study Technique with Flow Extender | Focus Flow',
    description: 'Master the 25/5 Pomodoro Technique with our online study timer. Automatically track 4-sprint cycles, customize short and long breaks, and link tasks to boost academic focus.',
    path: '/pomodoro-timer',
    keywords: [
      'pomodoro timer',
      '25 5 timer',
      'pomodoro study technique',
      'free online pomodoro',
      'pomodoro tracker for students',
      'pomodoro clock'
    ],
    ogType: 'article',
    ogImage: `${PRODUCTION_DOMAIN}/assets/og-pomodoro.png`,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: 'How to Study with the 25/5 Pomodoro Technique',
      description: 'A 5-step scientifically proven method to eliminate procrastination, sustain energy, and master challenging study materials.',
      step: [
        {
          '@type': 'HowToStep',
          name: 'Choose a single study task',
          text: 'Select one specific assignment or revision topic. Write it down and eliminate all extraneous tabs.'
        },
        {
          '@type': 'HowToStep',
          name: 'Set timer for 25 minutes',
          text: 'Initiate the Pomodoro sprint and commit 100% of cognitive effort without phone interruptions.'
        },
        {
          '@type': 'HowToStep',
          name: 'Take a 5-minute restful break',
          text: 'Step away from screens. Hydrate, stretch, or look at distant objects to recharge dopamine reserves.'
        },
        {
          '@type': 'HowToStep',
          name: 'Complete 4 consecutive cycles',
          text: 'Repeat the 25/5 interval 4 times to accumulate 100 minutes of concentrated study.'
        },
        {
          '@type': 'HowToStep',
          name: 'Reward yourself with a 15-30 minute long break',
          text: 'Take an extended break to let your brain consolidate learned information through memory reconsolidation.'
        }
      ]
    }
  },
  studyPlanner: {
    title: 'Interactive Study Planner & Spaced Repetition Schedule Generator | Focus Flow',
    description: 'Generate structured study timetables and spaced repetition revision schedules for upcoming exams. Plan revision blocks, prevent academic burnout, and organize subject workloads.',
    path: '/study-planner',
    keywords: [
      'study planner',
      'student revision timetable',
      'exam study schedule generator',
      'spaced repetition planner',
      'study schedule maker',
      'weekly study planner'
    ],
    ogType: 'article',
    ogImage: `${PRODUCTION_DOMAIN}/assets/og-planner.png`,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Focus Flow Study Schedule Generator',
      url: `${PRODUCTION_DOMAIN}/study-planner`,
      description: 'Visual study calendar and spaced repetition timetable creator for exams and weekly classes.',
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'All',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD'
      }
    }
  },
  focusTimer: {
    title: 'Minimalist Focus Timer & Ambient Distraction Blocker | Focus Flow',
    description: 'Full-screen minimalist focus timer with ambient soundscapes (rain, lofi, cafe, binaural beats) for distraction-free deep work and intense exam study sessions.',
    path: '/focus-timer',
    keywords: [
      'focus timer',
      'fullscreen study timer',
      'minimalist timer',
      'deep work timer',
      'focus timer with sounds',
      'monk mode study timer'
    ],
    ogType: 'article',
    ogImage: `${PRODUCTION_DOMAIN}/assets/og-focus.png`,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Focus Flow Minimalist Focus Timer',
      url: `${PRODUCTION_DOMAIN}/focus-timer`,
      description: 'Fullscreen distraction-free timer with ambient sound generators for high-intensity study and coding blocks.',
      applicationCategory: 'ProductivityApplication',
      operatingSystem: 'All',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD'
      }
    }
  }
};

/**
 * Updates DOM head tags for single-page SEO performance and social sharing previews
 */
export function updatePageSeo(config: PageSeoConfig) {
  if (typeof document === 'undefined') return;

  // 1. Page Title
  document.title = config.title;

  // 2. Canonical URL
  const canonicalUrl = `${PRODUCTION_DOMAIN}${config.path === '/' ? '' : config.path}`;
  let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute('href', canonicalUrl);

  // Helper to set or update meta tag
  const setMeta = (selector: string, attrName: 'name' | 'property', attrValue: string, content: string) => {
    let el = document.querySelector(selector) as HTMLMetaElement | null;
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attrName, attrValue);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  // 3. Standard Metas
  setMeta('meta[name="description"]', 'name', 'description', config.description);
  if (config.keywords && config.keywords.length > 0) {
    setMeta('meta[name="keywords"]', 'name', 'keywords', config.keywords.join(', '));
  }

  // 4. Open Graph Tags
  setMeta('meta[property="og:title"]', 'property', 'og:title', config.title);
  setMeta('meta[property="og:description"]', 'property', 'og:description', config.description);
  setMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
  setMeta('meta[property="og:type"]', 'property', 'og:type', config.ogType || 'website');
  setMeta('meta[property="og:site_name"]', 'property', 'og:site_name', 'Focus Flow');
  if (config.ogImage) {
    setMeta('meta[property="og:image"]', 'property', 'og:image', config.ogImage);
  }

  // 5. Twitter Card Tags
  setMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
  setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', config.title);
  setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', config.description);
  if (config.ogImage) {
    setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', config.ogImage);
  }

  // 6. JSON-LD Structured Data
  if (config.structuredData) {
    let scriptTag = document.getElementById('json-ld-structured-data') as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'json-ld-structured-data';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(config.structuredData);
  }
}
