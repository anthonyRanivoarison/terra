import { Snippet } from "@/components/sites/snippet"

const overlay = `Paddle.Checkout.open({
  items: [{ priceId: "pri_…", quantity: 1 }],
  customData: {
    terra_visitor_id: window.terra?.visitorId(),
  },
})`

const server = `// Browser: send the visitor id with your checkout request
await fetch("/api/checkout", {
  method: "POST",
  body: JSON.stringify({ visitorId: window.terra?.visitorId() }),
})

// Server: attach it to the transaction
await paddle.transactions.create({
  items: [{ priceId: "pri_…", quantity: 1 }],
  customData: { terra_visitor_id: body.visitorId },
})`

export const CheckoutSnippets = () => (
  <section className="flex flex-col gap-4">
    <div className="flex flex-col gap-1">
      <h2 className="font-heading text-lg font-semibold">
        Link payments to visitors
      </h2>
      <p className="text-sm text-muted-foreground">
        Pass the Terra visitor id in the checkout custom data. Purchases without
        it still count as revenue, but cannot be attributed to a channel.
        Existing <code className="font-mono">datafast_visitor_id</code> values
        work too.
      </p>
    </div>
    <h3 className="text-sm font-medium">Paddle.js overlay</h3>
    <Snippet code={overlay} label="Paddle.js checkout snippet" />
    <h3 className="text-sm font-medium">Server-side transaction</h3>
    <Snippet code={server} label="server-side transaction snippet" />
  </section>
)
