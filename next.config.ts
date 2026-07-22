import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  turbopack: {},
  // Milestone 1.1 renamed two routes; keep old links working.
  async redirects() {
    return [
      { source: "/officers", destination: "/organization", permanent: true },
      { source: "/officers/:id", destination: "/organization/:id", permanent: true },
      { source: "/activity", destination: "/knowledge", permanent: true },
    ]
  },
}

export default nextConfig
