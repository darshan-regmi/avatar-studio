export const AVATAR_FORMATS = ["png", "svg", "jpeg", "webp"] as const;

export type AvatarFormat = (typeof AVATAR_FORMATS)[number];

export type BackgroundMode = "default" | "transparent" | "custom";

export type StyleCategory =
  | "characters"
  | "illustrated"
  | "abstract"
  | "geometric"
  | "pixel";

export interface AvatarStyleDefinition {
  id: string;
  name: string;
  category: StyleCategory;
}

export interface AvatarSettings {
  style: string;
  seed: string;
  width: number;
  height: number;
  format: AvatarFormat;
  backgroundMode: BackgroundMode;
  backgroundColor: string;
  styleOptions: Record<string, string>;
  square: boolean;
}

export interface StyleOptionDefinition {
  name: string;
  label: string;
  values: string[];
}
