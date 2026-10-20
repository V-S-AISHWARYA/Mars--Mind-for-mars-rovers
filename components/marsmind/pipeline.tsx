import { cn } from "@/lib/utils"
import { PIPELINE, type PipelineStage } from "@/lib/mars/pipeline"
import { Fragment } from "react"

export function PipelineStrip({
  active,
  className,
  compact = false,
}: {
  active?: PipelineStage | null
  className?: string
  compact?: boolean
}) {
  const activeIndex = active ? PIPELINE.indexOf(active) : -1
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {PIPELINE.map((stage, i) => {
        const done = activeIndex > i
        const current = activeIndex === i
        return (
          <Fragment key={stage}>
            <span
              className={cn(
                "rounded font-mono uppercase tracking-[0.14em] transition-colors",
                compact ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-1 text-[10px]",
                current
                  ? "bg-mars/15 text-mars ring-1 ring-mars/50"
                  : done
                    ? "text-tech"
                    : "text-muted-foreground/60",
              )}
            >
              {stage}
            </span>
            {i < PIPELINE.length - 1 && (
              <span
                className={cn(
                  "font-mono text-[10px]",
                  activeIndex > i ? "text-tech" : "text-muted-foreground/30",
                )}
              >
                {"\u2192"}
              </span>
            )}
          </Fragment>
        )
      })}
    </div>
  )
}
