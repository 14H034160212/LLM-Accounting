/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  output: 'standalone',
  serverExternalPackages: ['better-sqlite3'],
};

export default nextConfig;
