import { NavLink } from "react-router-dom";
import LogoutIcon from "@mui/icons-material/Logout";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";

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
            <strong>{item.label}</strong>
            <span>{item.description}</span>
          </NavLink>
        ))}
      </nav>

      <Stack className="sidebar__footer" spacing={1.5}>
        <div>
          <Typography component="strong" sx={{ fontWeight: 800 }}>
            {currentUserName}
          </Typography>
          <Typography color="text.secondary" component="span">
            {currentUserRoleLabel}
          </Typography>
        </div>
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
