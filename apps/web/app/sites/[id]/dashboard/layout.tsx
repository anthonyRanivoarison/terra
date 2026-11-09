import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
}

export default function DashboardLayout({
  children,
  sheet,
}: Readonly<{ children: React.ReactNode; sheet: React.ReactNode }>) {
  return (
    <>
      {children}
      {sheet}
    </>
  )
}
