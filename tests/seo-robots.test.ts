import { describe, expect, test } from "vitest";
import robots from "../app/robots";

describe("robots.ts", () => {
  test("allows / and /login, disallows everything else", () => {
    const result = robots();
    expect(Array.isArray(result.rules) || typeof result.rules === "object").toBe(true);
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
    const all = rules.find((r) => r.userAgent === "*" || (Array.isArray(r.userAgent) && r.userAgent.includes("*")));
    expect(all).toBeDefined();
    const allow = ([] as string[]).concat(all!.allow ?? []);
    const disallow = ([] as string[]).concat(all!.disallow ?? []);
    expect(allow).toEqual(expect.arrayContaining(["/", "/login"]));
    expect(disallow).toEqual(
      expect.arrayContaining([
        "/dashboard",
        "/pacientes",
        "/prontuario",
        "/configuracoes",
        "/assinatura",
        "/sign",
        "/api",
      ])
    );
  });

  test("declares sitemap URL", () => {
    const result = robots();
    expect(result.sitemap).toBeTruthy();
    expect(String(result.sitemap)).toMatch(/sitemap\.xml$/);
  });
});
