import type {
  ActionType,
  DecisionResult,
  DetectionSeed,
  FactorWeights,
  MissionObjective,
  RiskLevel,
  TargetMetrics,
} from "./types"

export const CONFIDENCE_THRESHOLD = 55

export const OBJECTIVES: MissionObjective[] = [
  {
    id: "geology",
    name: "Geology & Mineralogy",
    description: "Prioritize scientifically rich rock and mineral formations.",
    weights: {
      scientificValue: 0.38,
      missionRelevance: 0.34,
      accessibility: 0.2,
      novelty: 0.18,
      terrainRisk: 0.15,
      distance: 0.08,
      energyCost: 0.05,
    },
  },
  {
    id: "biosignature",
    name: "Biosignature Search",
    description: "Weight novelty and unusual signatures far more heavily.",
    weights: {
      scientificValue: 0.34,
      missionRelevance: 0.3,
      accessibility: 0.16,
      novelty: 0.3,
      terrainRisk: 0.12,
      distance: 0.06,
      energyCost: 0.04,
    },
  },
  {
    id: "hazard",
    name: "Hazard & Route Survey",
    description: "Value accessibility and safety, penalize risk aggressively.",
    weights: {
      scientificValue: 0.3,
      missionRelevance: 0.32,
      accessibility: 0.3,
      novelty: 0.14,
      terrainRisk: 0.3,
      distance: 0.12,
      energyCost: 0.08,
    },
  },
]

export function getObjective(id: string): MissionObjective {
  return OBJECTIVES.find((o) => o.id === id) ?? OBJECTIVES[0]
}

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, n))
}

/** Distance in meters -> 0-100 cost (60m+ is maximal cost). */
export function distanceCost(distance: number): number {
  return clamp((Math.min(distance, 60) / 60) * 100)
}

/**
 * Transparent priority model:
 * score = wS·science + wR·relevance + wA·accessibility + wN·novelty
 *        − wRisk·risk − wDist·distanceCost − wEnergy·energyCost
 * Result is clamped to 0-100.
 */
export function computePriority(metrics: TargetMetrics, weights: FactorWeights): number {
  const positives =
    weights.scientificValue * metrics.scientificValue +
    weights.missionRelevance * metrics.missionRelevance +
    weights.accessibility * metrics.accessibility +
    weights.novelty * metrics.novelty
  const negatives =
    weights.terrainRisk * metrics.terrainRisk +
    weights.distance * distanceCost(metrics.distance) +
    weights.energyCost * metrics.energyCost
  return Math.round(clamp(positives - negatives))
}

export function riskLevel(risk: number): RiskLevel {
  if (risk < 35) return "LOW"
  if (risk < 65) return "MEDIUM"
  return "HIGH"
}

interface DecideInput {
  metrics: TargetMetrics
  confidence: number
  priorityScore: number
  label: string
  alreadyRescanned: boolean
}

export function decide({
  metrics,
  confidence,
  priorityScore,
  label,
  alreadyRescanned,
}: DecideInput): DecisionResult {
  const level = riskLevel(metrics.terrainRisk)
  const reasons: string[] = []
  let action: ActionType

  if (confidence < CONFIDENCE_THRESHOLD && !alreadyRescanned) {
    action = "RE-SCAN"
    reasons.push(`Detection confidence ${Math.round(confidence)}% is below the ${CONFIDENCE_THRESHOLD}% threshold`)
    reasons.push("Active perception required to resolve classification uncertainty")
    reasons.push("A new viewpoint should sharply improve the confidence estimate")
  } else if (metrics.terrainRisk >= 75) {
    action = "AVOID"
    reasons.push(`Terrain risk is ${metrics.terrainRisk}/100 — unsafe to approach`)
    if (metrics.scientificValue >= 70) reasons.push("High scientific value noted, but rover safety takes priority")
    reasons.push("Target flagged for orbital / remote observation instead")
  } else if (metrics.terrainRisk >= 55) {
    if (priorityScore >= 55) {
      action = "RE-ROUTE"
      reasons.push(`Elevated terrain risk (${metrics.terrainRisk}/100) on the direct path`)
      reasons.push("Scientific value justifies reaching the target via a safer approach vector")
      reasons.push("Planning an alternate route around the hazard field")
    } else {
      action = "AVOID"
      reasons.push(`Elevated terrain risk (${metrics.terrainRisk}/100) with limited payoff`)
      reasons.push("Priority score does not justify the maneuvering cost")
    }
  } else if (priorityScore >= 72) {
    action = "INVESTIGATE"
    reasons.push(`High mission priority score (${priorityScore}/100)`)
    if (metrics.scientificValue >= 75) reasons.push(`High scientific value (${metrics.scientificValue}/100)`)
    if (metrics.missionRelevance >= 75) reasons.push(`Strong mission relevance (${metrics.missionRelevance}/100)`)
    if (metrics.terrainRisk < 35) reasons.push(`Low terrain risk (${metrics.terrainRisk}/100)`)
    if (metrics.accessibility >= 70) reasons.push("Target is readily accessible")
    reasons.push(`High detection confidence (${Math.round(confidence)}%)`)
  } else if (priorityScore >= 45) {
    action = "APPROACH"
    reasons.push(`Moderate priority score (${priorityScore}/100) warrants a closer look`)
    reasons.push("Approaching to gather higher-resolution data before committing instruments")
    if (metrics.distance > 25) reasons.push(`Target is ${Math.round(metrics.distance)}m away — closing distance first`)
  } else {
    action = "RE-ROUTE"
    reasons.push(`Low priority score (${priorityScore}/100)`)
    reasons.push("Better candidates likely elsewhere — redirecting survey path")
  }

  const alternatives = buildAlternatives(action, metrics, priorityScore)
  return {
    action,
    riskLevel: level,
    priorityScore,
    reasons,
    alternatives,
    summary: buildSummary(action, label),
  }
}

function buildSummary(action: ActionType, label: string): string {
  switch (action) {
    case "INVESTIGATE":
      return `Deploy instruments and perform close-up science on ${label}.`
    case "APPROACH":
      return `Drive toward ${label} to acquire higher-resolution observations.`
    case "RE-SCAN":
      return `Reposition for a second viewpoint of ${label} to resolve uncertainty.`
    case "AVOID":
      return `Do not approach ${label}; log for remote observation only.`
    case "RE-ROUTE":
      return `Plan a safer path around ${label} / redirect to a better candidate.`
  }
}

function buildAlternatives(
  chosen: ActionType,
  metrics: TargetMetrics,
  priority: number,
): { action: ActionType; note: string }[] {
  const pool: { action: ActionType; note: string }[] = [
    { action: "INVESTIGATE", note: `Full science stop (priority ${priority})` },
    { action: "APPROACH", note: "Close distance, defer instruments" },
    { action: "RE-SCAN", note: "Acquire a second viewpoint" },
    { action: "RE-ROUTE", note: "Path around the target" },
    { action: "AVOID", note: `Skip — risk ${riskLevel(metrics.terrainRisk).toLowerCase()}` },
  ]
  return pool.filter((p) => p.action !== chosen).slice(0, 3)
}

/** Active perception: a second viewpoint sharply improves confidence. */
export function rescanConfidence(seed: DetectionSeed): number {
  if (seed.rescanConfidence != null) return seed.rescanConfidence
  return Math.round(clamp(seed.confidence + 40 + Math.random() * 8))
}
