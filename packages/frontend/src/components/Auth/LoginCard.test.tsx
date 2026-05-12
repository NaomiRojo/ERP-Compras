import { describe, expect, it, mock } from "bun:test";
import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { LoginCard } from "./LoginCard";

describe("LoginCard", () => {
  it("envia login temporal con WhatsApp y prefijo de Bolivia por defecto", async () => {
    const user = userEvent.setup({ document: globalThis.document });
    const onSubmitLogin = mock(() => {});

    const view = render(
      <LoginCard
        errorMessage={null}
        isSubmitting={false}
        onSubmitLogin={onSubmitLogin}
        onSubmitRegister={mock(async () => undefined)}
      />,
    );

    await user.type(view.getByLabelText("Correo electrónico"), "compras@erp.local");
    await user.type(view.getByLabelText("Contraseña"), "Secreta123*");
    await user.type(view.getByLabelText("Número de celular"), "71234567");
    await user.click(view.getByRole("button", { name: "Iniciar sesión" }));

    expect(view.getByText("El código de acceso se enviará por WhatsApp.")).toBeTruthy();
    expect(onSubmitLogin).toHaveBeenCalledWith({
      email: "compras@erp.local",
      password: "Secreta123*",
      persistence: "session",
      twoFactorChannel: "WHATSAPP",
      twoFactorPhoneNumber: "+59171234567",
    });
  });

  it("envia login persistente cuando el usuario activa recordarme", async () => {
    const user = userEvent.setup({ document: globalThis.document });
    const onSubmitLogin = mock(() => {});

    const view = render(
      <LoginCard
        errorMessage={null}
        isSubmitting={false}
        onSubmitLogin={onSubmitLogin}
        onSubmitRegister={mock(async () => undefined)}
      />,
    );

    await user.type(view.getByLabelText("Correo electrónico"), "admin@erp.local");
    await user.type(view.getByLabelText("Contraseña"), "Admin123*");
    await user.type(view.getByLabelText("Número de celular"), "70000000");
    await user.click(view.getByLabelText("Recordarme en este equipo"));
    await user.click(view.getByRole("button", { name: "Iniciar sesión" }));

    expect(onSubmitLogin).toHaveBeenCalledWith({
      email: "admin@erp.local",
      password: "Admin123*",
      persistence: "local",
      twoFactorChannel: "WHATSAPP",
      twoFactorPhoneNumber: "+59170000000",
    });
  });

  it("aplica el prefijo del pais seleccionado al numero de celular", async () => {
    const user = userEvent.setup({ document: globalThis.document });
    const onSubmitLogin = mock(() => {});

    const view = render(
      <LoginCard
        errorMessage={null}
        isSubmitting={false}
        onSubmitLogin={onSubmitLogin}
        onSubmitRegister={mock(async () => undefined)}
      />,
    );

    await user.type(view.getByLabelText("Correo electrónico"), "peru@erp.local");
    await user.type(view.getByLabelText("Contraseña"), "Clave123*");
    await user.click(view.getByLabelText("País"));
    await user.click(view.getByRole("option", { name: /Perú/ }));
    await user.type(view.getByLabelText("Número de celular"), "987 654 321");
    await user.click(view.getByRole("button", { name: "Iniciar sesión" }));

    expect(onSubmitLogin).toHaveBeenCalledWith({
      email: "peru@erp.local",
      password: "Clave123*",
      persistence: "session",
      twoFactorChannel: "WHATSAPP",
      twoFactorPhoneNumber: "+51987654321",
    });
  });

  it("registra un usuario y vuelve al modo login", async () => {
    const user = userEvent.setup({ document: globalThis.document });
    const onSubmitRegister = mock(async () => undefined);

    const view = render(
      <LoginCard
        errorMessage={null}
        isSubmitting={false}
        onSubmitLogin={mock(() => {})}
        onSubmitRegister={onSubmitRegister}
      />,
    );

    await user.click(view.getByRole("tab", { name: "Registro" }));
    await user.type(view.getByLabelText("Nombre completo"), "Maria Quiroga");
    await user.type(view.getByLabelText("Correo electrónico"), "maria@erp.local");
    await user.type(view.getByLabelText("Contraseña"), "Clave123*");
    await user.click(view.getByRole("button", { name: "Registrarse" }));

    await waitFor(() => {
      expect(onSubmitRegister).toHaveBeenCalledTimes(1);
    });

    const payload = (onSubmitRegister.mock.calls as unknown as Array<
      [
        {
          username: string;
          nombreCompleto: string;
          email: string;
          password: string;
          twoFactorEnabled: boolean;
        },
      ]
    >)[0]?.[0] as
      | {
          username: string;
          nombreCompleto: string;
          email: string;
          password: string;
          twoFactorEnabled: boolean;
        }
      | undefined;

    expect(payload).toMatchObject({
      nombreCompleto: "Maria Quiroga",
      email: "maria@erp.local",
      password: "Clave123*",
      twoFactorEnabled: true,
    });
    expect(payload?.username).toMatch(/^maria_[a-z0-9]{4}$/);
    expect(view.getByText("Cuenta registrada. Ahora inicia sesión.")).toBeTruthy();
    expect(view.getByRole("button", { name: "Iniciar sesión" })).toBeTruthy();
  });

  it("mantiene el modo registro cuando el backend rechaza el alta", async () => {
    const user = userEvent.setup({ document: globalThis.document });
    const onSubmitRegister = mock(async () => {
      throw new Error("Registro fallido");
    });

    const view = render(
      <LoginCard
        errorMessage={null}
        isSubmitting={false}
        onSubmitLogin={mock(() => {})}
        onSubmitRegister={onSubmitRegister}
      />,
    );

    await user.click(view.getByRole("tab", { name: "Registro" }));
    await user.type(view.getByLabelText("Nombre completo"), "Luis Perez");
    await user.type(view.getByLabelText("Correo electrónico"), "luis@erp.local");
    await user.type(view.getByLabelText("Contraseña"), "Clave123*");
    await user.click(view.getByLabelText("Activar verificación de dos pasos al crear la cuenta"));
    await user.click(view.getByRole("button", { name: "Registrarse" }));

    await waitFor(() => {
      expect(onSubmitRegister).toHaveBeenCalledTimes(1);
    });

    expect(view.queryByText("Cuenta registrada. Ahora inicia sesión.")).toBeNull();
    expect(view.getByRole("button", { name: "Registrarse" })).toBeTruthy();
  });

  it("mantiene el acceso con registro disponible solo desde la pestana y sin mensajes de ayuda antiguos", () => {
    const view = render(
      <LoginCard
        errorMessage={null}
        isSubmitting={false}
        onSubmitLogin={mock(() => {})}
        onSubmitRegister={mock(async () => undefined)}
      />,
    );

    expect(view.queryByRole("button", { name: "Crear una cuenta" })).toBeNull();
    expect(view.getByRole("tab", { name: "Registro" })).toBeTruthy();
    expect(view.queryByText(/TWO_FACTOR_PHONE_OVERRIDE/)).toBeNull();
    expect(view.queryByText(/Si no activas esta opcion/)).toBeNull();
    expect(view.getByText("Ingrese su número de celular, por favor.")).toBeTruthy();
  });

  it("permite mostrar y ocultar la contraseña", async () => {
    const user = userEvent.setup({ document: globalThis.document });

    const view = render(
      <LoginCard
        errorMessage={null}
        isSubmitting={false}
        onSubmitLogin={mock(() => {})}
        onSubmitRegister={mock(async () => undefined)}
      />,
    );

    const passwordInput = view.getByLabelText("Contraseña") as HTMLInputElement;
    expect(passwordInput.type).toBe("password");

    await user.click(view.getByLabelText("Mostrar contraseña"));
    expect(passwordInput.type).toBe("text");

    await user.click(view.getByLabelText("Ocultar contraseña"));
    expect(passwordInput.type).toBe("password");
  });
});
