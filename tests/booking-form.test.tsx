import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const services = vi.fn();
const availability = vi.fn();
const createAppointment = vi.fn();

vi.mock("@/src/lib/frontend-api", () => ({
  publicApi: {
    services: (...a: any[]) => services(...a),
    availability: (...a: any[]) => availability(...a),
    createAppointment: (...a: any[]) => createAppointment(...a),
  },
}));

import { BookingForm } from "../app/agendar/[slug]/BookingForm";

describe("BookingForm — agendamento público por slug", () => {
  beforeEach(() => {
    services.mockReset().mockResolvedValue([
      { id: "s1", name: "Limpeza", durationMinutes: 30, isActive: true },
    ]);
    availability.mockReset().mockResolvedValue([
      { id: "sc1", weekDay: 1, startTime: "09:00", endTime: "09:30" },
    ]);
    createAppointment.mockReset().mockResolvedValue({ id: "a1" });
  });

  it("carrega serviços, busca disponibilidade e cria agendamento com o slug", async () => {
    render(<BookingForm slug="dra-herlania" />);

    await waitFor(() => expect(screen.getByRole("option", { name: /Limpeza/ })).toBeTruthy());
    expect(screen.getByPlaceholderText("Maria Silva")).toHaveClass("text-ink-700");

    fireEvent.change(screen.getByPlaceholderText("Maria Silva"), {
      target: { value: "Maria Silva" },
    });
    fireEvent.change(screen.getByPlaceholderText("000.000.000-00"), {
      target: { value: "12345678901" },
    });
    fireEvent.change(screen.getByPlaceholderText("maria@email.com"), {
      target: { value: "maria@email.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("(11) 91234-5678"), {
      target: { value: "11912345678" },
    });

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "s1" } });

    await waitFor(() =>
      expect(availability).toHaveBeenCalledWith("dra-herlania", "s1", expect.any(String))
    );

    const slotBtn = await screen.findByRole("button", { name: "09:00" });
    fireEvent.click(slotBtn);

    fireEvent.click(screen.getByRole("button", { name: /Agendar|Confirmar/i }));

    await waitFor(() => expect(createAppointment).toHaveBeenCalledTimes(1));
    expect(createAppointment.mock.calls[0][0]).toBe("dra-herlania");
  });
});
