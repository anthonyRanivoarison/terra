import { notFound, redirect } from "next/navigation"
import { demoPath } from "@/lib/demo"

export const dynamic = "force-dynamic"

export default function DemoPage() {
  if (!demoPath) notFound()
  redirect(demoPath)
}
