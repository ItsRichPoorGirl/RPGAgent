import { Metadata } from 'next';
import { siteConfig } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Luciq AI',
  description: 'Luciq is a fully open source AI assistant that helps you accomplish real-world tasks with ease.',
  keywords: ['Luciq', 'AI', 'Agent'],
  authors: [
    {
      name: 'Luciq AI Team',
      url: 'https://luciqai.com',
    },
  ],
  creator: 'Luciq AI Team',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    title: 'Luciq',
    description: 'Luciq is a fully open source AI assistant that helps you accomplish real-world tasks with ease.',
    siteName: 'Luciq',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Luciq',
    description: 'Luciq is a fully open source AI assistant that helps you accomplish real-world tasks with ease.',
    creator: '@luciqai',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};
