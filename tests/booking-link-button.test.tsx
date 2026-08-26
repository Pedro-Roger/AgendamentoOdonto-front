import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BookingLinkButton } from "@/components/BookingLinkButton";

describe("BookingLinkButton", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
    vi.stubGlobal("open", vi.fn());
  });

  it("copies the public booking URL from the session tenant slug", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ user: { tenantSlug: "dra-herlania" } }),
      })
    );

    render(<BookingLinkButton />);

    fireEvent.click(await screen.findByRole("button", { name: /copiar link do formulário/i }));

    await waitFor(() =>
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        "https://www.maissorriso.online/agendar/dra-herlania"
      )
    );
    expect(await screen.findByText("Copiado")).toBeInTheDocument();
  });
});
