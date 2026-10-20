"use client"

import { Check, Crown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMission } from "@/lib/mars/store"
import { ActionBadge, TypeTag } from "./badges"

export function TargetList({ showRank = true }: { showRank?: boolean }) {
  const { ranked, selectedId, selectTarget, handledIds } = useMission()

  if (ranked.length === 0) {
    return (
      <p className="py-6 text-center font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
        No targets — run a camera scan
      </p>
    )
  }

  return (
    <ul className="space-y-1.5">
      {ranked.map((t, i) => {
        const selected = t.id === selectedId
        const handled = handledIds.includes(t.id)
        return (
          <li key={t.id}>
            <button
              onClick={() => selectTarget(t.id)}
              className={cn(
                "w-full rounded-md border p-2.5 text-left transition-colors",
                selected
                  ? "border-mars/60 bg-mars/10"
                  : "border-border bg-panel/60 hover:border-border/80 hover:bg-secondary/60",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  {showRank && (
                    <span
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded font-mono text-[10px] font-bold",
                        i === 0 ? "bg-mars/20 text-mars" : "bg-secondary text-muted-foreground",
                      )}
                    >
                      {i === 0 ? <Crown className="h-3 w-3" /> : i + 1}
                    </span>
                  )}
                  <span className="truncate font-mono text-xs font-semibold">{t.id}</span>
                  <TypeTag type={t.type} />
                  {handled && <Check className="h-3.5 w-3.5 text-safe" />}
                </div>
                <span className="shrink-0 font-mono text-sm font-bold tabular-nums text-mars">{t.priorityScore}</span>
              </div>
              <p className="mt-1 truncate text-[11px] text-muted-foreground">{t.label}</p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-border">
                  <div className="h-full rounded-full bg-mars" style={{ width: `${t.priorityScore}%` }} />
                </div>
                <ActionBadge action={t.decision.action} />
              </div>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
