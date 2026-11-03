import type { AppearanceSettings, BoxMode } from '../../types';

/** Legacy glass preferences remain readable until their stored schema is migrated. */
export function getGlobalBoxMode(appearance: AppearanceSettings): BoxMode {
  return appearance.boxMode ?? (appearance.glassEnabled === false ? 'solid' : 'glass');
}
