"use client"

import { useActionState } from "react"
import { Button } from "@workspace/ui/components/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { createKeyAction } from "@/app/settings/api-keys/actions"
import { CopyKey } from "@/components/settings/api-keys/copy-key"
import { SCOPE_LABELS } from "@/components/settings/api-keys/scopes"

export const CreateKeyForm = () => {
  const [state, action, pending] = useActionState(createKeyAction, {
    error: null,
    key: null,
    name: null,
  })
  return (
    <div className="flex flex-col gap-6">
      {state.key && (
        <div
          role="status"
          className="flex flex-col gap-2 rounded-xl border border-primary/30 bg-primary/5 p-4"
        >
          <p className="font-medium">{state.name} is ready</p>
          <p className="text-sm text-muted-foreground">
            Copy it now. Terra only stores a hash, so it won&apos;t be shown
            again.
          </p>
          <CopyKey value={state.key} />
        </div>
      )}
      <form action={action} className="flex flex-col gap-6">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="key-name">Name</FieldLabel>
            <Input
              id="key-name"
              name="name"
              placeholder="Production backend"
              autoComplete="off"
              maxLength={80}
              required
            />
          </Field>
          <FieldSet>
            <FieldLegend variant="label">Scopes</FieldLegend>
            {SCOPE_LABELS.map((scope) => (
              <Field key={scope.value} orientation="horizontal">
                <input
                  id={`scope-${scope.value}`}
                  type="checkbox"
                  name="scopes"
                  value={scope.value}
                  defaultChecked={scope.value === "read:stats"}
                  className="size-4 accent-primary"
                />
                <FieldLabel
                  htmlFor={`scope-${scope.value}`}
                  className="font-normal"
                >
                  <code className="font-mono text-xs">{scope.value}</code>
                  <span className="text-muted-foreground">
                    {scope.description}
                  </span>
                </FieldLabel>
              </Field>
            ))}
            <FieldDescription>
              Give each integration only the scopes it needs.
            </FieldDescription>
          </FieldSet>
          {state.error && <FieldError>{state.error}</FieldError>}
        </FieldGroup>
        <Button type="submit" disabled={pending} className="self-start">
          Create key
        </Button>
      </form>
    </div>
  )
}
