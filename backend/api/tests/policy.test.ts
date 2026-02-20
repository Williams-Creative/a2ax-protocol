import { describe, expect, it } from "vitest";
import { evaluateScope } from "../src/capabilities/policy.js";

describe("capability policy", () => {
  it("allows granted scope with amount under cap", () => {
    const result = evaluateScope(
      {
        scopes: [{ name: "request_payment", max_amount_cents: 50000 }],
        restricted_operations: []
      },
      { requestedScope: "request_payment", amountCents: 49000 }
    );
    expect(result.allowed).toBe(true);
  });

  it("denies when amount exceeds cap", () => {
    const result = evaluateScope(
      {
        scopes: [{ name: "request_payment", max_amount_cents: 50000 }],
        restricted_operations: []
      },
      { requestedScope: "request_payment", amountCents: 51000 }
    );
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("scope_amount_limit_exceeded");
  });
});
