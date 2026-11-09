import { formatDistanceToNow } from "date-fns"
import { KeyRound } from "lucide-react"
import { Badge } from "@workspace/ui/components/badge"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import type { ApiKeySummary } from "@/lib/api/keys"
import { RevokeKeyButton } from "@/components/settings/api-keys/revoke-key-button"

type KeyListType = { keys: ApiKeySummary[] }

const ago = (date: Date | null) =>
  date ? formatDistanceToNow(date, { addSuffix: true }) : "Never"

export const KeyList = ({ keys }: KeyListType) => {
  if (!keys.length) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <KeyRound aria-hidden />
          </EmptyMedia>
          <EmptyTitle>No API keys yet</EmptyTitle>
          <EmptyDescription>
            Create a key to read your stats or send server-side events.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Key</TableHead>
            <TableHead>Scopes</TableHead>
            <TableHead>Last used</TableHead>
            <TableHead className="sr-only">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {keys.map((key) => (
            <TableRow key={key.id}>
              <TableCell className="font-medium">{key.name}</TableCell>
              <TableCell>
                <code className="font-mono text-xs text-muted-foreground">
                  {key.prefix}…
                </code>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {key.scopes.map((scope) => (
                    <Badge key={scope} variant="secondary">
                      {scope}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground tabular-nums">
                {ago(key.lastUsedAt)}
              </TableCell>
              <TableCell className="text-right">
                <RevokeKeyButton id={key.id} name={key.name} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
