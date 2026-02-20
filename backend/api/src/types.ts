export type RiskTier = "Low" | "Medium" | "High";

export type CapabilityManifest = {
  scopes: Array<{
    name: string;
    max_amount_cents?: number;
    resources?: string[];
    operations?: string[];
  }>;
  limits?: {
    rate_per_minute?: number;
    concurrency?: number;
  };
  restricted_operations?: string[];
};

export type TrustExplanation = {
  successRate: number;
  failureRate: number;
  disputeRate: number;
  slaRate: number;
  uptimeScore: number;
  identityAgeDays: number;
  orgTierWeight: number;
  trustModelVersion: string;
};
