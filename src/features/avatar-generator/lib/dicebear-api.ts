import { z } from "zod";

import type { StyleOptionDefinition } from "@/features/avatar-generator/types/avatar";
import { resolveSeed } from "@/features/avatar-generator/lib/avatar-validation";

export const DICEBEAR_API_BASE_URL = "https://api.dicebear.com";
export const DICEBEAR_API_VERSION = "10.x";
export const DICEBEAR_WEBSITE_URL = "https://www.dicebear.com";
export const DICEBEAR_HTTP_DOCS_URL =
  "https://www.dicebear.com/how-to-use/http-api/";

export interface AvatarUrlOptions {
  seed: string;
  size?: number;
  /** Hex value without the leading #, as accepted by the DiceBear API. */
  backgroundColor?: string;
  styleOptions?: Record<string, string>;
}

const styleListSchema = z.object({ styles: z.array(z.string()) });
const styleOptionsSchema = z.record(z.string(), z.unknown());

export function buildAvatarUrl(
  style: string,
  options: AvatarUrlOptions,
): string {
  const url = new URL(
    `/${DICEBEAR_API_VERSION}/${encodeURIComponent(style)}/svg`,
    DICEBEAR_API_BASE_URL,
  );

  url.searchParams.set("seed", resolveSeed(options.seed));

  if (options.size !== undefined) {
    const size = Math.min(4096, Math.max(1, Math.round(options.size)));
    url.searchParams.set("size", String(size));
  }

  if (options.backgroundColor) {
    url.searchParams.set("backgroundColor", options.backgroundColor);
  }

  for (const [name, value] of Object.entries(options.styleOptions ?? {})) {
    if (!value || name === "seed" || name === "size") continue;
    url.searchParams.set(name, value);
  }

  return url.toString();
}

export function buildStyleThumbnailUrl(style: string, size = 96): string {
  return buildAvatarUrl(style, { seed: style, size });
}

export async function fetchAvailableStyles(
  signal?: AbortSignal,
): Promise<string[]> {
  const response = await fetch(
    `${DICEBEAR_API_BASE_URL}/${DICEBEAR_API_VERSION}`,
    { signal },
  );
  if (!response.ok) {
    throw new Error(`Style list request failed (${response.status})`);
  }

  const parsed = styleListSchema.safeParse(await response.json());
  if (!parsed.success) throw new Error("Unexpected style list response");
  return parsed.data.styles;
}

function humanizeOptionName(name: string): string {
  return name
    .replace(/Variant$/, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/^./, (char) => char.toUpperCase());
}

interface RawOption {
  type?: unknown;
  values?: unknown;
}

export async function fetchStyleOptions(
  style: string,
  signal?: AbortSignal,
): Promise<StyleOptionDefinition[]> {
  const response = await fetch(
    `${DICEBEAR_API_BASE_URL}/${DICEBEAR_API_VERSION}/${encodeURIComponent(style)}/options.json`,
    { signal },
  );
  if (!response.ok) {
    throw new Error(`Style options request failed (${response.status})`);
  }

  const parsed = styleOptionsSchema.safeParse(await response.json());
  if (!parsed.success) throw new Error("Unexpected style options response");

  const options: StyleOptionDefinition[] = [];

  for (const [name, raw] of Object.entries(parsed.data)) {
    const option = raw as RawOption;
    if (option?.type !== "enum" || !Array.isArray(option.values)) continue;
    if (name.endsWith("Probability") || name.endsWith("Order")) continue;
    if (name.startsWith("backgroundColor")) continue;

    const values = option.values.filter(
      (value): value is string => typeof value === "string",
    );
    if (values.length === 0) continue;

    options.push({
      name,
      label: humanizeOptionName(name),
      values,
    });
  }

  return options;
}
