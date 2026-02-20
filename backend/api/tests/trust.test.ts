import { describe, expect, it } from "vitest";
import { computeTrustScore } from "../src/trust/engine.js";

describe("trust engine", () => {
  it("produces deterministic score and low risk for strong metrics", () => {
    const result = computeTrustScore({
      successCount: 1000,
      failureCount: 20,
      disputeCount: 2,
      slaMetCount: 980,
      slaTotalCount: 1000,
      identityAgeDays: 720,
      orgTier: "enterprise",
      uptimeReliability: 0.999
    });

    expect(result.score).toBeGreaterThanOrEqual(75);
    expect(result.riskTier).toBe("Low");
    expect(result.explanation.trustModelVersion).toBe("v1");
  });

  it("produces higher risk with poor metrics", () => {
    const result = computeTrustScore({
      successCount: 10,
      failureCount: 80,
      disputeCount: 40,
      slaMetCount: 1,
      slaTotalCount: 20,
      identityAgeDays: 1,
      orgTier: "unverified",
      uptimeReliability: 0.6
    });

    expect(result.score).toBeLessThan(45);
    expect(result.riskTier).toBe("High");
  });
});
