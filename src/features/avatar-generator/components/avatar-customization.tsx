"use client";

import { ChevronDownIcon, RotateCcwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  AvatarSettings,
  BackgroundMode,
  StyleOptionDefinition,
} from "@/features/avatar-generator/types/avatar";

const BACKGROUND_MODES: { value: BackgroundMode; label: string }[] = [
  { value: "default", label: "Default" },
  { value: "transparent", label: "Transparent" },
  { value: "custom", label: "Custom" },
];

function humanizeValue(value: string): string {
  return value
    .replace(/[-_]/g, " ")
    .replace(/^./, (char) => char.toUpperCase());
}

interface AvatarCustomizationProps {
  settings: AvatarSettings;
  onChange: (patch: Partial<AvatarSettings>) => void;
  styleOptions: StyleOptionDefinition[];
  optionsLoading: boolean;
  optionsError: string | null;
  onRetryOptions: () => void;
  onStyleOptionChange: (name: string, value: string) => void;
}

export function AvatarCustomization({
  settings,
  onChange,
  styleOptions,
  optionsLoading,
  optionsError,
  onRetryOptions,
  onStyleOptionChange,
}: AvatarCustomizationProps) {
  const selectedOptionCount = Object.keys(settings.styleOptions).length;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="background-select">Background</Label>
          <Select
            value={settings.backgroundMode}
            onValueChange={(value) =>
              onChange({ backgroundMode: value as BackgroundMode })
            }
          >
            <SelectTrigger id="background-select" className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {BACKGROUND_MODES.map((mode) => (
                <SelectItem key={mode.value} value={mode.value}>
                  {mode.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {settings.backgroundMode === "custom" ? (
          <div className="flex items-center gap-2">
            <input
              id="background-color"
              type="color"
              value={settings.backgroundColor}
              onChange={(event) =>
                onChange({ backgroundColor: event.target.value })
              }
              className="size-7 cursor-pointer rounded-md border border-input bg-transparent p-0.5"
              aria-label="Custom background color"
            />
            <span className="font-mono text-xs text-muted-foreground">
              {settings.backgroundColor}
            </span>
          </div>
        ) : null}

        {settings.backgroundMode === "transparent" &&
        settings.format === "jpeg" ? (
          <p className="text-xs text-muted-foreground">
            JPEG cannot store transparency. Transparent areas will be white.
          </p>
        ) : null}
      </div>

      <details className="group rounded-lg border bg-muted/20">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm font-medium outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-2">
            Style options
            {selectedOptionCount > 0 ? (
              <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                {selectedOptionCount} set
              </span>
            ) : null}
          </span>
          <ChevronDownIcon
            className="size-4 text-muted-foreground transition-transform group-open:rotate-180"
            aria-hidden="true"
          />
        </summary>

        <div className="border-t p-3">
          {optionsLoading ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="space-y-1.5">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ))}
            </div>
          ) : optionsError ? (
            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>{optionsError}</span>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={onRetryOptions}
              >
                Retry
              </Button>
            </div>
          ) : styleOptions.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              This style has no extra appearance options.
            </p>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                {styleOptions.map((option) => (
                  <div key={option.name} className="space-y-1.5">
                    <Label
                      htmlFor={`option-${option.name}`}
                      className="text-xs text-muted-foreground"
                    >
                      {option.label}
                    </Label>
                    <Select
                      value={settings.styleOptions[option.name] ?? "__random"}
                      onValueChange={(value) =>
                        onStyleOptionChange(
                          option.name,
                          value === "__random" ? "" : value,
                        )
                      }
                    >
                      <SelectTrigger
                        id={`option-${option.name}`}
                        className="w-full"
                        aria-label={option.label}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__random">Random</SelectItem>
                        {option.values.map((value) => (
                          <SelectItem key={value} value={value}>
                            {humanizeValue(value)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
              {selectedOptionCount > 0 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  className="mt-2 text-muted-foreground"
                  onClick={() => {
                    for (const name of Object.keys(settings.styleOptions)) {
                      onStyleOptionChange(name, "");
                    }
                  }}
                >
                  <RotateCcwIcon />
                  Reset style options
                </Button>
              ) : null}
            </>
          )}
        </div>
      </details>
    </div>
  );
}
