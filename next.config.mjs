/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",

  images: {
    formats: ['image/avif', 'image/webp'],
  },

  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],

  async redirects() {
    return [
      {
        source: '/booking/confirmation/:path*',
        destination: '/paraguay/booking/confirmation/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
