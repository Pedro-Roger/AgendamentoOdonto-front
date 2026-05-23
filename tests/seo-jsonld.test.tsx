import { describe, expect, test } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { JsonLd, buildDentistSchema } from "../components/JsonLd";

describe("JsonLd", () => {
  test("schema declares Dentist with name/url/description", () => {
    const s = buildDentistSchema();
    expect(s["@context"]).toBe("https://schema.org");
    expect(s["@type"]).toBe("Dentist");
    expect(s.name).toBeTruthy();
    expect(s.url).toMatch(/^https?:\/\//);
    expect(s.description.length).toBeGreaterThan(50);
  });

  test("renders script tag with valid JSON", () => {
    const html = renderToStaticMarkup(<JsonLd />);
    expect(html).toContain('type="application/ld+json"');
    const json = html.match(/>([^<]+)</)?.[1] ?? "";
    expect(() => JSON.parse(json)).not.toThrow();
  });
});
