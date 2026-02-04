import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Book, BookStatus } from "@/types";
import { extractCoverPaletteAction } from "@/lib/actions";

interface CreateBookInput {
  title: string;
  author?: string;
  status?: BookStatus;
  rating?: number | null;
  cover_url?: string | null;
}

export function useBooks() {
  const supabase = useMemo(() => createClient(), []);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("books")
      .select("*")
      .order("updated_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setBooks([]);
    } else {
      setBooks((data ?? []) as Book[]);
    }

    setLoading(false);
  }, [supabase]);

  const createBook = useCallback(
    async (input: CreateBookInput) => {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError || !userData.user) {
        setError(userError?.message ?? "Please sign in to add a book.");
        return null;
      }

      const payload = {
        user_id: userData.user.id,
        title: input.title.trim(),
        author: input.author?.trim() || null,
        status: input.status ?? "to_read",
        rating: input.rating ?? null,
        cover_url: input.cover_url ?? null,
      };

      const { data, error: insertError } = await supabase
        .from("books")
        .insert(payload)
        .select("*")
        .single();

      if (insertError) {
        setError(insertError.message);
        return null;
      }

      if (data) {
        setBooks((prev) => [data as Book, ...prev]);
      }

      if (data?.cover_url) {
        console.log("Book created with cover, attempting palette extraction...");
        try {
          console.log("Calling extractCoverPaletteAction...");
          const palette = await extractCoverPaletteAction(data.cover_url);
          console.log("Extracted palette:", palette);

          if (palette.length > 0) {
            // Save to extracted_palette column instead of book_colors
            const { error: updateError } = await supabase
              .from("books")
              .update({ extracted_palette: palette })
              .eq("id", data.id);

            if (updateError) {
              console.error("Failed to save extracted palette:", updateError);
            } else {
              console.log("Extracted palette saved to book record");
            }
          } else {
            console.log("No colors extracted from palette");
          }
        } catch (paletteError) {
          console.error("Failed to extract palette:", paletteError);
        }
      } else {
        console.log("Book created without cover_url, skipping palette extraction");
      }

      return data as Book;
    },
    [supabase]
  );

  const updateBook = useCallback(
    async (bookId: string, updates: Partial<Book>) => {
      const { data, error: updateError } = await supabase
        .from("books")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", bookId)
        .select("*")
        .single();

      if (updateError) {
        setError(updateError.message);
        return null;
      }

      if (data) {
        setBooks((prev) =>
          prev.map((book) => (book.id === bookId ? (data as Book) : book))
        );
      }

      return data as Book;
    },
    [supabase]
  );

  const deleteBook = useCallback(
    async (bookId: string) => {
      const { error: deleteError } = await supabase
        .from("books")
        .delete()
        .eq("id", bookId);

      if (deleteError) {
        setError(deleteError.message);
        return false;
      }

      setBooks((prev) => prev.filter((book) => book.id !== bookId));
      return true;
    },
    [supabase]
  );

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  return {
    books,
    loading,
    error,
    createBook,
    updateBook,
    deleteBook,
    refetch: fetchBooks,
  };
}

export function useBook(bookId?: string) {
  const supabase = useMemo(() => createClient(), []);
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(Boolean(bookId));
  const [error, setError] = useState<string | null>(null);

  const fetchBook = useCallback(async () => {
    if (!bookId) return;
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("books")
      .select("*")
      .eq("id", bookId)
      .single();

    if (fetchError) {
      setError(fetchError.message);
      setBook(null);
    } else {
      setBook((data ?? null) as Book | null);
    }

    setLoading(false);
  }, [bookId, supabase]);

  useEffect(() => {
    fetchBook();
  }, [fetchBook]);

  const updateBook = useCallback(
    async (updates: Partial<Book>) => {
      if (!bookId) return null;
      const { data, error: updateError } = await supabase
        .from("books")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", bookId)
        .select("*")
        .single();

      if (updateError) {
        setError(updateError.message);
        return null;
      }

      if (data) {
        setBook(data as Book);
      }

      return data as Book;
    },
    [bookId, supabase]
  );

  return { book, loading, error, refetch: fetchBook, updateBook };
}
