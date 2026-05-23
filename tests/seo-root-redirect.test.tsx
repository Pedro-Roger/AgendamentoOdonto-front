import { describe, expect, test, vi } from "vitest";

const permanentMock = vi.fn();
const tempMock = vi.fn();
vi.mock("next/navigation", () => ({
  permanentRedirect: (...args: unknown[]) => permanentMock(...args),
  redirect: (...args: unknown[]) => tempMock(...args),
}));

describe("app/page.tsx", () => {
  test("uses permanentRedirect (308) to /login", async () => {
    const mod = await import("../app/page");
    mod.default();
    expect(permanentMock).toHaveBeenCalledWith("/login");
    expect(tempMock).not.toHaveBeenCalled();
  });
});
