/** Existing keys are centralized here so reorganizing code never resets browser data. */
export const STORAGE_KEYS = {
  tasks: 'ryo.tasks.v2',
  layout: 'ryo.layout.v2',
  links: 'ryo.links.v2',
  settings: 'ryo.settings.v2',
  focus: 'ryo.focus.v2',
  focusSettings: 'ryo.focus.settings',
  reminders: 'ryo.reminders.v2',
} as const;
