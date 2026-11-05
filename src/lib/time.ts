export function formatClockParts(date: Date, use24: boolean, seconds: boolean, base24 = false) {
  const fullDay = use24 || base24;
  const hours = fullDay ? date.getHours() : date.getHours() % 12 || 12;
  const format = (value: number, width = 2) =>
    value
      .toString(base24 ? 24 : 10)
      .toUpperCase()
      .padStart(width, '0');
  const minute = format(date.getMinutes());
  const second = format(date.getSeconds());
  const suffix = fullDay ? '' : date.getHours() < 12 ? 'AM' : 'PM';
  return {
    hour: format(hours, fullDay ? 2 : 1),
    minute,
    second,
    suffix,
    hour12: !fullDay,
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
