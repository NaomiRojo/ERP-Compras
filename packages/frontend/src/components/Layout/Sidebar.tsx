import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import AssessmentIcon from "@mui/icons-material/Assessment";
import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupsIcon from "@mui/icons-material/Groups";
import HistoryIcon from "@mui/icons-material/History";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import LogoutIcon from "@mui/icons-material/Logout";
import PaymentsIcon from "@mui/icons-material/Payments";
import PeopleIcon from "@mui/icons-material/People";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { Avatar, Box, Button, Paper, Stack, Typography } from "@mui/material";

import { buildViewPath } from "../../router/views";
import type { NavItem, ViewKey } from "../../types";

type SidebarProps = {
  navItems: NavItem[];
  currentUserName: string;
  currentUserRoleLabel: string;
  onLogout: () => void;
};

const NAV_ICON_BY_VIEW: Record<ViewKey, ReactNode> = {
  articulos: <Inventory2Icon fontSize="small" />,
  auditoria: <HistoryIcon fontSize="small" />,
  cxp: <ReceiptLongIcon fontSize="small" />,
  dashboard: <DashboardIcon fontSize="small" />,
  inventario: <Inventory2Icon fontSize="small" />,
  ordenes: <ShoppingCartIcon fontSize="small" />,
  pagos: <PaymentsIcon fontSize="small" />,
  proveedores: <GroupsIcon fontSize="small" />,
  reportes: <AssessmentIcon fontSize="small" />,
  usuarios: <PeopleIcon fontSize="small" />,
};

const initialsFromName = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "US";
  }

  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");
};

export function Sidebar({
  navItems,
  currentUserName,
  currentUserRoleLabel,
  onLogout,
}: SidebarProps) {
  return (
    <Paper className="sidebar" component="aside" square>
      <Stack className="sidebar__brand" direction="row" spacing={1.5}>
        <Box className="brand-mark">EC</Box>
        <div>
          <Typography component="strong" sx={{ fontWeight: 800 }}>
            ERP Compras
          </Typography>
          <Typography color="text.secondary" component="span">
            Compras, stock y finanzas
          </Typography>
        </div>
      </Stack>

      <nav className="sidebar__nav">
        {navItems.map((item) => (
          <NavLink
            key={item.key}
            className={({ isActive }) => (isActive ? "nav-link nav-link--active" : "nav-link")}
            to={buildViewPath(item.key)}
          >
            <span className="nav-link__icon">{NAV_ICON_BY_VIEW[item.key]}</span>
            <span className="nav-link__copy">
              <strong>{item.label}</strong>
              <span>{item.description}</span>
            </span>
          </NavLink>
        ))}
      </nav>

      <Stack className="sidebar__footer" spacing={1.5}>
        <Stack className="sidebar__user" direction="row" spacing={1.25}>
          <Avatar className="sidebar__avatar">{initialsFromName(currentUserName)}</Avatar>
          <div>
            <Typography component="strong" sx={{ fontWeight: 850 }}>
              {currentUserName}
            </Typography>
            <Typography color="text.secondary" component="span">
              {currentUserRoleLabel}
            </Typography>
          </div>
        </Stack>
        <Button
          className="secondary-button"
          onClick={onLogout}
          startIcon={<LogoutIcon />}
          type="button"
          variant="outlined"
        >
          Salir
        </Button>
      </Stack>
    </Paper>
  );
}
