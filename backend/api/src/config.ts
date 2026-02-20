import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z
  .object({
    PORT: z.coerce.number().int().positive().default(8080),
    HOST: z.string().default("0.0.0.0"),
    DATABASE_URL: z.string().url(),
    REDIS_URL: z.string().url(),
    ISSUER_KID: z.string().min(1).default("identity-ca-v1"),
    ISSUER_PRIVATE_JWK: z.string().optional(),
    ISSUER_PRIVATE_JWK_FILE: z.string().optional(),
    KMS_KEY_ARN: z.string().optional(),
    AWS_REGION: z.string().optional(),
    TIMESTAMP_SKEW_MS: z.coerce.number().int().positive().default(60_000),
    NONCE_TTL_SECONDS: z.coerce.number().int().positive().default(120),
    ADMIN_API_KEY: z.string().min(16),
    ADMIN_JWT_TTL_SECONDS: z.coerce.number().int().positive().default(900),
    RATE_LIMIT_PER_MINUTE: z.coerce.number().int().positive().default(120),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development")
  })
  .refine(
    (data) =>
      Boolean(data.ISSUER_PRIVATE_JWK || data.ISSUER_PRIVATE_JWK_FILE || data.KMS_KEY_ARN),
    { message: "Provide ISSUER_PRIVATE_JWK, ISSUER_PRIVATE_JWK_FILE, or KMS_KEY_ARN" }
  );

const parsedEnv = envSchema.safeParse(process.env);
if (!parsedEnv.success) {
  throw new Error(`Invalid environment configuration: ${parsedEnv.error.message}`);
}

const env = parsedEnv.data;

export const config = {
  port: env.PORT,
  host: env.HOST,
  databaseUrl: env.DATABASE_URL,
  redisUrl: env.REDIS_URL,
  issuerKid: env.ISSUER_KID,
  issuerPrivateJwk: env.ISSUER_PRIVATE_JWK,
  issuerPrivateJwkFile: env.ISSUER_PRIVATE_JWK_FILE,
  kmsKeyArn: env.KMS_KEY_ARN,
  awsRegion: env.AWS_REGION,
  timestampSkewMs: env.TIMESTAMP_SKEW_MS,
  nonceTtlSeconds: env.NONCE_TTL_SECONDS,
  adminApiKey: env.ADMIN_API_KEY,
  adminJwtTtlSeconds: env.ADMIN_JWT_TTL_SECONDS,
  rateLimitPerMinute: env.RATE_LIMIT_PER_MINUTE,
  nodeEnv: env.NODE_ENV
};
