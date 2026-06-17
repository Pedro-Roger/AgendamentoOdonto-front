import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/src/lib/frontend-api", () => ({
  adminApi: {
    listPatients: vi.fn(),
    patientProfile: vi.fn(),
    patientTimeline: vi.fn(),
    getMedicalRecordByPatient: vi.fn(),
    getMedicalRecord: vi.fn(),
    listMedicalRecordsByPatient: vi.fn(() => Promise.resolve([])),
  },
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/pacientes/lista",
  useRouter: () => ({ push: () => {}, replace: () => {} }),
  useSearchParams: () => new URLSearchParams("id=p1"),
}));

import { adminApi } from "@/src/lib/frontend-api";
import PacientesPage from "../app/pacientes/lista/page";
import PerfilPage from "../app/pacientes/perfil/page";

describe("SDD Phase 3 / Slice 5 — Patients list", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads patients and renders cards", async () => {
    vi.mocked(adminApi.listPatients).mockResolvedValue([
      { id: "p1", name: "Marina Castro", cpf: "12345678900", email: "m@x.com", phone: "11999999999" },
      { id: "p2", name: "Lucas Pereira", cpf: "98765432100", email: "l@x.com", phone: "11888888888" },
    ]);

    render(<PacientesPage />);

    expect(await screen.findByText("Marina Castro")).toBeInTheDocument();
    expect(screen.getByText("Lucas Pereira")).toBeInTheDocument();
  });

  it("filters by search input passing q to listPatients", async () => {
    vi.mocked(adminApi.listPatients)
      .mockResolvedValueOnce([{ id: "p1", name: "Marina Castro", cpf: "12345678900", email: "m@x.com", phone: "11999" }])
      .mockResolvedValueOnce([{ id: "p1", name: "Marina Castro", cpf: "12345678900", email: "m@x.com", phone: "11999" }]);

    render(<PacientesPage />);
    await screen.findByText("Marina Castro");

    fireEvent.change(screen.getByLabelText(/buscar paciente/i), { target: { value: "Marina" } });

    await waitFor(() => {
      expect(adminApi.listPatients).toHaveBeenLastCalledWith("Marina");
    });
  });

  it("shows empty state when no patients", async () => {
    vi.mocked(adminApi.listPatients).mockResolvedValue([]);
    render(<PacientesPage />);
    expect(await screen.findByText(/nenhum paciente/i)).toBeInTheDocument();
  });
});

describe("SDD Phase 3 / Slice 5 — Patient profile + timeline", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(adminApi.getMedicalRecordByPatient).mockResolvedValue(null as any);
  });

  it("loads profile via useSearchParams id and renders personal info + timeline", async () => {
    vi.mocked(adminApi.patientProfile).mockResolvedValue({
      id: "p1",
      name: "Marina Castro",
      cpf: "12345678900",
      email: "m@x.com",
      phone: "11999999999",
    } as any);
    vi.mocked(adminApi.patientTimeline).mockResolvedValue([
      { id: "ev1", type: "APPOINTMENT", title: "Limpeza", date: "2026-05-01", status: "DONE" },
      { id: "ev2", type: "MEDICAL_RECORD", title: "Prontuário #0142", date: "2026-05-10" },
    ] as any);

    render(<PerfilPage />);

    expect(await screen.findByText("Marina Castro")).toBeInTheDocument();
    expect(screen.getByText(/m@x\.com/i)).toBeInTheDocument();
    expect(await screen.findByText("Limpeza")).toBeInTheDocument();
    expect(screen.getByText(/prontu[áa]rio #0142/i)).toBeInTheDocument();
    expect(adminApi.patientProfile).toHaveBeenCalledWith("p1");
    expect(adminApi.patientTimeline).toHaveBeenCalledWith("p1");
  });
});
