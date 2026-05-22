import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

const listSchedules = vi.fn();
const replaceSchedules = vi.fn();

vi.mock("@/src/lib/frontend-api", () => ({
  adminApi: {
    listSchedules: (...a: any[]) => listSchedules(...a),
    replaceSchedules: (...a: any[]) => replaceSchedules(...a),
  },
}));

vi.mock("next/navigation", () => ({ usePathname: () => "/configuracoes/horarios", useRouter: () => ({ push: () => {}, replace: () => {} }) }));

import HorariosPage from "../app/configuracoes/horarios/page";

describe("SDD Phase 3 / Slice 3 — Schedules bulk replace", () => {
  beforeEach(() => {
    listSchedules.mockReset();
    replaceSchedules.mockReset();
  });

  it("loads schedules and renders one row per weekday with existing slots", async () => {
    listSchedules.mockResolvedValue([
      { id: "h1", weekDay: 1, startTime: "08:00", endTime: "12:00" },
      { id: "h2", weekDay: 1, startTime: "14:00", endTime: "18:00" },
      { id: "h3", weekDay: 3, startTime: "09:00", endTime: "17:00" },
    ]);

    render(<HorariosPage />);

    await screen.findByText("Segunda");
    expect(screen.getByText("Terça")).toBeInTheDocument();
    expect(screen.getByText("Domingo")).toBeInTheDocument();

    const segundaRow = screen.getByTestId("day-row-1");
    expect(within(segundaRow).getAllByLabelText(/in[íi]cio do intervalo/i)).toHaveLength(2);
  });

  it("adds a new slot when clicking + intervalo", async () => {
    listSchedules.mockResolvedValue([
      { id: "h1", weekDay: 1, startTime: "08:00", endTime: "12:00" },
    ]);

    render(<HorariosPage />);
    const segundaRow = await screen.findByTestId("day-row-1");

    expect(within(segundaRow).getAllByLabelText(/in[íi]cio do intervalo/i)).toHaveLength(1);
    fireEvent.click(within(segundaRow).getByRole("button", { name: /\+ intervalo/i }));
    expect(within(segundaRow).getAllByLabelText(/in[íi]cio do intervalo/i)).toHaveLength(2);
  });

  it("rejects save when slots overlap on the same day", async () => {
    listSchedules.mockResolvedValue([
      { id: "h1", weekDay: 2, startTime: "08:00", endTime: "12:00" },
      { id: "h2", weekDay: 2, startTime: "11:00", endTime: "15:00" },
    ]);

    render(<HorariosPage />);
    await screen.findByText("Terça");

    fireEvent.click(screen.getByRole("button", { name: /salvar altera[çc][õo]es/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/sobrep/i);
    expect(replaceSchedules).not.toHaveBeenCalled();
  });

  it("calls replaceSchedules with flat payload on save", async () => {
    listSchedules.mockResolvedValue([
      { id: "h1", weekDay: 1, startTime: "08:00", endTime: "12:00" },
      { id: "h2", weekDay: 5, startTime: "09:00", endTime: "13:00" },
    ]);
    replaceSchedules.mockResolvedValue([]);

    render(<HorariosPage />);
    await screen.findByText("Segunda");

    fireEvent.click(screen.getByRole("button", { name: /salvar altera[çc][õo]es/i }));

    await waitFor(() => {
      expect(replaceSchedules).toHaveBeenCalledTimes(1);
    });
    const payload = replaceSchedules.mock.calls[0][0];
    expect(payload).toEqual(
      expect.arrayContaining([
        { weekDay: 1, startTime: "08:00", endTime: "12:00" },
        { weekDay: 5, startTime: "09:00", endTime: "13:00" },
      ])
    );
  });

  it("shows empty placeholder when no schedules configured", async () => {
    listSchedules.mockResolvedValue([]);
    render(<HorariosPage />);
    expect(await screen.findByText(/nenhum hor[áa]rio/i)).toBeInTheDocument();
  });
});
