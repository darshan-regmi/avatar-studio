"use client";

import { useEffect, useMemo, useState } from "react";

import type {
  AvatarSettings,
  StyleOptionDefinition,
} from "@/features/avatar-generator/types/avatar";
import {
  buildAvatarUrl,
  fetchAvailableStyles,
  fetchStyleOptions,
} from "@/features/avatar-generator/lib/dicebear-api";
import {
  loadSettings,
  saveSettings,
} from "@/features/avatar-generator/lib/avatar-settings";
import {
  cloneDefaultSettings,
  MAX_DIMENSION,
  toApiBackgroundColor,
} from "@/features/avatar-generator/lib/avatar-validation";
import {
  AVATAR_STYLES,
  getStyleDefinition,
} from "@/data/avatar-styles";

const PREVIEW_SIZE = 512;
const SEED_DEBOUNCE_MS = 220;

interface CatalogState {
  styles: typeof AVATAR_STYLES;
  loading: boolean;
  error: string | null;
}

interface OptionsState {
  styleId: string;
  options: StyleOptionDefinition[];
  loading: boolean;
  error: string | null;
}

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timeout);
  }, [value, delay]);

  return debounced;
}

function createRandomSeed(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().replaceAll("-", "").slice(0, 10);
  }
  return Math.random().toString(36).slice(2, 12);
}

export function useAvatarGenerator() {
  const [settings, setSettings] = useState<AvatarSettings>(
    cloneDefaultSettings,
  );
  const [hydrated, setHydrated] = useState(false);
  const [catalog, setCatalog] = useState<CatalogState>({
    styles: AVATAR_STYLES,
    loading: true,
    error: null,
  });
  const [catalogRequest, setCatalogRequest] = useState(0);
  const [options, setOptions] = useState<OptionsState>({
    styleId: settings.style,
    options: [],
    loading: true,
    error: null,
  });
  const [optionsRequest, setOptionsRequest] = useState(0);

  useEffect(() => {
    // Read persisted settings after hydration so server and client markup match.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSettings(loadSettings());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveSettings(settings);
  }, [settings, hydrated]);

  useEffect(() => {
    const controller = new AbortController();

    fetchAvailableStyles(controller.signal)
      .then((styleIds) => {
        if (controller.signal.aborted) return;
        setCatalog({
          styles: styleIds.map(getStyleDefinition),
          loading: false,
          error: null,
        });
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setCatalog({
          styles: AVATAR_STYLES,
          loading: false,
          error:
            "The live style list is unavailable, so a bundled snapshot is shown.",
        });
      });

    return () => controller.abort();
  }, [catalogRequest]);

  useEffect(() => {
    const controller = new AbortController();
    const styleId = settings.style;

    fetchStyleOptions(styleId, controller.signal)
      .then((styleOptions) => {
        if (controller.signal.aborted) return;
        const allowed = new Set(styleOptions.map((option) => option.name));
        setOptions({ styleId, options: styleOptions, loading: false, error: null });
        setSettings((current) => {
          if (current.style !== styleId) return current;
          const entries = Object.entries(current.styleOptions).filter(([name]) =>
            allowed.has(name),
          );
          if (entries.length === Object.keys(current.styleOptions).length) {
            return current;
          }
          return { ...current, styleOptions: Object.fromEntries(entries) };
        });
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setOptions({
          styleId,
          options: [],
          loading: false,
          error: "Style options could not be loaded.",
        });
      });

    return () => controller.abort();
  }, [settings.style, optionsRequest]);

  const debouncedSeed = useDebouncedValue(settings.seed, SEED_DEBOUNCE_MS);

  const previewUrl = useMemo(
    () =>
      buildAvatarUrl(settings.style, {
        seed: debouncedSeed,
        size: PREVIEW_SIZE,
        backgroundColor: toApiBackgroundColor(
          settings.backgroundMode,
          settings.backgroundColor,
        ),
        styleOptions: settings.styleOptions,
      }),
    [
      settings.style,
      debouncedSeed,
      settings.backgroundMode,
      settings.backgroundColor,
      settings.styleOptions,
    ],
  );

  const exportUrl = useMemo(
    () =>
      buildAvatarUrl(settings.style, {
        seed: settings.seed,
        size: Math.min(
          MAX_DIMENSION,
          Math.max(settings.width, settings.height),
        ),
        backgroundColor: toApiBackgroundColor(
          settings.backgroundMode,
          settings.backgroundColor,
        ),
        styleOptions: settings.styleOptions,
      }),
    [settings],
  );

  const updateSettings = (patch: Partial<AvatarSettings>) => {
    setSettings((current) => ({ ...current, ...patch }));
  };

  const selectStyle = (style: string) => {
    setSettings((current) => ({ ...current, style, styleOptions: {} }));
  };

  const changeWidth = (width: number) => {
    setSettings((current) => ({
      ...current,
      width,
      height: current.square ? width : current.height,
    }));
  };

  const changeHeight = (height: number) => {
    setSettings((current) => ({
      ...current,
      height,
      width: current.square ? height : current.width,
    }));
  };

  const changeSquare = (square: boolean) => {
    setSettings((current) => ({
      ...current,
      square,
      height: square ? current.width : current.height,
    }));
  };

  const setStyleOption = (name: string, value: string) => {
    setSettings((current) => {
      const nextOptions = { ...current.styleOptions };
      if (value) nextOptions[name] = value;
      else delete nextOptions[name];
      return { ...current, styleOptions: nextOptions };
    });
  };

  const resetSettings = () => setSettings(cloneDefaultSettings());

  const retryCatalog = () => {
    setCatalog((current) => ({ ...current, loading: true, error: null }));
    setCatalogRequest((value) => value + 1);
  };

  const retryOptions = () => {
    setOptions((current) => ({
      ...current,
      styleId: settings.style,
      loading: true,
      error: null,
    }));
    setOptionsRequest((value) => value + 1);
  };

  const randomizeSeed = () => {
    updateSettings({ seed: createRandomSeed() });
  };

  const style = getStyleDefinition(settings.style);
  const styleUnavailable =
    !catalog.loading && !catalog.styles.some((item) => item.id === settings.style);

  return {
    settings,
    updateSettings,
    selectStyle,
    changeWidth,
    changeHeight,
    changeSquare,
    setStyleOption,
    resetSettings,
    randomizeSeed,
    previewUrl,
    exportUrl,
    style,
    styleUnavailable,
    catalog,
    retryCatalog,
    options:
      options.styleId === settings.style
        ? options
        : {
            styleId: settings.style,
            options: [],
            loading: true,
            error: null,
          },
    retryOptions,
  };
}
