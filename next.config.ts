import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Standalone-Output für schlanke Docker-Images (Sevalla baut per Dockerfile).
  // Erzeugt .next/standalone mit einem eigenständigen server.js.
  output: 'standalone',
};

export default nextConfig;
