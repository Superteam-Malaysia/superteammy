import { withBasePath } from "@borneo/lib/base-path";
import { publicAssetUrl } from "@borneo/lib/public-asset-url";
import { resolveStoredImageUrl } from "@borneo/lib/uploads/image-url";

/** Turn a stored avatar/logo value into a browser URL (external HTTPS or legacy /uploads path). */
export function uploadPublicUrl(stored: string | null | undefined): string | null {
  const resolved = resolveStoredImageUrl(stored);
  if (!resolved) return null;
  if (resolved.startsWith("https://") || resolved.startsWith("http://")) return resolved;
  if (resolved.startsWith("/images/") || resolved.startsWith("/borneo/images/")) {
    return publicAssetUrl(resolved);
  }
  return withBasePath(resolved);
}
