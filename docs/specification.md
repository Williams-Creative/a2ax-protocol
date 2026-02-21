# A2AX v1.0

## Agent-to-Agent Exchange Protocol

### Open Trust & Identity Layer for Autonomous Systems

**Status:** Draft v1.0  
**Category:** Standards Track  
**Intended Audience:** Protocol Engineers, Infrastructure Architects, Autonomous Systems Developers

---

## Abstract

A2AX defines a neutral, interoperable protocol for agent-to-agent identity verification and trust exchange across independent autonomous systems.

The protocol specifies:

* Agent identity structure
* Certificate format
* Cryptographic verification rules
* Trust anchor handling
* Revocation mechanisms
* Optional registry interaction

A2AX does not define trust policy, trusted issuers, or governance decisions. These remain verifier-controlled and externally configurable.

A2AX is designed to operate across:

* Public and private agent networks
* Independent organizations
* Federated ecosystems
* Autonomous economic systems

---

## Design Principles

1. **Neutrality** — The protocol defines verification mechanics, not who must be trusted.
2. **Verifier Sovereignty** — Trust anchors are controlled locally.
3. **Portability** — Certificates must verify without mandatory registry calls.
4. **Extensibility** — Economic and settlement layers may be built atop A2AX.
5. **Fork Safety** — No embedded root authority.
6. **Interoperability** — Cross-organizational verification at first meeting.

---

## Non-Goals

A2AX does not:

* Operate a mandatory global registry
* Embed a default trust anchor list
* Define governance of issuers
* Enforce economic or settlement models

---

## Terminology

* **Agent** — An autonomous system capable of cryptographic identity.
* **Issuer** — Entity that signs agent certificates.
* **Verifier** — Agent validating another agent's credentials.
* **Trust Anchor** — Public key of an issuer trusted by a verifier.
* **Registry** — Optional service for certificate discovery and revocation.
