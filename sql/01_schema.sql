-- Schema for BookKit
-- Order: 01_schema.sql -> 02_functions.sql -> 04_rls_policies.sql -> 03_seed.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'book_status') THEN
    CREATE TYPE book_status AS ENUM ('to_read', 'reading', 'completed', 'dropped');
  END IF;
END $$;

-- Optional user profile table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  author TEXT,
  cover_url TEXT,
  status book_status DEFAULT 'to_read',
  rating INTEGER CHECK (rating >= 0 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.characters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.character_avatars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  character_id UUID UNIQUE NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  face_id TEXT DEFAULT 'face_01',
  face_color TEXT DEFAULT '#FFE0BD',
  hair_id TEXT DEFAULT 'hair_01',
  hair_color TEXT DEFAULT '#4A3728',
  eye_id TEXT DEFAULT 'eye_01',
  eye_color TEXT DEFAULT '#634E34',
  accessory_id TEXT,
  accessory_color TEXT
);

CREATE TABLE IF NOT EXISTS public.book_colors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  hex_code TEXT NOT NULL,
  name TEXT,
  order_index INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_books_user_id ON public.books(user_id);
CREATE INDEX IF NOT EXISTS idx_characters_book_id ON public.characters(book_id);
CREATE INDEX IF NOT EXISTS idx_book_colors_book_id ON public.book_colors(book_id);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.character_avatars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_colors ENABLE ROW LEVEL SECURITY;
