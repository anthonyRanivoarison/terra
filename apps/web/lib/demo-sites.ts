export type DemoSite = {
  name: string
  domain: string
  visits: number
  crawls: number
  pages: string[]
  subdomains: string[]
  events: { name: string; props: Record<string, string> }[]
  priceCents: number
  buyRate: number
  campaigns: string[]
}

export const DEMO_SITES: DemoSite[] = [
  {
    name: "Quillstack",
    domain: "quillstack.example",
    visits: 16000,
    crawls: 4000,
    pages: [
      "/",
      "/pricing",
      "/docs",
      "/features",
      "/docs/getting-started",
      "/blog/shipping-v2",
      "/changelog",
      "/integrations",
      "/docs/api",
      "/customers",
      "/about",
      "/careers",
    ],
    subdomains: ["docs", "app"],
    events: [
      { name: "signup", props: { plan: "pro" } },
      { name: "signup", props: { plan: "team" } },
      { name: "start_trial", props: { source: "pricing" } },
      { name: "cta_click", props: { location: "hero" } },
      { name: "invite_teammate", props: { role: "editor" } },
    ],
    priceCents: 2900,
    buyRate: 0.02,
    campaigns: ["launch-week", "spring-promo", "webinar"],
  },
  {
    name: "Maison Ivoire",
    domain: "maison-ivoire.example",
    visits: 7000,
    crawls: 1500,
    pages: [
      "/",
      "/shop",
      "/products/speckled-mug",
      "/shop/mugs",
      "/products/linen-bowl-set",
      "/products/stoneware-vase",
      "/shop/plates",
      "/cart",
      "/journal/glazing-at-home",
      "/checkout",
      "/shipping",
      "/about",
    ],
    subdomains: [],
    events: [
      { name: "add_to_cart", props: { product: "speckled-mug" } },
      { name: "add_to_cart", props: { product: "linen-bowl-set" } },
      { name: "begin_checkout", props: { items: "2" } },
      { name: "newsletter_signup", props: { form: "popup" } },
    ],
    priceCents: 4800,
    buyRate: 0.035,
    campaigns: ["autumn-sale", "gift-guide", "restock"],
  },
  {
    name: "Slow Lanes",
    domain: "slowlanes.example",
    visits: 3500,
    crawls: 2500,
    pages: [
      "/",
      "/posts/three-weeks-in-madagascar",
      "/guides/japan-by-rail",
      "/posts/night-trains-of-europe",
      "/posts/packing-light",
      "/posts/cheap-flights-myth",
      "/archive",
      "/newsletter",
      "/about",
    ],
    subdomains: [],
    events: [
      { name: "newsletter_signup", props: { form: "footer" } },
      { name: "outbound_click", props: { href: "booking" } },
      { name: "share", props: { network: "whatsapp" } },
    ],
    priceCents: 900,
    buyRate: 0.006,
    campaigns: ["weekly-digest", "guide-launch"],
  },
]

export const demoIcon = (domain: string) =>
  DEMO_SITES.some((site) => site.domain === domain)
    ? `/demo-icons/${domain}.svg`
    : null
