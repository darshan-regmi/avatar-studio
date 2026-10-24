import { describe, expect, it } from "vitest";

import { getRasterLayout } from "./avatar-export";

describe("raster export layout", () => {
  it("produces the exact requested canvas dimensions", () => {
    expect(getRasterLayout(300, 300)).toEqual({
      width: 300,
      height: 300,
      side: 300,
      x: 0,
      y: 0,
    });
  });

  it("letterboxes wide output around a centered square avatar", () => {
    expect(getRasterLayout(1024, 512)).toEqual({
      width: 1024,
      height: 512,
      side: 512,
      x: 256,
      y: 0,
    });
  });

  it("letterboxes tall output around a centered square avatar", () => {
    expect(getRasterLayout(200, 600)).toEqual({
      width: 200,
      height: 600,
      side: 200,
      x: 0,
      y: 200,
    });
  });
});
