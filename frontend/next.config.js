/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'customprintingservices.com.au', 'backend.customprintingservices.com.au'],
  },
}

module.exports = nextConfig
