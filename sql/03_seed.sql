-- Seed data (development only)
-- Replace seed_user_id with an existing auth.users.id before running.

DO $$
DECLARE
  seed_user_id UUID := '00000000-0000-0000-0000-000000000000';
  book_one_id UUID := uuid_generate_v4();
  book_two_id UUID := uuid_generate_v4();
  book_three_id UUID := uuid_generate_v4();
BEGIN
  IF seed_user_id = '00000000-0000-0000-0000-000000000000' THEN
    RAISE EXCEPTION 'Set seed_user_id to a real auth.users.id before running';
  END IF;

  INSERT INTO public.books (id, user_id, title, author, status, rating)
  VALUES
    (book_one_id, seed_user_id, 'The Whispering Library', 'A. Park', 'reading', 4),
    (book_two_id, seed_user_id, 'Midnight Atlas', 'J. Choi', 'to_read', NULL),
    (book_three_id, seed_user_id, 'Garden of Glass', 'S. Kim', 'completed', 5)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.characters (book_id, name, description, order_index)
  VALUES
    (book_one_id, 'Mira', 'Librarian who guards the hidden stacks.', 0),
    (book_one_id, 'Joon', 'Cartographer of forgotten worlds.', 1),
    (book_three_id, 'Haneul', 'Botanist who restores lost gardens.', 0)
  ON CONFLICT DO NOTHING;

  INSERT INTO public.book_colors (book_id, hex_code, name, order_index)
  VALUES
    (book_one_id, '#4F46E5', 'Indigo', 0),
    (book_one_id, '#10B981', 'Emerald', 1),
    (book_two_id, '#F59E0B', 'Amber', 0),
    (book_three_id, '#EF4444', 'Crimson', 0)
  ON CONFLICT DO NOTHING;
END $$;
