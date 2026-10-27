import { SetupStep, SetupSteps } from "@/components/setup/setup-step"
import { Snippet } from "@/components/sites/snippet"

const overlay = `Paddle.Checkout.open({
  items: [{ priceId: "pri_…", quantity: 1 }],
  customData: {
    terra_visitor_id: window.terra?.visitorId(),
  },
})`

const browser = `await fetch("/api/checkout", {
  method: "POST",
  body: JSON.stringify({ visitorId: window.terra?.visitorId() }),
})`

const server = `await paddle.transactions.create({
  items: [{ priceId: "pri_…", quantity: 1 }],
  customData: { terra_visitor_id: body.visitorId },
})`

export const CheckoutSnippets = () => (
  <>
    <h3 className="mb-6 font-semibold">Wire checkouts by hand</h3>
    <SetupSteps>
      <SetupStep
        index={1}
        title="Paddle.js overlay or inline checkout"
        description={
          <>
            Add the visitor id to the custom data. Existing{" "}
            <code className="font-mono">datafast_visitor_id</code> values work
            too.
          </>
        }
      >
        <Snippet code={overlay} label="Paddle.js checkout snippet" />
      </SetupStep>
      <SetupStep
        index={2}
        title="Or a server-side transaction"
        description="Send the visitor id with the checkout request, then attach it on the server."
      >
        <Snippet code={browser} label="browser checkout request" />
        <Snippet code={server} label="server-side transaction snippet" />
      </SetupStep>
    </SetupSteps>
  </>
)
