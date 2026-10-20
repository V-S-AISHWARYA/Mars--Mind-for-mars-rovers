import { cn } from "@/lib/utils"
import type { ActionType, ObjectType, RiskLevel } from "@/lib/mars/types"

export const ACTION_STYLE: Record<ActionType, { text: string; bg: string; border: string; dot: string }> = {
  INVESTIGATE: { text: "text-safe", bg: "bg-safe/10", border: "border-safe/40", dot: "bg-safe" },
  APPROACH: { text: "text-tech", bg: "bg-tech/10", border: "border-tech/40", dot: "bg-tech" },
  "RE-SCAN": { text: "text-warn", bg: "bg-warn/10", border: "border-warn/40", dot: "bg-warn" },
  "RE-ROUTE": { text: "text-warn", bg: "bg-warn/10", border: "border-warn/40", dot: "bg-warn" },
  AVOID: { text: "text-danger", bg: "bg-danger/10", border: "border-danger/40", dot: "bg-danger" },
}

const RISK_STYLE: Record<RiskLevel, { text: string; bg: string; border: string }> = {
  LOW: { text: "text-safe", bg: "bg-safe/10", border: "border-safe/40" },
  MEDIUM: { text: "text-warn", bg: "bg-warn/10", border: "border-warn/40" },
  HIGH: { text: "text-danger", bg: "bg-danger/10", border: "border-danger/40" },
}

export function ActionBadge({ action, className }: { action: ActionType; className?: string }) {
  const s = ACTION_STYLE[action]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wider",
        s.bg,
        s.border,
        s.text,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {action}
    </span>
  )
}

export function RiskBadge({ level, className }: { level: RiskLevel; className?: string }) {
  const s = RISK_STYLE[level]
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wider",
        s.bg,
        s.border,
        s.text,
        className,
      )}
    >
      {level} RISK
    </span>
  )
}

const TYPE_LABEL: Record<ObjectType, string> = {
  rock: "ROCK",
  boulder: "BOULDER",
  crater: "CRATER",
  formation: "FORMATION",
  marker: "MARKER",
  hazard: "HAZARD",
  unknown: "UNKNOWN",
}

export function TypeTag({ type, className }: { type: ObjectType; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground",
        className,
      )}
    >
      {TYPE_LABEL[type]}
    </span>
  )
}
