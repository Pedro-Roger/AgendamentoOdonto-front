import { describe, expect, test } from "vitest";

describe("login page metadata", () => {
  test("exports metadata with login-specific title + description + robots index", async () => {
    const mod = await import("../app/login/page");
    expect(mod.metadata).toBeTruthy();
    expect(String(mod.metadata.title)).toMatch(/Entrar|Login|Acessar/i);
    expect(String(mod.metadata.description ?? "").length).toBeGreaterThan(50);
    const robots = mod.metadata.robots;
    if (robots) {
      expect(robots.index).not.toBe(false);
    }
    expect(mod.metadata.alternates?.canonical).toBeTruthy();
  });
});
