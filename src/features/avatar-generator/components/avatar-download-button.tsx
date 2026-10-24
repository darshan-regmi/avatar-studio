"use client";

import { useEffect, useRef, useState } from "react";
import { DownloadIcon, Loader2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { downloadAvatar } from "@/features/avatar-generator/lib/avatar-export";
import {
  avatarSettingsSchema,
  getDownloadDescriptor,
} from "@/features/avatar-generator/lib/avatar-validation";
import type { AvatarSettings } from "@/features/avatar-generator/types/avatar";

type DownloadStatus = "idle" | "working" | "success" | "error";

interface AvatarDownloadButtonProps {
  settings: AvatarSettings;
  svgUrl: string;
  disabled?: boolean;
}

export function AvatarDownloadButton({
  settings,
  svgUrl,
  disabled = false,
}: AvatarDownloadButtonProps) {
  const [status, setStatus] = useState<DownloadStatus>("idle");
  const [message, setMessage] = useState("");
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleDownload = async () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    setStatus("working");
    setMessage("");

    try {
      const valid = avatarSettingsSchema.safeParse(settings);
      if (!valid.success) {
        throw new Error("Some settings are invalid. Check the dimensions.");
      }

      const descriptor = getDownloadDescriptor(settings);
      await downloadAvatar({
        svgUrl,
        width: settings.width,
        height: settings.height,
        format: settings.format,
        filename: descriptor.filename,
        background:
          settings.backgroundMode === "custom"
            ? settings.backgroundColor
            : settings.format === "jpeg"
              ? "#ffffff"
              : undefined,
      });

      setStatus("success");
      setMessage(`Downloaded ${descriptor.filename}`);
      timeoutRef.current = window.setTimeout(() => setStatus("idle"), 4_000);
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "The avatar could not be downloaded.",
      );
    }
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        size="lg"
        className="h-10 w-full"
        onClick={handleDownload}
        disabled={disabled || status === "working"}
      >
        {status === "working" ? (
          <>
            <Loader2Icon className="animate-spin" aria-hidden="true" />
            Preparing download…
          </>
        ) : (
          <>
            <DownloadIcon aria-hidden="true" />
            Download {settings.format.toUpperCase()}
          </>
        )}
      </Button>
      <p
        role={status === "error" ? "alert" : "status"}
        aria-live="polite"
        className={
          status === "error"
            ? "text-xs text-destructive"
            : "text-xs text-muted-foreground"
        }
      >
        {message}
      </p>
    </div>
  );
}
