import path from "node:path"
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.join(import.meta.dirname, "../.."),
  transpilePackages: ["@workspace/ui", "@terra/db", "@terra/core"],
  redirects: async () => [
    { source: "/sign-in", destination: "/auth/signin", permanent: true },
    { source: "/sign-up", destination: "/auth/signup", permanent: true },
    {
      source: "/sites/:id/dashboard/revenue",
      destination: "/sites/:id/dashboard",
      permanent: true,
    },
  ],
}

export default nextConfig
