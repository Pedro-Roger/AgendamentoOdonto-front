import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const listServices = vi.fn();
const availability = vi.fn();
const createAppointment = vi.fn();

vi.mock("@/src/lib/frontend-api", () => ({
  adminApi: {
    listServices: (...a: any[]) => listServices(...a),
    availability: (...a: any[]) => availability(...a),
    createAppointment: (...a: any[]) => createAppointment(...a),
  },
}));

import { NewAppointmentModal } from "../components/NewAppointmentModal";

describe("NewAppointmentModal — staff usa rota autenticada", () => {
  beforeEach(() => {
    listServices.mockReset().mockResolvedValue([
      { id: "s1", name: "Limpeza", durationMinutes: 30, isActive: true },
    ]);
    availability.mockReset().mockResolvedValue([
      { id: "sc1", weekDay: 1, startTime: "09:00", endTime: "09:30" },
    ]);
    createAppointment.mockReset().mockResolvedValue({ id: "a1" });
  });

  it("busca disponibilidade via adminApi.availability e cria via adminApi.createAppointment", async () => {
    render(<NewAppointmentModal open onClose={() => {}} />);

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

    // wait for services to load, then select
    await waitFor(() => expect(screen.getByRole("option", { name: /Limpeza/ })).toBeTruthy());
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "s1" } });

    // availability fetched after selecting service
    await waitFor(() => expect(availability).toHaveBeenCalledWith("s1", expect.any(String)));

    // click the 09:00 slot
    const slotBtn = await screen.findByRole("button", { name: "09:00" });
    fireEvent.click(slotBtn);

    fireEvent.click(screen.getByRole("button", { name: /Agendar/ }));

    await waitFor(() => expect(createAppointment).toHaveBeenCalledTimes(1));
    expect(createAppointment).toHaveBeenCalledWith(
      expect.objectContaining({ serviceId: "s1", time: "09:00" })
    );
  });
});
