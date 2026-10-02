/**
 * Minimal sanitizer for CMS rich text: only <strong>, <em> and <a href="/..|https://..|mailto:..|tel:..">
 * survive; every other character is escaped. Returns an HTML string safe for dangerouslySetInnerHTML.
 */
const TAG = /<(\/?)(strong|em|a)((?:\s+href="[^"<>]*")?)\s*>/gi;
const esc = (s: string) => s.replace(/&(?!amp;|lt;|gt;|quot;|#39;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const SAFE_HREF = /^(\/|https:\/\/|mailto:|tel:|#)/i;

export function sanitizeRich(html: string): string {
  let out = '';
  let last = 0;
  for (const m of html.matchAll(TAG)) {
    out += esc(html.slice(last, m.index));
    const [full, close, name, attrs] = m;
    const tag = name.toLowerCase();
    if (close) out += `</${tag}>`;
    else if (tag === 'a') {
      const href = /href="([^"]*)"/i.exec(attrs)?.[1] ?? '';
      out += SAFE_HREF.test(href) ? `<a href="${href.replace(/"/g, '&quot;')}">` : '<a>';
    } else out += `<${tag}>`;
    last = (m.index ?? 0) + full.length;
  }
  return out + esc(html.slice(last));
}
