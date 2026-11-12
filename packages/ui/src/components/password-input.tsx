"use client"

import * as React from "react"
import { EyeIcon, EyeSlashIcon, LockIcon } from "@phosphor-icons/react/ssr"

import { Button } from "@workspace/ui/components/button"
import { ButtonGroup } from "@workspace/ui/components/button-group"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@workspace/ui/components/input-group"
import { cn } from "@workspace/ui/lib/utils"

function PasswordInput({
  className,
  ...props
}: Omit<React.ComponentProps<"input">, "type">) {
  const [visible, setVisible] = React.useState(false)

  return (
    <ButtonGroup className={cn("w-full", className)}>
      <InputGroup className="h-12">
        <InputGroupInput
          type={visible ? "text" : "password"}
          placeholder="••••••••••••"
          {...props}
          className="h-12 flex-1 text-base"
        />
        <InputGroupAddon>
          <LockIcon />
        </InputGroupAddon>
      </InputGroup>
      <Button
        type="button"
        variant="outline"
        aria-label={visible ? "Hide password" : "Show password"}
        onClick={() => setVisible((v) => !v)}
        className="h-12"
      >
        {visible ? <EyeSlashIcon /> : <EyeIcon />}
      </Button>
    </ButtonGroup>
  )
}

export { PasswordInput }
