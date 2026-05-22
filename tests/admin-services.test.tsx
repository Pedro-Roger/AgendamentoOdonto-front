import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

const listServices = vi.fn();
const createService = vi.fn();
const updateService = vi.fn();

vi.mock("@/src/lib/frontend-api", () => ({
  adminApi: {
    listServices: (...a: any[]) => listServices(...a),
    createService: (...a: any[]) => createService(...a),
    updateService: (...a: any[]) => updateService(...a),
  },
}));

vi.mock("next/navigation", () => ({ usePathname: () => "/configuracoes/servicos", useRouter: () => ({ push: () => {}, replace: () => {} }) }));

import ServicosPage from "../app/configuracoes/servicos/page";

describe("SDD Phase 3 / Slice 2 — Services CRUD", () => {
  beforeEach(() => {
    listServices.mockReset();
    createService.mockReset();
    updateService.mockReset();
  });

  it("loads active services from backend and renders them", async () => {
    listServices.mockResolvedValue([
      { id: "s1", name: "Limpeza", durationMinutes: 45, isActive: true },
      { id: "s2", name: "Canal", durationMinutes: 90, isActive: true },
    ]);

    render(<ServicosPage />);

    expect(await screen.findByText("Limpeza")).toBeInTheDocument();
    expect(screen.getByText("Canal")).toBeInTheDocument();
    expect(listServices).toHaveBeenCalled();
  });

  it("shows empty state placeholder when no services", async () => {
    listServices.mockResolvedValue([]);
    render(<ServicosPage />);
    expect(await screen.findByText(/nenhum servi[çc]o cadastrado/i)).toBeInTheDocument();
  });

  it("opens modal and creates a new service via adminApi.createService", async () => {
    listServices.mockResolvedValue([]);
    createService.mockResolvedValue({ id: "s9", name: "Clareamento", durationMinutes: 60, isActive: true });
    listServices.mockResolvedValueOnce([]);
    listServices.mockResolvedValue([{ id: "s9", name: "Clareamento", durationMinutes: 60, isActive: true }]);

    render(<ServicosPage />);
    await screen.findByText(/nenhum servi[çc]o cadastrado/i);

    fireEvent.click(screen.getByRole("button", { name: /novo servi[çc]o/i }));

    const nameInput = await screen.findByLabelText(/nome do servi[çc]o/i);
    fireEvent.change(nameInput, { target: { value: "Clareamento" } });
    fireEvent.change(screen.getByLabelText(/dura[çc][ãa]o/i), { target: { value: "60" } });

    fireEvent.click(screen.getByRole("button", { name: /^salvar$/i }));

    await waitFor(() => {
      expect(createService).toHaveBeenCalledWith({ name: "Clareamento", durationMinutes: 60 });
    });
  });

  it("rejects duplicate service names before submitting", async () => {
    listServices.mockResolvedValue([
      { id: "s1", name: "Limpeza", durationMinutes: 45, isActive: true },
    ]);

    render(<ServicosPage />);
    await screen.findByText("Limpeza");

    fireEvent.click(screen.getByRole("button", { name: /novo servi[çc]o/i }));
    fireEvent.change(await screen.findByLabelText(/nome do servi[çc]o/i), {
      target: { value: "limpeza" },
    });
    fireEvent.change(screen.getByLabelText(/dura[çc][ãa]o/i), { target: { value: "30" } });
    fireEvent.click(screen.getByRole("button", { name: /^salvar$/i }));

    expect(await screen.findByText(/j[áa] existe um servi[çc]o/i)).toBeInTheDocument();
    expect(createService).not.toHaveBeenCalled();
  });

  it("deactivates a service via updateService when trash clicked", async () => {
    listServices.mockResolvedValue([
      { id: "s1", name: "Limpeza", durationMinutes: 45, isActive: true },
    ]);
    updateService.mockResolvedValue({ id: "s1", name: "Limpeza", durationMinutes: 45, isActive: false });

    render(<ServicosPage />);
    await screen.findByText("Limpeza");

    fireEvent.click(screen.getByRole("button", { name: /desativar limpeza/i }));

    await waitFor(() => {
      expect(updateService).toHaveBeenCalledWith("s1", { isActive: false });
    });
  });
});
