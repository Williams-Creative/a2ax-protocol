const baseUrl = process.env.PILOT_BASE_URL ?? "http://localhost:8080";
const adminApiKey = process.env.ADMIN_API_KEY;

if (!adminApiKey) {
  throw new Error("ADMIN_API_KEY is required for pilot smoke test");
}

function headers(extra = {}) {
  return {
    "content-type": "application/json",
    "x-admin-api-key": adminApiKey,
    ...extra
  };
}

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`Request failed ${path}: ${response.status} ${JSON.stringify(body)}`);
  }
  return body;
}

async function main() {
  const org = await request("/v1/orgs", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ name: "Pilot Org", verification_tier: "verified" })
  });

  const agent = await request("/v1/agents/register", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      org_id: org.org_id,
      display_name: "pilot-agent",
      public_jwk: {
        kty: "OKP",
        crv: "Ed25519",
        x: "fM8n7sJ63D8i-5J1zm5J-4zwW2WfY9HqT1t9Jv5hw9Q"
      },
      capability_manifest: {
        scopes: [{ name: "data_access" }],
        restricted_operations: []
      }
    })
  });

  const trustEvent = await request("/v1/trust/events", {
    method: "POST",
    headers: { "content-type": "application/json", "x-agent-id": agent.agent_id },
    body: JSON.stringify({
      agent_id: agent.agent_id,
      type: "availability_probe",
      success: true,
      sla_met: true,
      raw: { uptime_reliability: 0.997 }
    })
  });

  const trust = await request(`/v1/agents/${agent.agent_id}/trust`);
  const audit = await request("/v1/audit?limit=5", { headers: headers() });

  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify(
      {
        ok: true,
        org_id: org.org_id,
        agent_id: agent.agent_id,
        trust_event_id: trustEvent.id,
        trust_score: trust.score,
        risk_tier: trust.riskTier,
        audit_rows: audit.rows.length
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
