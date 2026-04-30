import { describe, expect, it } from "bun:test";

import { resolveTone } from "./data";

describe("resolveTone", () => {
  it("devuelve success para estados positivos", () => {
    expect(resolveTone("APROBADO")).toBe("success");
    expect(resolveTone("pagada")).toBe("success");
    expect(resolveTone(" IN ")).toBe("success");
  });

  it("devuelve warning para estados intermedios", () => {
    expect(resolveTone("PARCIAL")).toBe("warning");
    expect(resolveTone("borrador")).toBe("warning");
    expect(resolveTone("OUT")).toBe("warning");
  });

  it("devuelve info para estados no mapeados", () => {
    expect(resolveTone("ANULADO")).toBe("info");
  });
});
