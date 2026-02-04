import Image from "next/image";
import clsx from "clsx";
import { Book } from "@/types";
import { STATUS_COLORS } from "@/lib/utils/colors";

interface BookCardProps {
  book: Book;
  onClick: () => void;
}

const MAX_STARS = 5;

export function BookCard({ book, onClick }: BookCardProps) {
  const rating = book.rating ?? 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white text-left shadow-sm transition hover:scale-[1.01] hover:shadow-md"
    >
      <div className="relative aspect-[2/3] w-full bg-stone-100">
        {book.cover_url ? (
          <Image
            src={book.cover_url}
            alt={book.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-stone-400">
            No cover
          </div>
        )}
        <span
          className={clsx(
            "absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold",
            STATUS_COLORS[book.status]
          )}
        >
          {book.status.replace("_", " ")}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div>
          <h3 className="text-base font-semibold text-stone-900">
            {book.title}
          </h3>
          <p className="text-sm text-stone-500">
            {book.author || "Unknown author"}
          </p>
        </div>
        <div className="mt-auto flex items-center gap-1">
          {Array.from({ length: MAX_STARS }).map((_, index) => (
            <span
              key={index}
              className={clsx(
                "text-sm",
                index < rating ? "text-amber-400" : "text-stone-300"
              )}
            >
              ★
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}
