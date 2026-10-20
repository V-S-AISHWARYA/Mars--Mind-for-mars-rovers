"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react"
import { computePriority, decide, getObjective, rescanConfidence } from "./engine"
import { getScenario } from "./scenarios"
import { PIPELINE, type PipelineStage } from "./pipeline"
import type {
  AnalyzedTarget,
  MissionEvent,
  MissionStatus,
  RoverState,
  Scenario,
} from "./types"

export { PIPELINE, type PipelineStage }

interface MissionState {
  scenario: Scenario | null
  objectiveId: string
  status: MissionStatus
  stage: PipelineStage | null
  rover: RoverState
  targets: AnalyzedTarget[]
  selectedId: string | null
  handledIds: string[]
  events: MissionEvent[]
  log: { id: string; text: string; kind: "info" | "warn" | "ok" }[]
  minuteClock: number
  rescanningId: string | null
}

const initialRover: RoverState = {
  pos: { x: 18, y: 78 },
  heading: 45,
  energy: 100,
  sol: 24,
  distanceTraveled: 0,
}

const initialState: MissionState = {
  scenario: null,
  objectiveId: "geology",
  status: "IDLE",
  stage: null,
  rover: initialRover,
  targets: [],
  selectedId: null,
  handledIds: [],
  events: [],
  log: [],
  minuteClock: 872, // 14:32
  rescanningId: null,
}

type Action =
  | { type: "START"; scenario: Scenario }
  | { type: "STATUS"; status: MissionStatus; stage?: PipelineStage | null }
  | { type: "SET_TARGETS"; targets: AnalyzedTarget[]; selectedId: string | null }
  | { type: "SELECT"; id: string }
  | { type: "RESCAN_START"; id: string }
  | { type: "RESCAN_DONE"; target: AnalyzedTarget }
  | { type: "EXECUTE"; rover: RoverState; event: MissionEvent; handledId: string; status: MissionStatus }
  | { type: "LOG"; text: string; kind?: "info" | "warn" | "ok" }
  | { type: "RESET" }

