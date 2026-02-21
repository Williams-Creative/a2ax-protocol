/**
 * Revocation provider interface.
 * Protocol defines the contract; implementation is injectable.
 * Revocation must not depend on A2AX-operated infrastructure.
 */

export interface RevocationProvider {
  isRevoked(agentId: string): Promise<boolean>;
}
