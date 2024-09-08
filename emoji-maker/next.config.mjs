/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: ['replicate.delivery', 'xfpoygmqmrkvnzovtlgu.supabase.co'],
    },
    webpack: (config) => {
      config.resolve.fallback = { ...config.resolve.fallback, process: false };
      return config;
    },
  };
  
  export default nextConfig;