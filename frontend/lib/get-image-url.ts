/**
 * Constructs the full URL for an image asset.
 * For local development, set NEXT_PUBLIC_BACKEND_URL=http://localhost:3000 in your .env.local file.
 * This ensures relative paths like "/uploads/image.webp" are correctly prefixed.
 * @param path The relative path to the image (e.g., /uploads/image.webp) or a full URL.
 * @returns The full URL for the image.
 */
export function getImageUrl(path?: string): string {
  if (!path) {
    return "/placeholder.svg?height=400&width=600&text=No+Image"
  }

  // If the path is already a full URL (starts with http or https), return it directly.
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("blob:")) {
    return path
  }

  // For local development, NEXT_PUBLIC_BACKEND_URL should be http://localhost:3000
  // For production, it could be your production backend URL or an empty string if served from the same domain.
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000"

  if (path.startsWith("/")) {
    return `${backendUrl}${path}`
  }

  // Fallback for unexpected path formats, though ideally paths should be absolute or full URLs.
  return `${backendUrl}/${path}`
}
