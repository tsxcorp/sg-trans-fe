/**
 * Public URL of a file by its Directus-style file id.
 * M1 (fixtures): files live in /public/fixtures/<id>.<ext> — resolved through FILE_EXT.
 * M3 (Directus): becomes `${DIRECTUS_URL}/assets/<id>`.
 */
import ext from '@/content/fixtures/files.json';

const EXT = ext as Record<string, string>;

export function assetUrl(fileId: string): string {
  if (process.env.CMS_DRIVER === 'directus' && process.env.NEXT_PUBLIC_DIRECTUS_URL) {
    return `${process.env.NEXT_PUBLIC_DIRECTUS_URL.replace(/\/$/, '')}/assets/${fileId}`;
  }
  return `/fixtures/${fileId}.${EXT[fileId] ?? 'jpg'}`;
}
