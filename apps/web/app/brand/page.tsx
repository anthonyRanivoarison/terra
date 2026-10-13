import { BrandBoard } from "@/components/brand/brand-board"
import { metadataFor } from "@/lib/seo"

export const metadata = metadataFor({
  title: "Brand kit",
  description:
    "The Terra logo, colors, typography and visual language, ready to use.",
  path: "/brand",
})

export default function BrandPage() {
  return <BrandBoard />
}
