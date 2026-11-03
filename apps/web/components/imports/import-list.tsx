"use client"

import { useTransition } from "react"
import { Button } from "@workspace/ui/components/button"
import { Spinner } from "@workspace/ui/components/spinner"
import { deleteImportAction } from "@/app/sites/[id]/settings/import/actions"
import { sourceLabel } from "./sources"

type ImportItem = {
  id: string
  source: string
  firstDate: string
  lastDate: string
  rows: number
}

type ImportListType = { publicId: string; imports: ImportItem[] }

const DeleteButton = ({ publicId, id }: { publicId: string; id: string }) => {
  const [pending, startTransition] = useTransition()
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => startTransition(() => deleteImportAction(publicId, id))}
    >
      {pending && <Spinner />}
      Delete
    </Button>
  )
}

export const ImportList = ({ publicId, imports }: ImportListType) =>
  imports.length ? (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">Imported data</h2>
      <ul className="flex flex-col divide-y rounded-lg border">
        {imports.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-4 px-4 py-3"
          >
            <div className="flex min-w-0 flex-col">
              <span className="text-sm font-medium">
                {sourceLabel(item.source)}
              </span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {item.firstDate} → {item.lastDate} ·{" "}
                {item.rows.toLocaleString()} rows
              </span>
            </div>
            <DeleteButton publicId={publicId} id={item.id} />
          </li>
        ))}
      </ul>
    </section>
  ) : null
