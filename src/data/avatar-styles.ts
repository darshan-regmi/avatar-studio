import type {
  AvatarStyleDefinition,
  StyleCategory,
} from "@/features/avatar-generator/types/avatar";

export const STYLE_CATEGORIES: {
  id: StyleCategory;
  label: string;
  description: string;
}[] = [
  {
    id: "characters",
    label: "Characters",
    description: "People, faces, and personalities",
  },
  {
    id: "illustrated",
    label: "Illustrated",
    description: "Hand-drawn and playful artwork",
  },
  {
    id: "abstract",
    label: "Abstract",
    description: "Organic shapes, patterns, and moods",
  },
  {
    id: "geometric",
    label: "Geometric",
    description: "Grids, tiles, and clean shapes",
  },
  {
    id: "pixel",
    label: "Pixel art",
    description: "Retro pixels and voxels",
  },
];

export const CATEGORY_LABELS: Record<StyleCategory, string> = {
  characters: "Characters",
  illustrated: "Illustrated",
  abstract: "Abstract",
  geometric: "Geometric",
  pixel: "Pixel art",
};

/**
 * Bundled snapshot of the public styles in DiceBear 10.x, used for names,
 * categories, and as a fallback when the live style list cannot be loaded.
 * The live list from https://api.dicebear.com/10.x is the source of truth.
 */
export const AVATAR_STYLES: AvatarStyleDefinition[] = [
  { id: "adventurer", name: "Adventurer", category: "characters" },
  {
    id: "adventurer-neutral",
    name: "Adventurer Neutral",
    category: "characters",
  },
  { id: "avataaars", name: "Avataaars", category: "characters" },
  {
    id: "avataaars-neutral",
    name: "Avataaars Neutral",
    category: "characters",
  },
  { id: "big-ears", name: "Big Ears", category: "characters" },
  {
    id: "big-ears-neutral",
    name: "Big Ears Neutral",
    category: "characters",
  },
  { id: "big-smile", name: "Big Smile", category: "characters" },
  { id: "blobs", name: "Blobs", category: "abstract" },
  { id: "bottts", name: "Bottts", category: "illustrated" },
  {
    id: "bottts-neutral",
    name: "Bottts Neutral",
    category: "illustrated",
  },
  { id: "cameo", name: "Cameo", category: "characters" },
  { id: "clay", name: "Clay", category: "abstract" },
  { id: "constellation", name: "Constellation", category: "abstract" },
  { id: "critters", name: "Critters", category: "illustrated" },
  { id: "croodles", name: "Croodles", category: "characters" },
  {
    id: "croodles-neutral",
    name: "Croodles Neutral",
    category: "characters",
  },
  { id: "cutouts", name: "Cutouts", category: "illustrated" },
  { id: "disco", name: "Disco", category: "illustrated" },
  { id: "dylan", name: "Dylan", category: "characters" },
  { id: "fun-emoji", name: "Fun Emoji", category: "characters" },
  { id: "gaze", name: "Gaze", category: "illustrated" },
  { id: "glass", name: "Glass", category: "illustrated" },
  { id: "glyphs", name: "Glyphs", category: "abstract" },
  { id: "icons", name: "Icons", category: "abstract" },
  { id: "identicon", name: "Identicon", category: "abstract" },
  { id: "initial-face", name: "Initial Face", category: "characters" },
  { id: "initials", name: "Initials", category: "characters" },
  { id: "landscape", name: "Landscape", category: "illustrated" },
  { id: "line-face", name: "Line Face", category: "characters" },
  { id: "loops", name: "Loops", category: "abstract" },
  { id: "lorelei", name: "Lorelei", category: "characters" },
  {
    id: "lorelei-neutral",
    name: "Lorelei Neutral",
    category: "characters",
  },
  { id: "marbles", name: "Marbles", category: "abstract" },
  { id: "micah", name: "Micah", category: "characters" },
  { id: "miniavs", name: "Miniavs", category: "characters" },
  { id: "moods", name: "Moods", category: "illustrated" },
  { id: "notionists", name: "Notionists", category: "characters" },
  {
    id: "notionists-neutral",
    name: "Notionists Neutral",
    category: "characters",
  },
  { id: "open-peeps", name: "Open Peeps", category: "characters" },
  { id: "patchwork", name: "Patchwork", category: "illustrated" },
  { id: "personas", name: "Personas", category: "characters" },
  { id: "pixel-art", name: "Pixel Art", category: "pixel" },
  {
    id: "pixel-art-neutral",
    name: "Pixel Art Neutral",
    category: "pixel",
  },
  { id: "pixelbot", name: "Pixelbot", category: "pixel" },
  { id: "planets", name: "Planets", category: "abstract" },
  { id: "rings", name: "Rings", category: "abstract" },
  { id: "shadows", name: "Shadows", category: "abstract" },
  { id: "shape-grid", name: "Shape Grid", category: "geometric" },
  { id: "shapes", name: "Shapes", category: "geometric" },
  { id: "slice", name: "Slice", category: "abstract" },
  { id: "sprouts", name: "Sprouts", category: "abstract" },
  { id: "squircles", name: "Squircles", category: "geometric" },
  { id: "stack", name: "Stack", category: "abstract" },
  { id: "stripes", name: "Stripes", category: "geometric" },
  { id: "thumbs", name: "Thumbs", category: "illustrated" },
  { id: "toon-head", name: "Toon Head", category: "characters" },
  { id: "triangles", name: "Triangles", category: "geometric" },
  { id: "voxel-art", name: "Voxel Art", category: "pixel" },
  { id: "voxel-bot", name: "Voxel Bot", category: "pixel" },
  { id: "waves", name: "Waves", category: "abstract" },
  { id: "weave", name: "Weave", category: "geometric" },
];

const STYLE_MAP = new Map(AVATAR_STYLES.map((style) => [style.id, style]));

export function humanizeStyleId(id: string): string {
  return id
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getStyleDefinition(id: string): AvatarStyleDefinition {
  return (
    STYLE_MAP.get(id) ?? {
      id,
      name: humanizeStyleId(id),
      category: "illustrated",
    }
  );
}
