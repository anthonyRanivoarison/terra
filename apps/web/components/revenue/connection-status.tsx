"use client"

import { useActionState } from "react"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Spinner } from "@workspace/ui/components/spinner"
import {
  backfillAction,
  disconnectAction,
} from "@/app/sites/[id]/settings/revenue/actions"

type ConnectionStatusType = {
  publicId: string
  environment: "sandbox" | "production"
  connectedAt: string
  lastBackfillAt: string | null
}

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso))

const initial = { error: null, message: null }

export const ConnectionStatus = ({
  publicId,
  environment,
  connectedAt,
  lastBackfillAt,
}: ConnectionStatusType) => {
  const [backfillState, runBackfill, backfilling] = useActionState(
    backfillAction.bind(null, publicId),
    initial
  )
  const [disconnectState, disconnect, disconnecting] = useActionState(
    disconnectAction.bind(null, publicId),
    initial
  )
  const state = disconnectState.message ? disconnectState : backfillState
  return (
    <section className="flex flex-col gap-5 rounded-lg border p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">Paddle</h2>
        <Badge variant={environment === "production" ? "default" : "secondary"}>
          {environment === "production" ? "Production" : "Sandbox"}
        </Badge>
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
        <dt className="text-muted-foreground">Connected</dt>
        <dd className="tabular-nums">{formatDate(connectedAt)}</dd>
        <dt className="text-muted-foreground">Last backfill</dt>
        <dd className="tabular-nums">
          {lastBackfillAt ? formatDate(lastBackfillAt) : "Never"}
        </dd>
      </dl>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.message && (
        <p className="text-sm text-muted-foreground" role="status">
          {state.message}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <form action={runBackfill}>
          <Button type="submit" variant="outline" disabled={backfilling}>
            {backfilling && <Spinner />}
            Backfill now
          </Button>
        </form>
        <form action={disconnect}>
          <Button type="submit" variant="ghost" disabled={disconnecting}>
            {disconnecting && <Spinner />}
            Disconnect
          </Button>
        </form>
      </div>
    </section>
  )
}
