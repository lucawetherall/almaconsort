import { glob } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';

const events = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/events' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    date: z.coerce.date(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    venue: z.object({
      name: z.string(),
      address: z.string().optional(),
    }),
    description: z.string(),
    ticketUrl: z.string().url().optional(),
    image: z.string().optional(),          // legacy — kept for compatibility
    performers: z.array(z.string()).optional(),
    featured: z.boolean().optional(),
    programme: z.array(z.object({
      composer: z.string(),
      work: z.string(),
    })).optional(),

    // Editorial uplift additions
    photo: image().optional(),
    photoAlt: z.string().optional(),
    photoCaption: z.string().optional(),
    composers: z.array(z.string()).optional(),
    altTitle: z.string().optional(),
    priceFrom: z.string().optional(),
  }).refine(
    (data) => !data.photo || (data.photo && data.photoAlt),
    { message: 'photoAlt is required when photo is set', path: ['photoAlt'] }
  ),
});

const supportTiers = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/support-tiers' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    order: z.number(),
    tagline: z.string(),
    cardImage: z.string().optional(),
    stripeButtons: z.array(
      z.object({
        id: z.string(),
        label: z.string(),
        tierName: z.string(),
        price: z.string(),
        billingNote: z.string().optional(),
      })
    ),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string(),
    author: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

const featuredRecordings = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/featuredRecordings' }),
  schema: z.object({
    youtubeId: z.string(),
    title: z.string(),
    composer: z.string(),
    order: z.number().optional(),
  }),
});

export const collections = { events, supportTiers, blog, featuredRecordings };
