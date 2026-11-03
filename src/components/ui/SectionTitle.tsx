import type { ReactNode } from 'react';
import styles from './Controls.module.css';

export function SectionTitle({ children }: { children: ReactNode }) {
  return <h3 className={styles.title}>{children}</h3>;
}
