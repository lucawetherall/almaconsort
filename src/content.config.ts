import { glob } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';

const events = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/events' }),
  schema: z.object({
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
    image: z.string().optional(),
    performers: z.array(z.string()).optional(),
  }),
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

export const collections = { events, supportTiers };
