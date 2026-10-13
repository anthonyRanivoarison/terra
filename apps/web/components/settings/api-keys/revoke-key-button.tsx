"use client"

import { useFormStatus } from "react-dom"
import { Button } from "@workspace/ui/components/button"
import { revokeKeyAction } from "@/app/settings/api-keys/actions"

type RevokeKeyButtonType = { id: string; name: string }

const Submit = ({ name }: { name: string }) => {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      variant="destructive"
      size="sm"
      disabled={pending}
      aria-label={`Revoke ${name}`}
    >
      {pending ? "Revoking…" : "Revoke"}
    </Button>
  )
}

export const RevokeKeyButton = ({ id, name }: RevokeKeyButtonType) => (
  <form
    action={revokeKeyAction}
    onSubmit={(event) => {
      if (!confirm(`Revoke “${name}”? Apps using it will stop working.`)) {
        event.preventDefault()
      }
    }}
  >
    <input type="hidden" name="id" value={id} />
    <Submit name={name} />
  </form>
)
