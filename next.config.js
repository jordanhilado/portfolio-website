/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize for production
  swcMinify: true,

  // Enable static optimization where possible
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  // Race photos (Race.imageUrl) live in the public `race-photos` bucket in
  // Supabase Storage. next/image refuses any remote host not listed here, so
  // without this entry RaceCards throws as soon as a race has a photo.
  //
  // next/image does the resizing and WebP conversion itself, which is why the
  // originals are stored untransformed: Supabase's own transformation API is
  // Pro-only, and would duplicate work Vercel already does.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'snxrkwpgkkydsbizqsaz.supabase.co',
        pathname: '/storage/v1/object/public/race-photos/**',
      },
    ],
  },

  // Every section now lives on the landing page as an anchored block, so the
  // old per-section routes are gone and survive only as redirects into the
  // matching anchor. Slugs are duplicated from DEFAULT_SECTIONS in
  // src/constants/site.ts because this file cannot import TypeScript — adding
  // a section there means adding its redirect here.
  //
  // /blogs and /hobbies are the pre-rename names of Thoughts and Running.
  async redirects() {
    return [
      { source: '/about', destination: '/#about', permanent: true },
      { source: '/projects', destination: '/#projects', permanent: true },
      { source: '/thoughts', destination: '/#thoughts', permanent: true },
      { source: '/running', destination: '/#running', permanent: true },
      { source: '/blogs', destination: '/#thoughts', permanent: true },
      { source: '/blogs/:slug', destination: '/thoughts/:slug', permanent: true },
      { source: '/hobbies', destination: '/#running', permanent: true },
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
