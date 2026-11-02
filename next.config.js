/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pins the project root. Left to itself Next guesses it from the nearest
  // lockfile walking upward, and a stray one in a parent folder (e.g. the
  // home directory) makes it warn on every build.
  turbopack: {
    root: __dirname,
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

  // Each section is its own route, with About at `/`. /about and the
  // pre-rename /blogs and /hobbies (now Thoughts and Running) redirect to
  // their current homes.
  //
  // Not permanent: these routes have changed shape before, and a cached 308
  // in someone's browser outlives the next change. The old /#section
  // redirects browsers may still have cached are sent back to their routes
  // by LayoutWrapper.
  async redirects() {
    return [
      { source: '/about', destination: '/', permanent: false },
      { source: '/blogs', destination: '/thoughts', permanent: false },
      { source: '/blogs/:slug', destination: '/thoughts/:slug', permanent: true },
      { source: '/hobbies', destination: '/running', permanent: false },
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
