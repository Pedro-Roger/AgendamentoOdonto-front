import { fireEvent, render, screen } from "@testing-library/react";
import { SchedulesPage } from "../src/features/configuracao-clinica/SchedulesPage";

describe("Feature 01 - Horários", () => {
  it("permite marcar dia e intervalo de atendimento", () => {
    const onSave = vi.fn();

    render(<SchedulesPage onSave={onSave} />);

    fireEvent.change(screen.getByLabelText("Dia"), { target: { value: "Segunda" } });
    fireEvent.change(screen.getByLabelText("Início"), { target: { value: "08:00" } });
    fireEvent.change(screen.getByLabelText("Fim"), { target: { value: "12:00" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar horário" }));

    expect(onSave).toHaveBeenCalledWith({ day: "Segunda", start: "08:00", end: "12:00" });
  });
});
