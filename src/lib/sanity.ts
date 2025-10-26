import { createClient } from '@sanity/client';

export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '92ocrdmp',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.SANITY_API_VERSION || '2024-05-16',
  useCdn: true,
  token: process.env.SANITY_READ_TOKEN,
});

export const sanityConfig = {
  projectId: '92ocrdmp',
  dataset: 'production',
  apiVersion: '2024-05-16',
} as const;
