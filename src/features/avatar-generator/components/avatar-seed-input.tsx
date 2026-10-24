"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon, CopyIcon, ShuffleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MAX_SEED_LENGTH } from "@/features/avatar-generator/lib/avatar-validation";

interface AvatarSeedInputProps {
  seed: string;
  onChange: (seed: string) => void;
  onRandomize: () => void;
}

export function AvatarSeedInput({
  seed,
  onChange,
  onRandomize,
}: AvatarSeedInputProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  const copySeed = async () => {
    try {
      await navigator.clipboard.writeText(seed);
      setCopied(true);
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => setCopied(false), 1_600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="space-y-2">
      <label htmlFor="avatar-seed" className="text-sm font-medium">
        Name or seed
      </label>
      <div className="flex gap-2">
        <Input
          id="avatar-seed"
          value={seed}
          onChange={(event) => onChange(event.target.value)}
          placeholder="eftsoons"
          maxLength={MAX_SEED_LENGTH}
          autoComplete="off"
          spellCheck={false}
          className="min-w-0 flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onRandomize}
          aria-label="Randomize seed"
          title="Randomize seed"
        >
          <ShuffleIcon />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={copySeed}
          aria-label={copied ? "Seed copied" : "Copy seed"}
          title="Copy seed"
          disabled={seed.length === 0}
        >
          {copied ? (
            <CheckIcon className="text-emerald-600 dark:text-emerald-400" />
          ) : (
            <CopyIcon />
          )}
        </Button>
      </div>
      <span className="sr-only" role="status" aria-live="polite">
        {copied ? "Seed copied to clipboard" : ""}
      </span>
    </div>
  );
}
