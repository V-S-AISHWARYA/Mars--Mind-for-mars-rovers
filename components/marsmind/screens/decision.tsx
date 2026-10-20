"use client"

import { CheckCircle2, HelpCircle, Play, RefreshCw, ShieldAlert } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMission } from "@/lib/mars/store"
import { CONFIDENCE_THRESHOLD } from "@/lib/mars/engine"
import type { RiskLevel } from "@/lib/mars/types"
import { Panel } from "../panel"
import { Gauge } from "../gauge"
import { ACTION_STYLE, ActionBadge, RiskBadge } from "../badges"

export function DecisionScreen({ onNavigate }: { onNavigate: (t: "map") => void }) {
  const mission = useMission()
  const { selectedTarget, status, handledIds } = mission

  if (!selectedTarget) {
    return (
      <Panel title="Decision Center">
        <p className="py-16 text-center font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          No target selected — run a camera scan and choose a target
        </p>
      </Panel>
    )
  }

  const t = selectedTarget
  const s = ACTION_STYLE[t.decision.action]
  const handled = handledIds.includes(t.id)
  const busy = status === "EXECUTING" || status === "SCANNING" || status === "ANALYZING"
  const isRescan = t.decision.action === "RE-SCAN"

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Big decision card */}
      <div className="lg:col-span-2">
        <div className={cn("rounded-xl border-2 p-6", s.border, s.bg)}>
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Recommended Action
            </span>
            <RiskBadge level={t.decision.riskLevel} />
          </div>

          <div className="mt-2 flex items-center gap-3">
            <span className={cn("h-3 w-3 rounded-full", s.dot)} />
            <h1 className={cn("font-mono text-4xl font-bold tracking-tight md:text-5xl", s.text)}>
              {t.decision.action}
            </h1>
          </div>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground text-pretty">{t.decision.summary}</p>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <MiniStat label="Priority" value={`${t.priorityScore}`} sub="/ 100" accent="text-mars" />
            <MiniStat
              label="Confidence"
              value={`${Math.round(t.confidenceLive)}%`}
              accent={t.confidenceLive >= CONFIDENCE_THRESHOLD ? "text-safe" : "text-warn"}
            />
            <MiniStat label="Terrain Risk" value={`${t.metrics.terrainRisk}`} sub="/ 100" accent={riskColor(t.decision.riskLevel)} />
          </div>

          <RiskMeter level={t.decision.riskLevel} />

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {handled ? (
              <span className="inline-flex items-center gap-2 rounded-md border border-safe/40 bg-safe/10 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-safe">
                <CheckCircle2 className="h-4 w-4" /> Action executed
              </span>
            ) : (
              <button
                onClick={() => (isRescan ? mission.rescan(t.id) : mission.executeAction(t.id))}
                disabled={busy}
                className={cn(
                  "inline-flex items-center gap-2 rounded-md border px-5 py-2.5 font-mono text-sm font-semibold uppercase tracking-wider transition-transform hover:scale-[1.02] disabled:opacity-50",
                  s.bg,
                  s.border,
                  s.text,
                )}
              >
                {isRescan ? <RefreshCw className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isRescan ? "Initiate Re-scan" : `Execute ${t.decision.action}`}
              </button>
            )}
            <button
              onClick={() => onNavigate("map")}
              className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
            >
              View on map
            </button>
          </div>
        </div>

        {/* Alternatives */}
        <Panel title="Alternative Actions" className="mt-4">
          <div className="grid gap-2 sm:grid-cols-3">
            {t.decision.alternatives.map((alt) => (
              <div key={alt.action} className="rounded-md border border-border bg-panel/60 p-3">
                <ActionBadge action={alt.action} />
                <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{alt.note}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Right rail: reasoning + explainable AI + active perception */}
      <div className="space-y-4">
        <Panel title="Decision Reasoning">
          <ul className="space-y-2">
            {t.decision.reasons.map((r, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", s.dot)} />
                <span className="text-pretty text-foreground">{r}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <ActivePerception />

        <Panel title="Explainable AI">
          <dl className="space-y-3">
            <Explain q="What was detected?" a={`${t.label} — classified as ${t.type.toUpperCase()}.`} />
            <Explain
              q="How confident is the AI?"
              a={`${Math.round(t.confidenceLive)}% ${t.confidenceLive >= CONFIDENCE_THRESHOLD ? "— above" : "— below"} the ${CONFIDENCE_THRESHOLD}% threshold.`}
            />
            <Explain q="How important scientifically?" a={`${t.metrics.scientificValue}/100 scientific value.`} />
            <Explain q="How relevant to the mission?" a={`${t.metrics.missionRelevance}/100 mission relevance.`} />
            <Explain q="How risky is it?" a={`Terrain risk ${t.metrics.terrainRisk}/100 (${t.decision.riskLevel}).`} />
            <Explain q="Why this action?" a={t.decision.reasons[0]} />
          </dl>
        </Panel>
      </div>
    </div>
  )
}

function ActivePerception() {
  const mission = useMission()
  const t = mission.selectedTarget
  if (!t) return null

  const wasUncertain = t.confidence < CONFIDENCE_THRESHOLD
  if (!wasUncertain) return null

  const steps = [
    "Object detected",
    `Confidence ${t.confidence}% below threshold`,
    "RE-SCAN — change viewpoint",
    "New image acquired",
    "Re-analysis",
    t.rescanned ? `Updated: ${Math.round(t.confidenceLive)}%` : "Awaiting re-scan",
  ]

  return (
    <Panel
      title="Active Perception"
      right={
        <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-warn">
          <HelpCircle className="h-3 w-3" /> Uncertainty
        </span>
      }
    >
      <div className="space-y-2">
        <div className="flex items-center justify-around gap-2 rounded-md border border-border bg-panel/60 p-3">
          <Gauge value={t.confidence} unit="%" size={72} stroke={6} label="Initial" colorClass="text-warn" />
          <RefreshCw className="h-5 w-5 text-muted-foreground" />
          <Gauge
            value={t.rescanned ? t.confidenceLive : 0}
            unit="%"
            size={72}
            stroke={6}
            label="After re-scan"
            colorClass="text-safe"
          />
        </div>
        <ol className="space-y-1">
          {steps.map((step, i) => {
            const done = t.rescanned || i < 2
            return (
              <li key={i} className="flex items-center gap-2 font-mono text-[11px]">
                <span
                  className={cn(
                    "flex h-4 w-4 items-center justify-center rounded-full text-[8px]",
                    done ? "bg-safe/20 text-safe" : "bg-secondary text-muted-foreground",
                  )}
                >
                  {i + 1}
                </span>
                <span className={done ? "text-foreground" : "text-muted-foreground"}>{step}</span>
              </li>
            )
          })}
        </ol>
        {!t.rescanned && (
          <button
            onClick={() => mission.rescan(t.id)}
            className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-md border border-warn/40 bg-warn/10 px-3 py-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-warn transition-colors hover:bg-warn/20"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Re-scan for a second viewpoint
          </button>
        )}
      </div>
    </Panel>
  )
}

function Explain({ q, a }: { q: string; a: string }) {
  return (
    <div>
      <dt className="font-mono text-[10px] font-semibold uppercase tracking-wider text-tech">{q}</dt>
      <dd className="mt-0.5 text-sm text-muted-foreground text-pretty">{a}</dd>
    </div>
  )
}

function MiniStat({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent: string }) {
  return (
    <div className="rounded-md border border-border bg-background/40 p-3">
      <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className={cn("font-mono text-2xl font-bold tabular-nums", accent)}>
        {value}
        {sub && <span className="text-xs text-muted-foreground"> {sub}</span>}
      </p>
    </div>
  )
}

function riskColor(level: RiskLevel) {
  return level === "LOW" ? "text-safe" : level === "MEDIUM" ? "text-warn" : "text-danger"
}

function RiskMeter({ level }: { level: RiskLevel }) {
  const segments: { key: RiskLevel; label: string; color: string }[] = [
    { key: "LOW", label: "LOW", color: "bg-safe" },
    { key: "MEDIUM", label: "MEDIUM", color: "bg-warn" },
    { key: "HIGH", label: "HIGH", color: "bg-danger" },
  ]
  return (
    <div className="mt-5">
      <div className="mb-1 flex items-center gap-1.5">
        <ShieldAlert className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Risk Level</span>
      </div>
      <div className="flex gap-1">
        {segments.map((seg) => {
          const active = seg.key === level
          return (
            <div key={seg.key} className="flex-1">
              <div className={cn("h-2 rounded-full transition-opacity", active ? seg.color : "bg-border")} />
              <span
                className={cn(
                  "mt-1 block text-center font-mono text-[9px] uppercase tracking-wider",
                  active ? "text-foreground" : "text-muted-foreground/50",
                )}
              >
                {seg.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
