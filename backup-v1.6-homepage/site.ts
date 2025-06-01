export const SITE_CONFIG = {
  name: 'Luciq A.I.',
  description: 'Your personal AI employee',
  url: 'https://luciqai.com',
  ogImage: '/og-image.png',
  links: {
    github: 'https://github.com/ItsRichPoorGirl/Luciq-AI-Agent',
  },
}

// Export with the expected name for layout.tsx
export const siteConfig = SITE_CONFIG;

export type SiteConfig = typeof SITE_CONFIG;
