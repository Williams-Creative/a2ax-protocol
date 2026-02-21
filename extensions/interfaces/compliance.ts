/**
 * Compliance interface - abstract contract only.
 * No logic, no A2AX-specific references, optional.
 */

export interface ComplianceVerifyInput {
  agentId: string;
  jurisdiction?: string;
}

export interface ComplianceVerifyResult {
  allowed: boolean;
  reason?: string;
}

export interface ComplianceCheckInput {
  operation: string;
  context?: Record<string, unknown>;
}

export interface ComplianceCheckResult {
  allowed: boolean;
  reason?: string;
}

export interface ComplianceInterface {
  verifyJurisdiction(input: ComplianceVerifyInput): Promise<ComplianceVerifyResult>;
  checkPolicy(input: ComplianceCheckInput): Promise<ComplianceCheckResult>;
}
