import "reflect-metadata";
import { describe, expect, it } from "vitest";
import { InMemoryTokenVerifier } from "./token-verifier.js";

describe("InMemoryTokenVerifier", () => {
  it("verifies a seeded token", () => {
    const verifier = new InMemoryTokenVerifier({
      abc: { id: "1", roles: ["user"] },
    });
    expect(verifier.verify("abc")).toEqual({ id: "1", roles: ["user"] });
  });

  it("returns null for an unknown token", () => {
    const verifier = new InMemoryTokenVerifier();
    expect(verifier.verify("nope")).toBeNull();
  });

  it("registers and verifies a new token", () => {
    const verifier = new InMemoryTokenVerifier();
    verifier.register("xyz", { id: "2", roles: ["admin"] });
    expect(verifier.verify("xyz")?.roles).toEqual(["admin"]);
  });

  it("revokes a token", () => {
    const verifier = new InMemoryTokenVerifier({ t: { id: "3", roles: [] } });
    expect(verifier.revoke("t")).toBe(true);
    expect(verifier.revoke("t")).toBe(false);
    expect(verifier.verify("t")).toBeNull();
  });
});
