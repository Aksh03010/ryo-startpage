import { useEffect } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { DEFAULT_POSITIONS, DEFAULT_LINKS, DEFAULT_SETTINGS, DEFAULT_FOCUS } from '../../constants';
import { STORAGE_KEYS } from '../../lib/storageKeys';
import type { Task, LayoutState, QuickLink, Settings, Reminder, FocusSettings } from '../../types';
import { migrateSettings } from './migrateSettings';

export function useStartpageState() {
  const [tasks, setTasks] = useLocalStorage<Task[]>(STORAGE_KEYS.tasks, []);
  const [layout, setLayout] = useLocalStorage<LayoutState>(STORAGE_KEYS.layout, DEFAULT_POSITIONS);
  const [links, setLinks] = useLocalStorage<QuickLink[]>(STORAGE_KEYS.links, DEFAULT_LINKS);
  const [settings, setSettings] = useLocalStorage<Settings>(
    STORAGE_KEYS.settings,
    DEFAULT_SETTINGS,
  );
  const [reminders, setReminders] = useLocalStorage<Reminder[]>(STORAGE_KEYS.reminders, []);
  const [focusSettings, setFocusSettings] = useLocalStorage<FocusSettings>(
    STORAGE_KEYS.focusSettings,
    DEFAULT_FOCUS,
  );
  useEffect(() => setSettings(migrateSettings), [setSettings]);
  return {
    tasks,
    setTasks,
    layout,
    setLayout,
    links,
    setLinks,
    settings,
    setSettings,
    reminders,
    setReminders,
    focusSettings,
    setFocusSettings,
  };
}
