// Shared sample data derived from the "Data contracts" section of docs/requirements.md.
export const UUID_A = '3f2b8c1e-5a4d-4e6f-9b7a-1c2d3e4f5a6b';
export const UUID_B = '8d1e2f3a-4b5c-4d6e-8f70-91a2b3c4d5e6';
export const DT = '2026-10-02T08:00:00.000Z';

export const base = (over: Record<string, unknown> = {}) => ({
  id: UUID_A,
  status: 'published',
  sort: 1,
  date_created: DT,
  date_updated: null,
  ...over,
});

export const validService = base({
  slug: 'freight-forwarding',
  icon: null,
  image: UUID_B,
  translations: [{ languages_code: 'en', title: 'Freight', summary: 'Sum', body: null }],
});
export const validNews = base({
  slug: 'hello',
  cover: UUID_B,
  published_at: DT,
  translations: [{ languages_code: 'en', title: 'T', excerpt: 'E', body: [{ type: 'paragraph', text: 'B' }] }],
});
export const validStat = base({
  value: '15+',
  icon: null,
  as_of: '2026-10-01',
  translations: [{ languages_code: 'en', label: 'Years' }],
});
export const validPartner = base({ name: 'Acme', logo: UUID_B, url: 'https://example.com' });
export const validOffice = base({
  phone: '+84 28 0000 0000',
  email: 'office@example.com',
  translations: [{ languages_code: 'en', name: 'HCMC', address: '1 Street', role: null }],
});
export const validLeadInput = {
  first_name: 'An',
  last_name: 'Nguyen',
  company: 'Acme',
  email: 'an@example.com',
  phone: '0901234567',
  country: 'Vietnam',
  job_title: 'Buyer',
  locale: 'en',
  website: '',
};
export const omit = <T extends Record<string, unknown>>(o: T, ...keys: string[]): Record<string, unknown> =>
  Object.fromEntries(Object.entries(o).filter(([k]) => !keys.includes(k)));

export const validLead = {
  ...omit(validLeadInput, 'website'),
  id: UUID_A,
  date_created: DT,
  email_status: 'pending',
  source_page: '/en',
};
