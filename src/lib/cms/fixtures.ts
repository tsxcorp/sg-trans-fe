import { z } from 'zod';
import { Service, News, Stat, Partner, Office } from './schema';
import servicesJson from '@/content/fixtures/services.json';
import newsJson from '@/content/fixtures/news.json';
import statsJson from '@/content/fixtures/stats.json';
import partnersJson from '@/content/fixtures/partners.json';
import officesJson from '@/content/fixtures/offices.json';

// Fixtures are validated against the same contracts Directus will have to satisfy.
export const services = z.array(Service).parse(servicesJson);
export const news = z.array(News).parse(newsJson);
export const stats = z.array(Stat).parse(statsJson);
export const partners = z.array(Partner).parse(partnersJson);
export const offices = z.array(Office).parse(officesJson);
