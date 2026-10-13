import {
  DigitalTile,
  PhysicalTile,
} from "@/components/brand/board/application-tiles"
import {
  ColorsTile,
  EssenceTile,
  TypeTile,
} from "@/components/brand/board/identity-tiles"
import {
  ConstructionTile,
  CoverTile,
} from "@/components/brand/board/logo-tiles"
import { ImageryTile, SystemTile } from "@/components/brand/board/world-tiles"
import { Logo } from "@/components/brand/logo"

export const BrandBoard = () => (
  <main className="sm:py-14] min-h-svh bg-[#ECEEF2] px-4 py-10 text-[#0A0A0B] sm:px-8">
    <div className="mx-auto max-w-[88rem]">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4 sm:mb-12">
        <div>
          <Logo className="text-2xl" markClassName="text-[#2563EB]" />
          <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Brand kit
          </h1>
        </div>
        <p className="max-w-xs text-sm text-[#0A0A0B]/60">
          Logo, color, type and voice for everything Terra ships.
        </p>
      </header>
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
        <CoverTile />
        <ConstructionTile />
        <DigitalTile />
        <EssenceTile />
        <ColorsTile />
        <TypeTile />
        <PhysicalTile />
        <ImageryTile />
        <SystemTile />
      </div>
    </div>
  </main>
)
