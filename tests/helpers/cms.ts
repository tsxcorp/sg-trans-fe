// Helpers that tolerate either "flat resolved" or "single-entry translations" output shapes.
export type Rec = Record<string, unknown>;

export function text(rec: Rec, field: string): unknown {
  if (typeof rec[field] === 'string') return rec[field];
  const tr = rec.translations;
  return Array.isArray(tr) ? (tr[0] as Rec | undefined)?.[field] : undefined;
}

export function translationsAreResolved(rec: Rec, locale: string): boolean {
  if (!Array.isArray(rec.translations)) return true;
  return (rec.translations as Rec[]).every((t) => t.languages_code === locale || t.languages_code === 'en');
}

export const sortKey = (r: Rec): number => (typeof r.sort === 'number' ? r.sort : Number.POSITIVE_INFINITY);
