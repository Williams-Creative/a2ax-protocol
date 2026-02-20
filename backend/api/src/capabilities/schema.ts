import { z } from "zod";

export const capabilityManifestSchema = z.object({
  scopes: z.array(
    z.object({
      name: z.string().min(1),
      max_amount_cents: z.number().int().nonnegative().optional(),
      resources: z.array(z.string()).optional(),
      operations: z.array(z.string()).optional()
    })
  ),
  limits: z
    .object({
      rate_per_minute: z.number().int().positive().optional(),
      concurrency: z.number().int().positive().optional()
    })
    .optional(),
  restricted_operations: z.array(z.string()).optional()
});

export type CapabilityManifestInput = z.infer<typeof capabilityManifestSchema>;
