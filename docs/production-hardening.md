# Production Hardening

Before public rollout, address the following security and operational requirements.

---

## 1. KMS for Issuer Signing

**Status:** Supported via `KMS_KEY_ARN`. When set, the API uses AWS KMS for issuer certificate signing instead of a file-based JWK.

### Setup

1. **Create a KMS asymmetric signing key** (RSA 2048 or 4096):
   ```bash
   aws kms create-key \
     --key-usage SIGN_VERIFY \
     --customer-master-key-spec RSA_2048
   ```

2. **Create an alias** (optional):
   ```bash
   aws kms create-alias \
     --alias-name alias/a2ax-issuer \
     --target-key-id <key-id>
   ```

3. **Configure the API**:
   - Set `KMS_KEY_ARN` to the key ARN (e.g. `arn:aws:kms:us-east-1:123456789012:key/...`)
   - Set `AWS_REGION` (or rely on `AWS_REGION` env / default `us-east-1`)
   - Ensure the API process has IAM permissions: `kms:Sign` on the key

4. **Docker Compose**: Add to the `api` service:
   ```yaml
   environment:
     KMS_KEY_ARN: ${KMS_KEY_ARN}
     AWS_REGION: ${AWS_REGION:-us-east-1}
   ```
   Remove or omit `ISSUER_PRIVATE_JWK_FILE` when using KMS.

### Key Rotation

- Use KMS automatic key rotation if available.
- For manual rotation: provision a new KMS key, add it with a new `ISSUER_KID`, issue certs with the new kid, then retire the old key.

---

## 2. Admin Key in Secret Manager and Rotation

**Status:** `ADMIN_API_KEY` is read from environment. Populate it from a secret manager at deploy time.

### AWS Secrets Manager

1. Store the admin key:
   ```bash
   aws secretsmanager create-secret \
     --name a2ax/admin-api-key \
     --secret-string "your-strong-admin-key-min-16-chars"
   ```

2. **At deploy time** (e.g. in ECS task definition, Kubernetes init container, or startup script):
   ```bash
   export ADMIN_API_KEY=$(aws secretsmanager get-secret-value \
     --secret-id a2ax/admin-api-key \
     --query SecretString --output text)
   ```

3. **Rotation**:
   - Create a new secret version in Secrets Manager.
   - Update the running deployment to fetch the new value.
   - Restart the API so it picks up the new key.
   - Deprecate the old secret version after a grace period.

### Kubernetes

Use a `Secret` and inject as an env var:

```yaml
env:
  - name: ADMIN_API_KEY
    valueFrom:
      secretKeyRef:
        name: a2ax-secrets
        key: admin-api-key
```

Rotate by updating the Secret and rolling the deployment.

---

## 3. TLS Termination

**Status:** The API listens on HTTP. TLS must be terminated at a reverse proxy or load balancer.

### Recommended Architecture

```
[Client] --TLS--> [Load Balancer / Reverse Proxy] --HTTP--> [API Container]
```

### Options

| Option | Notes |
|--------|-------|
| **AWS ALB** | Terminate TLS at the load balancer; use ACM for certificates. |
| **nginx / Traefik** | Run as a sidecar or front proxy; obtain certs via Let's Encrypt or ACM. |
| **Cloudflare** | Terminate TLS at the edge; use Full (strict) mode. |

### Configuration

1. **Obtain a certificate** (ACM, Let's Encrypt, or your CA).
2. **Configure the proxy** to:
   - Terminate TLS on 443
   - Proxy to `http://api:8080` (or your API host)
   - Set `X-Forwarded-For`, `X-Forwarded-Proto` if the API needs them
3. **HSTS**: Enable `Strict-Transport-Security` at the proxy.
4. **TLS version**: Disable TLS 1.0/1.1; use TLS 1.2+.

### Example nginx snippet

```nginx
server {
  listen 443 ssl http2;
  ssl_certificate     /etc/ssl/certs/a2ax.crt;
  ssl_certificate_key /etc/ssl/private/a2ax.key;
  ssl_protocols       TLSv1.2 TLSv1.3;

  location / {
    proxy_pass http://api:8080;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
  }
}
```

---

## 4. Immutable Audit Archiving

**Status:** Audit logs are stored in Postgres. For compliance and tamper-evidence, archive to an immutable store.

### Requirements

- **Append-only**: Archived data must not be modifiable or deletable by the application.
- **Retention**: Define retention policy (e.g. 7 years for compliance).
- **Integrity**: Optionally use content-addressed storage or checksums.

### Options

| Option | Notes |
|--------|-------|
| **S3 + Object Lock** | Enable S3 Object Lock (Compliance mode) on the bucket; write audit exports (JSON/NDJSON) with retention. |
| **AWS CloudTrail / CloudWatch Logs** | Stream audit events to CloudWatch; use log group retention and optional KMS encryption. |
| **WORM storage** | Use a WORM-compliant storage service per your jurisdiction. |

### Implementation Approach

1. **Scheduled export job** (cron or Lambda):
   - Query `audit_logs` for records not yet archived (e.g. `ts < now() - 1 day`).
   - Export to NDJSON or Parquet.
   - Upload to S3 with Object Lock, or append to a CloudWatch log stream.

2. **Change Data Capture (CDC)**:
   - Use Postgres logical replication or Debezium to stream `audit_logs` inserts to a queue (e.g. Kafka, SQS).
   - Consumer writes to S3/CloudWatch with retention and integrity checks.

3. **Application-level streaming** (future enhancement):
   - Extend `AuditWriter` with an optional `AuditArchiver` that receives each event and forwards to an immutable sink.
   - Keep Postgres as the primary store for querying; archiver is fire-and-forget.

### S3 Object Lock Example

```bash
# Create bucket with Object Lock (must be enabled at creation)
aws s3api create-bucket --bucket a2ax-audit-archive
aws s3api put-bucket-versioning --bucket a2ax-audit-archive \
  --versioning-configuration Status=Enabled
aws s3api put-object-lock-configuration --bucket a2ax-audit-archive \
  --object-lock-configuration '{"ObjectLockEnabled":"Enabled","Rule":{"DefaultRetention":{"Mode":"GOVERNANCE","Years":7}}}'

# Upload audit export (retention applied per object or bucket default)
aws s3 cp audit-export-2026-02-21.ndjson s3://a2ax-audit-archive/2026/02/21/audit.ndjson \
  --metadata '{"retention-years":"7"}'
```

---

## Checklist Before Production

- [ ] KMS configured for issuer signing (`KMS_KEY_ARN`) or HSM equivalent
- [ ] Admin key stored in secret manager; rotation procedure documented
- [ ] TLS termination enabled at load balancer or reverse proxy
- [ ] HSTS and modern TLS only (1.2+)
- [ ] Audit archiving to immutable store configured and tested
- [ ] Metrics and alerts operational (see `docs/deployment-and-pilot.md`)
- [ ] Incident response runbook and on-call process in place
