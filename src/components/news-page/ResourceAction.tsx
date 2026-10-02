import { useId } from 'react';
import { assetUrl } from '@/lib/cms';
import type { ResourceT } from '@/lib/cms/pages/news';
import { DownloadIcon } from './icons';

type Variant = 'card' | 'view' | 'download';

/**
 * Call to action of a Resource (white paper, report). With a file it is a real link (`view` opens in a new tab,
 * the others download); without a file it is a disabled button with an accessible explanation (never `href="#"`).
 */
export function ResourceAction({
  file,
  label,
  unavailable,
  variant,
  className,
  icon,
}: {
  file: ResourceT['file'];
  label: string;
  unavailable: string;
  variant: Variant;
  className: string;
  icon?: boolean;
}) {
  const hintId = useId();
  const content = (
    <>
      {label}
      {icon && <DownloadIcon className="h-[14px] w-[14px]" />}
    </>
  );
  if (file) {
    return variant === 'view' ? (
      <a href={assetUrl(file)} target="_blank" rel="noopener noreferrer" className={className}>{content}</a>
    ) : (
      <a href={assetUrl(file)} download className={className}>{content}</a>
    );
  }
  return (
    <>
      <button type="button" aria-disabled="true" aria-describedby={hintId} title={unavailable} className={`${className} cursor-not-allowed`}>{content}</button>
      <span id={hintId} className="sr-only">{unavailable}</span>
    </>
  );
}
