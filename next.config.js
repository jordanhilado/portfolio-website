/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize for production
  swcMinify: true,

  // Enable static optimization where possible
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  // The Blogs and Hobbies sections were renamed to Thoughts and Running.
  // Redirect the retired URLs so links already shared elsewhere keep resolving.
  async redirects() {
    return [
      { source: '/blogs', destination: '/thoughts', permanent: true },
      { source: '/blogs/:slug', destination: '/thoughts/:slug', permanent: true },
      { source: '/hobbies', destination: '/running', permanent: true },
    ];
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
}

module.exports = nextConfig
