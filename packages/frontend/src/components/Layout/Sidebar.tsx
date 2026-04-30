import { NavLink } from "react-router-dom";

import { buildViewPath } from "../../router/views";
import type { NavItem } from "../../types";

type SidebarProps = {
  navItems: NavItem[];
  currentUserName: string;
  currentUserRoleLabel: string;
  onLogout: () => void;
};

export function Sidebar({
  navItems,
  currentUserName,
  currentUserRoleLabel,
  onLogout,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="brand-mark">EC</div>
        <div>
          <strong>ERP Compras</strong>
          <span>Compras, stock y finanzas</span>
        </div>
      </div>

      <nav className="sidebar__nav">
        {navItems.map((item) => (
          <NavLink
            key={item.key}
            className={({ isActive }) => (isActive ? "nav-link nav-link--active" : "nav-link")}
            to={buildViewPath(item.key)}
          >
            <strong>{item.label}</strong>
            <span>{item.description}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        <div>
          <strong>{currentUserName}</strong>
          <span>{currentUserRoleLabel}</span>
        </div>
        <button className="secondary-button" onClick={onLogout} type="button">
          Salir
        </button>
      </div>
    </aside>
  );
}
