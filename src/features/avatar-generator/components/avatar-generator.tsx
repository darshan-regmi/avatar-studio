"use client";

import { RotateCcwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AvatarCustomization } from "@/features/avatar-generator/components/avatar-customization";
import { AvatarFormatSelector } from "@/features/avatar-generator/components/avatar-format-selector";
import { AvatarPreview } from "@/features/avatar-generator/components/avatar-preview";
import { AvatarSeedInput } from "@/features/avatar-generator/components/avatar-seed-input";
import { AvatarSizeSelector } from "@/features/avatar-generator/components/avatar-size-selector";
import { AvatarStylePicker } from "@/features/avatar-generator/components/avatar-style-picker";
import { useAvatarGenerator } from "@/features/avatar-generator/hooks/use-avatar-generator";

export function AvatarGenerator() {
  const generator = useAvatarGenerator();
  const { settings } = generator;

  return (
    <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-6">
      <Card className="order-2 min-w-0 gap-0 py-0 lg:order-1">
        <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
          <h2 className="text-sm font-semibold">Customize</h2>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={generator.resetSettings}
            title="Reset all settings to defaults"
          >
            <RotateCcwIcon />
            Reset
          </Button>
        </div>

        <div className="space-y-4 p-4">
          <AvatarStylePicker
            selectedStyle={generator.style}
            selectedAvailable={!generator.styleUnavailable}
            styles={generator.catalog.styles}
            loading={generator.catalog.loading}
            error={generator.catalog.error}
            onRetry={generator.retryCatalog}
            onSelect={generator.selectStyle}
          />

          <AvatarSeedInput
            seed={settings.seed}
            onChange={(seed) => generator.updateSettings({ seed })}
            onRandomize={generator.randomizeSeed}
          />

          <AvatarSizeSelector
            width={settings.width}
            height={settings.height}
            square={settings.square}
            onWidthChange={generator.changeWidth}
            onHeightChange={generator.changeHeight}
            onSquareChange={generator.changeSquare}
          />

          <AvatarFormatSelector
            format={settings.format}
            onChange={(format) => generator.updateSettings({ format })}
          />

          <AvatarCustomization
            settings={settings}
            onChange={generator.updateSettings}
            styleOptions={generator.options.options}
            optionsLoading={generator.options.loading}
            optionsError={generator.options.error}
            onRetryOptions={generator.retryOptions}
            onStyleOptionChange={generator.setStyleOption}
          />
        </div>
      </Card>

      <div className="order-1 min-w-0 lg:order-2">
        <AvatarPreview
          settings={settings}
          previewUrl={generator.previewUrl}
          exportUrl={generator.exportUrl}
          styleName={generator.style.name}
          styleUnavailable={generator.styleUnavailable}
        />
      </div>
    </div>
  );
}
