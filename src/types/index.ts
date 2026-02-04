export type BookStatus = "to_read" | "reading" | "completed" | "dropped";

export interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  created_at: string;
}

export interface Book {
  id: string;
  user_id: string;
  title: string;
  author: string | null;
  cover_url: string | null;
  status: BookStatus;
  rating: number | null;
  created_at: string;
  updated_at: string;
  extracted_palette?: string[];
}

export interface Character {
  id: string;
  book_id: string;
  name: string;
  description: string | null;
  order_index: number;
  created_at: string;
}

export interface BookColor {
  id: string;
  book_id: string;
  hex_code: string;
  name: string | null;
  order_index: number;
}
