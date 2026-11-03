import type { FocusSettings, Settings, WidgetId } from '../../types';

export type UpdateSettings = (update: (previous: Settings) => Settings) => void;

export interface SettingsTabProps {
  settings: Settings;
  onSettings: UpdateSettings;
}

export interface CustomizePanelProps extends SettingsTabProps {
  open: boolean;
  onClose: () => void;
  arrange: boolean;
  onArrange: () => void;
  onResetLayout: () => void;
  onResetPreferences: () => void;
  onUpload: (file: File) => void;
  uploading: boolean;
  uploadError: string | null;
  focusSettings: FocusSettings;
  onFocusSettings: (next: FocusSettings | ((previous: FocusSettings) => FocusSettings)) => void;
}

export interface BackgroundTabProps
  extends SettingsTabProps, Pick<CustomizePanelProps, 'onUpload' | 'uploading' | 'uploadError'> {
  urlDraft: string;
  setUrlDraft: (value: string) => void;
  urlError: string | null;
  setUrlError: (value: string | null) => void;
}

export interface WidgetsTabProps
  extends SettingsTabProps, Pick<CustomizePanelProps, 'focusSettings' | 'onFocusSettings'> {
  widgetDetail: WidgetId;
  setWidgetDetail: (value: WidgetId) => void;
}

export interface LayoutTabProps
  extends SettingsTabProps, Pick<CustomizePanelProps, 'arrange' | 'onArrange' | 'onResetLayout'> {
  onRequestReset: () => void;
}
