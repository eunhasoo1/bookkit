import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { BookColor } from "@/types";

export function usePalette(bookId?: string) {
  const supabase = useMemo(() => createClient(), []);
  const [colors, setColors] = useState<BookColor[]>([]);
  const [loading, setLoading] = useState(Boolean(bookId));
  const [error, setError] = useState<string | null>(null);

  const fetchColors = useCallback(async () => {
    if (!bookId) return;
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("book_colors")
      .select("*")
      .eq("book_id", bookId)
      .order("order_index", { ascending: true });

    if (fetchError) {
      setError(fetchError.message);
      setColors([]);
    } else {
      setColors((data ?? []) as BookColor[]);
    }

    setLoading(false);
  }, [bookId, supabase]);

  const addColor = useCallback(
    async (hex: string, name?: string) => {
      if (!bookId) return null;
      const { data, error: insertError } = await supabase
        .from("book_colors")
        .insert({
          book_id: bookId,
          hex_code: hex,
          name: name?.trim() || null,
          order_index: colors.length,
        })
        .select("*")
        .single();

      if (insertError) {
        setError(insertError.message);
        return null;
      }

      if (data) {
        setColors((prev) => [...prev, data as BookColor]);
      }

      return data as BookColor;
    },
    [bookId, colors.length, supabase]
  );

  const deleteColor = useCallback(
    async (colorId: string) => {
      const { error: deleteError } = await supabase
        .from("book_colors")
        .delete()
        .eq("id", colorId);

      if (deleteError) {
        setError(deleteError.message);
        return false;
      }

      setColors((prev) => prev.filter((color) => color.id !== colorId));
      return true;
    },
    [supabase]
  );

  const updateColorName = useCallback(
    async (colorId: string, name: string) => {
      const { error: updateError } = await supabase
        .from("book_colors")
        .update({ name: name.trim() || null })
        .eq("id", colorId);

      if (updateError) {
        setError(updateError.message);
        return false;
      }

      setColors((prev) =>
        prev.map((color) =>
          color.id === colorId ? { ...color, name: name.trim() || null } : color
        )
      );
      return true;
    },
    [supabase]
  );

  useEffect(() => {
    fetchColors();
  }, [fetchColors]);

  return {
    colors,
    loading,
    error,
    addColor,
    deleteColor,
    updateColorName,
    refetch: fetchColors,
  };
}
