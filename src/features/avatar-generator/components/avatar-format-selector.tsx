"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AVATAR_FORMATS } from "@/features/avatar-generator/types/avatar";
import type { AvatarFormat } from "@/features/avatar-generator/types/avatar";
import { FORMAT_LABELS } from "@/features/avatar-generator/lib/avatar-validation";

interface AvatarFormatSelectorProps {
  format: AvatarFormat;
  onChange: (format: AvatarFormat) => void;
}

export function AvatarFormatSelector({
  format,
  onChange,
}: AvatarFormatSelectorProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Label htmlFor="format-select">Format</Label>
      <Select
        value={format}
        onValueChange={(value) => onChange(value as AvatarFormat)}
      >
        <SelectTrigger id="format-select" className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end">
          {AVATAR_FORMATS.map((value) => (
            <SelectItem key={value} value={value}>
              {FORMAT_LABELS[value]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
