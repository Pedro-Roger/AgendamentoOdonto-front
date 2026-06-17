import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { setTheme, getStoredTheme, applyTheme } from "@/src/lib/theme";
import { ThemeToggle } from "@/components/ThemeToggle";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove("dark");
});

describe("theme helpers", () => {
  it("setTheme('dark') adds dark class and persists", () => {
    setTheme("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(getStoredTheme()).toBe("dark");
    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("setTheme('light') removes dark class and persists", () => {
    setTheme("dark");
    setTheme("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(getStoredTheme()).toBe("light");
  });

  it("applyTheme toggles the class without persisting", () => {
    applyTheme("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(getStoredTheme()).toBeNull();
  });
});

describe("ThemeToggle", () => {
  it("toggles the dark class on click", () => {
    render(<ThemeToggle />);
    const btn = screen.getByRole("button");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    fireEvent.click(btn);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    fireEvent.click(btn);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });
});
