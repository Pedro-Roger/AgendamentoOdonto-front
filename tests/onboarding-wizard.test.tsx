import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: pushMock }),
}));

vi.mock("@/src/lib/frontend-api", () => ({
  adminApi: {
    replaceSchedules: vi.fn().mockResolvedValue([]),
    createService: vi.fn().mockResolvedValue({ id: "s1" }),
  },
}));

import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { adminApi } from "@/src/lib/frontend-api";

describe("OnboardingWizard", () => {
  beforeEach(() => {
    pushMock.mockReset();
    (adminApi.replaceSchedules as any).mockClear();
    (adminApi.createService as any).mockClear();
  });

  it("walks through 3 steps and persists on Concluir", async () => {
    const onComplete = vi.fn();
    render(<OnboardingWizard clinicName="Dra Herlânia" onComplete={onComplete} />);

    // Step 1 shows the clinic name
    expect(screen.getByText(/Dra Herlânia/)).toBeInTheDocument();

    // advance to step 2
    fireEvent.click(screen.getByRole("button", { name: /pr[óo]ximo/i }));
    expect(screen.getByText(/hor[áa]rios/i)).toBeInTheDocument();

    // advance to step 3
    fireEvent.click(screen.getByRole("button", { name: /pr[óo]ximo/i }));

    // fill service
    fireEvent.change(screen.getByLabelText(/nome do servi[çc]o/i), {
      target: { value: "Limpeza" },
    });
    fireEvent.change(screen.getByLabelText(/dura[çc][ãa]o/i), {
      target: { value: "30" },
    });

    fireEvent.click(screen.getByRole("button", { name: /concluir/i }));

    await waitFor(() => {
      expect(adminApi.replaceSchedules).toHaveBeenCalled();
      expect(adminApi.createService).toHaveBeenCalledWith({
        name: "Limpeza",
        durationMinutes: 30,
      });
      expect(onComplete).toHaveBeenCalled();
    });
  });

  it("redirects to /dashboard when no onComplete is given", async () => {
    render(<OnboardingWizard clinicName="Clínica X" />);
    fireEvent.click(screen.getByRole("button", { name: /pr[óo]ximo/i }));
    fireEvent.click(screen.getByRole("button", { name: /pr[óo]ximo/i }));
    fireEvent.change(screen.getByLabelText(/nome do servi[çc]o/i), {
      target: { value: "Avaliação" },
    });
    fireEvent.change(screen.getByLabelText(/dura[çc][ãa]o/i), {
      target: { value: "45" },
    });
    fireEvent.click(screen.getByRole("button", { name: /concluir/i }));
    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("allows adding and removing schedule blocks", () => {
    render(<OnboardingWizard clinicName="X" />);
    fireEvent.click(screen.getByRole("button", { name: /pr[óo]ximo/i }));

    fireEvent.change(screen.getByLabelText(/dia/i), { target: { value: "1" } });
    fireEvent.change(screen.getByLabelText(/in[íi]cio/i), {
      target: { value: "08:00" },
    });
    fireEvent.change(screen.getByLabelText(/fim/i), {
      target: { value: "12:00" },
    });
    fireEvent.click(screen.getByRole("button", { name: /adicionar/i }));

    expect(screen.getByText(/08:00/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /remover/i }));
    expect(screen.queryByText(/08:00/)).not.toBeInTheDocument();
  });
});
