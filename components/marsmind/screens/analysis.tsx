"use client"

import { cn } from "@/lib/utils"
import { useMission } from "@/lib/mars/store"
import { distanceCost, getObjective } from "@/lib/mars/engine"
import { Panel } from "../panel"
import { CameraFeed } from "../camera-feed"
import { Gauge, FactorBar } from "../gauge"
import { FactorRadar } from "../radar"
import { ActionBadge, TypeTag } from "../badges"

export function AnalysisScreen() {
  const mission = useMission()
  const { ranked, selectedTarget, selectedId, selectTarget } = mission
  const weights = getObjective(mission.objectiveId).weights

  return (
    <div className="space-y-4">
      {/* target chips */}
      {ranked.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {ranked.map((t) => (
            <button
              key={t.id}
              onClick={() => selectTarget(t.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors",
                t.id === selectedId
                  ? "border-mars/60 bg-mars/10 text-mars"
                  : "border-border bg-panel/60 text-muted-foreground hover:text-foreground",
              )}
            >
              {t.id}
              <span className="font-bold text-foreground">{t.priorityScore}</span>
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Panel title="Detection & Bounding Boxes" bodyClassName="p-3">
            <CameraFeed interactive />
          </Panel>

          {selectedTarget && (
            <Panel title="Factor Analysis" subtitle={`${selectedTarget.id} · ${selectedTarget.label}`}>
              <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                <FactorBar label="Scientific Value" value={selectedTarget.metrics.scientificValue} />
                <FactorBar label="Mission Relevance" value={selectedTarget.metrics.missionRelevance} />
                <FactorBar label="Novelty" value={selectedTarget.metrics.novelty} />
                <FactorBar label="Accessibility" value={selectedTarget.metrics.accessibility} />
                <FactorBar label="Terrain Risk" value={selectedTarget.metrics.terrainRisk} invert />
                <FactorBar label="Distance Cost" value={distanceCost(selectedTarget.metrics.distance)} invert />
              </div>
            </Panel>
          )}

          {selectedTarget && (
            <Panel title="Priority Computation" subtitle="Transparent weighted model">
              <PriorityBreakdown target={selectedTarget} weights={weights} />
            </Panel>
          )}
        </div>

        <div className="space-y-4">
          {selectedTarget ? (
            <>
              <Panel title="Classification">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-lg font-bold">{selectedTarget.id}</p>
                    <p className="text-sm text-muted-foreground">{selectedTarget.label}</p>
                  </div>
                  <TypeTag type={selectedTarget.type} />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <ActionBadge action={selectedTarget.decision.action} />
                  {selectedTarget.rescanned && (
                    <span className="font-mono text-[10px] uppercase tracking-wider text-safe">Re-scanned</span>
                  )}
                </div>
              </Panel>

              <Panel title="Scores">
                <div className="flex items-center justify-around gap-2">
                  <Gauge
                    value={selectedTarget.priorityScore}
                    label="Priority"
                    sublabel="/ 100"
                    colorClass="text-mars"
                  />
                  <Gauge
                    value={selectedTarget.confidenceLive}
                    label="AI Confidence"
                    unit="%"
                    colorClass={selectedTarget.confidenceLive >= 55 ? "text-safe" : "text-warn"}
                  />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border pt-3 text-center">
                  <div>
                    <p className="font-mono text-lg font-bold tabular-nums text-tech">
                      {Math.round(selectedTarget.metrics.distance)}m
                    </p>
                    <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Distance</p>
                  </div>
                  <div>
                    <p className="font-mono text-lg font-bold tabular-nums text-tech">
                      {selectedTarget.metrics.energyCost}
                    </p>
                    <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Energy cost</p>
                  </div>
                </div>
              </Panel>

              <Panel title="Factor Profile">
                <div className="flex justify-center">
                  <FactorRadar
                    axes={[
                      { label: "SCIENCE", value: selectedTarget.metrics.scientificValue },
                      { label: "RELEVANCE", value: selectedTarget.metrics.missionRelevance },
                      { label: "NOVELTY", value: selectedTarget.metrics.novelty },
                      { label: "ACCESS", value: selectedTarget.metrics.accessibility },
                      { label: "SAFETY", value: 100 - selectedTarget.metrics.terrainRisk },
                      { label: "PROXIMITY", value: 100 - distanceCost(selectedTarget.metrics.distance) },
                    ]}
                  />
                </div>
              </Panel>
            </>
          ) : (
            <Panel title="Scores">
              <p className="py-10 text-center font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                Run a scan and select a target to view its analysis
              </p>
            </Panel>
          )}
        </div>
      </div>
    </div>
  )
}

function PriorityBreakdown({
  target,
  weights,
}: {
  target: ReturnType<typeof useMission>["ranked"][number]
  weights: ReturnType<typeof getObjective>["weights"]
}) {
  const m = target.metrics
  const rows = [
    { label: "Scientific Value", w: weights.scientificValue, v: m.scientificValue, sign: 1 },
    { label: "Mission Relevance", w: weights.missionRelevance, v: m.missionRelevance, sign: 1 },
    { label: "Accessibility", w: weights.accessibility, v: m.accessibility, sign: 1 },
    { label: "Novelty", w: weights.novelty, v: m.novelty, sign: 1 },
    { label: "Terrain Risk", w: weights.terrainRisk, v: m.terrainRisk, sign: -1 },
    { label: "Distance Cost", w: weights.distance, v: distanceCost(m.distance), sign: -1 },
    { label: "Energy Cost", w: weights.energyCost, v: m.energyCost, sign: -1 },
  ]
  return (
    <div className="space-y-1">
      {rows.map((r) => {
        const contrib = r.sign * r.w * r.v
        return (
          <div key={r.label} className="flex items-center justify-between gap-3 font-mono text-xs">
            <span className="text-muted-foreground">{r.label}</span>
            <span className="text-muted-foreground/60">
              {r.sign < 0 ? "−" : "+"}
              {r.w.toFixed(2)} × {Math.round(r.v)}
            </span>
            <span className={cn("w-14 text-right font-semibold tabular-nums", r.sign < 0 ? "text-danger" : "text-safe")}>
              {contrib >= 0 ? "+" : ""}
              {contrib.toFixed(1)}
            </span>
          </div>
        )
      })}
      <div className="mt-2 flex items-center justify-between border-t border-border pt-2 font-mono text-sm">
        <span className="font-semibold uppercase tracking-wider">Priority Score</span>
        <span className="text-lg font-bold text-mars">{target.priorityScore} / 100</span>
      </div>
    </div>
  )
}
