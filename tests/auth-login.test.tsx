import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LoginPage from "../app/login/page";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: pushMock }),
}));

const originalFetch = global.fetch;

describe("SDD Phase 3 / Slice 1 — Auth flow", () => {
  beforeEach(() => {
    pushMock.mockReset();
    global.fetch = vi.fn() as any;
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it("posts credentials to /api/session/login and redirects to /dashboard on success", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ ok: true }),
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/e-mail/i), {
      target: { value: "dra@clinica.com" },
    });
    fireEvent.change(screen.getByLabelText(/^senha$/i), {
      target: { value: "secret123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /entrar na cl[ií]nica/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/session/login",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ email: "dra@clinica.com", password: "secret123" }),
        })
      );
    });

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("shows styled error alert when backend returns 401", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: async () => JSON.stringify({ message: "Credenciais inválidas" }),
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/e-mail/i), {
      target: { value: "wrong@x.com" },
    });
    fireEvent.change(screen.getByLabelText(/^senha$/i), {
      target: { value: "bad" },
    });
    fireEvent.click(screen.getByRole("button", { name: /entrar na cl[ií]nica/i }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/credenciais inv[áa]lidas/i);
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("disables submit button while request is pending", async () => {
    let resolveFn: (v: any) => void;
    (global.fetch as any).mockReturnValueOnce(
      new Promise((res) => {
        resolveFn = res;
      })
    );

    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/e-mail/i), { target: { value: "a@b.c" } });
    fireEvent.change(screen.getByLabelText(/^senha$/i), { target: { value: "x" } });
    const btn = screen.getByRole("button", { name: /entrar na cl[ií]nica/i });
    fireEvent.click(btn);

    await waitFor(() => expect(btn).toBeDisabled());
    resolveFn!({ ok: true, status: 200, text: async () => "{}" });
  });
});
