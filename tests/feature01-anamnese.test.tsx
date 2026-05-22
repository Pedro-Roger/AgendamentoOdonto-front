import { fireEvent, render, screen } from "@testing-library/react";
import { AnamnesisFormBuilderPage } from "../src/features/configuracao-clinica/AnamnesisFormBuilderPage";

describe("Feature 01 - Formulário de Anamnese", () => {
  it("adiciona pergunta customizada", () => {
    render(<AnamnesisFormBuilderPage />);

    fireEvent.change(screen.getByLabelText("Nova pergunta"), { target: { value: "Tem alergia a algo?" } });
    fireEvent.click(screen.getByRole("button", { name: "Adicionar pergunta" }));

    expect(screen.getByText("Tem alergia a algo?")).toBeInTheDocument();
  });
});
