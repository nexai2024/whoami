import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
const nextConfig: NextConfig = {
  images: {
    domains: ['localhost', '127.0.0.1','images.unsplash.com','lh3.googleusercontent.com','content.stack-auth.com'],
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
export default withSentryConfig(nextConfig, {
  org: "nexai-5v",
  project: "whoami",
  // Only print logs for uploading source maps in CI
  //silent: !process.env.CI,
   // Pass the auth token
   authToken: process.env.SENTRY_AUTH_TOKEN,
   // Upload a larger set of source maps for prettier stack traces
   widenClientFileUpload: true,
});

