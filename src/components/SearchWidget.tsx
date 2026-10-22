import { useState } from 'react';
import type { SearchEngineId } from '../types';
import { SEARCH_ENGINES } from '../constants';
import { buildSearchUrl } from '../lib/search';
import styles from './SearchWidget.module.css';

export default function SearchWidget({
  engine,
  onEngineChange,
}: {
  engine: SearchEngineId;
  onEngineChange: (engine: SearchEngineId) => void;
}) {
  const [term, setTerm] = useState('');

  const search = () => {
    const query = term.trim();
    if (!query) return;
    const target = buildSearchUrl(query, engine);
    window.location.assign(target as string);
    setTerm('');
  };

  return (
    <form
      className={styles.bar}
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        search();
      }}
    >
      <span className={styles.spark} aria-hidden>
        <svg viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6.6" stroke="currentColor" strokeWidth="1.3" />
          <path d="M8 4.4 9 8l-1 3.6L7 8l1-3.6Z" fill="currentColor" />
        </svg>
      </span>
      <input
        className={styles.input}
        type="search"
        placeholder="Search the web…"
        value={term}
        onChange={(event) => setTerm(event.target.value)}
        aria-label="Search query"
      />
      <select
        className={styles.engine}
        value={engine}
        onChange={(event) => onEngineChange(event.target.value as SearchEngineId)}
        aria-label="Search engine"
      >
        {Object.entries(SEARCH_ENGINES).map(([id, info]) => (
          <option key={id} value={id}>
            {info.label}
          </option>
        ))}
      </select>
    </form>
  );
}
