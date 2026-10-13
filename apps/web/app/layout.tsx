import type { Metadata } from "next"
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google"

import "@workspace/ui/globals.css"
import { JsonLd } from "@/components/seo/json-ld"
import { ThemeProvider } from "@/components/theme-provider"
import { rootMetadata } from "@/lib/seo"

const fontDisplay = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
})

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = rootMetadata

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fontDisplay.variable} ${fontSans.variable} ${fontMono.variable} font-sans antialiased`}
    >
      <body>
        <JsonLd />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
