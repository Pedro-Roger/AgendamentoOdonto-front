import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

const getFormSettings = vi.fn();
const createFormSettings = vi.fn();

vi.mock("@/src/lib/frontend-api", () => ({
  adminApi: {
    getFormSettings: (...a: any[]) => getFormSettings(...a),
    createFormSettings: (...a: any[]) => createFormSettings(...a),
  },
}));

vi.mock("next/navigation", () => ({ usePathname: () => "/configuracoes/anamnese", useRouter: () => ({ push: () => {}, replace: () => {} }) }));

import AnamnesePage from "../app/configuracoes/anamnese/page";

describe("SDD Phase 3 / Slice 4 — Anamnese builder", () => {
  beforeEach(() => {
    getFormSettings.mockReset();
    createFormSettings.mockReset();
  });

  it("loads existing form settings and renders fields", async () => {
    getFormSettings.mockResolvedValue({
      id: "f1",
      createdAt: "2026-05-21T00:00:00Z",
      fields: [
        { key: "motivo", label: "Motivo da consulta", type: "text" },
        { key: "alergia", label: "Possui alergia?", type: "radio" },
      ],
    });

    render(<AnamnesePage />);

    expect(await screen.findByDisplayValue("Motivo da consulta")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Possui alergia?")).toBeInTheDocument();
  });

  it("adds a new field via sidebar button", async () => {
    getFormSettings.mockResolvedValue({ id: "f1", createdAt: "x", fields: [] });
    render(<AnamnesePage />);
    await screen.findByText(/nenhuma pergunta/i);

    fireEvent.click(screen.getByRole("button", { name: /adicionar texto longo/i }));

    expect(await screen.findAllByLabelText(/r[óo]tulo da pergunta/i)).toHaveLength(1);
  });

  it("removes a field when trash is clicked", async () => {
    getFormSettings.mockResolvedValue({
      id: "f1",
      createdAt: "x",
      fields: [{ key: "a", label: "Pergunta A", type: "text" }],
    });
    render(<AnamnesePage />);
    await screen.findByDisplayValue("Pergunta A");

    fireEvent.click(screen.getByRole("button", { name: /remover pergunta 1/i }));
    await waitFor(() => {
      expect(screen.queryByDisplayValue("Pergunta A")).not.toBeInTheDocument();
    });
  });

  it("publishes form via createFormSettings with all current fields", async () => {
    getFormSettings.mockResolvedValue({
      id: "f1",
      createdAt: "x",
      fields: [{ key: "k1", label: "Motivo", type: "text" }],
    });
    createFormSettings.mockResolvedValue({});

    render(<AnamnesePage />);
    await screen.findByDisplayValue("Motivo");

    fireEvent.click(screen.getByRole("button", { name: /publicar formul[áa]rio/i }));

    await waitFor(() => {
      expect(createFormSettings).toHaveBeenCalledWith([
        expect.objectContaining({ label: "Motivo", type: "text" }),
      ]);
    });
  });
});
