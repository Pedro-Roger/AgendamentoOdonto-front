import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("../app/agendar/[slug]/BookingForm", () => ({
  BookingForm: ({ slug }: { slug: string }) => <div>slug:{slug}</div>,
}));

import AgendarPage from "../app/agendar/[slug]/page";

describe("AgendarPage", () => {
  it("passes the route slug to the public booking form", async () => {
    const ui = await AgendarPage({ params: Promise.resolve({ slug: "dra-herlania" }) });
    render(ui);
    expect(screen.getByText("slug:dra-herlania")).toBeInTheDocument();
  });
});
