import { describe, expect, it } from "vitest";

import { buildAvatarUrl, buildStyleThumbnailUrl } from "./dicebear-api";

function searchParams(url: string): URLSearchParams {
  return new URL(url).searchParams;
}

describe("buildAvatarUrl", () => {
  it("uses the centralized API version and style path", () => {
    const url = buildAvatarUrl("shadows", { seed: "eftsoons", size: 300 });
    expect(url).toBe(
      "https://api.dicebear.com/10.x/shadows/svg?seed=eftsoons&size=300",
    );
  });

  it("encodes seeds safely while preserving their content", () => {
    const seed = "A B & C/ü?x=y#z";
    const params = searchParams(buildAvatarUrl("shadows", { seed }));
    expect(params.get("seed")).toBe(seed);
    expect(params.get("seed")).not.toBeNull();
  });

  it("encodes unicode seeds", () => {
    const seed = "山田太郎 🎨";
    const url = buildAvatarUrl("micah", { seed });
    expect(searchParams(url).get("seed")).toBe(seed);
    expect(url).toContain("seed=%E5%B1%B1");
  });

  it("falls back to the default seed when empty", () => {
    expect(searchParams(buildAvatarUrl("shadows", { seed: "   " })).get("seed")).toBe(
      "eftsoons",
    );
  });

  it("clamps the API size to the documented range", () => {
    expect(
      searchParams(buildAvatarUrl("shadows", { seed: "x", size: 9999 })).get(
        "size",
      ),
    ).toBe("4096");
    expect(
      searchParams(buildAvatarUrl("shadows", { seed: "x", size: 0 })).get(
        "size",
      ),
    ).toBe("1");
  });

  it("adds API-ready background colors and style options", () => {
    const params = searchParams(
      buildAvatarUrl("shadows", {
        seed: "x",
        backgroundColor: "aabbcc",
        styleOptions: {
          flip: "horizontal",
          topsVariant: "bun",
          empty: "",
        },
      }),
    );
    expect(params.get("backgroundColor")).toBe("aabbcc");
    expect(params.get("flip")).toBe("horizontal");
    expect(params.get("topsVariant")).toBe("bun");
    expect(params.has("empty")).toBe(false);
  });

  it("does not let style options override the seed", () => {
    const params = searchParams(
      buildAvatarUrl("shadows", {
        seed: "real",
        styleOptions: { seed: "fake" },
      }),
    );
    expect(params.get("seed")).toBe("real");
  });

  it("builds lazy thumbnail URLs", () => {
    const url = buildStyleThumbnailUrl("pixel-art", 96);
    expect(url).toBe(
      "https://api.dicebear.com/10.x/pixel-art/svg?seed=pixel-art&size=96",
    );
  });
});
