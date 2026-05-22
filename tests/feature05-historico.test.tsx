import { fireEvent, render, screen } from "@testing-library/react";
import { PatientHistoryPage } from "../src/features/historico-paciente/PatientHistoryPage";

describe("Feature 05 - Histórico do Paciente", () => {
  it("filtra pacientes por nome e exibe timeline do selecionado", () => {
    render(
      <PatientHistoryPage
        patients={[
          { id: "1", name: "Ana Souza", cpf: "111" },
          { id: "2", name: "Bruno Lima", cpf: "222" }
        ]}
        timelineByPatient={{
          "1": ["Agendamento em 01/05", "Prontuário #001"],
          "2": ["Falta em 02/05"]
        }}
      />
    );

    fireEvent.change(screen.getByLabelText("Buscar paciente"), { target: { value: "Bruno" } });
    expect(screen.queryByText("Ana Souza")).not.toBeInTheDocument();
    expect(screen.getByText("Bruno Lima")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Ver perfil Bruno Lima" }));
    expect(screen.getByText("Falta em 02/05")).toBeInTheDocument();
  });
});
