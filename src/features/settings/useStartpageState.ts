import { useLocalStorage } from '../../hooks/useLocalStorage';
import { DEFAULT_POSITIONS, DEFAULT_LINKS, DEFAULT_SETTINGS, DEFAULT_FOCUS } from '../../constants';
import { STORAGE_KEYS } from '../../lib/storageKeys';
import type { Task, LayoutState, QuickLink, Settings, Reminder, FocusSettings } from '../../types';
import {
  normalizeSettings,
  normalizeLayout,
  normalizeLinks,
  normalizeTasks,
  normalizeReminders,
  normalizeFocusSettings,
} from './normalizeSavedData';

export function useStartpageState() {
  const [tasks, setTasks] = useLocalStorage<Task[]>(STORAGE_KEYS.tasks, [], normalizeTasks);
  const [layout, setLayout] = useLocalStorage<LayoutState>(
    STORAGE_KEYS.layout,
    DEFAULT_POSITIONS,
    normalizeLayout,
  );
  const [links, setLinks] = useLocalStorage<QuickLink[]>(
    STORAGE_KEYS.links,
    DEFAULT_LINKS,
    normalizeLinks,
  );
  const [settings, setSettings] = useLocalStorage<Settings>(
    STORAGE_KEYS.settings,
    DEFAULT_SETTINGS,
    normalizeSettings,
  );
  const [reminders, setReminders] = useLocalStorage<Reminder[]>(
    STORAGE_KEYS.reminders,
    [],
    normalizeReminders,
  );
  const [focusSettings, setFocusSettings] = useLocalStorage<FocusSettings>(
    STORAGE_KEYS.focusSettings,
    DEFAULT_FOCUS,
    normalizeFocusSettings,
  );
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
