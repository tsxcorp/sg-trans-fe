import NextImage from 'next/image';
import { assetUrl } from '@/lib/cms';

/** Renders a CMS file by id. Components never build image URLs themselves. */
export function CmsImage({
  file,
  alt,
  width,
  height,
  className,
  priority,
  sizes,
  loading,
}: {
  file: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  loading?: 'lazy' | 'eager';
}) {
  return (
    <NextImage
      src={assetUrl(file)}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      sizes={sizes}
      loading={priority ? undefined : loading}
      unoptimized
    />
  );
}
