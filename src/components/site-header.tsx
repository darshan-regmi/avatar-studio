import { ExternalLinkIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { DICEBEAR_WEBSITE_URL } from "@/features/avatar-generator/lib/dicebear-api";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="min-w-0">
          <p className="text-base font-semibold tracking-tight">Avatar Studio</p>
          <p className="truncate text-xs text-muted-foreground">
            Create your avatar. Make it yours.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button asChild variant="ghost" size="sm">
            <a
              href={DICEBEAR_WEBSITE_URL}
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground"
            >
              <span className="hidden sm:inline">DiceBear</span>
              <ExternalLinkIcon aria-hidden="true" />
              <span className="sr-only">Open the DiceBear website</span>
            </a>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
