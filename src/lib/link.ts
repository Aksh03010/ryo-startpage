const URL_LIKE = /^(localhost|(\d{1,3}\.){3}\d{1,3}|(?:[\p{L}\p{N}-]+\.)+[\p{L}]{2,})(?::\d{1,5})?(?:[/?#]\S*)?$/iu;

const VIDEO_EXT = ['mp4', 'webm', 'ogv'];

export function looksLikeUrl(input: string): boolean {
  const raw = input.trim();
  if (!raw) return false;
  if (/^https?:\/\//i.test(raw)) return true;
  if (/\s/.test(raw)) return false;
  return URL_LIKE.test(raw);
}

export function safeHttpUrl(raw: string): URL {
  const parsed = new URL(raw.includes('://') ? raw : `https://${raw}`);
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Only http(s) links are supported.');
  }
  return parsed;
}

export function guessMediaType(raw: string): 'image' | 'video' {
  const ext = raw.split('?')[0]?.split('.').pop()?.toLowerCase() ?? '';
  if (VIDEO_EXT.includes(ext)) return 'video';
  return 'image';
}
