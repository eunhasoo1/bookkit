import clsx from "clsx";
import { BookColor } from "@/types";

interface ColorSwatchProps {
  color: BookColor;
  onCopy: (hex: string) => void;
  onDelete?: (id: string) => void;
  isActive?: boolean;
}

export function ColorSwatch({
  color,
  onCopy,
  onDelete,
  isActive = false,
}: ColorSwatchProps) {
  return (
    <button
      type="button"
      onClick={() => onCopy(color.hex_code)}
      className={clsx(
        "group relative flex h-10 w-10 items-center justify-center rounded-full border border-white shadow-sm transition",
        isActive && "ring-2 ring-stone-900 ring-offset-2"
      )}
      style={{ backgroundColor: color.hex_code }}
      title={color.name ?? color.hex_code}
    >
      {onDelete ? (
        <span
          onClick={(event) => {
            event.stopPropagation();
            onDelete(color.id);
          }}
          className="absolute -right-1 -top-1 hidden h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-semibold text-stone-500 shadow group-hover:flex"
        >
          ×
        </span>
      ) : null}
    </button>
  );
}
