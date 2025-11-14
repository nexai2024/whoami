import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['localhost', '127.0.0.1','images.unsplash.com'],
  },
  // Let Tailwind's PostCSS plugin handle CSS processing

  // webpack: (config, { isServer }) => {
  //   // Help webpack resolve native modules for Lightning CSS
  //   config.resolve.alias = {
  //     ...config.resolve.alias,
  //   };
    
  //   // Allow dynamic requires for native modules
  //   config.module = {
  //     ...config.module,
  //     unknownContextRegExp: /^\.\/.*$/,
  //     unknownContextCritical: false,
  //   };

  //   if (!isServer) {
  //     config.resolve.fallback = {
  //       ...config.resolve.fallback,
  //       fs: false,
  //     };
  //   }
  //   return config;
  // },
};

export default nextConfig;
