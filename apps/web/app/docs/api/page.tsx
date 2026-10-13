import type { Metadata } from "next"
import { ScalarReference } from "@/app/docs/api/scalar"

export const metadata: Metadata = {
  title: "API reference",
  description:
    "Read your Terra analytics and send server-side goals and payments.",
}

export default function ApiDocsPage() {
  return (
    <main>
      <ScalarReference url="/api/v1/openapi.json" />
    </main>
  )
}
