import type { MetadataRoute } from "next"

import { brand } from "@/components/brand/palette"
import { siteConfig } from "@/lib/seo"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.name} Analytics`,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: "/sites",
    scope: "/",
    display: "standalone",
    theme_color: brand.night,
    background_color: brand.night,
    categories: ["business", "productivity", "utilities"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  }
}
