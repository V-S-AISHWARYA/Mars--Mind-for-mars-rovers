"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  LayoutDashboard,
  ScanEye,
  Gavel,
  Map as MapIcon,
  History,
  Loader2,
  Radar,
  Play,
  RotateCcw,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useMission } from "@/lib/mars/store"
import { getObjective } from "@/lib/mars/engine"
import { MarsMindMark } from "./logo"
import { PipelineStrip } from "./pipeline"
import { ACTION_STYLE } from "./badges"
import { MissionBriefing } from "./mission-briefing"
import { DashboardScreen } from "./screens/dashboard"
import { AnalysisScreen } from "./screens/analysis"
import { DecisionScreen } from "./screens/decision"
import { MarsMapScreen } from "./screens/mars-map"
import { MemoryScreen } from "./screens/memory"

type Tab = "dashboard" | "analysis" | "decision" | "map" | "memory"

const TABS: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "analysis", label: "AI Analysis", icon: ScanEye },
  { id: "decision", label: "Decision", icon: Gavel },
  { id: "map", label: "Mars Map", icon: MapIcon },
  { id: "memory", label: "Memory", icon: History },
]

const STATUS_STYLE: Record<string, string> = {
  IDLE: "text-muted-foreground",
  SCANNING: "text-tech",
  ANALYZING: "text-tech",
  AWAITING_DECISION: "text-warn",
  EXECUTING: "text-mars",
  COMPLETE: "text-safe",
}

export function MissionShell() {
  const mission = useMission()
  const params = useSearchParams()
  const [tab, setTab] = useState<Tab>("dashboard")
  const started = useRef(false)

  useEffect(() => {
    const s = params.get("scenario")
    if (s && !started.current) {
      started.current = true
      mission.startMission(s)
    }
  }, [params, mission])

  if (!mission.scenario) {
    return (
      <MissionBriefing
        onSelect={(id) => {
          started.current = true
          mission.startMission(id)
        }}
      />
    )
  }

  const { scenario, status, rover, progress } = mission
  const objective = getObjective(mission.objectiveId)
  const clock = mission.log.length // placeholder to keep re-renders honest

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none fixed inset-0 grid-backdrop opacity-40" />

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto max-w-[1400px] px-4">
          <div className="flex flex-wrap items-center justify-between gap-3 py-2.5">
            <div className="flex items-center gap-3">
              <Link href="/" aria-label="Home" className="flex items-center gap-2">
                <MarsMindMark className="h-7 w-7" />
                <span className="font-mono text-sm font-bold tracking-[0.16em]">
                  MARS<span className="text-mars">MIND</span>
                </span>
              </Link>
              <span className="hidden h-4 w-px bg-border sm:block" />
              <div className="hidden sm:block">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-mars/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-mars">
                    {scenario.code}
                  </span>
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider">{scenario.name}</span>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Objective: {objective.name}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2" data-clock={clock}>
              <Telemetry label="SOL" value={String(rover.sol).padStart(3, "0")} />
              <Telemetry label="STATUS" value={status.replace("_", " ")} accent={STATUS_STYLE[status]} />
              <Telemetry label="ENERGY" value={`${rover.energy}%`} />
              <Telemetry label="DRIVEN" value={`${rover.distanceTraveled}m`} />
              <PrimaryCTA />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
            <nav className="flex items-center gap-1">
              {TABS.map((t) => {
                const active = tab === t.id
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider transition-colors",
                      active
                        ? "bg-mars/15 text-mars ring-1 ring-mars/40"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                    )}
                  >
                    <t.icon className="h-3.5 w-3.5" />
                    <span className="hidden md:inline">{t.label}</span>
                  </button>
                )
              })}
            </nav>
            <PipelineStrip active={mission.stage} compact className="hidden lg:flex" />
          </div>
        </div>
        {/* progress line */}
        <div className="h-0.5 w-full bg-border">
          <div className="h-full bg-mars transition-all duration-700" style={{ width: `${progress}%` }} />
        </div>
      </header>

      <main className="relative mx-auto max-w-[1400px] px-4 py-5">
        {tab === "dashboard" && <DashboardScreen onNavigate={setTab} />}
        {tab === "analysis" && <AnalysisScreen />}
        {tab === "decision" && <DecisionScreen onNavigate={setTab} />}
        {tab === "map" && <MarsMapScreen />}
        {tab === "memory" && <MemoryScreen />}
      </main>
    </div>
  )
}

function Telemetry({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="hidden flex-col items-end rounded-md border border-border bg-panel/60 px-2.5 py-1 sm:flex">
      <span className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground">{label}</span>
      <span className={cn("font-mono text-xs font-semibold tabular-nums", accent ?? "text-foreground")}>{value}</span>
    </div>
  )
}

function PrimaryCTA() {
  const mission = useMission()
  const { status, targets, selectedTarget } = mission
  const busy = status === "SCANNING" || status === "ANALYZING" || status === "EXECUTING"

  if (busy) {
    return (
      <button
        disabled
        className="inline-flex items-center gap-2 rounded-md border border-border bg-secondary px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground"
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        {status === "EXECUTING" ? "Executing" : status === "SCANNING" ? "Scanning" : "Analyzing"}
      </button>
    )
  }

  if (status === "COMPLETE") {
    return (
      <button
        onClick={() => mission.reset()}
        className="inline-flex items-center gap-2 rounded-md border border-safe/40 bg-safe/10 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-safe transition-colors hover:bg-safe/20"
      >
        <RotateCcw className="h-4 w-4" /> New Mission
      </button>
    )
  }

  if (targets.length === 0) {
    return (
      <button
        onClick={() => mission.runScan()}
        className="glow-mars inline-flex items-center gap-2 rounded-md bg-mars px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-primary-foreground transition-transform hover:scale-[1.02]"
      >
        <Radar className="h-4 w-4" /> Run Camera Scan
      </button>
    )
  }

  if (selectedTarget) {
    const action = selectedTarget.decision.action
    const s = ACTION_STYLE[action]
    return (
      <button
        onClick={() => mission.executeAction(selectedTarget.id)}
        className={cn(
          "inline-flex items-center gap-2 rounded-md border px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider transition-transform hover:scale-[1.02]",
          s.bg,
          s.border,
          s.text,
        )}
      >
        <Play className="h-4 w-4" /> {action === "RE-SCAN" ? "Re-scan Target" : `Execute ${action}`}
      </button>
    )
  }

  return null
}
