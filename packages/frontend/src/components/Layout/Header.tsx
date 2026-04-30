import { useState } from "react";
import {
  Avatar,
  Box,
  Breadcrumbs,
  ButtonBase,
  Chip,
  Link,
  Divider,
  ListItemIcon,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import BadgeIcon from "@mui/icons-material/Badge";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import EmailIcon from "@mui/icons-material/Email";
import LightModeIcon from "@mui/icons-material/LightMode";
import LogoutIcon from "@mui/icons-material/Logout";
import SecurityIcon from "@mui/icons-material/Security";

import { useColorMode } from "../Common/ColorMode";
import { SearchBar } from "../Common/SearchBar";
import { buildViewPath } from "../../router/views";
import type { ViewKey } from "../../types";
import type { UsuarioApi } from "../../types/api";

type HeaderProps = {
  currentUser: UsuarioApi | null;
  currentUserRoleLabel: string;
  currentView: ViewKey;
  onLogout: () => void;
  title: string;
  subtitle: string;
  statusChip: string;
};

const initialsFromName = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "US";
  }

  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");
};

export function Header({
  currentUser,
  currentUserRoleLabel,
  currentView,
  onLogout,
  title,
  subtitle,
  statusChip,
}: HeaderProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const { mode, toggleMode } = useColorMode();
  const currentUserName = currentUser?.nombreCompleto ?? "Usuario";
  const currentUserEmail = currentUser?.email ?? "Sin correo registrado";
  const currentUsername = currentUser?.username ?? "usuario";
  const menuOpen = Boolean(anchorEl);

  const closeMenu = () => setAnchorEl(null);

  return (
    <header className="content__header">
      <div>
        <Breadcrumbs aria-label="Ruta de navegacion" className="breadcrumbs">
          {currentView === "dashboard" ? (
            <Typography color="text.primary" component="span">
              Inicio
            </Typography>
          ) : (
            <Link color="inherit" href={`#${buildViewPath("dashboard")}`} underline="hover">
              Inicio
            </Link>
          )}
          {currentView !== "dashboard" ? (
            <Typography color="text.primary" component="span">
              {title}
            </Typography>
          ) : null}
        </Breadcrumbs>
        <Typography component="h2" variant="h4">
          {title}
        </Typography>
        <Typography className="header-copy" color="text.secondary">
          {subtitle}
        </Typography>
      </div>
      <Stack className="header-actions" direction={{ xs: "column", sm: "row" }} spacing={1.5}>
        <SearchBar />
        <ButtonBase
          aria-label={mode === "dark" ? "Activar tema claro" : "Activar tema oscuro"}
          className="theme-toggle"
          onClick={toggleMode}
          title={mode === "dark" ? "Tema claro" : "Tema oscuro"}
        >
          {mode === "dark" ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
        </ButtonBase>
        <ButtonBase
          aria-controls={menuOpen ? "user-profile-menu" : undefined}
          aria-expanded={menuOpen ? "true" : undefined}
          aria-haspopup="menu"
          className="user-pill"
          onClick={(event) => setAnchorEl(event.currentTarget)}
        >
          <Avatar className="user-pill__avatar">{initialsFromName(currentUserName)}</Avatar>
          <Box sx={{ minWidth: 0, textAlign: "left" }}>
            <Typography component="strong" sx={{ display: "block", fontWeight: 850, lineHeight: 1.1 }} variant="body2">
              {currentUserName}
            </Typography>
            <Typography color="text.secondary" component="span" variant="caption">
              {currentUserRoleLabel}
            </Typography>
          </Box>
        </ButtonBase>
        <Menu
          anchorEl={anchorEl}
          id="user-profile-menu"
          onClose={closeMenu}
          open={menuOpen}
          slotProps={{ paper: { sx: { mt: 1, minWidth: 320, p: 0.75 } } }}
        >
          <Box sx={{ px: 1.5, py: 1.25 }}>
            <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
              <Avatar className="user-pill__avatar">{initialsFromName(currentUserName)}</Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 850 }}>{currentUserName}</Typography>
                <Typography color="text.secondary" variant="body2">
                  @{currentUsername}
                </Typography>
              </Box>
            </Stack>
          </Box>
          <Divider />
          <MenuItem disabled>
            <ListItemIcon>
              <EmailIcon fontSize="small" />
            </ListItemIcon>
            <Box>
              <Typography variant="body2">{currentUserEmail}</Typography>
              <Typography color="text.secondary" variant="caption">
                Correo corporativo
              </Typography>
            </Box>
          </MenuItem>
          <MenuItem disabled>
            <ListItemIcon>
              <BadgeIcon fontSize="small" />
            </ListItemIcon>
            <Box>
              <Typography variant="body2">{currentUserRoleLabel}</Typography>
              <Typography color="text.secondary" variant="caption">
                Rol activo
              </Typography>
            </Box>
          </MenuItem>
          <MenuItem disabled>
            <ListItemIcon>
              <SecurityIcon fontSize="small" />
            </ListItemIcon>
            <Box>
              <Typography variant="body2">
                2FA {currentUser?.twoFactorEnabled ? "activo" : "desactivado"}
              </Typography>
              <Typography color="text.secondary" variant="caption">
                Seguridad de cuenta
              </Typography>
            </Box>
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              closeMenu();
              onLogout();
            }}
          >
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            Cerrar sesion
          </MenuItem>
        </Menu>
        <Chip className="search-chip" color={statusChip.includes("Error") ? "error" : "success"} label={statusChip} variant="outlined" />
      </Stack>
    </header>
  );
}
