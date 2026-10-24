"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircleIcon,
  CheckIcon,
  CopyIcon,
  ExternalLinkIcon,
  RefreshCwIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { AvatarDownloadButton } from "@/features/avatar-generator/components/avatar-download-button";
import type { AvatarSettings } from "@/features/avatar-generator/types/avatar";
import { cn } from "@/lib/utils";

function PreviewImage({ src, alt }: { src: string; alt: string }) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(
    "loading",
  );
  const [retry, setRetry] = useState(0);

  const imageRef = useCallback((node: HTMLImageElement | null) => {
    // Cached images can finish loading before React attaches onLoad.
    if (node?.complete && node.naturalWidth > 0) setStatus("loaded");
  }, []);

  const retrySrc = useMemo(() => {
    if (retry === 0) return src;
    const url = new URL(src);
    url.searchParams.set("_retry", String(retry));
    return url.toString();
  }, [src, retry]);

  if (status === "error") {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
        <AlertCircleIcon
          className="size-6 text-destructive"
          aria-hidden="true"
        />
        <div className="space-y-1">
          <p className="text-sm font-medium">Couldn&apos;t load this avatar</p>
          <p className="text-xs text-muted-foreground">
            Check your connection or try another style.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setStatus("loading");
            setRetry((value) => value + 1);
          }}
        >
          <RefreshCwIcon />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <>
      {status === "loading" ? (
        <Skeleton className="absolute inset-3 rounded-lg" />
      ) : null}
      {/* eslint-disable-next-line @next/next/no-img-element -- generated SVG preview with manual load states */}
      <img
        key={retrySrc}
        ref={imageRef}
        src={retrySrc}
        alt={alt}
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("error")}
        decoding="async"
        className={cn(
          "h-full w-full object-contain transition-opacity duration-200",
          status === "loaded" ? "opacity-100" : "opacity-0",
        )}
      />
    </>
  );
}

interface AvatarPreviewProps {
  settings: AvatarSettings;
  previewUrl: string;
  exportUrl: string;
  styleName: string;
  styleUnavailable: boolean;
}

export function AvatarPreview({
  settings,
  previewUrl,
  exportUrl,
  styleName,
  styleUnavailable,
}: AvatarPreviewProps) {
  const [checkerboard, setCheckerboard] = useState(true);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">(
    "idle",
  );
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  const copyUrl = async () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    try {
      await navigator.clipboard.writeText(exportUrl);
      setCopyState("copied");
      timeoutRef.current = window.setTimeout(() => setCopyState("idle"), 2_000);
    } catch {
      setCopyState("error");
      timeoutRef.current = window.setTimeout(() => setCopyState("idle"), 3_000);
    }
  };

  const formatLabel = settings.format.toUpperCase();

  return (
    <Card className="gap-0 py-0 lg:sticky lg:top-24">
      <div className="border-b px-4 py-3">
        <h2 className="text-sm font-semibold">Live preview</h2>
      </div>

      <div className="space-y-4 p-4">
        <div
          className={cn(
            "relative mx-auto flex max-w-full items-center justify-center overflow-hidden rounded-xl ring-1 ring-foreground/10",
            checkerboard ? "checkerboard" : "bg-muted/30",
          )}
          style={{
            aspectRatio: `${settings.width} / ${settings.height}`,
            width: `min(100%, ${(
              (26 * settings.width) /
              settings.height
            ).toFixed(3)}rem)`,
          }}
        >
          <PreviewImage
            key={previewUrl}
            src={previewUrl}
            alt={`${styleName} avatar for seed ${settings.seed}`}
          />
        </div>

        <p
          className="truncate text-xs text-muted-foreground"
          title={`${styleName} · ${settings.seed} · ${settings.width} × ${settings.height} · ${formatLabel}`}
        >
          {styleName} ·{" "}
          <span className="font-mono">{settings.seed || "eftsoons"}</span> ·{" "}
          <span className="font-mono">
            {settings.width} × {settings.height}
          </span>{" "}
          · {formatLabel}
        </p>

        {styleUnavailable ? (
          <p role="alert" className="text-xs text-destructive">
            This style is not available right now. Choose another style to
            download.
          </p>
        ) : null}

        <AvatarDownloadButton
          settings={settings}
          svgUrl={exportUrl}
          disabled={styleUnavailable}
        />

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={copyUrl}
            disabled={styleUnavailable}
          >
            {copyState === "copied" ? (
              <CheckIcon className="text-emerald-600 dark:text-emerald-400" />
            ) : (
              <CopyIcon />
            )}
            {copyState === "copied" ? "Copied" : "Copy URL"}
          </Button>
          {styleUnavailable ? (
            <Button type="button" variant="outline" size="icon" disabled>
              <ExternalLinkIcon />
              <span className="sr-only">Open in new tab</span>
            </Button>
          ) : (
            <Button asChild variant="outline" size="icon">
              <a
                href={exportUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Open avatar in a new tab"
                title="Open avatar in a new tab"
              >
                <ExternalLinkIcon />
              </a>
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <Label
            htmlFor="checkerboard-preview"
            className="text-xs text-muted-foreground"
          >
            Checkerboard
          </Label>
          <Switch
            id="checkerboard-preview"
            checked={checkerboard}
            onCheckedChange={setCheckerboard}
            size="sm"
          />
        </div>

        <span className="sr-only" role="status" aria-live="polite">
          {copyState === "copied"
            ? "Avatar URL copied to clipboard"
            : copyState === "error"
              ? "Could not copy the avatar URL"
              : ""}
        </span>
      </div>
    </Card>
  );
}
