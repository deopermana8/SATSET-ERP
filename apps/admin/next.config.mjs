import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig = {
  reactStrictMode: true,
  // Restrict output file tracing to the admin app root to avoid tracing
  // outside the app (prevents scanning user home directories on Windows).
  outputFileTracingRoot: path.resolve(__dirname),
  // Exclude the current user's home directory from tracing to avoid
  // accidental scans of system junctions like "Application Data" on Windows.
  // Use the key 'next-server' so Next picks up these excludes for server tracing.
  outputFileTracingExcludes: (() => {
    const up = process.env.USERPROFILE || process.env.HOME || '';
    if (!up) return {};
    const normalized = up.replace(/\\/g, '/');
    return { 'next-server': [normalized + '/**'] };
  })(),
};

export default nextConfig
