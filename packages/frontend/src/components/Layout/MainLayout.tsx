import type { ReactNode } from "react";

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
    <div className="shell">
      <Sidebar
        currentUserName={currentUserName}
        currentUserRoleLabel={currentUserRoleLabel}
        navItems={navItems}
        onLogout={onLogout}
      />
      <main className="content">
        <Header statusChip={statusChip} subtitle={subtitle} title={title} />
        <div className="content__body">{children}</div>
      </main>
    </div>
  );
}
