"use client";

import { useState, useEffect, useRef } from "react";
import { BookStatus } from "@/types";
import { searchBooksAction, getBookDetailsAction, GoogleBook } from "@/lib/actions";
import { Loader2, Book as BookIcon } from "lucide-react";

interface BookFormProps {
  onSubmit: (values: {
    title: string;
    author: string;
    status: BookStatus;
    rating: number | null;
    cover_url?: string | null;
  }) => Promise<void> | void;
  onCancel: () => void;
}

const STATUS_OPTIONS: { value: BookStatus; label: string }[] = [
  { value: "to_read", label: "To read" },
  { value: "reading", label: "Reading" },
  { value: "completed", label: "Completed" },
  { value: "dropped", label: "Dropped" },
];

export function BookForm({ onSubmit, onCancel }: BookFormProps) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [status, setStatus] = useState<BookStatus>("to_read");
  const [rating, setRating] = useState<number | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);

  // Autocomplete state
  const [suggestions, setSuggestions] = useState<GoogleBook[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (title.trim() && showSuggestions) {
        setIsSearching(true);
        const results = await searchBooksAction(title);
        setSuggestions(results);
        setIsSearching(false);
      } else {
        setSuggestions([]);
      }
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [title, showSuggestions]);

  // Handle click outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectBook = async (book: GoogleBook) => {
    setTitle(book.title);
    setAuthor(book.authors.join(", "));
    setCoverUrl(book.thumbnail); // Set thumbnail first for immediate feedback
    setShowSuggestions(false);
    setSuggestions([]);

    // Fetch high-res cover
    setIsLoadingDetails(true);
    const highResUrl = await getBookDetailsAction(book.id);
    if (highResUrl) {
      setCoverUrl(highResUrl);
    }
    setIsLoadingDetails(false);
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!title.trim()) return;
        onSubmit({ title, author, status, rating, cover_url: coverUrl });
        setTitle("");
        setAuthor("");
        setStatus("to_read");
        setRating(null);
        setCoverUrl(null);
      }}
      className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
    >
      <div className="grid gap-4 md:grid-cols-[100px_1fr] md:gap-6">
        {/* Cover Preview */}
        <div className="relative flex aspect-2/3 w-full items-center justify-center overflow-hidden rounded-lg border border-stone-100 bg-stone-50 md:w-[100px]">
          {isLoadingDetails && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm">
              <Loader2 className="h-5 w-5 animate-spin text-stone-500" />
            </div>
          )}
          {coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverUrl}
              alt="Cover"
              className="h-full w-full object-cover"
            />
          ) : (
            <BookIcon className="h-8 w-8 text-stone-300" />
          )}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {/* Title Input with Autocomplete */}
          <div ref={wrapperRef} className="relative">
            <label className="flex flex-col gap-1 text-sm font-medium text-stone-700">
              Title
              <div className="relative">
                <input
                  value={title}
                  onChange={(event) => {
                    setTitle(event.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm text-stone-900 focus:border-stone-400 focus:outline-none"
                  placeholder="Search by title"
                  autoComplete="off"
                />
                {isSearching && (
                  <div className="absolute right-3 top-2.5">
                    <Loader2 className="h-4 w-4 animate-spin text-stone-400" />
                  </div>
                )}
              </div>
            </label>
            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full z-10 mt-1 w-full overflow-hidden rounded-xl border border-stone-200 bg-white shadow-lg">
                <ul className="max-h-60 overflow-auto py-1">
                  {suggestions.map((book) => (
                    <li key={book.id}>
                      <button
                        type="button"
                        onClick={() => handleSelectBook(book)}
                        className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-stone-50"
                      >
                        <div className="h-10 w-8 shrink-0 overflow-hidden rounded bg-stone-100">
                          {book.thumbnail ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={book.thumbnail}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <BookIcon className="h-4 w-4 text-stone-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-stone-900 line-clamp-1">
                            {book.title}
                          </span>
                          <span className="text-xs text-stone-500 line-clamp-1">
                            {book.authors.join(", ")}
                          </span>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <label className="flex flex-col gap-1 text-sm font-medium text-stone-700">
            Author
            <input
              value={author}
              onChange={(event) => setAuthor(event.target.value)}
              className="rounded-xl border border-stone-200 px-3 py-2 text-sm text-stone-900 focus:border-stone-400 focus:outline-none"
              placeholder="Author name"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-stone-700">
            Status
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as BookStatus)}
              className="rounded-xl border border-stone-200 px-3 py-2 text-sm text-stone-900 focus:border-stone-400 focus:outline-none"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-stone-700">
            Rating
            <select
              value={rating ?? ""}
              onChange={(event) =>
                setRating(
                  event.target.value ? Number(event.target.value) : null
                )
              }
              className="rounded-xl border border-stone-200 px-3 py-2 text-sm text-stone-900 focus:border-stone-400 focus:outline-none"
            >
              <option value="">Not set</option>
              {[1, 2, 3, 4, 5].map((value) => (
                <option key={value} value={value}>
                  {value} star{value > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-stone-200 px-4 py-2 text-sm font-medium text-stone-600 hover:border-stone-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"
        >
          Save
        </button>
      </div>
    </form>
  );
}
