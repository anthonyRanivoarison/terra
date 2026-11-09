import type { Metadata } from "next"
import { AppHeader } from "@/components/app/app-header"

export const metadata: Metadata = { robots: { index: false, follow: false } }

export default function PrivateLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <AppHeader />
      {children}
    </>
  )
}