function timeString(minutes: number): string {
  const m = ((minutes % 1440) + 1440) % 1440
  const hh = Math.floor(m / 60)
  const mm = m % 60
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`
}

function reducer(state: MissionState, action: Action): MissionState {
  switch (action.type) {
    case "START": {
      const objectiveId = action.scenario.objectiveId
      const sol = 20 + Math.floor(Math.random() * 20)
      return {
        ...initialState,
        scenario: action.scenario,
        objectiveId,
        status: "IDLE",
        stage: null,
        minuteClock: 500 + Math.floor(Math.random() * 600),
        rover: {
          ...initialRover,
          pos: { ...action.scenario.roverStart },
          sol,
          energy: 100,
          distanceTraveled: 0,
        },
        log: [{ id: crypto.randomUUID(), text: `Mission ${action.scenario.code} initialized — ${action.scenario.name}`, kind: "info" }],
      }
    }
    case "STATUS":
      return { ...state, status: action.status, stage: action.stage ?? state.stage }
    case "SET_TARGETS":
      return { ...state, targets: action.targets, selectedId: action.selectedId }
    case "SELECT":
      return { ...state, selectedId: action.id }
    case "RESCAN_START":
      return { ...state, rescanningId: action.id, status: "SCANNING", stage: "SEE" }
    case "RESCAN_DONE": {
      const targets = state.targets.map((t) => (t.id === action.target.id ? action.target : t))
      return { ...state, targets, rescanningId: null, status: "AWAITING_DECISION", stage: "DECIDE" }
    }
    case "EXECUTE": {
      return {
        ...state,
        rover: action.rover,
        events: [action.event, ...state.events],
        handledIds: [...state.handledIds, action.handledId],
        status: action.status,
        stage: "REMEMBER",
      }
    }
    case "LOG":
      return {
        ...state,
        log: [{ id: crypto.randomUUID(), text: action.text, kind: action.kind ?? "info" }, ...state.log].slice(0, 60),
      }
    case "RESET":
      return initialState
    default:
      return state
  }
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

interface MissionContextValue extends MissionState {
  startMission: (scenarioId: string) => void
  runScan: () => Promise<void>
  selectTarget: (id: string) => void
  rescan: (id: string) => Promise<void>
  executeAction: (id: string) => Promise<void>
  reset: () => void
  selectedTarget: AnalyzedTarget | null
  ranked: AnalyzedTarget[]
  progress: number
}

const MissionContext = createContext<MissionContextValue | null>(null)

export function MissionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const stateRef = useRef(state)
  stateRef.current = state

  const analyzeSeed = useCallback((scenario: Scenario) => {
    const weights = getObjective(scenario.objectiveId).weights
    const targets: AnalyzedTarget[] = scenario.detections.map((seed) => {
      const priorityScore = computePriority(seed.metrics, weights)
      const decision = decide({
        metrics: seed.metrics,
        confidence: seed.confidence,
        priorityScore,
        label: seed.label,
        alreadyRescanned: false,
      })
      return {
        ...seed,
        confidenceLive: seed.confidence,
        priorityScore,
        decision,
        rescanned: false,
      }
    })
    return targets
  }, [])

  const startMission = useCallback((scenarioId: string) => {
    dispatch({ type: "START", scenario: getScenario(scenarioId) })
  }, [])

  const runScan = useCallback(async () => {
    const scenario = stateRef.current.scenario
    if (!scenario) return
    dispatch({ type: "STATUS", status: "SCANNING", stage: "SEE" })
    dispatch({ type: "LOG", text: "Camera capture acquired — running detection pass", kind: "info" })
    await delay(900)
    dispatch({ type: "STATUS", status: "ANALYZING", stage: "UNDERSTAND" })
    dispatch({ type: "LOG", text: `${scenario.detections.length} object(s) detected — classifying`, kind: "info" })
    await delay(800)
    const targets = analyzeSeed(scenario)
    dispatch({ type: "STATUS", status: "ANALYZING", stage: "EVALUATE" })
    dispatch({ type: "LOG", text: "Evaluating scientific value, risk, novelty and accessibility", kind: "info" })
    await delay(800)
    const ranked = [...targets].sort((a, b) => b.priorityScore - a.priorityScore)
    const top = ranked[0]
    dispatch({ type: "SET_TARGETS", targets, selectedId: top?.id ?? null })
    dispatch({ type: "STATUS", status: "ANALYZING", stage: "PRIORITIZE" })
    dispatch({
      type: "LOG",
      text: `Priority ranking complete — top target ${top?.id} @ ${top?.priorityScore}/100`,
      kind: "ok",
    })
    await delay(700)
    dispatch({ type: "STATUS", status: "AWAITING_DECISION", stage: "DECIDE" })
    dispatch({
      type: "LOG",
      text: `Decision: ${top?.decision.action} — ${top?.decision.summary}`,
      kind: top?.decision.action === "AVOID" ? "warn" : "ok",
    })
  }, [analyzeSeed])

  const selectTarget = useCallback((id: string) => {
    dispatch({ type: "SELECT", id })
  }, [])

  const rescan = useCallback(async (id: string) => {
    const target = stateRef.current.targets.find((t) => t.id === id)
    if (!target) return
    dispatch({ type: "RESCAN_START", id })
    dispatch({ type: "LOG", text: `Active perception: repositioning for a second viewpoint of ${id}`, kind: "warn" })
    await delay(1100)
    dispatch({ type: "STATUS", status: "ANALYZING", stage: "UNDERSTAND" })
    await delay(800)
    const newConfidence = rescanConfidence(target)
    const newLabel = target.rescanLabel ?? target.label
    const newType = target.rescanType ?? target.type
    const weights = getObjective(stateRef.current.objectiveId).weights
    const priorityScore = computePriority(target.metrics, weights)
    const decision = decide({
      metrics: target.metrics,
      confidence: newConfidence,
      priorityScore,
      label: newLabel,
      alreadyRescanned: true,
    })
    const updated: AnalyzedTarget = {
      ...target,
      label: newLabel,
      type: newType,
      confidenceLive: newConfidence,
      priorityScore,
      decision,
      rescanned: true,
    }
    dispatch({ type: "RESCAN_DONE", target: updated })
    dispatch({
      type: "LOG",
      text: `Re-scan complete — ${id} confidence ${target.confidenceLive}% → ${newConfidence}%, classified as ${newLabel}`,
      kind: "ok",
    })
    dispatch({ type: "LOG", text: `Updated decision: ${decision.action}`, kind: "ok" })
  }, [])

  const executeAction = useCallback(async (id: string) => {
    const s = stateRef.current
    const target = s.targets.find((t) => t.id === id)
    const scenario = s.scenario
    if (!target || !scenario) return
    const action = target.decision.action

    if (action === "RE-SCAN") {
      await rescan(id)
      return
    }

    dispatch({ type: "STATUS", status: "EXECUTING", stage: "ACT" })
    dispatch({ type: "LOG", text: `Executing ${action} on ${id}`, kind: "info" })
    await delay(1400)

    const start = s.rover.pos
    const tp = target.mapPos
    let dest = { ...start }
    let result = ""

    if (action === "INVESTIGATE") {
      dest = { ...tp }
      result = "Target reached — instruments deployed"
    } else if (action === "APPROACH") {
      dest = { x: start.x + (tp.x - start.x) * 0.7, y: start.y + (tp.y - start.y) * 0.7 }
      result = `Closed to ~${Math.round(target.metrics.distance * 0.3)}m — imaging`
    } else if (action === "RE-ROUTE") {
      const mid = scenario.safeZones[0] ?? { x: (start.x + tp.x) / 2, y: (start.y + tp.y) / 2 }
      dest = { x: (mid.x + tp.x) / 2, y: (mid.y + tp.y) / 2 - 6 }
      result = "Re-routed around hazard field"
    } else if (action === "AVOID") {
      const safe = scenario.safeZones[0] ?? start
      dest = { x: start.x + (safe.x - start.x) * 0.4, y: start.y + (safe.y - start.y) * 0.4 }
      result = "Target avoided — logged for remote observation"
    }

    const dx = dest.x - start.x
    const dy = dest.y - start.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    const heading = (Math.atan2(dy, dx) * 180) / Math.PI
    const energyUse = Math.round(dist * 0.4 + target.metrics.energyCost * 0.1)

    const event: MissionEvent = {
      id: crypto.randomUUID(),
      sol: s.rover.sol,
      time: timeString(s.minuteClock),
      timestamp: Date.now(),
      roverPos: dest,
      targetId: target.id,
      targetLabel: target.label,
      objectType: target.type,
      confidence: target.confidenceLive,
      scientificScore: target.metrics.scientificValue,
      riskScore: target.metrics.terrainRisk,
      priorityScore: target.priorityScore,
      decision: action,
      action: target.decision.summary,
      result,
    }

    const handledCount = new Set([...s.handledIds, id]).size
    const done = handledCount >= s.targets.length
    const rover: RoverState = {
      ...s.rover,
      pos: dest,
      heading,
      energy: Math.max(0, s.rover.energy - energyUse),
      distanceTraveled: s.rover.distanceTraveled + Math.round(dist),
    }
    dispatch({
      type: "EXECUTE",
      rover,
      event,
      handledId: id,
      status: done ? "COMPLETE" : "AWAITING_DECISION",
    })
    dispatch({ type: "LOG", text: `${id}: ${result}`, kind: "ok" })
    if (done) dispatch({ type: "LOG", text: "All targets resolved — mission objective complete", kind: "ok" })
  }, [rescan])

  const reset = useCallback(() => dispatch({ type: "RESET" }), [])

  const selectedTarget = useMemo(
    () => state.targets.find((t) => t.id === state.selectedId) ?? null,
    [state.targets, state.selectedId],
  )
  const ranked = useMemo(
    () => [...state.targets].sort((a, b) => b.priorityScore - a.priorityScore),
    [state.targets],
  )
  const progress = useMemo(() => {
    if (state.targets.length === 0) return 0
    return Math.round((state.handledIds.length / state.targets.length) * 100)
  }, [state.targets.length, state.handledIds.length])

  const value: MissionContextValue = {
    ...state,
    startMission,
    runScan,
    selectTarget,
    rescan,
    executeAction,
    reset,
    selectedTarget,
    ranked,
    progress,
  }

  return <MissionContext.Provider value={value}>{children}</MissionContext.Provider>
}

export function useMission() {
  const ctx = useContext(MissionContext)
  if (!ctx) throw new Error("useMission must be used within MissionProvider")
  return ctx
}
