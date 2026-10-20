"use client"

import { Clock, MapPin } from "lucide-react"
import { useMission } from "@/lib/mars/store"
import { Panel } from "../panel"
import { ACTION_STYLE, TypeTag } from "../badges"
import { cn } from "@/lib/utils"

export function MemoryScreen() {
  const { events } = useMission()

  const avgPriority =
    events.length > 0 ? Math.round(events.reduce((a, e) => a + e.priorityScore, 0) / events.length) : 0
  const investigated = events.filter((e) => e.decision === "INVESTIGATE").length
  const avoided = events.filter((e) => e.decision === "AVOID" || e.decision === "RE-ROUTE").length

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Panel title="Mission Memory" subtitle="Chronological log of every observation and decision">
          {events.length === 0 ? (
            <p className="py-16 text-center font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              No mission events yet — execute a decision to write to memory
            </p>
          ) : (
            <ol className="relative space-y-4 border-l border-border pl-5">
              {events.map((e) => {
                const s = ACTION_STYLE[e.decision]
                return (
                  <li key={e.id} className="relative animate-rise">
                    <span className={cn("absolute -left-[26px] top-1.5 h-3 w-3 rounded-full ring-4 ring-background", s.dot)} />
                    <div className="rounded-lg border border-border bg-panel/60 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-xs font-semibold uppercase tracking-wider text-mars">
                          SOL {String(e.sol).padStart(3, "0")} — {e.time}
                        </span>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider",
                            s.bg,
                            s.border,
                            s.text,
                          )}
                        >
                          {e.decision}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="font-mono text-sm font-semibold">{e.targetId}</span>
                        <TypeTag type={e.objectType} />
                        <span className="truncate text-xs text-muted-foreground">{e.targetLabel}</span>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-4">
                        <Metric label="Priority" value={`${e.priorityScore}`} accent="text-mars" />
                        <Metric label="Confidence" value={`${Math.round(e.confidence)}%`} />
                        <Metric label="Science" value={`${e.scientificScore}`} />
                        <Metric label="Risk" value={`${e.riskScore}`} />
                      </div>
                      <div className="mt-2 flex items-center gap-1.5 border-t border-border pt-2 text-[11px] text-muted-foreground">
                        <MapPin className="h-3 w-3 shrink-0 text-tech" />
                        <span>
                          Result: <span className="text-foreground">{e.result}</span> @ grid{" "}
                          {e.roverPos.x.toFixed(0)}, {e.roverPos.y.toFixed(0)}
                        </span>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ol>
          )}
        </Panel>
      </div>

      <div className="space-y-4">
        <Panel title="Mission Summary">
          <div className="grid grid-cols-2 gap-3">
            <Summary label="Events" value={events.length} icon={<Clock className="h-4 w-4 text-tech" />} />
            <Summary label="Avg Priority" value={avgPriority} accent="text-mars" />
            <Summary label="Investigated" value={investigated} accent="text-safe" />
            <Summary label="Avoided / Rerouted" value={avoided} accent="text-warn" />
          </div>
        </Panel>
      </div>
    </div>
  )
}

function Metric({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div>
      <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className={cn("font-mono text-sm font-bold tabular-nums", accent ?? "text-foreground")}>{value}</p>
    </div>
  )
}

function Summary({
  label,
  value,
  accent,
  icon,
}: {
  label: string
  value: number
  accent?: string
  icon?: React.ReactNode
}) {
  return (
    <div className="rounded-md border border-border bg-panel/60 p-3">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">{label}</span>
        {icon}
      </div>
      <p className={cn("mt-1 font-mono text-2xl font-bold tabular-nums", accent ?? "text-foreground")}>{value}</p>
    </div>
  )
}
