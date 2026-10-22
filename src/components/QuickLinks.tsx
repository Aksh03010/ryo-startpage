import { useMemo, useState } from 'react';
import { Plus, X } from 'lucide-react';
import type { QuickLink } from '../types';
import { linkDomain, linkInitial, normalizeLinkUrl } from '../lib/links';
import styles from './QuickLinks.module.css';

function hostColor(url: string): string {
  const name = linkDomain(url);
  let hash = 0;
  for (let index = 0; index < name.length; index += 1) {
    hash = (hash * 31 + name.charCodeAt(index)) % 360;
  }
  const hue = hash;
  return `hsl(${hue} 78% 62%)`;
}

export default function QuickLinks({
  links,
  onLinksChange,
}: {
  links: QuickLink[];
  onLinksChange: (updater: (prev: QuickLink[]) => QuickLink[]) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [draftLabel, setDraftLabel] = useState('');
  const [draftUrl, setDraftUrl] = useState('');

  const add = () => {
    const value = normalizeLinkUrl(draftUrl);
    if (!value) return;
    const label = draftLabel.trim() || linkDomain(value);
    onLinksChange((prev) => [...prev, { id: crypto.randomUUID(), label, url: value }]);
    setDraftLabel('');
    setDraftUrl('');
    setAdding(false);
  };

  const gradient = useMemo(
    () => (url: string) => {
      const color = hostColor(url);
      return {
        background: `linear-gradient(145deg, ${color}, hsl(0 0% 6% / 0.9) `,
      };
    },
    [],
  );

  return (
    <div className={styles.wrap}>
      <p className={styles.title}>Quick links</p>
      <ul className={styles.grid}>
        {links.map((link) => (
          <li key={link.id} className={styles.link}>
            <a href={link.url} target="_blank" rel="noreferrer" aria-label={link.label}>
              <span
                className={styles.tile}
                style={{ background: gradient(link.url).background + '36% 26%, rgba(10, 12, 20, 0.9) 100%)' }}
                data-tint={hostColor(link.url)}
              >
                {linkInitial(link.label, link.url)}
              </span>
              <span className={styles.label}>{link.label}</span>
            </a>
            <button
              type="button"
              className={styles.remove}
              aria-label={`Remove ${link.label}`}
              title="Remove link"
              onClick={() =>
                onLinksChange((prev) => prev.filter((item) => item.id !== link.id))
              }
            >
              <X size={12} strokeWidth={2.6} />
            </button>
          </li>
        ))}
        <li className={`${styles.link} ${styles.addLink}`}>
          {adding ? (
            <form
              className={styles.addForm}
              onSubmit={(event) => {
                event.preventDefault();
                add();
              }}
            >
              <input
                autoFocus
                className={styles.input}
                placeholder="Label"
                value={draftLabel}
                onChange={(event) => setDraftLabel(event.target.value)}
                aria-label="Link label"
              />
              <input
                className={styles.input}
                placeholder="https://example.com"
                value={draftUrl}
                onChange={(event) => setDraftUrl(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') add();
                }}
                aria-label="Link URL"
              />
              <div className={styles.formActions}>
                <button type="button" onClick={() => setAdding(false)}>
                  Cancel
                </button>
                <button type="submit">Save</button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              className={styles.addTile}
              aria-label="Add quick link"
              onClick={() => setAdding(true)}
            >
              <Plus size={17} strokeWidth={2.2} />
            </button>
          )}
        </li>
      </ul>
    </div>
  );
}
