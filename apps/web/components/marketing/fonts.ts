import { Instrument_Sans, Space_Grotesk } from "next/font/google"

export const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-display",
})

export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-accent",
})
