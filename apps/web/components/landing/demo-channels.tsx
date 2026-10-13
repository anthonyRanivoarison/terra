import {
  DEMO_CHANNELS,
  DEMO_CRAWLERS,
  formatCount,
  formatMoney,
  formatRate,
} from "./demo-data"

const top = Math.max(...DEMO_CHANNELS.map((channel) => channel.revenue))

export const DemoChannels = () => (
  <div className="min-w-0">
    <table className="w-full text-sm">
      <caption className="mb-3 text-left text-sm font-medium text-foreground">
        Channels by revenue
      </caption>
      <thead>
        <tr className="text-left text-xs text-muted-foreground">
          <th scope="col" className="pb-2 font-normal">
            Channel
          </th>
          <th
            scope="col"
            className="hidden pb-2 text-right font-normal sm:table-cell"
          >
            Visitors
          </th>
          <th scope="col" className="pb-2 text-right font-normal">
            Per visitor
          </th>
          <th scope="col" className="pb-2 text-right font-normal">
            Revenue
          </th>
        </tr>
      </thead>
      <tbody>
        {DEMO_CHANNELS.map((channel) => (
          <tr key={channel.name} className="border-t border-foreground/[0.07]">
            <th scope="row" className="py-2.5 pr-3 text-left font-normal">
              <span className="block text-foreground">{channel.name}</span>
              <span
                aria-hidden
                className="mt-1.5 block h-1 rounded-full bg-primary/10"
              >
                <span
                  data-share
                  className="block h-full origin-left rounded-full bg-primary"
                  style={{ width: `${(channel.revenue / top) * 100}%` }}
                />
              </span>
            </th>
            <td className="hidden py-2.5 text-right font-mono text-muted-foreground tabular-nums sm:table-cell">
              {formatCount(channel.visitors)}
            </td>
            <td className="py-2.5 pl-3 text-right font-mono text-muted-foreground tabular-nums">
              {formatRate(channel.revenue / channel.visitors)}
            </td>
            <td className="py-2.5 pl-3 text-right font-mono text-foreground tabular-nums">
              {formatMoney(channel.revenue)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    <div className="mt-6 border-t border-foreground/10 pt-4">
      <p className="text-sm font-medium text-foreground">
        AI crawler reads today
      </p>
      <ul className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
        {DEMO_CRAWLERS.map((crawler) => (
          <li key={crawler.name} className="flex justify-between gap-3">
            <span className="text-muted-foreground">{crawler.name}</span>
            <span className="font-mono text-foreground tabular-nums">
              {formatCount(crawler.reads)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  </div>
)
