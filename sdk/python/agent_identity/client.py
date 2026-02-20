import hashlib
import time
import uuid
from typing import Any

import jwt


def hash_body(body: Any) -> str:
    payload = "{}" if body is None else str(body)
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def sign_agent_request(
    private_key_pem: str,
    agent_id: str,
    scope: str,
    method: str,
    path: str,
    body: Any = None,
) -> dict[str, Any]:
    nonce = str(uuid.uuid4())
    timestamp = int(time.time() * 1000)
    token = jwt.encode(
        {
            "agent_id": agent_id,
            "scope": scope,
            "nonce": nonce,
            "ts": timestamp,
            "method": method.upper(),
            "path": path,
            "body_hash": hash_body(body),
        },
        private_key_pem,
        algorithm="EdDSA",
    )
    return {"token": token, "nonce": nonce, "timestamp": timestamp}


def build_handshake_request(
    private_key_pem: str,
    agent_id: str,
    requested_scopes: list[str],
    session_ttl_s: int = 300,
) -> dict[str, Any]:
    nonce = str(uuid.uuid4())
    timestamp = int(time.time() * 1000)
    token = jwt.encode(
        {
            "agent_id": agent_id,
            "nonce": nonce,
            "ts": timestamp,
            "requested_scopes": requested_scopes,
            "session_ttl_s": session_ttl_s,
        },
        private_key_pem,
        algorithm="EdDSA",
    )
    return {"token": token, "nonce": nonce, "timestamp": timestamp}
