"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { CharacterCard } from "@/components/character/CharacterCard";
import { ColorPalette } from "@/components/palette/ColorPalette";
import { useBook } from "@/hooks/useBooks";
import { useCharacters } from "@/hooks/useCharacters";
import { usePalette } from "@/hooks/usePalette";
import { BookStatus } from "@/types";
import { STATUS_COLORS } from "@/lib/utils/colors";

const STATUS_OPTIONS: { value: BookStatus; label: string }[] = [
  { value: "to_read", label: "To read" },
  { value: "reading", label: "Reading" },
  { value: "completed", label: "Completed" },
  { value: "dropped", label: "Dropped" },
];

export default function BookDetailPage() {
  const params = useParams<{ bookId: string }>();
  const bookId = params?.bookId;
  const { book, loading, error, updateBook } = useBook(bookId);
  const { colors, addColor, deleteColor, updateColorName } = usePalette(bookId);
  const { characters, createCharacter } = useCharacters(bookId);
  const [characterName, setCharacterName] = useState("");

  const rating = book?.rating ?? 0;

  const statusLabel = useMemo(() => {
    if (!book) return "";
    return book.status.replace("_", " ");
  }, [book]);

  return (
    <div className="min-h-screen bg-stone-50 px-6 py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <Link href="/books" className="text-sm font-medium text-stone-500">
          ← Back to books
        </Link>

        {loading ? (
          <p className="text-sm text-stone-400">Loading book...</p>
        ) : error ? (
          <p className="text-sm text-rose-500">{error}</p>
        ) : !book ? (
          <p className="text-sm text-stone-400">Book not found.</p>
        ) : (
          <>
            <section className="flex flex-col gap-6 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm md:flex-row md:items-center">
              <div className="relative h-40 w-28 overflow-hidden rounded-2xl border border-stone-200 bg-stone-100">
                {book.cover_url ? (
                  <Image
                    src={book.cover_url}
                    alt={book.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-stone-400">
                    Book cover
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-4">
                <div>
                  <h1 className="text-2xl font-semibold text-stone-900">
                    {book.title}
                  </h1>
                  <p className="text-sm text-stone-500">
                    {book.author || "Unknown author"}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLORS[book.status]}`}
                  >
                    {statusLabel}
                  </span>
                  <select
                    value={book.status}
                    onChange={(event) =>
                      updateBook({ status: event.target.value as BookStatus })
                    }
                    className="rounded-full border border-stone-200 px-3 py-1 text-xs font-semibold text-stone-600"
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, index) => {
                    const starValue = index + 1;
                    return (
                      <button
                        key={starValue}
                        type="button"
                        onClick={() => updateBook({ rating: starValue })}
                        className={`text-lg ${
                          starValue <= rating
                            ? "text-amber-400"
                            : "text-stone-300"
                        }`}
                      >
                        ★
                      </button>
                    );
                  })}
                  <span className="ml-2 text-xs text-stone-400">
                    {rating}/5
                  </span>
                </div>
              </div>
            </section>

            <ColorPalette
              colors={colors}
              extractedColors={book.extracted_palette}
              onAdd={async (hex, name) => {
                await addColor(hex, name);
                toast.success("Color added");
              }}
              onDelete={async (id) => {
                await deleteColor(id);
                toast.message("Color removed");
              }}
              onUpdateName={async (id, name) => {
                await updateColorName(id, name);
                toast.success("Color updated");
              }}
            />

            <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-stone-900">
                  Characters
                </h3>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {characters.length === 0 ? (
                  <p className="text-sm text-stone-400">
                    Add your first character to start tracking.
                  </p>
                ) : (
                  characters.map((character) => (
                    <CharacterCard key={character.id} character={character} />
                  ))
                )}
              </div>
              <div className="mt-4 flex flex-col gap-2 md:flex-row">
                <input
                  value={characterName}
                  onChange={(event) => setCharacterName(event.target.value)}
                  placeholder="Character name"
                  className="flex-1 rounded-xl border border-stone-200 px-3 py-2 text-sm text-stone-900 focus:border-stone-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={async () => {
                    if (!characterName.trim()) return;
                    await createCharacter(characterName.trim());
                    setCharacterName("");
                    toast.success("Character added");
                  }}
                  className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"
                >
                  Add character
                </button>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
