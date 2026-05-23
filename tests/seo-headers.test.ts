import { describe, expect, test } from "vitest";
import config from "../next.config.mjs";

describe("next.config headers", () => {
  test("X-Robots-Tag noindex for private + sensitive paths", async () => {
    expect(typeof config.headers).toBe("function");
    const headers = await (config.headers as () => Promise<Array<{ source: string; headers: Array<{ key: string; value: string }> }>>)();
    const sources = headers.map((h) => h.source);
    for (const path of [
      "/dashboard/:path*",
      "/pacientes/:path*",
      "/prontuario/:path*",
      "/configuracoes/:path*",
      "/assinatura/:path*",
      "/sign/:path*",
      "/api/:path*",
    ]) {
      expect(sources).toContain(path);
    }
    for (const h of headers) {
      const tag = h.headers.find((x) => x.key.toLowerCase() === "x-robots-tag");
      expect(tag).toBeTruthy();
      expect(tag!.value).toMatch(/noindex/);
      expect(tag!.value).toMatch(/nofollow/);
    }
  });
});
