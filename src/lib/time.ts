export function formatClockParts(date: Date, use24: boolean, seconds: boolean) {
  const hours = use24 ? date.getHours() : (date.getHours() % 12) || 12;
  const minute = String(date.getMinutes()).padStart(2, '0');
  const second = String(date.getSeconds()).padStart(2, '0');
  const suffix = use24 ? '' : date.getHours() < 12 ? 'AM' : 'PM';
  return {
    hour: String(hours).padStart(use24 ? 2 : 1, '0'),
    minute,
    second,
    suffix,
    hour12: !use24,
    seconds,
  };
}

export function formatDateLine(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function greetingFor(date: Date): string {
  const hour = date.getHours();
  if (hour < 5) return 'Good night';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
