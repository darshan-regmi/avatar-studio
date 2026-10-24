"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CheckIcon, ChevronDownIcon, SearchIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CATEGORY_LABELS,
  STYLE_CATEGORIES,
} from "@/data/avatar-styles";
import {
  buildStyleThumbnailUrl,
} from "@/features/avatar-generator/lib/dicebear-api";
import type { AvatarStyleDefinition } from "@/features/avatar-generator/types/avatar";
import { cn } from "@/lib/utils";

function StyleThumb({
  style,
  size = 72,
  eager = false,
  className,
}: {
  style: AvatarStyleDefinition;
  size?: number;
  eager?: boolean;
  className?: string;
}) {
  const [shouldLoad, setShouldLoad] = useState(eager);
  const containerRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (shouldLoad) return;
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "120px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [shouldLoad]);

  return (
    <span
      ref={containerRef}
      aria-hidden="true"
      className={cn(
        "relative block shrink-0 overflow-hidden rounded-md bg-muted/40",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {shouldLoad ? (
        // eslint-disable-next-line @next/next/no-img-element -- remote SVG thumbnails cannot use the image optimizer
        <img
          src={buildStyleThumbnailUrl(style.id, size * 2)}
          alt=""
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      ) : null}
    </span>
  );
}

interface AvatarStylePickerProps {
  selectedStyle: AvatarStyleDefinition;
  selectedAvailable: boolean;
  styles: AvatarStyleDefinition[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onSelect: (styleId: string) => void;
}

export function AvatarStylePicker({
  selectedStyle,
  selectedAvailable,
  styles,
  loading,
  error,
  onRetry,
  onSelect,
}: AvatarStylePickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return styles;
    return styles.filter((style) =>
      [style.name, style.id, CATEGORY_LABELS[style.category]]
        .join(" ")
        .toLowerCase()
        .includes(search),
    );
  }, [query, styles]);

  const handleSelect = (styleId: string) => {
    onSelect(styleId);
    setOpen(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span id="style-picker-label" className="text-sm font-medium">
          Avatar style
        </span>
        <span className="text-xs text-muted-foreground">
          {styles.length} styles
        </span>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            id="style-picker-trigger"
            type="button"
            variant="outline"
            className="h-auto w-full justify-start gap-3 px-2.5 py-2.5 text-left dark:bg-input/30"
            aria-haspopup="dialog"
            aria-label={`Avatar style: ${selectedStyle.name}. Change style.`}
          >
            <StyleThumb style={selectedStyle} size={40} eager />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">
                {selectedStyle.name}
              </span>
              <span className="block text-xs font-normal text-muted-foreground">
                {CATEGORY_LABELS[selectedStyle.category]}
              </span>
            </span>
            <ChevronDownIcon
              className="size-4 text-muted-foreground"
              aria-hidden="true"
            />
          </Button>
        </DialogTrigger>

        <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
          <DialogHeader className="gap-1 border-b px-5 py-4 pr-12">
            <DialogTitle>Choose an avatar style</DialogTitle>
            <DialogDescription>
              Every public DiceBear style, with live thumbnails.
            </DialogDescription>
          </DialogHeader>

          <div className="border-b p-3">
            <div className="relative">
              <SearchIcon
                className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search styles…"
                aria-label="Search avatar styles"
                className="pl-8"
                autoFocus
              />
            </div>
            {error ? (
              <div
                role="status"
                className="mt-2 flex items-center justify-between gap-2 rounded-md bg-muted/60 px-2.5 py-1.5 text-xs text-muted-foreground"
              >
                <span>{error}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={onRetry}
                >
                  Retry
                </Button>
              </div>
            ) : null}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
            {loading && styles.length === 0 ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center gap-2 rounded-lg border p-2"
                  >
                    <Skeleton className="size-[72px] rounded-md" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No styles match “{query.trim()}”.
              </p>
            ) : (
              <div className="space-y-5">
                {STYLE_CATEGORIES.map((category) => {
                  const items = filtered.filter(
                    (style) => style.category === category.id,
                  );
                  if (items.length === 0) return null;
                  return (
                    <section key={category.id} aria-labelledby={`cat-${category.id}`}>
                      <div className="mb-2 flex items-baseline gap-2">
                        <h3
                          id={`cat-${category.id}`}
                          className="text-xs font-medium tracking-wide text-muted-foreground uppercase"
                        >
                          {category.label}
                        </h3>
                        <span className="text-xs text-muted-foreground/70">
                          {category.description}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {items.map((style) => {
                          const selected = style.id === selectedStyle.id;
                          return (
                            <button
                              key={style.id}
                              type="button"
                              onClick={() => handleSelect(style.id)}
                              aria-pressed={selected}
                              className={cn(
                                "group relative flex flex-col items-center gap-2 rounded-lg border bg-card/40 p-2 text-center transition-colors outline-none hover:bg-muted/60 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                                selected
                                  ? "border-primary/60 bg-primary/5 ring-1 ring-primary/30"
                                  : "border-border",
                              )}
                            >
                              <StyleThumb style={style} />
                              <span className="line-clamp-2 text-xs leading-tight font-medium">
                                {style.name}
                              </span>
                              {selected ? (
                                <span className="absolute top-1 right-1 rounded-full bg-primary p-0.5 text-primary-foreground">
                                  <CheckIcon className="size-2.5" />
                                  <span className="sr-only">Selected</span>
                                </span>
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 border-t px-4 py-2.5 text-xs text-muted-foreground">
            <span>
              Source: DiceBear HTTP API · v10.x
            </span>
            {loading ? <Badge variant="secondary">Refreshing…</Badge> : null}
          </div>
        </DialogContent>
      </Dialog>

      {!selectedAvailable ? (
        <p role="alert" className="text-xs text-destructive">
          This style is not in the current DiceBear catalog. Choose another
          style.
        </p>
      ) : null}
    </div>
  );
}
