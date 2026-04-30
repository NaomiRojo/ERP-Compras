import { describe, expect, it, mock } from "bun:test";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SearchBar } from "./SearchBar";

describe("SearchBar", () => {
  it("renderiza el placeholder por defecto y emite cambios", async () => {
    const user = userEvent.setup({ document: globalThis.document });
    const onChange = mock(() => {});
    const view = render(<SearchBar onChange={onChange} />);

    const input = view.getByLabelText("Buscar");

    expect(input.getAttribute("placeholder")).toBe("Buscar registros...");

    await user.type(input, "orden");

    expect(onChange).toHaveBeenLastCalledWith("orden");
  });

  it("acepta placeholder personalizado sin handler opcional", () => {
    const view = render(<SearchBar placeholder="Buscar ordenes" value="OC-1" />);

    const input = view.getByLabelText("Buscar");

    expect(input.getAttribute("placeholder")).toBe("Buscar ordenes");
    expect((input as HTMLInputElement).value).toBe("OC-1");
  });
});
