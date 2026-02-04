-- Row Level Security policies

DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile"
ON public.users
FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can create own profile" ON public.users;
CREATE POLICY "Users can create own profile"
ON public.users
FOR INSERT
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile"
ON public.users
FOR UPDATE
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can manage own books" ON public.books;
CREATE POLICY "Users can manage own books"
ON public.books
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage characters in own books" ON public.characters;
CREATE POLICY "Users can manage characters in own books"
ON public.characters
FOR ALL
USING (
  book_id IN (SELECT id FROM public.books WHERE user_id = auth.uid())
)
WITH CHECK (
  book_id IN (SELECT id FROM public.books WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can manage avatars for own characters" ON public.character_avatars;
CREATE POLICY "Users can manage avatars for own characters"
ON public.character_avatars
FOR ALL
USING (
  character_id IN (
    SELECT c.id
    FROM public.characters c
    JOIN public.books b ON c.book_id = b.id
    WHERE b.user_id = auth.uid()
  )
)
WITH CHECK (
  character_id IN (
    SELECT c.id
    FROM public.characters c
    JOIN public.books b ON c.book_id = b.id
    WHERE b.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can manage colors in own books" ON public.book_colors;
CREATE POLICY "Users can manage colors in own books"
ON public.book_colors
FOR ALL
USING (
  book_id IN (SELECT id FROM public.books WHERE user_id = auth.uid())
)
WITH CHECK (
  book_id IN (SELECT id FROM public.books WHERE user_id = auth.uid())
);
