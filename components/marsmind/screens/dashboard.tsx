"use client"

import { ArrowRight, Crosshair, Gauge as GaugeIcon, Target } from "lucide-react"
import { useMission } from "@/lib/mars/store"
import { getObjective } from "@/lib/mars/engine"
import { Panel, StatLine } from "../panel"
import { CameraFeed } from "../camera-feed"
import { TargetList } from "../target-list"
import { MissionLog } from "../mission-log"
import { ActionBadge, RiskBadge } from "../badges"

export function DashboardScreen({ onNavigate }: { onNavigate: (t: "analysis" | "decision" | "map" | "memory") => void }) {
  const mission = useMission()
  const { scenario, rover, progress, status, selectedTarget, targets } = mission
  if (!scenario) return null
  const objective = getObjective(mission.objectiveId)

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Camera + current action */}
      <div className="space-y-4 lg:col-span-2">
        <Panel
          title="Simulated Rover Camera"
          subtitle={scenario.summary}
          right={
            <button
              onClick={() => onNavigate("analysis")}
              className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-tech hover:underline"
            >
              Analyze <ArrowRight className="h-3 w-3" />
            </button>
          }
          bodyClassName="p-3"
        >
          <CameraFeed interactive />
        </Panel>

        <div className="grid gap-4 sm:grid-cols-2">
          <Panel title="Current Action">
            {selectedTarget ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <ActionBadge action={selectedTarget.decision.action} />
                  <RiskBadge level={selectedTarget.decision.riskLevel} />
                </div>
                <div>
                  <p className="font-mono text-xs text-muted-foreground">{selectedTarget.id} · {selectedTarget.label}</p>
                  <p className="mt-1 text-sm text-pretty">{selectedTarget.decision.summary}</p>
                </div>
                <button
                  onClick={() => onNavigate("decision")}
                  className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-mars hover:underline"
                >
                  Open decision center <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <Crosshair className="h-6 w-6 text-muted-foreground/50" />
                <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  {targets.length === 0 ? "Run a camera scan to detect targets" : "Select a target"}
                </p>
              </div>
            )}
          </Panel>

          <Panel title="Mission Objective">
            <div className="space-y-2">
              <p className="font-mono text-sm font-semibold text-tech">{objective.name}</p>
              <p className="text-sm leading-relaxed text-muted-foreground text-pretty">{objective.description}</p>
              <div className="pt-1">
                <StatLine label="Targets" value={targets.length || "—"} />
                <StatLine label="Resolved" value={mission.handledIds.length} accent="text-safe" />
              </div>
            </div>
          </Panel>
        </div>
      </div>

      {/* Right rail */}
      <div className="space-y-4">
        <Panel title="Rover Status">
          <div className="mb-3 flex items-center gap-3 rounded-md border border-border bg-secondary/50 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md border border-mars/40 bg-mars/10">
              <Target className="h-5 w-5 text-mars" />
            </div>
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-wider">MarsMind Rover</p>
              <p className="font-mono text-[10px] uppercase tracking-wider text-safe">{status.replace("_", " ")}</p>
            </div>
          </div>
          <StatLine label="Grid X / Y" value={`${rover.pos.x.toFixed(1)} · ${rover.pos.y.toFixed(1)}`} />
          <StatLine label="Heading" value={`${Math.round((rover.heading + 360) % 360)}°`} />
          <StatLine label="Energy" value={`${rover.energy}%`} accent={rover.energy > 40 ? "text-safe" : "text-warn"} />
          <StatLine label="Distance driven" value={`${rover.distanceTraveled} m`} />
          <div className="mt-3">
            <div className="mb-1 flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Mission Progress</span>
              <span className="font-mono text-xs font-semibold text-mars">{progress}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-border">
              <div className="h-full rounded-full bg-mars transition-all duration-700" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </Panel>

        <Panel
          title="Detected Objects"
          right={
            <span className="inline-flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
              <GaugeIcon className="h-3 w-3" /> ranked
            </span>
          }
        >
          <TargetList />
        </Panel>

        <Panel title="Telemetry Log">
          <MissionLog className="max-h-48" />
        </Panel>
      </div>
    </div>
  )
}
