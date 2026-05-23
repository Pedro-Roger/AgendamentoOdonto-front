import { describe, expect, test } from "vitest";
import sitemap from "../app/sitemap";

describe("sitemap.ts", () => {
  test("lists only public routes", () => {
    const entries = sitemap();
    const urls = entries.map((e) => e.url);
    expect(urls.some((u) => u.endsWith("/"))).toBe(true);
    expect(urls.some((u) => u.endsWith("/login"))).toBe(true);
    expect(urls.some((u) => /dashboard|pacientes|prontuario|configuracoes|assinatura|sign|api/.test(u))).toBe(false);
  });

  test("entries have lastModified + priority", () => {
    const entries = sitemap();
    for (const e of entries) {
      expect(e.lastModified).toBeDefined();
      expect(typeof e.priority).toBe("number");
    }
  });
});
