import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({ push: vi.fn() }),
}));

// Mock next/image
vi.mock("next/image", () => ({
  default: (props: any) => <img {...props} />,
}));

// Mock fetch to return different roles
function mockFetchWithRole(role: string) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ user: { id: "1", name: "Test User", email: "t@t.com", role } }),
  } as any);
}

import { SidebarContext } from "../components/Sidebar";
import { Sidebar } from "../components/Sidebar";

function renderSidebar() {
  return render(
    <SidebarContext.Provider value={{ sidebarOpen: false, setSidebarOpen: vi.fn() }}>
      <Sidebar />
    </SidebarContext.Provider>
  );
}

describe("Sidebar RBAC — USR-002", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows all items for MASTER", async () => {
    mockFetchWithRole("MASTER");
    renderSidebar();
    await screen.findByText("Visão geral");
    expect(screen.getByText("Configurações")).toBeDefined();
    expect(screen.getByText("Relatórios")).toBeDefined();
    expect(screen.getByText("Atendimento")).toBeDefined();
  });

  it("hides Configurações and Relatórios for DENTISTA", async () => {
    mockFetchWithRole("DENTISTA");
    renderSidebar();
    await screen.findByText("Visão geral");
    expect(screen.queryByText("Configurações")).toBeNull();
    expect(screen.queryByText("Relatórios")).toBeNull();
  });

  it("shows Atendimento, Pacientes and Agenda for DENTISTA", async () => {
    mockFetchWithRole("DENTISTA");
    renderSidebar();
    await screen.findByText("Atendimento");
    expect(screen.getByText("Atendimento")).toBeDefined();
    expect(screen.getByText("Pacientes")).toBeDefined();
    expect(screen.getByText("Agenda")).toBeDefined();
  });

  it("hides Atendimento and Assinaturas for RECEPCIONISTA", async () => {
    mockFetchWithRole("RECEPCIONISTA");
    renderSidebar();
    await screen.findByText("Visão geral");
    expect(screen.queryByText("Atendimento")).toBeNull();
    expect(screen.queryByText("Assinaturas")).toBeNull();
  });

  it("shows Pacientes and Agenda for RECEPCIONISTA", async () => {
    mockFetchWithRole("RECEPCIONISTA");
    renderSidebar();
    await screen.findByText("Pacientes");
    expect(screen.getByText("Pacientes")).toBeDefined();
    expect(screen.getByText("Agenda")).toBeDefined();
  });

  it("displays role label in user info area", async () => {
    mockFetchWithRole("DENTISTA");
    renderSidebar();
    await screen.findByText("Dentista");
    expect(screen.getByText("Dentista")).toBeDefined();
  });
});
