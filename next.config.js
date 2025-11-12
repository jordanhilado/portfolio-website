/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize for production
  swcMinify: true,
  
  // Enable static optimization where possible
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
}

module.exports = nextConfig
