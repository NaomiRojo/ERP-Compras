import { describe, expect, it, mock } from "bun:test";
import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { LoginCard } from "./LoginCard";

describe("LoginCard", () => {
  it("envia login con sesion temporal por defecto y canal 2FA seleccionado", async () => {
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

    await user.clear(view.getByLabelText("Correo electronico"));
    await user.type(view.getByLabelText("Correo electronico"), "compras@erp.local");
    await user.clear(view.getByLabelText("Contrasena"));
    await user.type(view.getByLabelText("Contrasena"), "Secreta123*");
    await user.selectOptions(view.getByLabelText("Canal 2FA"), "WHATSAPP");
    await user.type(view.getByLabelText("Numero para 2FA"), "+59171234567");
    await user.click(view.getByRole("button", { name: "Iniciar sesion" }));

    expect(onSubmitLogin).toHaveBeenCalledWith({
      email: "compras@erp.local",
      password: "Secreta123*",
      persistence: "session",
      twoFactorChannel: "WHATSAPP",
      twoFactorPhoneNumber: "+59171234567",
    });
    expect(view.queryByLabelText("Persistencia de sesion")).toBeNull();
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

    await user.type(view.getByLabelText("Correo electronico"), "admin@erp.local");
    await user.type(view.getByLabelText("Contrasena"), "Admin123*");
    await user.click(view.getByLabelText("Recordarme en este equipo"));
    await user.click(view.getByRole("button", { name: "Iniciar sesion" }));

    expect(onSubmitLogin).toHaveBeenCalledWith({
      email: "admin@erp.local",
      password: "Admin123*",
      persistence: "local",
      twoFactorChannel: "WHATSAPP",
      twoFactorPhoneNumber: undefined,
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

    await user.click(view.getByRole("button", { name: "Crear una cuenta" }));
    await user.type(view.getByLabelText("Nombre completo"), "Maria Quiroga");
    await user.clear(view.getByLabelText("Correo electronico"));
    await user.type(view.getByLabelText("Correo electronico"), "maria@erp.local");
    await user.clear(view.getByLabelText("Contrasena"));
    await user.type(view.getByLabelText("Contrasena"), "Clave123*");
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
    expect(view.getByText("Usuario registrado. Ahora inicia sesion.")).toBeTruthy();
    expect(view.getByRole("button", { name: "Iniciar sesion" })).toBeTruthy();
  });

  it("permite canales con telefono sin enviar numero cuando queda vacio", async () => {
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

    await user.type(view.getByLabelText("Correo electronico"), "sms@erp.local");
    await user.type(view.getByLabelText("Contrasena"), "Clave123*");
    await user.selectOptions(view.getByLabelText("Canal 2FA"), "SMS");

    expect(view.getByText(/TWO_FACTOR_PHONE_OVERRIDE/)).toBeTruthy();
    await user.click(view.getByRole("button", { name: "Iniciar sesion" }));

    expect(onSubmitLogin).toHaveBeenCalledWith({
      email: "sms@erp.local",
      password: "Clave123*",
      persistence: "session",
      twoFactorChannel: "SMS",
      twoFactorPhoneNumber: undefined,
    });
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

    await user.click(view.getByRole("button", { name: "Crear una cuenta" }));
    await user.type(view.getByLabelText("Nombre completo"), "Luis Perez");
    await user.type(view.getByLabelText("Correo electronico"), "luis@erp.local");
    await user.type(view.getByLabelText("Contrasena"), "Clave123*");
    await user.click(view.getByLabelText("Activar segundo factor al crear la cuenta"));
    await user.click(view.getByRole("button", { name: "Registrarse" }));

    await waitFor(() => {
      expect(onSubmitRegister).toHaveBeenCalledTimes(1);
    });

    expect(view.queryByText("Usuario registrado. Ahora inicia sesion.")).toBeNull();
    expect(view.getByRole("button", { name: "Registrarse" })).toBeTruthy();
  });
});
