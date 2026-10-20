"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"
import { useMission } from "@/lib/mars/store"
import { ACTION_STYLE } from "./badges"
import { Radar } from "lucide-react"

export function CameraFeed({
  interactive = false,
  showBoxes = true,
  className,
}: {
  interactive?: boolean
  showBoxes?: boolean
  className?: string
}) {
  const { scenario, targets, selectedId, selectTarget, status, handledIds, rescanningId } = useMission()
  if (!scenario) return null

  const scanning = status === "SCANNING" || status === "ANALYZING"
  const hasBoxes = showBoxes && targets.length > 0

  return (
    <div className={cn("relative overflow-hidden rounded-lg border border-border bg-black", className)}>
      <div className="relative aspect-[4/3] w-full">
        <Image src={scenario.image} alt={`${scenario.name} rover camera view`} fill className="object-cover" />
        <div className="pointer-events-none absolute inset-0 scanline opacity-25" />

        {/* HUD corners */}
        <div className="pointer-events-none absolute left-2 top-2 h-4 w-4 border-l-2 border-t-2 border-tech/60" />
        <div className="pointer-events-none absolute right-2 top-2 h-4 w-4 border-r-2 border-t-2 border-tech/60" />
        <div className="pointer-events-none absolute bottom-2 left-2 h-4 w-4 border-b-2 border-l-2 border-tech/60" />
        <div className="pointer-events-none absolute bottom-2 right-2 h-4 w-4 border-b-2 border-r-2 border-tech/60" />

        {/* scan sweep */}
        {scanning && (
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-x-0 top-0 h-1/2 animate-pulse-soft bg-gradient-to-b from-tech/20 to-transparent" />
            <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded bg-background/80 px-2 py-1 backdrop-blur">
              <Radar className="h-3 w-3 animate-spin text-tech" />
              <span className="font-mono text-[10px] uppercase tracking-wider text-tech">Detecting…</span>
            </div>
          </div>
        )}

        {/* detection boxes */}
        {hasBoxes &&
          targets.map((t) => {
            const selected = t.id === selectedId
            const handled = handledIds.includes(t.id)
            const rescanning = rescanningId === t.id
            const s = ACTION_STYLE[t.decision.action]
            return (
              <button
                key={t.id}
                type="button"
                disabled={!interactive}
                onClick={() => interactive && selectTarget(t.id)}
                style={{
                  left: `${t.bbox.x * 100}%`,
                  top: `${t.bbox.y * 100}%`,
                  width: `${t.bbox.w * 100}%`,
                  height: `${t.bbox.h * 100}%`,
                }}
                className={cn(
                  "absolute rounded border-2 transition-all",
                  interactive && "cursor-pointer hover:brightness-125",
                  selected ? "border-mars glow-mars" : "border-tech/70",
                  handled && "border-safe/70 opacity-70",
                  rescanning && "animate-pulse-soft border-warn",
                )}
              >
                <span
                  className={cn(
                    "absolute -top-[18px] left-0 whitespace-nowrap rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold",
                    selected ? "bg-mars text-primary-foreground" : "bg-background/85 text-foreground backdrop-blur",
                  )}
                >
                  {t.id} · {Math.round(t.confidenceLive)}%
                </span>
                <span
                  className={cn(
                    "absolute -bottom-[16px] right-0 rounded px-1 py-0.5 font-mono text-[8px] uppercase tracking-wider",
                    s.bg,
                    s.text,
                  )}
                >
                  {t.decision.action}
                </span>
              </button>
            )
          })}

        {!hasBoxes && !scanning && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-md border border-border bg-background/70 px-3 py-2 backdrop-blur">
              <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                Awaiting camera scan
              </span>
            </div>
          </div>
        )}
      </div>

      {/* footer strip */}
      <div className="flex items-center justify-between border-t border-border bg-panel/80 px-3 py-1.5">
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          NAVCAM · {scenario.code}
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-safe">
          <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-safe" /> Live
        </span>
      </div>
    </div>
  )
}
