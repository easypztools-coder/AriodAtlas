/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracingExcludes: {
      // The cron route only reads JSON files; exclude large botanical plate images
      // from the function bundle to stay under Vercel's 300MB limit.
      "/api/cron/update-retail-prices": ["./content/plants/**/*.png"],
    },
  },
};

export default nextConfig;
