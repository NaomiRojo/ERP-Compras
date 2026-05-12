import type { ReactNode } from "react";
import { Box } from "@mui/material";

import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import type { NavItem, ViewKey } from "../../types";
import type { UsuarioApi } from "../../types/api";

type MainLayoutProps = {
  navItems: NavItem[];
  title: string;
  subtitle: string;
  currentUser: UsuarioApi | null;
  currentUserRoleLabel: string;
  currentView: ViewKey;
  onLogout: () => void;
  children: ReactNode;
};

export function MainLayout({
  navItems,
  title,
  subtitle,
  currentUser,
  currentUserRoleLabel,
  currentView,
  onLogout,
  children,
}: MainLayoutProps) {
  return (
    <Box className="shell">
      <Sidebar
        currentUserName={currentUser?.nombreCompleto ?? "Usuario"}
        currentUserRoleLabel={currentUserRoleLabel}
        navItems={navItems}
        onLogout={onLogout}
      />
      <Box className="content" component="main">
        <Header
          currentUser={currentUser}
          currentUserRoleLabel={currentUserRoleLabel}
          currentView={currentView}
          onLogout={onLogout}
          subtitle={subtitle}
          title={title}
        />
        <div className="content__body">{children}</div>
      </Box>
    </Box>
  );
}
