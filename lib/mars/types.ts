export type ObjectType =
  | "rock"
  | "boulder"
  | "crater"
  | "formation"
  | "marker"
  | "hazard"
  | "unknown"

export type ActionType = "APPROACH" | "INVESTIGATE" | "RE-SCAN" | "AVOID" | "RE-ROUTE"

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH"

/** Raw factors that describe a detected target. All 0-100 unless noted. */
export interface TargetMetrics {
  scientificValue: number
  missionRelevance: number
  novelty: number
  accessibility: number
  terrainRisk: number
  /** meters from the rover */
  distance: number
  /** relative energy cost to reach/act on target, 0-100 */
  energyCost: number
}

/** Normalized bounding box, values 0-1 relative to the source image. */
export interface BBox {
  x: number
  y: number
  w: number
  h: number
}

export interface DetectionSeed {
  id: string
  label: string
  type: ObjectType
  confidence: number
  bbox: BBox
  /** position on the mission map, 0-100 grid space */
  mapPos: { x: number; y: number }
  metrics: TargetMetrics
  /** used only for the low-confidence active-perception scenario */
  rescanConfidence?: number
  rescanLabel?: string
  rescanType?: ObjectType
  notes?: string
}

export interface MissionObjective {
  id: string
  name: string
  description: string
  weights: FactorWeights
}

export interface FactorWeights {
  scientificValue: number
  missionRelevance: number
  accessibility: number
  novelty: number
  terrainRisk: number
  distance: number
  energyCost: number
}

export interface Scenario {
  id: string
  code: string
  name: string
  summary: string
  image: string
  objectiveId: string
  roverStart: { x: number; y: number }
  hazards: { x: number; y: number; r: number }[]
  safeZones: { x: number; y: number; r: number }[]
  detections: DetectionSeed[]
}

export interface DecisionResult {
  action: ActionType
  riskLevel: RiskLevel
  priorityScore: number
  reasons: string[]
  alternatives: { action: ActionType; note: string }[]
  summary: string
}

/** A fully analyzed target: seed + computed decision + live confidence. */
export interface AnalyzedTarget extends DetectionSeed {
  confidenceLive: number
  priorityScore: number
  decision: DecisionResult
  rescanned: boolean
}

export interface MissionEvent {
  id: string
  sol: number
  time: string
  timestamp: number
  roverPos: { x: number; y: number }
  targetId: string
  targetLabel: string
  objectType: ObjectType
  confidence: number
  scientificScore: number
  riskScore: number
  priorityScore: number
  decision: ActionType
  action: string
  result: string
}

export type MissionStatus = "IDLE" | "SCANNING" | "ANALYZING" | "AWAITING_DECISION" | "EXECUTING" | "COMPLETE"

export interface RoverState {
  pos: { x: number; y: number }
  heading: number
  energy: number
  sol: number
  distanceTraveled: number
}
