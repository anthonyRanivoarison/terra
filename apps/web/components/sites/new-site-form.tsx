"use client"

import { useActionState } from "react"
import { Globe } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@workspace/ui/components/input-group"
import { Spinner } from "@workspace/ui/components/spinner"
import { createSiteAction } from "@/app/sites/new/actions"
import { TimezonePicker } from "./timezone-picker"

export const NewSiteForm = () => {
  const [state, action, pending] = useActionState(createSiteAction, {
    error: null,
  })
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="text-lg">Add a new website</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="flex flex-col gap-6">
          <FieldGroup>
            <Field data-invalid={state.error ? true : undefined}>
              <FieldLabel htmlFor="domain">Domain</FieldLabel>
              <InputGroup>
                <InputGroupAddon className="gap-2 border-r pr-3">
                  <Globe aria-hidden />
                  <InputGroupText>https://</InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  id="domain"
                  name="domain"
                  placeholder="unicorn.com"
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  inputMode="url"
                  aria-invalid={state.error ? true : undefined}
                  aria-describedby={state.error ? "domain-error" : undefined}
                  required
                  autoFocus
                />
              </InputGroup>
              {state.error && (
                <FieldError id="domain-error">{state.error}</FieldError>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="timezone">Timezone</FieldLabel>
              <TimezonePicker
                id="timezone"
                name="timezone"
                describedBy="timezone-help"
              />
              <FieldDescription id="timezone-help">
                This defines what &quot;today&quot; means in your reports
              </FieldDescription>
            </Field>
          </FieldGroup>
          <Button type="submit" size="lg" className="w-full" disabled={pending}>
            {pending && <Spinner aria-hidden />}
            {pending ? "Adding website" : "Add website"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
