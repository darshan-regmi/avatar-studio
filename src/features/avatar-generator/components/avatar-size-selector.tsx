"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  MAX_DIMENSION,
  MIN_DIMENSION,
  parseDimensionInput,
} from "@/features/avatar-generator/lib/avatar-validation";

const PRESET_SIZES = [64, 128, 256, 300, 512, 1024] as const;

interface DimensionFieldProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
}

function DimensionField({ id, label, value, onChange }: DimensionFieldProps) {
  const [text, setText] = useState(String(value));
  const [previousValue, setPreviousValue] = useState(value);

  // Keep the text field in sync when another control (square lock or presets)
  // changes the dimension, without an extra effect render.
  if (previousValue !== value) {
    setPreviousValue(value);
    setText(String(value));
  }

  const parsed = parseDimensionInput(text);
  const invalid = parsed === null;

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <Input
        id={id}
        type="number"
        inputMode="numeric"
        min={MIN_DIMENSION}
        max={MAX_DIMENSION}
        step={1}
        value={text}
        aria-invalid={invalid}
        aria-describedby={invalid ? `${id}-error` : undefined}
        onChange={(event) => {
          const next = event.target.value;
          setText(next);
          const dimension = parseDimensionInput(next);
          if (dimension !== null) onChange(dimension);
        }}
        onBlur={() => {
          setText(String(parsed ?? value));
        }}
      />
      {invalid ? (
        <p id={`${id}-error`} className="text-xs text-destructive">
          Use {MIN_DIMENSION}–{MAX_DIMENSION}px.
        </p>
      ) : null}
    </div>
  );
}

interface AvatarSizeSelectorProps {
  width: number;
  height: number;
  square: boolean;
  onWidthChange: (value: number) => void;
  onHeightChange: (value: number) => void;
  onSquareChange: (value: boolean) => void;
}

export function AvatarSizeSelector({
  width,
  height,
  square,
  onWidthChange,
  onHeightChange,
  onSquareChange,
}: AvatarSizeSelectorProps) {
  // Empty value shows the "Custom" placeholder whenever the dimensions
  // don't match a preset.
  const preset =
    width === height && (PRESET_SIZES as readonly number[]).includes(width)
      ? String(width)
      : "";

  return (
    <div className="space-y-2">
      <Label htmlFor="size-select">Size</Label>
      <Select
        value={preset}
        onValueChange={(value) => {
          const size = Number(value);
          onWidthChange(size);
          onHeightChange(size);
        }}
      >
        <SelectTrigger id="size-select" className="w-full">
          <SelectValue placeholder="Custom" />
        </SelectTrigger>
        <SelectContent>
          {PRESET_SIZES.map((size) => (
            <SelectItem key={size} value={String(size)}>
              {size} × {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="grid grid-cols-2 gap-2">
        <DimensionField
          id="avatar-width"
          label="Width (px)"
          value={width}
          onChange={onWidthChange}
        />
        <DimensionField
          id="avatar-height"
          label="Height (px)"
          value={height}
          onChange={onHeightChange}
        />
      </div>

      <div className="flex items-center justify-between gap-2">
        <Label
          htmlFor="square-dimensions"
          className="text-xs text-muted-foreground"
        >
          Square
        </Label>
        <Switch
          id="square-dimensions"
          checked={square}
          onCheckedChange={onSquareChange}
          size="sm"
        />
      </div>
    </div>
  );
}
