"use client"

import { cn } from "@/lib/utils"
import { useMission } from "@/lib/mars/store"

const KIND: Record<string, string> = {
  info: "text-muted-foreground",
  ok: "text-safe",
  warn: "text-warn",
}

export function MissionLog({ className }: { className?: string }) {
  const { log } = useMission()
  return (
    <div className={cn("space-y-1 overflow-y-auto font-mono text-[11px] leading-relaxed", className)}>
      {log.length === 0 && <p className="text-muted-foreground/60">System idle…</p>}
      {log.map((l) => (
        <div key={l.id} className="flex gap-2">
          <span className="shrink-0 text-muted-foreground/40">{">"}</span>
          <span className={cn(KIND[l.kind])}>{l.text}</span>
        </div>
      ))}
    </div>
  )
}
