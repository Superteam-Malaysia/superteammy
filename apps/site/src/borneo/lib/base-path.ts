/** App routes live under /borneo — prefix asset paths accordingly. */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "/borneo";

/** Prefix a root-relative public asset path for deployment under basePath. */
export function withBasePath(path: string): string {
  if (!path.startsWith("/") || path.startsWith("//") || !BASE_PATH) {
    return path;
  }
  // Files in public/ (e.g. public/images) are served from the site root, not under basePath.
  if (path.startsWith("/images/")) {
    return path;
  }
  if (path === BASE_PATH || path.startsWith(`${BASE_PATH}/`)) {
    return path;
  }
  return `${BASE_PATH}${path}`;
}
