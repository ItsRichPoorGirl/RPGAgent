/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static optimization where possible
  reactStrictMode: true,
  
  // Configure dynamic rendering for specific pages
  async headers() {
    return [
      {
        source: '/dashboard',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
    ];
  },

  // Configure page-specific settings
  async rewrites() {
    return [];
  },

  // Configure experimental features
  experimental: {
    // Enable server actions
    serverActions: true,
  },
};

module.exports = nextConfig; 