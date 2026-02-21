export { hashJsonBody, verifyAgentJwt } from "@a2ax/protocol";
import { getIssuerSigner } from "./issuer-signer.js";

export async function signCertificate(payload: Record<string, unknown>): Promise<string> {
  const signer = await getIssuerSigner();
  return signer.sign(payload);
}
