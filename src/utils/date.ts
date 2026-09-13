export function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatReadableDate(dateString?: string): string {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-').map(Number);
  if (!year || !month || !day) return dateString;
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function formatHeaderDate(): string {
  const d = new Date();
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function isTaskOverdue(dueDate?: string, dueTime?: string, completed?: boolean): boolean {
  if (completed || !dueDate) return false;
  const now = new Date();
  
  const [year, month, day] = dueDate.split('-').map(Number);
  let dueDateTime: Date;
  
  if (dueTime) {
    const [hours, minutes] = dueTime.split(':').map(Number);
    dueDateTime = new Date(year, month - 1, day, hours || 0, minutes || 0, 0);
  } else {
    // If no time is specified, mark overdue after 23:59:59 of that day
    dueDateTime = new Date(year, month - 1, day, 23, 59, 59);
  }

  return now.getTime() > dueDateTime.getTime();
}

export function getOverdueText(dueDate?: string, dueTime?: string): string {
  if (!dueDate) return '';
  const now = new Date();
  const [year, month, day] = dueDate.split('-').map(Number);
  let dueDateTime: Date;
  if (dueTime) {
    const [hours, minutes] = dueTime.split(':').map(Number);
    dueDateTime = new Date(year, month - 1, day, hours || 0, minutes || 0, 0);
  } else {
    dueDateTime = new Date(year, month - 1, day, 23, 59, 59);
  }

  const diffMs = now.getTime() - dueDateTime.getTime();
  if (diffMs <= 0) return '';

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `Overdue by ${diffDays}d`;
  }
  if (diffHours > 0) {
    return `Overdue by ${diffHours}h`;
  }
  return 'Overdue';
}

export function isDueToday(dueDate?: string): boolean {
  if (!dueDate) return false;
  return dueDate === getTodayString();
}

export function isDueUpcoming(dueDate?: string): boolean {
  if (!dueDate) return false;
  return dueDate > getTodayString();
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function formatMinutes(minutes: number): string {
  if (!minutes || minutes <= 0) return '0m';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
  if (hrs > 0) return `${hrs}h`;
  return `${mins}m`;
}

export function getDaysAgoString(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getStartOfWeek(): Date {
  const now = new Date();
  const day = now.getDay();
  // In US/Standard, Sunday is 0 or Monday is 1. Let's take Monday as start of study week
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export function getStartOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
}

