import { render, screen } from "@testing-library/react";
import { ServicesPage } from "../src/features/configuracao-clinica/ServicesPage";

describe("Feature 01 - Configuração da Clínica / Serviços", () => {
  it("mostra lista de serviços e ação para cadastrar", () => {
    render(<ServicesPage services={[{ id: "1", name: "Limpeza", price: 150 }]} />);

    expect(screen.getByRole("heading", { name: "Serviços" })).toBeInTheDocument();
    expect(screen.getByText("Limpeza")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Novo serviço" })).toBeInTheDocument();
  });
});
