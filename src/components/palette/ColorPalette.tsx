"use client";

import { useState } from "react";
import { toast } from "sonner";
import { BookColor } from "@/types";
import { DEFAULT_BOOK_COLORS } from "@/lib/utils/colors";
import { ColorSwatch } from "./ColorSwatch";
import { Plus } from "lucide-react";

interface ColorPaletteProps {
  colors: BookColor[];
  extractedColors?: string[];
  onAdd: (hex: string, name?: string) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
  onUpdateName: (id: string, name: string) => Promise<void> | void;
}

export function ColorPalette({
  colors,
  extractedColors = [],
  onAdd,
  onDelete,
  onUpdateName,
}: ColorPaletteProps) {
  const [hexInput, setHexInput] = useState("");
  const [nameInput, setNameInput] = useState("");

  const suggestions = [
    ...DEFAULT_BOOK_COLORS,
    ...extractedColors.filter((hex) => !DEFAULT_BOOK_COLORS.includes(hex)),
  ].filter((hex) => !colors.some((savedColor) => savedColor.hex_code === hex));

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-stone-900">
          Color Palette
        </h3>
        <span className="text-xs text-stone-400">click to copy</span>
      </div>

      {/* Saved Colors (Top Row) */}
      <div className="mt-4 flex flex-col gap-3">
        {colors.length === 0 ? (
          <div className="text-sm text-stone-400">
            No colors yet. Add a swatch below or tap a quick pick.
          </div>
        ) : (
          colors.map((color) => (
            <div key={color.id} className="flex items-center gap-3">
              <ColorSwatch
                color={color}
                onCopy={(hex) => {
                  navigator.clipboard.writeText(hex);
                  toast.success(`Copied ${hex}`);
                }}
                onDelete={onDelete}
              />
              <input
                defaultValue={color.name || ""}
                placeholder="Label..."
                onBlur={(e) => {
                  if (e.target.value !== color.name) {
                    onUpdateName(color.id, e.target.value);
                  }
                }}
                className="flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm text-stone-600 hover:border-stone-200 focus:border-stone-400 focus:outline-none"
              />
            </div>
          ))
        )}
      </div>

      {/* Suggestions (Bottom Row) */}
      <div className="mt-6">
        <p className="mb-2 text-xs font-medium text-stone-500">Quick Add</p>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((hex) => (
            <button
              key={hex}
              type="button"
              onClick={() => onAdd(hex)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white shadow-sm transition hover:scale-110"
              style={{ backgroundColor: hex }}
              title={`Add ${hex}`}
            >
              <Plus className="h-4 w-4 text-white/70" />
            </button>
          ))}
        </div>
      </div>

      {/* Manual Add */}
      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
        <input
          value={hexInput}
          onChange={(event) => setHexInput(event.target.value)}
          placeholder="#C8E7FF"
          className="rounded-xl border border-stone-200 px-3 py-2 text-sm text-stone-900 focus:border-stone-400 focus:outline-none"
        />
        <input
          value={nameInput}
          onChange={(event) => setNameInput(event.target.value)}
          placeholder="Name (optional)"
          className="rounded-xl border border-stone-200 px-3 py-2 text-sm text-stone-900 focus:border-stone-400 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => {
            if (!hexInput.trim()) return;
            onAdd(hexInput.trim(), nameInput.trim() || undefined);
            setHexInput("");
            setNameInput("");
          }}
          className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"
        >
          Add
        </button>
      </div>
    </div>
  );
}
