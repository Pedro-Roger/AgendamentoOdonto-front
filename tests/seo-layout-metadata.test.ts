import { describe, expect, test } from "vitest";
import { metadata, viewport } from "../app/layout";

describe("root layout metadata", () => {
  test("has metadataBase", () => {
    expect(metadata.metadataBase).toBeInstanceOf(URL);
  });

  test("title uses template", () => {
    const t = metadata.title as { default: string; template: string };
    expect(t.default).toMatch(/Sorriso/);
    expect(t.template).toContain("%s");
  });

  test("description ≥ 120 chars", () => {
    expect(String(metadata.description ?? "").length).toBeGreaterThanOrEqual(120);
  });

  test("declares openGraph + twitter + icons + manifest + robots + applicationName", () => {
    expect(metadata.openGraph).toBeTruthy();
    expect(metadata.twitter).toBeTruthy();
    expect(metadata.icons).toBeTruthy();
    expect(metadata.manifest).toBeTruthy();
    expect(metadata.robots).toBeTruthy();
    expect(metadata.applicationName).toBeTruthy();
  });

  test("viewport defines themeColor + width", () => {
    expect(viewport.themeColor).toBeTruthy();
    expect(viewport.width).toBe("device-width");
  });
});
