import { Footer } from "@/components/landing/footer"

import { Agents } from "./agents"
import { Closing } from "./closing"
import { Faq } from "./faq"
import { Features } from "./features"
import { Header } from "./header"
import { Hero } from "./hero"
import { Journey } from "./journey"
import { Pricing } from "./pricing"
import { Rankings } from "./rankings"
import { Stack } from "./stack"
import { Steps } from "./steps"

type HomeType = {
  signedIn: boolean
}

export const Home = ({ signedIn }: HomeType) => (
  <div className="home min-h-[100svh] bg-background text-foreground">
    <a
      href="#content"
      className="fixed top-3 left-3 z-40 -translate-y-20 rounded-md bg-foreground px-4 py-3 text-sm text-background focus-visible:translate-y-0"
    >
      Skip to content
    </a>
    <Header signedIn={signedIn} />
    <main id="content" className="w-full max-w-full overflow-x-clip">
      <Hero signedIn={signedIn} />
      <Rankings />
      <Journey />
      <Features />
      <Agents />
      <Steps />
      <Stack />
      <Pricing />
      <Faq />
      <Closing signedIn={signedIn} />
    </main>
    <Footer />
  </div>
)
