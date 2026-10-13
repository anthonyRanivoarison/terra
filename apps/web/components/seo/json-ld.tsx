import { jsonLd } from "@/lib/seo"

type JsonLdType = {
  data?: object
}

export const JsonLd = ({ data = jsonLd() }: JsonLdType) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify(data).replace(/</g, "\\u003c"),
    }}
  />
)
