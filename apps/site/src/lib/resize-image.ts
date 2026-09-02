/**
 * Downscale an image in the browser before uploading it.
 *
 * Storage cost is not the reason this exists -- decoded memory is. A bitmap
 * occupies width * height * 4 bytes of RAM once decoded, however small the file
 * is, so a 4096x2731 phone photo costs ~45MB whether it is displayed at 4096px
 * or, as in the event dome, at 91px. Enough of those on one page and a mobile
 * browser kills the tab.
 *
 * Supabase can do this server-side via /render/image, but that is a paid
 * add-on and is not enabled on this project, so it happens here instead.
 */

export const GALLERY_MAX_WIDTH = 1600;
export const LOGO_MAX_WIDTH = 800;

export interface ResizeOptions {
  maxWidth: number;
  /** 0-1. 0.82 keeps photos clean at these sizes. */
  quality?: number;
  /** Defaults to WebP, falling back to JPEG where it is unsupported. */
  mimeType?: string;
}

/** True when the browser can actually encode the requested type. */
function canEncode(type: string): boolean {
  const c = document.createElement("canvas");
  c.width = c.height = 1;
  return c.toDataURL(type).startsWith(`data:${type}`);
}

/**
 * Returns a resized copy, or the original file when it is already small
 * enough, is not a raster image, or the browser cannot decode it -- callers
 * can always upload whatever comes back.
 */
export async function resizeImage(
  file: File,
  { maxWidth, quality = 0.82, mimeType }: ResizeOptions
): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
    return file;
  }

  // GIFs would lose their animation, so leave them alone.
  if (file.type === "image/gif") return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }

  if (bitmap.width <= maxWidth) {
    bitmap.close();
    return file;
  }

  const scale = maxWidth / bitmap.width;
  const width = maxWidth;
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const type = mimeType ?? (canEncode("image/webp") ? "image/webp" : "image/jpeg");
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, type, quality)
  );
  if (!blob) return file;

  const ext = type === "image/webp" ? "webp" : "jpg";
  const base = file.name.replace(/\.[^.]+$/, "");
  return new File([blob], `${base}.${ext}`, { type });
}
