import { Snippet } from "@/components/landing/snippet"

const steps = [
  "Add your site and its domain.",
  "Paste the script in the head of every page.",
  "Watch the first visit arrive, then connect Paddle.",
]

export const Install = () => (
  <section
    id="install"
    aria-labelledby="install-title"
    className="px-5 py-32 md:px-12"
  >
    <div className="marketing-panel mx-auto grid w-full max-w-6xl gap-10 rounded-[1.75rem] p-6 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:items-center md:p-10">
      <div>
        <h2
          id="install-title"
          className="font-heading text-[clamp(2rem,4vw,3.25rem)] leading-[1.02] font-semibold tracking-[-0.035em] text-balance"
        >
          One line. <span className="marketing-accent">Live in a minute.</span>
        </h2>
        <ol className="mt-8 flex flex-col gap-4">
          {steps.map((step, i) => (
            <li key={step} className="flex items-baseline gap-4">
              <span className="marketing-accent w-5 shrink-0 text-xl text-foreground/50 tabular-nums">
                {i + 1}
              </span>
              <span className="leading-relaxed text-foreground/85">{step}</span>
            </li>
          ))}
        </ol>
      </div>
      <Snippet />
    </div>
  </section>
)
