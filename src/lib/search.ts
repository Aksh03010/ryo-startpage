import type { SearchEngineId } from '../types';
import { SEARCH_ENGINES } from '../constants';
import { looksLikeUrl, safeHttpUrl } from './link';

export function buildSearchUrl(input: string, engine: SearchEngineId): string {
  const term = input.trim();
  if (!term) return '';

  if (looksLikeUrl(term)) {
    try {
      return safeHttpUrl(term).toString();
    } catch {
      // Treat malformed URL-like input as a search query instead.
    }
  }

  return SEARCH_ENGINES[engine].query.replace('%s', encodeURIComponent(term));
}
