export interface AvatarOption {
  id: string;
  label: string;
  iconName: string;
  bgColor: string;
  textColor: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  { id: 'scholar', label: 'Scholar', iconName: 'GraduationCap', bgColor: 'bg-indigo-600', textColor: 'text-white' },
  { id: 'zen', label: 'Zen Mind', iconName: 'Flower2', bgColor: 'bg-emerald-600', textColor: 'text-white' },
  { id: 'astro', label: 'Cosmonaut', iconName: 'Rocket', bgColor: 'bg-violet-600', textColor: 'text-white' },
  { id: 'coffee', label: 'Focus Brew', iconName: 'Coffee', bgColor: 'bg-amber-600', textColor: 'text-white' },
  { id: 'spark', label: 'Bright Spark', iconName: 'Sparkles', bgColor: 'bg-yellow-500', textColor: 'text-slate-900' },
  { id: 'cyber', label: 'Cyber Pulse', iconName: 'Terminal', bgColor: 'bg-cyan-500', textColor: 'text-slate-900' },
  { id: 'book', label: 'Bookworm', iconName: 'BookOpen', bgColor: 'bg-rose-500', textColor: 'text-white' },
  { id: 'target', label: 'High Achiever', iconName: 'Target', bgColor: 'bg-sky-600', textColor: 'text-white' },
];

export function getAvatarOption(id?: string): AvatarOption {
  return AVATAR_OPTIONS.find((a) => a.id === id) || AVATAR_OPTIONS[0];
}
