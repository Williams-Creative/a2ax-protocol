/**
 * Portable A2AX Agent Certificate format.
 * Verification works without contacting the registry.
 */

export type A2AXAgentCertificatePayload = {
  agent_id: string;
  public_key?: string;
  public_jwk?: Record<string, unknown>;
  org_id?: string;
  capability_manifest_hash?: string;
  status?: string;
  revocation_url?: string;
  metadata?: Record<string, unknown>;
};

export type A2AXAgentCertificate = {
  /** JWT/JWS string (compact serialization) */
  jws: string;
  /** Decoded payload for inspection */
  payload: A2AXAgentCertificatePayload & {
    iss?: string;
    exp?: number;
    iat?: number;
  };
};

export type PortableVerificationInput = {
  certificateJws: string;
  issuerPublicKey: IssuerPublicKey;
  revocationStatus?: "active" | "revoked";
  requireRevocationCheck?: boolean;
};

export type IssuerPublicKey =
  | { format: "jwk"; key: Record<string, unknown> }
  | { format: "pem"; key: string };

export type PortableVerificationResult =
  | { valid: true; payload: Record<string, unknown> }
  | { valid: false; reason: string };
