import type { RiskTier, TrustExplanation } from "../types.js";

type TrustInput = {
  successCount: number;
  failureCount: number;
  disputeCount: number;
  slaMetCount: number;
  slaTotalCount: number;
  identityAgeDays: number;
  orgTier: string;
  uptimeReliability: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function computeTrustScore(input: TrustInput): {
  score: number;
  riskTier: RiskTier;
  explanation: TrustExplanation;
} {
  const total = Math.max(1, input.successCount + input.failureCount);
  const successRate = input.successCount / total;
  const failureRate = input.failureCount / total;
  const disputeRate = input.disputeCount / total;
  const slaRate = input.slaTotalCount > 0 ? input.slaMetCount / input.slaTotalCount : 0.5;
  const uptimeScore = clamp(input.uptimeReliability, 0, 1);
  const ageScore = clamp(input.identityAgeDays / 365, 0, 1);
  const orgTierWeight = input.orgTier === "enterprise" ? 1 : input.orgTier === "verified" ? 0.6 : 0.3;

  const raw =
    successRate * 35 +
    (1 - failureRate) * 20 +
    (1 - disputeRate) * 15 +
    slaRate * 12 +
    uptimeScore * 8 +
    ageScore * 5 +
    orgTierWeight * 5;

  const score = clamp(Math.round(raw), 0, 100);
  const riskTier: RiskTier = score >= 75 ? "Low" : score >= 45 ? "Medium" : "High";

  return {
    score,
    riskTier,
    explanation: {
      successRate,
      failureRate,
      disputeRate,
      slaRate,
      uptimeScore,
      identityAgeDays: input.identityAgeDays,
      orgTierWeight,
      trustModelVersion: "v1"
    }
  };
}
