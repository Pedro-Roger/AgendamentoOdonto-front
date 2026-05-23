import { describe, expect, test } from "vitest";

const privateLayouts = [
  "../app/dashboard/layout",
  "../app/pacientes/layout",
  "../app/prontuario/layout",
  "../app/configuracoes/layout",
  "../app/assinatura/layout",
  "../app/sign/layout",
];

describe("noindex on private/sensitive segment layouts", () => {
  for (const path of privateLayouts) {
    test(`${path} exports noindex metadata`, async () => {
      const mod = await import(path);
      const robots = mod.metadata?.robots;
      expect(robots).toBeTruthy();
      expect(robots.index).toBe(false);
      expect(robots.follow).toBe(false);
    });
  }
});

describe("not-found noindex", () => {
  test("app/not-found exports robots noindex + title", async () => {
    const mod = await import("../app/not-found");
    expect(mod.metadata.robots.index).toBe(false);
    expect(String(mod.metadata.title)).toMatch(/encontrada/i);
  });
});
