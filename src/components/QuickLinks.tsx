import { useState } from 'react';
import { ArrowUpRight, Plus, X } from 'lucide-react';
import type { QuickLink } from '../types';
import { linkDomain, linkFavicon, linkInitial, normalizeLinkUrl } from '../lib/links';
import styles from './QuickLinks.module.css';

function QuickLinkIcon({ link }: { link: QuickLink }) {
  const [failed, setFailed] = useState(false);
  const favicon = linkFavicon(link.url);

  return (
    <span className={styles.tile} aria-hidden="true">
      <span className={styles.tileFallback}>{linkInitial(link.label, link.url)}</span>
      {favicon && !failed && (
        <img
          className={styles.favicon}
          src={favicon}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      )}
    </span>
  );
}

export function QuickLinks({
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

  return (
    <div className={styles.wrap}>
      <p className={styles.title}>
        <ArrowUpRight size={15} /> Your constellation<span>{links.length} links</span>
      </p>
      <ul className={styles.grid}>
        {links.map((link) => (
          <li key={link.id} className={styles.link}>
            <a href={link.url} target="_blank" rel="noreferrer" aria-label={link.label}>
              <QuickLinkIcon link={link} />
              <span className={styles.label}>{link.label}</span>
            </a>
            <button
              type="button"
              className={styles.remove}
              aria-label={`Remove ${link.label}`}
              title="Remove link"
              onClick={() => onLinksChange((prev) => prev.filter((item) => item.id !== link.id))}
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
