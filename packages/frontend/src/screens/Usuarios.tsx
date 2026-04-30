import { Badge } from "../components/Common/Badge";
import { DataTable } from "../components/Common/DataTable";
import type { User } from "../types";

export function UsuariosScreen({ users }: { users: User[] }) {
  return (
    <DataTable
      title="Usuarios"
      description="Administracion de accesos, perfil y estado del segundo factor."
      headers={["Usuario", "Nombre completo", "Email", "Rol", "2FA", "Estado"]}
      rows={users.map((user) => [
        user.username,
        user.nombreCompleto,
        user.email,
        user.rol,
        <Badge key={`${user.id}-2fa`} tone={user.twoFactorEnabled ? "success" : "neutral"}>
          {user.twoFactorEnabled ? "Habilitado" : "Desactivado"}
        </Badge>,
        <Badge key={`${user.id}-status`} tone={user.activo ? "success" : "neutral"}>
          {user.activo ? "Activo" : "Inactivo"}
        </Badge>,
      ])}
    />
  );
}
