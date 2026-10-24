import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import fs from "node:fs/promises";

function pngDimensions(buffer: Buffer) {
  expect(buffer.subarray(1, 4).toString("ascii")).toBe("PNG");
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

async function downloadBuffer(page: Page, name: RegExp) {
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name }).click();
  const download = await downloadPromise;
  const path = await download.path();
  if (path === null) throw new Error("Download did not produce a file");
  return { download, buffer: await fs.readFile(path) };
}

async function selectOption(page: Page, triggerId: string, name: string) {
  await page.locator(`#${triggerId}`).click();
  await page.getByRole("option", { name }).click();
}

test("generates, customizes, exports, and restores an avatar", async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));

  await page.goto("/");

  const preview = page.getByRole("img", { name: /avatar for seed/ });
  await expect(preview).toBeVisible();
  await expect
    .poll(() => preview.evaluate((img: HTMLImageElement) => img.naturalWidth))
    .toBeGreaterThan(0);

  await expect(page.locator("#avatar-seed")).toHaveValue("eftsoons");
  await expect(page.getByText("300 × 300").first()).toBeVisible();

  await page.locator("#avatar-seed").fill("hello world");
  await expect
    .poll(async () => {
      const src = await preview.getAttribute("src");
      return src ? new URL(src).searchParams.get("seed") : null;
    })
    .toBe("hello world");

  await page.locator("#style-picker-trigger").click();
  await page.getByLabel("Search avatar styles").fill("micah");
  await page.getByRole("button", { name: /^Micah/ }).click();
  await expect(page.locator("#style-picker-trigger")).toContainText("Micah");
  await expect(preview).toHaveAttribute("alt", /Micah/);

  await page.locator("#square-dimensions").click();
  await page.locator("#avatar-width").fill("512");
  await page.locator("#avatar-height").fill("300");

  const png = await downloadBuffer(page, /^Download PNG/);
  expect(png.download.suggestedFilename()).toBe(
    "hello-world-micah-512x300.png",
  );
  expect(pngDimensions(png.buffer)).toEqual({ width: 512, height: 300 });

  await selectOption(page, "format-select", "JPEG");
  const jpeg = await downloadBuffer(page, /^Download JPEG/);
  expect(jpeg.download.suggestedFilename()).toBe(
    "hello-world-micah-512x300.jpeg",
  );
  expect(jpeg.buffer.subarray(0, 2).toString("hex")).toBe("ffd8");

  await selectOption(page, "format-select", "SVG");
  const svg = await downloadBuffer(page, /^Download SVG/);
  expect(svg.download.suggestedFilename()).toBe(
    "hello-world-micah-512x300.svg",
  );
  const svgText = svg.buffer.toString("utf8");
  expect(svgText).toContain("<svg");
  expect(svgText).toContain('width="512"');
  expect(svgText).toContain('height="300"');
  expect(svgText).toContain("viewBox");

  await selectOption(page, "format-select", "WebP");
  const webp = await downloadBuffer(page, /^Download WebP/);
  expect(webp.download.suggestedFilename()).toBe(
    "hello-world-micah-512x300.webp",
  );
  expect(webp.buffer.subarray(0, 4).toString("ascii")).toBe("RIFF");
  expect(webp.buffer.subarray(8, 12).toString("ascii")).toBe("WEBP");

  const themeBefore = await page.locator("html").getAttribute("class");
  await page.getByRole("button", { name: "Toggle color theme" }).click();
  await expect
    .poll(() => page.locator("html").getAttribute("class"))
    .not.toBe(themeBefore);

  await page.waitForTimeout(400);
  await page.reload();
  await expect(page.locator("#avatar-seed")).toHaveValue("hello world");
  await expect(page.locator("#style-picker-trigger")).toContainText("Micah");
  await expect(page.locator("#avatar-width")).toHaveValue("512");
  await expect(page.locator("#avatar-height")).toHaveValue("300");
  await expect(page.locator("#format-select")).toContainText("WebP");
  expect(consoleErrors).toEqual([]);
});

test("stays usable on a narrow viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(
    page.getByRole("img", { name: /avatar for seed/ }),
  ).toBeVisible();
  await expect
    .poll(() =>
      page
        .getByRole("img", { name: /avatar for seed/ })
        .evaluate((img: HTMLImageElement) => img.naturalWidth),
    )
    .toBeGreaterThan(0);

  const previewBox = await page
    .getByRole("heading", { name: "Live preview" })
    .boundingBox();
  const configBox = await page
    .getByRole("heading", { name: "Customize" })
    .boundingBox();
  expect(previewBox?.y).toBeLessThan(configBox?.y ?? 0);
});
