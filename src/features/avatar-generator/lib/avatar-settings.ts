import type { AvatarSettings } from "@/features/avatar-generator/types/avatar";
import {
  avatarSettingsSchema,
  cloneDefaultSettings,
  DEFAULT_SETTINGS,
} from "@/features/avatar-generator/lib/avatar-validation";

export const SETTINGS_STORAGE_KEY = "avatar-studio:settings:v1";

export type StorageLike = Pick<Storage, "getItem" | "setItem">;

function getBrowserStorage(): StorageLike | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

export function loadSettings(storage = getBrowserStorage()): AvatarSettings {
  if (!storage) return cloneDefaultSettings();

  try {
    const raw = storage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return cloneDefaultSettings();
    const parsed = avatarSettingsSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : cloneDefaultSettings();
  } catch {
    return cloneDefaultSettings();
  }
}

export function saveSettings(
  settings: AvatarSettings,
  storage = getBrowserStorage(),
): void {
  if (!storage) return;
  try {
    storage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Storage can be unavailable or full; settings simply won't persist.
  }
}

export { DEFAULT_SETTINGS };
