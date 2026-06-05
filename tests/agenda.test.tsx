import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

const listAppointmentsWeek = vi.fn();

vi.mock("@/src/lib/frontend-api", () => ({
  adminApi: {
    listAppointmentsWeek: (...a: any[]) => listAppointmentsWeek(...a),
  },
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/agenda",
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

import AgendaPage from "../app/agenda/page";

const TODAY_ISO = new Date().toISOString().slice(0, 10);

const SAMPLE_APPTS = [
  {
    id: "a1",
    date: TODAY_ISO,
    time: "09:00",
    reason: "Dor de dente",
    patient: { id: "p1", name: "Maria Silva", cpf: "12345678901", email: "m@m.com", phone: "11999" },
    service: { id: "s1", name: "Consulta", durationMinutes: 30 },
  },
];

describe("AGD-001 — Agenda semanal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listAppointmentsWeek.mockResolvedValue([]);
  });

  it("renders 7 day columns in header", async () => {
    render(<AgendaPage />);
    await waitFor(() => expect(listAppointmentsWeek).toHaveBeenCalled());
    const dayHeaders = screen.getAllByText(/Dom|Seg|Ter|Qua|Qui|Sex|Sáb/);
    expect(dayHeaders.length).toBe(7);
  });

  it("shows Hoje button", async () => {
    render(<AgendaPage />);
    expect(screen.getByText("Hoje")).toBeDefined();
  });

  it("shows appointment card when data available", async () => {
    listAppointmentsWeek.mockResolvedValue(SAMPLE_APPTS);
    render(<AgendaPage />);
    await waitFor(() => screen.getByText(/Maria Silva/));
    expect(screen.getByText(/Maria Silva/)).toBeDefined();
  });

  it("opens detail modal when appointment card clicked", async () => {
    listAppointmentsWeek.mockResolvedValue(SAMPLE_APPTS);
    render(<AgendaPage />);
    await waitFor(() => screen.getByText(/Maria Silva/));
    fireEvent.click(screen.getByText(/09:00 Maria Silva/));
    await waitFor(() => screen.getByText("Abrir prontuário"));
    expect(screen.getByText("Dor de dente")).toBeDefined();
  });

  it("calls API again when next week button clicked", async () => {
    render(<AgendaPage />);
    await waitFor(() => expect(listAppointmentsWeek).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByLabelText("Próxima semana"));
    await waitFor(() => expect(listAppointmentsWeek).toHaveBeenCalledTimes(2));
  });

  it("shows error message when API fails", async () => {
    listAppointmentsWeek.mockRejectedValue(new Error("Falha na rede"));
    render(<AgendaPage />);
    await waitFor(() => screen.getByText(/Falha na rede/));
  });
});
