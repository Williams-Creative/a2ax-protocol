# A2AX-Core Protocol Identity Charter

## Naming Doctrine

**A2AX-Core** = project, implementation, brand identity  
**A2AX-Core Protocol** = formal specification, normative behavior  
**A2AX Ecosystem** = umbrella for A2AX-Core and future layers (A2AX-E, A2AX-Extensions, A2AX-Services)

Always write: **A2AX-Core** or **A2AX-Core Protocol**. Never shorten to "A2AX" alone.

---

## 1. Purpose

**A2AX-Core** defines a standardized trust and verification layer for autonomous systems.

It provides portable cryptographic identity, explicit capability declaration, verifier-controlled trust evaluation, and secure agent-to-agent handshake mechanisms.

A2AX-Core exists to enable:

* Verifiable agent identity
* Portable, registry-independent credentials
* Context-aware capability negotiation
* Secure session establishment
* Neutral, platform-independent trust coordination

A2AX-Core defines the foundational trust substrate upon which autonomous economic, operational, and coordination systems may be built.

It is infrastructure — not platform.

---

## 2. Core Primitive: Portable Agent Identity Certificate

**Definition**

> A2AX-Core Identity Certificate:
> A self-contained, cryptographically signed identity artifact enabling an autonomous agent to prove authorship, declared capabilities, and issuance provenance without reliance on centralized registries.

For the purposes of this protocol:

> An **agent** is any autonomous system capable of initiating, executing, or participating in computational, operational, or economic interactions.

This includes, but is not limited to:

* AI software agents
* Multi-agent orchestration systems
* Robotic systems
* Autonomous services
* Distributed machine actors

The protocol defines identity structure, issuance rules, verification logic, and handshake requirements.

It does not define intelligence, economic valuation, governance, or legal classification.

---

## 3. Scope Boundaries

A2AX-Core:

* Defines certificate structure
* Defines Ed25519-based signing and verification requirements
* Defines replay protection mechanisms
* Defines capability declaration schema
* Defines verifier trust store interfaces
* Defines trust scoring integration points
* Defines agent-to-agent handshake flow
* Defines portable verification procedures

A2AX-Core does **not**:

* Define token systems
* Define economic policy
* Mandate blockchain usage
* Require centralized registries
* Impose governance structures
* Define marketplace logic
* Control compliance frameworks

The protocol is a minimal trust layer.

All higher-order systems remain external.

---

## 4. Trust Model & Verifier Sovereignty

A2AX-Core is verifier-centric.

Trust is determined exclusively by the verifying party.

The protocol:

* Embeds no mandatory trust anchors
* Enforces no centralized authority
* Requires no global root of trust
* Performs no live registry dependency
* Does not enforce universal revocation infrastructure

Each verifier maintains:

* Its own trust store
* Its own trust policy
* Its own scoring logic
* Its own acceptance thresholds

Trust evaluation is programmable, contextual, and locally sovereign.

---

## 5. Neutrality Principle

A2AX-Core SHALL:

* Remain vendor-neutral
* Remain platform-neutral
* Remain governance-neutral
* Remain jurisdiction-neutral
* Remain chain-neutral
* Remain implementation-agnostic

No organization, including original contributors, may embed structural control into the protocol core.

All ecosystem services — hosting, analytics, scoring, compliance tooling — must remain optional and external.

Neutrality is a structural property, not a marketing claim.

---

## 6. Portability Principle

A2AX-Core identity certificates are:

* Self-contained
* Cryptographically verifiable
* Transferable across networks
* Usable without centralized lookup

Verification must be possible using:

* The identity certificate
* The issuer’s public key
* The verifier’s local trust configuration

Portability ensures resilience and prevents systemic dependency.

---

## 7. Capability Declaration Principle

Agents MUST explicitly declare capabilities within identity certificates.

Capabilities:

* Are scope-defined
* May include quantitative limits
* Are cryptographically bound to identity
* Do not imply automatic trust

Trust decisions remain contextual.

Capabilities describe declared function.
Trust determines permitted interaction.

---

## 8. Layered Architecture Principle

A2AX-Core enforces strict separation of concerns:

```
Application / Agent Layer
        ↓
A2AX-Core Protocol Layer (Identity + Verification + Handshake)
        ↓
Verifier Trust Policy Layer
        ↓
Optional Extensions (Economic, Compliance, Analytics)
```

The core protocol MUST NOT directly depend on:

* Economic coordination systems
* Intelligence layers
* Analytics services
* Centralized infrastructure
* Any specific implementation

Extensions integrate via defined interfaces without coupling to core verification logic.

---

## 9. Extensibility Principle

A2AX-Core is designed for forward compatibility.

The protocol permits:

* Custom trust scoring engines
* Compliance overlays
* Economic coordination layers
* Escrow modules
* Additional handshake negotiation metadata
* Cross-protocol interoperability adapters

Core cryptographic verification rules must remain stable and minimal.

Backward compatibility takes precedence over feature expansion.

---

## 10. Fork Test (Integrity Safeguard)

A2AX-Core satisfies the following condition:

> If all references to any specific organization, trust bundle provider, ecosystem service, or implementation are removed, the protocol core MUST continue to function correctly.

This ensures:

* Long-term neutrality
* Resistance to central capture
* Structural independence
* Ecosystem defensibility

Neutrality must survive contributor turnover.

---

## 11. Strategic Positioning

A2AX-Core defines trust primitives for autonomous agents.

It does not define:

* Agent intelligence
* Agent economics
* Agent marketplaces
* Agent governance
* Legal recognition frameworks

Those systems may build on A2AX-Core but remain external to it.

A2AX-Core is the trust substrate.

---

## 12. Long-Term Vision

A2AX-Core aims to become:

* A neutral trust standard for agent-to-agent interaction
* A portable identity and verification layer for autonomous systems
* A foundational primitive for secure multi-agent coordination
* A protocol-level alternative to centralized trust registries

Its durability depends on:

* Minimalism
* Cryptographic integrity
* Verifier sovereignty
* Strict scope boundaries
* Neutral governance

A2AX-Core must remain smaller than the systems built on top of it.

---

## Closing Statement

A2AX-Core exists to standardize how autonomous agents identify, authenticate, declare capabilities, and establish verifiable trust — without embedding authority, marketplace logic, or centralized control.

The protocol defines verification structure.
The ecosystem defines usage.

Trust is programmable.
Authority is not embedded.
