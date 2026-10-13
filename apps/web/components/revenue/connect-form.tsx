"use client"

import { useActionState } from "react"
import { Button } from "@workspace/ui/components/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Spinner } from "@workspace/ui/components/spinner"
import { connectAction } from "@/app/sites/[id]/settings/revenue/actions"

type ConnectFormType = { publicId: string }

const ENVIRONMENTS = [
  { value: "production", label: "Production" },
  { value: "sandbox", label: "Sandbox" },
]

export const ConnectForm = ({ publicId }: ConnectFormType) => {
  const [state, action, pending] = useActionState(
    connectAction.bind(null, publicId),
    { error: null, message: null }
  )
  return (
    <section className="flex flex-col gap-4 rounded-xl border p-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-lg font-semibold">Connect Paddle</h2>
        <p className="text-sm text-muted-foreground">
          Terra registers a webhook in your Paddle account and imports the last
          90 days of transactions and refunds.
        </p>
      </div>
      <form action={action} className="flex flex-col gap-6">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="apiKey">API key</FieldLabel>
            <Input
              id="apiKey"
              name="apiKey"
              type="password"
              placeholder="pdl_live_apikey_…"
              autoComplete="off"
              required
            />
            <FieldDescription>
              Create it in Paddle under Developer tools → Authentication with
              read access to transactions and adjustments, and write access to
              notification settings. It is stored encrypted.
            </FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="environment">Environment</FieldLabel>
            <Select
              name="environment"
              defaultValue="production"
              items={ENVIRONMENTS}
            >
              <SelectTrigger id="environment" className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ENVIRONMENTS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          {state.error && <FieldError>{state.error}</FieldError>}
        </FieldGroup>
        <Button type="submit" disabled={pending} className="self-start">
          {pending && <Spinner />}
          Connect Paddle
        </Button>
      </form>
    </section>
  )
}
