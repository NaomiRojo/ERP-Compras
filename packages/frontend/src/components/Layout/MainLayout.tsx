import type { ReactNode } from "react";
import { Box } from "@mui/material";

import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import type { NavItem } from "../../types";

type MainLayoutProps = {
  navItems: NavItem[];
  title: string;
  subtitle: string;
  statusChip: string;
  currentUserName: string;
  currentUserRoleLabel: string;
  onLogout: () => void;
  children: ReactNode;
};

export function MainLayout({
  navItems,
  title,
  subtitle,
  statusChip,
  currentUserName,
  currentUserRoleLabel,
  onLogout,
  children,
}: MainLayoutProps) {
  return (
    <Box className="shell">
      <Sidebar
        currentUserName={currentUserName}
        currentUserRoleLabel={currentUserRoleLabel}
        navItems={navItems}
        onLogout={onLogout}
      />
      <Box className="content" component="main">
        <Header statusChip={statusChip} subtitle={subtitle} title={title} />
        <div className="content__body">{children}</div>
      </Box>
    </Box>
  );
}
