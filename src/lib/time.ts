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

function formatBlurbPart(value: number): string {
  return value.toString(6).padStart(3, '0');
}

export function formatClockParts(
  date: Date,
  use24: boolean,
  seconds: boolean,
  blurb = false,
  blorp = false,
) {
  if (blorp) {
    // Use local wall time so midnight/noon retain their meaning across time zones and DST.
    const milliseconds =
      ((date.getHours() * 60 + date.getMinutes()) * 60 + date.getSeconds()) * 1000 +
      date.getMilliseconds();
    const ticks = Math.floor(milliseconds / 864);
    return {
      hour: String(Math.floor(ticks / 10_000)),
      minute: String(Math.floor(ticks / 100) % 100).padStart(2, '0'),
      second: String(ticks % 100).padStart(2, '0'),
      suffix: '',
      hour12: false,
      seconds,
    };
  }
  const fullDay = use24 || blurb;
  const hours = fullDay ? date.getHours() : date.getHours() % 12 || 12;
  const format = (value: number, width = 2) => String(value).padStart(width, '0');
  const minute = blurb ? formatBlurbPart(date.getMinutes()) : format(date.getMinutes());
  const second = blurb ? formatBlurbPart(date.getSeconds()) : format(date.getSeconds());
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
