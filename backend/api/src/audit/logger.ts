import { randomUUID } from "node:crypto";
import { query } from "../db/postgres.js";

type AuditInput = {
  actorType: "agent" | "org_admin" | "system";
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  requestId: string;
  ip?: string;
  userAgent?: string;
  details?: Record<string, unknown>;
};

export async function writeAuditLog(input: AuditInput): Promise<void> {
  await query(
    `INSERT INTO audit_logs
      (id, actor_type, actor_id, action, target_type, target_id, request_id, ip, user_agent, details_json)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb)`,
    [
      randomUUID(),
      input.actorType,
      input.actorId,
      input.action,
      input.targetType,
      input.targetId,
      input.requestId,
      input.ip ?? null,
      input.userAgent ?? null,
      JSON.stringify(input.details ?? {})
    ]
  );
}
