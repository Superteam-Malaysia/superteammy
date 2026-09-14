/**
 * URLs for files in `public/` (e.g. `public/images/...`).
 * These are always served from the site root (`/images/...`), never under `/borneo`.
 */
export function publicAssetUrl(path: string): string {
  if (!path.startsWith("/")) return path;
  if (path.startsWith("/borneo/images/")) {
    return path.slice("/borneo".length);
  }
  return path;
}
