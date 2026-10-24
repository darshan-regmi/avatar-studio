import { describe, expect, it } from "vitest";

import {
  cloneDefaultSettings,
} from "@/features/avatar-generator/lib/avatar-validation";
import {
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
  SETTINGS_STORAGE_KEY,
  type StorageLike,
} from "./avatar-settings";

class MemoryStorage implements StorageLike {
  private readonly data = new Map<string, string>();

  getItem(key: string): string | null {
    return this.data.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }
}

describe("settings persistence", () => {
  it("round-trips settings", () => {
    const storage = new MemoryStorage();
    const settings = {
      ...cloneDefaultSettings(),
      style: "micah",
      seed: "山田",
      width: 1024,
      height: 512,
      format: "webp" as const,
      backgroundMode: "custom" as const,
      backgroundColor: "#abcdef",
      square: false,
      styleOptions: { flip: "horizontal" },
    };

    saveSettings(settings, storage);
    expect(loadSettings(storage)).toEqual(settings);
  });

  it("returns defaults when nothing is stored", () => {
    expect(loadSettings(new MemoryStorage())).toEqual(DEFAULT_SETTINGS);
  });

  it("recovers from corrupt JSON", () => {
    const storage = new MemoryStorage();
    storage.setItem(SETTINGS_STORAGE_KEY, "{not json");
    expect(loadSettings(storage)).toEqual(DEFAULT_SETTINGS);
  });

  it("rejects stored settings with invalid dimensions or formats", () => {
    const storage = new MemoryStorage();
    storage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({ ...DEFAULT_SETTINGS, width: 99999 }),
    );
    expect(loadSettings(storage)).toEqual(DEFAULT_SETTINGS);

    storage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({ ...DEFAULT_SETTINGS, format: "gif" }),
    );
    expect(loadSettings(storage)).toEqual(DEFAULT_SETTINGS);
  });

  it("does not throw when storage access fails", () => {
    const broken: StorageLike = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    };

    expect(loadSettings(broken)).toEqual(DEFAULT_SETTINGS);
    expect(() => saveSettings(DEFAULT_SETTINGS, broken)).not.toThrow();
  });
});
