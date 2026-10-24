import { describe, expect, it } from "vitest";

import {
  avatarSettingsSchema,
  buildDownloadFilename,
  clampDimension,
  dimensionSchema,
  getDownloadDescriptor,
  getFormatMimeType,
  hexColorSchema,
  MAX_DIMENSION,
  MIN_DIMENSION,
  parseDimensionInput,
  resolveSeed,
  slugifyFilenamePart,
  styleIdSchema,
  toApiBackgroundColor,
} from "./avatar-validation";

describe("dimension validation", () => {
  it("accepts the documented range", () => {
    expect(dimensionSchema.safeParse(MIN_DIMENSION).success).toBe(true);
    expect(dimensionSchema.safeParse(300).success).toBe(true);
    expect(dimensionSchema.safeParse(MAX_DIMENSION).success).toBe(true);
  });

  it("rejects out-of-range, fractional, and non-finite values", () => {
    expect(dimensionSchema.safeParse(MIN_DIMENSION - 1).success).toBe(false);
    expect(dimensionSchema.safeParse(MAX_DIMENSION + 1).success).toBe(false);
    expect(dimensionSchema.safeParse(300.5).success).toBe(false);
    expect(dimensionSchema.safeParse(Number.NaN).success).toBe(false);
  });

  it("parses input strings strictly", () => {
    expect(parseDimensionInput("300")).toBe(300);
    expect(parseDimensionInput(" 0300 ")).toBe(300);
    expect(parseDimensionInput("")).toBeNull();
    expect(parseDimensionInput("3.5")).toBeNull();
    expect(parseDimensionInput("abc")).toBeNull();
    expect(parseDimensionInput("2049")).toBeNull();
    expect(parseDimensionInput("-20")).toBeNull();
  });

  it("clamps arbitrary numbers", () => {
    expect(clampDimension(2)).toBe(MIN_DIMENSION);
    expect(clampDimension(9999)).toBe(MAX_DIMENSION);
    expect(clampDimension(Number.NaN)).toBe(MIN_DIMENSION);
  });
});

describe("seed handling", () => {
  it("falls back only for empty or whitespace seeds", () => {
    expect(resolveSeed("")).toBe("eftsoons");
    expect(resolveSeed("   ")).toBe("eftsoons");
    expect(resolveSeed(" padded ")).toBe(" padded ");
  });

  it("validates style ids used in URLs and filenames", () => {
    expect(styleIdSchema.safeParse("pixel-art").success).toBe(true);
    expect(styleIdSchema.safeParse("../evil").success).toBe(false);
    expect(styleIdSchema.safeParse("").success).toBe(false);
  });
});

describe("background handling", () => {
  it("maps transparency to the API alpha value", () => {
    expect(toApiBackgroundColor("transparent", "#ffffff")).toBe("00000000");
  });

  it("strips the hash from custom colors", () => {
    expect(toApiBackgroundColor("custom", "#AaBbCc")).toBe("aabbcc");
    expect(toApiBackgroundColor("custom", "red")).toBeUndefined();
    expect(toApiBackgroundColor("default", "#ffffff")).toBeUndefined();
  });

  it("validates hex colors", () => {
    expect(hexColorSchema.safeParse("#12abEF").success).toBe(true);
    expect(hexColorSchema.safeParse("12abEF").success).toBe(false);
    expect(hexColorSchema.safeParse("#fff").success).toBe(false);
  });
});

describe("filenames and formats", () => {
  it("builds descriptive filenames", () => {
    expect(
      buildDownloadFilename("eftsoons", "shadows", 300, 300, "png"),
    ).toBe("eftsoons-shadows-300x300.png");
    expect(
      buildDownloadFilename("Hello World!", "pixel-art", 512, 512, "webp"),
    ).toBe("hello-world-pixel-art-512x512.webp");
  });

  it("keeps unicode readable and removes unsafe characters", () => {
    expect(slugifyFilenamePart("José / 山田")).toBe("jose");
    expect(slugifyFilenamePart("///")).toBe("");
  });

  it("falls back to a usable seed in filenames", () => {
    expect(buildDownloadFilename("   ", "shadows", 64, 64, "svg")).toBe(
      "eftsoons-shadows-64x64.svg",
    );
  });

  it("uses the matching extension and mime type", () => {
    expect(getFormatMimeType("jpeg")).toBe("image/jpeg");
    expect(getFormatMimeType("svg")).toBe("image/svg+xml");
    expect(
      getDownloadDescriptor({
        seed: "x",
        style: "glass",
        width: 1024,
        height: 512,
        format: "jpeg",
      }),
    ).toEqual({
      filename: "x-glass-1024x512.jpeg",
      mimeType: "image/jpeg",
      isVector: false,
    });
    expect(
      getDownloadDescriptor({
        seed: "x",
        style: "glass",
        width: 512,
        height: 512,
        format: "svg",
      }).isVector,
    ).toBe(true);
  });
});

describe("settings schema", () => {
  it("rejects invalid settings", () => {
    expect(
      avatarSettingsSchema.safeParse({
        style: "shadows",
        seed: "x",
        width: 10,
        height: 300,
        format: "png",
        backgroundMode: "default",
        backgroundColor: "#ffffff",
        styleOptions: {},
        square: false,
      }).success,
    ).toBe(false);
  });
});
