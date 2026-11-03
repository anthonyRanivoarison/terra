"use client"

import { useState, useTransition, type FormEvent } from "react"
import { useRouter } from "next/navigation"
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
import { IMPORT_SOURCES } from "./sources"

type ImportFormType = { publicId: string; guide: string }

type Result = {
  error?: string
  rows?: number
  firstDate?: string
  lastDate?: string
  skipped?: string[]
}

export const ImportForm = ({ publicId, guide }: ImportFormType) => {
  const router = useRouter()
  const [result, setResult] = useState<Result | null>(null)
  const [pending, startTransition] = useTransition()

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const body = new FormData(form)
    startTransition(async () => {
      const response = await fetch(`/api/sites/${publicId}/imports`, {
        method: "POST",
        body,
      }).catch(() => null)
      const data: Result = response
        ? await response.json().catch(() => ({}))
        : { error: "Network error. Try again." }
      if (!response?.ok) {
        setResult({ error: data.error ?? "The import failed. Try again." })
        return
      }
      setResult(data)
      form.reset()
      router.refresh()
    })
  }

  return (
    <section className="flex flex-col gap-4 rounded-lg border p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">Upload an export</h2>
        <p className="text-sm text-muted-foreground">
          Terra reads daily totals in the Plausible CSV format. Unzip the export
          and select every CSV file.{" "}
          <a
            href={guide}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground underline underline-offset-4"
          >
            How to export from each tool
          </a>
        </p>
      </div>
      <form onSubmit={submit} className="flex flex-col gap-6">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="source">Exported from</FieldLabel>
            <Select
              name="source"
              defaultValue="plausible"
              items={IMPORT_SOURCES}
            >
              <SelectTrigger id="source" className="w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {IMPORT_SOURCES.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="files">CSV files</FieldLabel>
            <Input
              id="files"
              name="files"
              type="file"
              accept=".csv,text/csv"
              multiple
              required
            />
            <FieldDescription>
              visitors.csv, pages.csv, sources.csv, locations.csv, devices.csv,
              browsers.csv, operating_systems.csv, entry_pages.csv and
              exit_pages.csv. Only visitors.csv is required. Up to 50 MB.
            </FieldDescription>
          </Field>
          {result?.error && <FieldError>{result.error}</FieldError>}
          {result?.rows && (
            <p className="text-sm text-muted-foreground" role="status">
              Imported {result.rows.toLocaleString()} rows from{" "}
              {result.firstDate} to {result.lastDate}.
              {result.skipped?.length
                ? ` Skipped ${result.skipped.join(", ")}.`
                : ""}
            </p>
          )}
        </FieldGroup>
        <Button type="submit" disabled={pending} className="self-start">
          {pending && <Spinner />}
          Import
        </Button>
      </form>
    </section>
  )
}
