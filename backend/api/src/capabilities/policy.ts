import type { CapabilityManifest } from "../types.js";

type ScopeCheckInput = {
  requestedScope: string;
  amountCents?: number;
  operation?: string;
};

export function evaluateScope(
  manifest: CapabilityManifest,
  input: ScopeCheckInput
): { allowed: boolean; reason: string } {
  if (manifest.restricted_operations?.includes(input.requestedScope)) {
    return { allowed: false, reason: "scope_restricted" };
  }

  if (input.operation && manifest.restricted_operations?.includes(input.operation)) {
    return { allowed: false, reason: "operation_restricted" };
  }

  const matchingScope = manifest.scopes.find((scope) => scope.name === input.requestedScope);
  if (!matchingScope) {
    return { allowed: false, reason: "scope_not_granted" };
  }

  if (
    typeof input.amountCents === "number" &&
    typeof matchingScope.max_amount_cents === "number" &&
    input.amountCents > matchingScope.max_amount_cents
  ) {
    return { allowed: false, reason: "scope_amount_limit_exceeded" };
  }

  if (
    input.operation &&
    Array.isArray(matchingScope.operations) &&
    matchingScope.operations.length > 0 &&
    !matchingScope.operations.includes(input.operation)
  ) {
    return { allowed: false, reason: "operation_not_granted" };
  }

  return { allowed: true, reason: "allowed" };
}
