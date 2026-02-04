"use server";

export interface GoogleBook {
  id: string;
  title: string;
  authors: string[];
  thumbnail: string | null;
}

interface GoogleBooksResponse {
  items?: {
    id: string;
    volumeInfo: {
      title: string;
      authors?: string[];
      imageLinks?: {
        thumbnail?: string;
        smallThumbnail?: string;
      };
    };
  }[];
}

interface GoogleBookDetailsResponse {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    imageLinks?: {
      thumbnail?: string;
      small?: string;
      medium?: string;
      large?: string;
      extraLarge?: string;
    };
  };
}

export async function searchBooksAction(query: string): Promise<GoogleBook[]> {
  if (!query.trim()) return [];

  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  const baseUrl = "https://www.googleapis.com/books/v1/volumes";
  const params = new URLSearchParams({
    q: query,
    maxResults: "5",
    printType: "books",
  });

  if (apiKey) {
    params.append("key", apiKey);
  }

  try {
    const response = await fetch(`${baseUrl}?${params.toString()}`);

    if (!response.ok) {
      console.error("Google Books API Error Status:", response.status);
      return [];
    }

    const data: GoogleBooksResponse = await response.json();

    return (
      data.items?.map((item) => ({
        id: item.id,
        title: item.volumeInfo.title,
        authors: item.volumeInfo.authors || [],
        thumbnail:
          item.volumeInfo.imageLinks?.thumbnail?.replace("http://", "https://") ||
          null,
      })) || []
    );
  } catch (error) {
    console.error("Google Books API Fetch Error:", error);
    return [];
  }
}

export async function getBookDetailsAction(bookId: string): Promise<string | null> {
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  const baseUrl = "https://www.googleapis.com/books/v1/volumes";
  const params = new URLSearchParams();

  if (apiKey) {
    params.append("key", apiKey);
  }

  try {
    const response = await fetch(`${baseUrl}/${bookId}?${params.toString()}`);

    if (!response.ok) {
      console.error("Google Books Details Error Status:", response.status);
      return null;
    }

    const data: GoogleBookDetailsResponse = await response.json();
    const images = data.volumeInfo.imageLinks;

    if (!images) return null;

    // Try to get the highest resolution image available
    let imageUrl =
      images.extraLarge ||
      images.large ||
      images.medium ||
      images.small ||
      images.thumbnail;

    if (imageUrl) {
      // Ensure HTTPS
      imageUrl = imageUrl.replace("http://", "https://");
      
      // Try to improve quality by removing zoom parameter or edge=curl
      // Google Books images often have &zoom=1&edge=curl. 
      // Removing edge=curl usually gives a clean rectangular cover.
      // Changing zoom=1 to zoom=0 sometimes gives a larger image.
      imageUrl = imageUrl.replace("&edge=curl", "");
      // imageUrl = imageUrl.replace("&zoom=1", "&zoom=0"); 
    }

    return imageUrl || null;
  } catch (error) {
    console.error("Google Books Details Fetch Error:", error);
    return null;
  }
}

export async function extractCoverPaletteAction(
  coverUrl: string
): Promise<string[]> {
  console.log("extractCoverPaletteAction called with:", coverUrl);
  if (!coverUrl.trim()) {
    console.log("Empty cover URL, skipping extraction");
    return [];
  }

  try {
    // 1. Fetch image manually
    const response = await fetch(coverUrl);
    if (!response.ok) {
      console.error(
        "Failed to fetch cover image:",
        response.status,
        response.statusText
      );
      return [];
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const getColors = (await import("get-image-colors")).default;
    const palette = await getColors(buffer, "image/jpeg");

    console.log(
      "get-image-colors palette:",
      palette.map((c) => c.hex())
    );

    const colors = palette.map((c) => c.hex().toUpperCase());
    const unique = Array.from(new Set(colors)) as string[];
    return unique.slice(0, 5);
  } catch (error) {
    console.error("Cover palette extraction error:", error);
    return [];
  }
}
