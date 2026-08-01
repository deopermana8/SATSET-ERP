const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["@prisma/client", "prisma"],
  // ESLint runs separately via pnpm lint; skip during next build to avoid version conflicts.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig
