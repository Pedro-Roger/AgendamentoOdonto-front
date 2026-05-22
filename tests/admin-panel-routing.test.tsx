import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { App } from "../src/app/App";

function renderAt(path: string) {
  window.history.pushState({}, "", path);
  render(<App />);
}

describe("Admin panel routing", () => {
  test("shows admin nav and default page", () => {
    renderAt("/admin");

    expect(screen.getByRole("navigation", { name: "Admin menu" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Serviços" })).toBeInTheDocument();
  });

  test("opens prontuario route", () => {
    renderAt("/admin/prontuario");
    expect(screen.getByRole("heading", { name: "Atendimento Clínico" })).toBeInTheDocument();
  });

  test("opens assinatura route", () => {
    renderAt("/admin/assinatura");
    expect(screen.getByRole("heading", { name: "Conclusão do prontuário" })).toBeInTheDocument();
  });

  test("opens historico route", () => {
    renderAt("/admin/historico-paciente");
    expect(screen.getByRole("heading", { name: "Histórico do Paciente" })).toBeInTheDocument();
  });
});
