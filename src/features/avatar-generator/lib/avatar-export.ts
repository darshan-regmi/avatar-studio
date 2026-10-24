import type { AvatarFormat } from "@/features/avatar-generator/types/avatar";
import { getFormatMimeType } from "@/features/avatar-generator/lib/avatar-validation";

export interface RasterLayout {
  width: number;
  height: number;
  side: number;
  x: number;
  y: number;
}

/** The avatar is square, so it is contained and centered inside non-square output. */
export function getRasterLayout(width: number, height: number): RasterLayout {
  const side = Math.min(width, height);
  return {
    width,
    height,
    side,
    x: (width - side) / 2,
    y: (height - side) / 2,
  };
}

/**
 * The API always returns a square SVG. Rewriting its outer dimensions keeps the
 * file a valid vector image while matching the requested output size.
 */
export function applySvgDimensions(
  svgText: string,
  width: number,
  height: number,
): string {
  const document = new DOMParser().parseFromString(svgText, "image/svg+xml");
  const root = document.documentElement;
  if (!root || root.nodeName.toLowerCase() !== "svg") return svgText;

  root.setAttribute("width", String(width));
  root.setAttribute("height", String(height));
  root.setAttribute("preserveAspectRatio", "xMidYMid meet");
  return new XMLSerializer().serializeToString(root);
}

function loadSvgImage(svgText: string): Promise<HTMLImageElement> {
  const blobUrl = URL.createObjectURL(
    new Blob([svgText], { type: "image/svg+xml" }),
  );

  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(blobUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(blobUrl);
      reject(new Error("The avatar image could not be decoded."));
    };
    image.src = blobUrl;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: AvatarFormat,
): Promise<Blob> {
  const mimeType = getFormatMimeType(format);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("The browser could not encode this image format."));
          return;
        }
        // Some browsers silently fall back to PNG for unsupported encoders.
        if (blob.type && blob.type !== mimeType) {
          reject(
            new Error(
              `${format.toUpperCase()} export is not supported in this browser.`,
            ),
          );
          return;
        }
        resolve(blob);
      },
      mimeType,
      0.95,
    );
  });
}

export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

export interface DownloadAvatarOptions {
  svgUrl: string;
  width: number;
  height: number;
  format: AvatarFormat;
  filename: string;
  /** Solid canvas fill used behind transparent areas (always used for JPEG). */
  background?: string;
}

export async function downloadAvatar({
  svgUrl,
  width,
  height,
  format,
  filename,
  background,
}: DownloadAvatarOptions): Promise<void> {
  const response = await fetch(svgUrl);
  if (!response.ok) {
    throw new Error(`Avatar request failed (${response.status}).`);
  }
  const svgText = await response.text();
  if (!svgText.trimStart().startsWith("<svg")) {
    throw new Error("The server did not return an SVG avatar.");
  }

  if (format === "svg") {
    const sizedSvg = applySvgDimensions(svgText, width, height);
    triggerDownload(
      new Blob([sizedSvg], { type: getFormatMimeType("svg") }),
      filename,
    );
    return;
  }

  const image = await loadSvgImage(svgText);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas rendering is unavailable.");

  if (background) {
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);
  }

  const layout = getRasterLayout(width, height);
  context.imageSmoothingQuality = "high";
  context.drawImage(image, layout.x, layout.y, layout.side, layout.side);

  const blob = await canvasToBlob(canvas, format);
  triggerDownload(blob, filename);
}
