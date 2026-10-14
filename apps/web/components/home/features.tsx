const items = [
  {
    title: "Goals and funnels",
    body: "Name the steps that matter and see where visitors drop between them.",
  },
  {
    title: "Realtime",
    body: "Who is on the site right now, on which page and from where.",
  },
  {
    title: "Sessions",
    body: "Open any visit and read it page by page, from referrer to order.",
  },
  {
    title: "Web Vitals",
    body: "Loading, interaction and layout shift, measured on real visitors.",
  },
]

export const Features = () => (
  <section
    id="features"
    aria-label="Also in Terra"
    className="scroll-mt-20 px-4 sm:px-6 md:px-10"
  >
    <dl className="mx-auto grid w-full max-w-6xl gap-x-8 gap-y-10 border-y border-border py-12 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div key={item.title}>
          <dt className="font-heading text-lg font-semibold">{item.title}</dt>
          <dd className="mt-2 leading-relaxed text-muted-foreground">
            {item.body}
          </dd>
        </div>
      ))}
    </dl>
  </section>
)
