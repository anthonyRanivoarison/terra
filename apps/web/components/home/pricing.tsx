import { plans } from "@/lib/billing/plans"

import { PlanSlider } from "./plan-slider"
import { Section } from "./section"

export const Pricing = () => (
  <Section
    id="pricing"
    title="Plans that follow your traffic."
    lead="Drag to your monthly volume. The only thing a bigger plan changes is how many events you can send."
  >
    <PlanSlider
      plans={plans().map(({ id, name, quota }) => ({ id, name, quota }))}
    />
  </Section>
)
