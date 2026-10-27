import { BotTrackingSnippet } from "@/components/sites/bot-tracking-snippet"
import { Snippet } from "@/components/sites/snippet"
import { SetupStep, SetupSteps } from "./setup-step"

type InstallManualType = {
  domain: string
  publicId: string
  ingestUrl: string
  botToken: string
}

const GOAL = `<button data-goal="signup" data-goal-plan="pro">Sign up</button>
<script>window.terra?.goal("signup", { plan: "pro" })</script>`

export const InstallManual = ({
  domain,
  publicId,
  ingestUrl,
  botToken,
}: InstallManualType) => (
  <>
    <h3 className="mb-6 font-semibold">Install by hand</h3>
    <SetupSteps>
      <SetupStep
        index={1}
        title="Add the tracking script"
        description={`Paste it in the head of every page. All subdomains of ${domain} share the same visitors and visits.`}
      >
        <Snippet
          label="tracking script"
          code={`<script
  defer
  data-website-id="${publicId}"
  data-domain="${domain}"
  src="${ingestUrl}/js/script.js">
</script>`}
        />
      </SetupStep>
      <SetupStep
        id="goals"
        index={2}
        title="Name your goals"
        description="Clicks and outbound links are tracked automatically. Name the ones that matter with an attribute, or from code."
      >
        <Snippet code={GOAL} label="goal examples" />
      </SetupStep>
      <SetupStep
        index={3}
        title="Track AI crawlers (optional)"
        description="ChatGPT, Claude and Perplexity do not run JavaScript, so report them from your server."
      >
        <BotTrackingSnippet
          websiteId={publicId}
          token={botToken}
          ingestUrl={ingestUrl}
        />
      </SetupStep>
    </SetupSteps>
  </>
)
