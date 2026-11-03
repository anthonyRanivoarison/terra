import type { Metadata } from "next"

const url = (
  process.env.APP_URL ??
  process.env.BETTER_AUTH_URL ??
  "http://localhost:3000"
).replace(/\/$/, "")

const repository = "https://github.com/anthonyRanivoarison/terra"

export const siteConfig = {
  name: "Terra",
  url,
  tagline: "Know where your revenue comes from.",
  description:
    "Terra is free, self-hostable, privacy-friendly web analytics. Add a site, paste one script and see where your visitors and revenue come from, including traffic from ChatGPT, Claude, Perplexity and Google.",
  keywords: [
    "web analytics",
    "privacy-friendly analytics",
    "self-hosted analytics",
    "open source analytics",
    "revenue attribution",
    "Google Analytics alternative",
    "cookieless analytics",
    "AI crawler tracking",
    "GEO",
    "Paddle analytics",
  ],
  ogImage: "/opengraph-image",
  github: repository,
  supportHref: process.env.SUPPORT_EMAIL
    ? `mailto:${process.env.SUPPORT_EMAIL}`
    : `${repository}/issues`,
}

export const rootMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: `Terra · ${siteConfig.tagline}`, template: "%s · Terra" },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: siteConfig.keywords,
  authors: [{ name: "Terra", url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  category: "technology",
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: "en_US",
    url: "/",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.tagline,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: ["/twitter-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: { canonical: "/" },
  formatDetection: { email: false, address: false, telephone: false },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
  },
}

type MetadataForType = {
  title: string
  description?: string
  path: string
  noIndex?: boolean
}

export function metadataFor({
  title,
  description = siteConfig.description,
  path,
  noIndex = false,
}: MetadataForType): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      title,
      description,
      url: path,
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: siteConfig.tagline,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [siteConfig.ogImage],
    },
    robots: noIndex ? { index: false, follow: false } : undefined,
  }
}

export function jsonLd() {
  const org = `${siteConfig.url}/#organization`
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": org,
        name: siteConfig.name,
        url: siteConfig.url,
        logo: `${siteConfig.url}/icon.svg`,
        sameAs: [siteConfig.github],
      },
      {
        "@type": "WebSite",
        "@id": `${siteConfig.url}/#website`,
        url: siteConfig.url,
        name: siteConfig.name,
        description: siteConfig.description,
        publisher: { "@id": org },
        inLanguage: "en",
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${siteConfig.url}/#software`,
        name: siteConfig.name,
        url: siteConfig.url,
        description: siteConfig.description,
        applicationCategory: "BusinessApplication",
        applicationSubCategory: "Web analytics",
        operatingSystem: "Web, Linux, Docker",
        image: `${siteConfig.url}${siteConfig.ogImage}`,
        publisher: { "@id": org },
        offers: {
          "@type": "Offer",
          name: "Self-hosted",
          price: "0",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
        },
      },
    ],
  }
}
