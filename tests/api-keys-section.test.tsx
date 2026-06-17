import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const list = vi.fn();
const create = vi.fn();
const revoke = vi.fn();

vi.mock("@/src/lib/frontend-api", () => ({
  apiKeysApi: {
    list: (...a: any[]) => list(...a),
    create: (...a: any[]) => create(...a),
    revoke: (...a: any[]) => revoke(...a),
  },
}));

import { ApiKeysSection } from "../components/integracoes/ApiKeysSection";

describe("ApiKeysSection — gestão de API Keys", () => {
  beforeEach(() => {
    list.mockReset().mockResolvedValue([
      {
        id: "k1",
        name: "Site",
        prefix: "sk_abcd1234",
        allowedOrigins: [],
        lastUsedAt: null,
        revokedAt: null,
        createdAt: "2026-06-16",
      },
    ]);
    create.mockReset().mockResolvedValue({
      id: "k2",
      name: "Novo",
      prefix: "sk_eeee2222",
      allowedOrigins: [],
      lastUsedAt: null,
      revokedAt: null,
      createdAt: "2026-06-17",
      plaintextKey: "sk_FULLPLAINTEXTKEY",
    });
    revoke.mockReset().mockResolvedValue({});
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  it("lista chaves, cria nova exibindo plaintext, e revoga", async () => {
    render(<ApiKeysSection />);

    await waitFor(() => expect(screen.getByText("Site")).toBeTruthy());

    fireEvent.change(screen.getByPlaceholderText(/Nome da chave/i), {
      target: { value: "Novo" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Gerar chave|Nova chave|Criar/i }));

    await waitFor(() => expect(screen.getByText("sk_FULLPLAINTEXTKEY")).toBeTruthy());
    expect(create).toHaveBeenCalledWith({ name: "Novo", allowedOrigins: [] });

    const revogarBtn = await screen.findByRole("button", { name: /Revogar/i });
    fireEvent.click(revogarBtn);
    await waitFor(() => expect(revoke).toHaveBeenCalledWith("k1"));
  });
});
