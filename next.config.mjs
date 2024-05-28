/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // to prevent mount, remount, mount
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
