"use client"

import {
  ArchiveIcon,
  CheckCheckIcon,
  Clock3Icon,
  ForwardIcon,
} from "lucide-react"

import type { EmailAction } from "@/types/email"
import { Button } from "@/components/ui/button"

type EmailQuickActionsProps = {
  emailId: string
  disabled?: boolean
  onAction: (emailId: string, action: EmailAction) => Promise<void>
}

const actions: Array<{
  action: EmailAction
  label: string
  icon: typeof Clock3Icon
  variant: "default" | "outline"
}> = [
  {
    action: "reply_later",
    label: "Later",
    icon: Clock3Icon,
    variant: "outline",
  },
  {
    action: "delegate",
    label: "Delegate",
    icon: ForwardIcon,
    variant: "outline",
  },
  {
    action: "archive",
    label: "Archive",
    icon: ArchiveIcon,
    variant: "outline",
  },
  {
    action: "done",
    label: "Done",
    icon: CheckCheckIcon,
    variant: "default",
  },
]

export function EmailQuickActions({
  emailId,
  disabled = false,
  onAction,
}: EmailQuickActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map(({ action, label, icon: Icon, variant }) => (
        <Button
          key={action}
          variant={variant}
          size="sm"
          disabled={disabled}
          onClick={() => void onAction(emailId, action)}
        >
          <Icon />
          {label}
        </Button>
      ))}
    </div>
  )
}
