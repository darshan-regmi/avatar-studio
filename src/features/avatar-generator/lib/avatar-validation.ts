import { z } from "zod";

import type {
  AvatarFormat,
  AvatarSettings,
  BackgroundMode,
} from "@/features/avatar-generator/types/avatar";
import { AVATAR_FORMATS } from "@/features/avatar-generator/types/avatar";

export const MIN_DIMENSION = 16;
export const MAX_DIMENSION = 2048;
export const DEFAULT_SEED = "eftsoons";
export const MAX_SEED_LENGTH = 160;

export const dimensionSchema = z
  .number()
  .int("Use a whole number")
  .min(MIN_DIMENSION, `Use at least ${MIN_DIMENSION}px`)
  .max(MAX_DIMENSION, `Use at most ${MAX_DIMENSION}px`);

export const styleIdSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Unknown style");

export const seedSchema = z.string().max(MAX_SEED_LENGTH);

export const formatSchema = z.enum(AVATAR_FORMATS);

export const backgroundModeSchema = z.enum([
  "default",
  "transparent",
  "custom",
]) satisfies z.ZodType<BackgroundMode>;

export const hexColorSchema = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "Use a 6-digit hex color");

export const avatarSettingsSchema = z.object({
  style: styleIdSchema,
  seed: seedSchema,
  width: dimensionSchema,
  height: dimensionSchema,
  format: formatSchema,
  backgroundMode: backgroundModeSchema,
  backgroundColor: hexColorSchema,
  styleOptions: z.record(z.string(), z.string()),
  square: z.boolean(),
}) satisfies z.ZodType<AvatarSettings>;

export const DEFAULT_SETTINGS: AvatarSettings = {
  style: "shadows",
  seed: DEFAULT_SEED,
  width: 300,
  height: 300,
  format: "png",
  backgroundMode: "default",
  backgroundColor: "#f4f4f5",
  styleOptions: {},
  square: true,
};

export function cloneDefaultSettings(): AvatarSettings {
  return { ...DEFAULT_SETTINGS, styleOptions: {} };
}

export function parseDimensionInput(raw: string): number | null {
  const trimmed = raw.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const parsed = Number(trimmed);
  return dimensionSchema.safeParse(parsed).success ? parsed : null;
}

export function clampDimension(value: number): number {
  if (!Number.isFinite(value)) return MIN_DIMENSION;
  return Math.min(MAX_DIMENSION, Math.max(MIN_DIMENSION, Math.round(value)));
}

/** Empty or whitespace-only seeds fall back to the default; other input is kept verbatim. */
export function resolveSeed(seed: string): string {
  return seed.trim().length === 0 ? DEFAULT_SEED : seed;
}

export function toApiBackgroundColor(
  mode: BackgroundMode,
  color: string,
): string | undefined {
  if (mode === "transparent") return "00000000";
  if (mode === "custom" && hexColorSchema.safeParse(color).success) {
    return color.slice(1).toLowerCase();
  }
  return undefined;
}

const FORMAT_MIME_TYPES: Record<AvatarFormat, string> = {
  png: "image/png",
  svg: "image/svg+xml",
  jpeg: "image/jpeg",
  webp: "image/webp",
};

export const FORMAT_LABELS: Record<AvatarFormat, string> = {
  png: "PNG",
  svg: "SVG",
  jpeg: "JPEG",
  webp: "WebP",
};

export function getFormatMimeType(format: AvatarFormat): string {
  return FORMAT_MIME_TYPES[format];
}

export function slugifyFilenamePart(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function buildDownloadFilename(
  seed: string,
  style: string,
  width: number,
  height: number,
  format: AvatarFormat,
): string {
  const seedPart = slugifyFilenamePart(resolveSeed(seed)) || "avatar";
  const stylePart = slugifyFilenamePart(style) || "style";
  return `${seedPart}-${stylePart}-${width}x${height}.${format}`;
}

export interface DownloadDescriptor {
  filename: string;
  mimeType: string;
  isVector: boolean;
}

export function getDownloadDescriptor(
  settings: Pick<AvatarSettings, "seed" | "style" | "width" | "height" | "format">,
): DownloadDescriptor {
  return {
    filename: buildDownloadFilename(
      settings.seed,
      settings.style,
      settings.width,
      settings.height,
      settings.format,
    ),
    mimeType: getFormatMimeType(settings.format),
    isVector: settings.format === "svg",
  };
}
