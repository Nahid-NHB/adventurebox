import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // This app has its own lockfile; pin tracing here so Next doesn't walk up to
  // the Expo repo root and warn about multiple lockfiles.
  outputFileTracingRoot: here,
};

export default nextConfig;
