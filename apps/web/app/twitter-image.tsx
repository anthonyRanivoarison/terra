import { ImageResponse } from "next/og"

import { SocialImage } from "@/components/brand/social-image"

export const alt =
  "Terra: privacy-friendly web analytics that shows where your revenue comes from"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function Image() {
  return new ImageResponse(<SocialImage />, size)
}
