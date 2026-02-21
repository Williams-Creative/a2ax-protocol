/**
 * TrustScoring interface - abstract contract only.
 * No implementation, no A2AX-specific references.
 */

import type { AttestationGraph } from "@a2ax/protocol";

export type RiskTier = "Low" | "Medium" | "High";

export interface TrustScoringInput {
  agentId: string;
  attestationGraph: AttestationGraph;
}

export interface TrustScoringResult {
  score: number;
  riskTier: RiskTier;
}

export interface TrustScoringInterface {
  compute(input: TrustScoringInput): Promise<TrustScoringResult>;
}
