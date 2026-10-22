import type { QuickLink, SearchEngineId } from '../types';
import { DEFAULT_LINKS } from '../constants';

export function normalizeLinkUrl(input: string): string {
  const raw = input.trim();
  if (!raw) return '';
  if (/^(https?:\/\/|mailto:)/i.test(raw)) return raw;
  return `https://${raw.replace(/^\/+/, '')}`;
}

export function linkDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./i, '');
  } catch {
    return url;
  }
}

export function linkInitial(label: string, url: string): string {
  const source = label.trim() || linkDomain(url);
  const value = source.trim().toUpperCase();
  return value.length > 0 ? value[0] : '#';
}

export function linkFavicon(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    return new URL('/favicon.ico', parsed.origin).href;
  } catch {
    return null;
  }
}

export function searchEngine(engine: SearchEngineId): { label: string; endpoint: string } {
  switch (engine) {
    case 'google':
      return { label: 'Google', endpoint: 'https://www.google.com/search?q={query}' };
    case 'brave':
      return { label: 'Brave', endpoint: 'https://search.brave.com/search?q={query}' };
    case 'youtube':
      return { label: 'YouTube', endpoint: 'https://www.youtube.com/results?search_query={query}' };
    default:
      return {
        label: 'DuckDuckGo',
        endpoint: 'https://duckduckgo.com/?q={query}',
      };
  }
}

export function quickLinkDefaults(): QuickLink[] {
  return DEFAULT_LINKS;
}
