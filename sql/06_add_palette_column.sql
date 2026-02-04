-- Add extracted_palette column to books table to store suggested colors
ALTER TABLE public.books
ADD COLUMN IF NOT EXISTS extracted_palette JSONB DEFAULT '[]'::jsonb;
