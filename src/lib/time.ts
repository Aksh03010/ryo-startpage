// One text glyph per hour, using local symbol fonts instead of image or font downloads.
const HOUR_SYMBOLS = [
  '☾',
  '☽',
  '◌',
  '○',
  '◔',
  '◑',
  '◕',
  '◉',
  '◇',
  '✧',
  '✦',
  '✶',
  '☼',
  '✹',
  '✺',
  '✷',
  '✴',
  '✳',
  '❋',
  '◈',
  '◆',
  '△',
  '▽',
  '◎',
] as const;

export function formatClockParts(date: Date, use24: boolean, seconds: boolean, blurb = false) {
  const fullDay = use24 || blurb;
  const hours = fullDay ? date.getHours() : date.getHours() % 12 || 12;
  const format = (value: number, width = 2) => value.toString(blurb ? 6 : 10).padStart(width, '0');
  const minute = format(date.getMinutes(), blurb ? 3 : 2);
  const second = format(date.getSeconds(), blurb ? 3 : 2);
  const suffix = fullDay ? '' : date.getHours() < 12 ? 'AM' : 'PM';
  return {
    hour: blurb ? HOUR_SYMBOLS[date.getHours()] : format(hours, fullDay ? 2 : 1),
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
