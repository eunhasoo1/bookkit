"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { BookCard } from "@/components/book/BookCard";
import { BookForm } from "@/components/book/BookForm";
import { useBooks } from "@/hooks/useBooks";
import { BookStatus } from "@/types";

const FILTERS: { label: string; value: BookStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "To read", value: "to_read" },
  { label: "Reading", value: "reading" },
  { label: "Completed", value: "completed" },
  { label: "Dropped", value: "dropped" },
];

export default function BooksPage() {
  const router = useRouter();
  const supabase = createClient();
  const { books, loading, error, createBook } = useBooks();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<BookStatus | "all">("all");
  const [showForm, setShowForm] = useState(false);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
      return;
    }
    router.refresh();
    router.push("/login");
  };

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchesQuery =
        book.title.toLowerCase().includes(query.toLowerCase()) ||
        (book.author ?? "").toLowerCase().includes(query.toLowerCase());
      const matchesStatus = filter === "all" || book.status === filter;
      return matchesQuery && matchesStatus;
    });
  }, [books, filter, query]);

  return (
    <div className="min-h-screen bg-stone-50 px-6 py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-stone-400">BookKit</p>
            <h1 className="text-2xl font-semibold text-stone-900">
              Your reading kit
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
            >
              Sign out
            </button>
            <button
              type="button"
              onClick={() => setShowForm((prev) => !prev)}
              className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"
            >
              {showForm ? "Close" : "Add book"}
            </button>
          </div>
        </header>

        {showForm ? (
          <BookForm
            onSubmit={async (values) => {
              await createBook(values);
              setShowForm(false);
            }}
            onCancel={() => setShowForm(false)}
          />
        ) : null}

        <div className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((filterOption) => (
                <button
                  key={filterOption.value}
                  type="button"
                  onClick={() => setFilter(filterOption.value)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    filter === filterOption.value
                      ? "bg-stone-900 text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  {filterOption.label}
                </button>
              ))}
            </div>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by title or author"
              className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm text-stone-900 focus:border-stone-400 focus:outline-none md:max-w-xs"
            />
          </div>

          {loading ? (
            <p className="text-sm text-stone-400">Loading books...</p>
          ) : error ? (
            <p className="text-sm text-rose-500">{error}</p>
          ) : filteredBooks.length === 0 ? (
            <p className="text-sm text-stone-400">
              No books yet. Add your first book to get started.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onClick={() => router.push(`/books/${book.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
