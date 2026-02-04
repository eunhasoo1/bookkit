import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Character } from "@/types";

export function useCharacters(bookId?: string) {
  const supabase = useMemo(() => createClient(), []);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(Boolean(bookId));
  const [error, setError] = useState<string | null>(null);

  const fetchCharacters = useCallback(async () => {
    if (!bookId) return;
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("characters")
      .select("*")
      .eq("book_id", bookId)
      .order("order_index", { ascending: true });

    if (fetchError) {
      setError(fetchError.message);
      setCharacters([]);
    } else {
      setCharacters((data ?? []) as Character[]);
    }

    setLoading(false);
  }, [bookId, supabase]);

  const createCharacter = useCallback(
    async (name: string) => {
      if (!bookId) return null;
      const { data, error: insertError } = await supabase
        .from("characters")
        .insert({
          book_id: bookId,
          name: name.trim(),
          order_index: characters.length,
        })
        .select("*")
        .single();

      if (insertError) {
        setError(insertError.message);
        return null;
      }

      if (data) {
        setCharacters((prev) => [...prev, data as Character]);
      }

      return data as Character;
    },
    [bookId, characters.length, supabase]
  );

  useEffect(() => {
    fetchCharacters();
  }, [fetchCharacters]);

  return {
    characters,
    loading,
    error,
    createCharacter,
    refetch: fetchCharacters,
  };
}
