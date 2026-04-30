import { createTheme, type PaletteMode } from "@mui/material/styles";

export const createAppTheme = (mode: PaletteMode) => createTheme({
  palette: {
    mode,
    primary: {
      main: mode === "dark" ? "#7aa2ff" : "#2156d9",
      dark: "#173f9e",
    },
    secondary: {
      main: mode === "dark" ? "#2dd4bf" : "#0f766e",
    },
    warning: {
      main: "#b45309",
    },
    error: {
      main: "#be123c",
    },
    success: {
      main: "#15803d",
    },
    background: {
      default: mode === "dark" ? "#09111f" : "#f5f7fb",
      paper: mode === "dark" ? "#101b2f" : "#ffffff",
    },
    text: {
      primary: mode === "dark" ? "#e7eefc" : "#142033",
      secondary: mode === "dark" ? "#9eb0cc" : "#60708c",
    },
    divider: mode === "dark" ? "rgba(231, 238, 252, 0.1)" : "rgba(20, 32, 51, 0.08)",
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: 'Inter, "Segoe UI", sans-serif',
    button: {
      fontWeight: 700,
      letterSpacing: 0,
      textTransform: "none",
    },
    h1: {
      fontWeight: 800,
      letterSpacing: 0,
    },
    h2: {
      fontWeight: 800,
      letterSpacing: 0,
    },
    h3: {
      fontWeight: 800,
      letterSpacing: 0,
    },
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          minHeight: 40,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: `1px solid ${mode === "dark" ? "rgba(231, 238, 252, 0.1)" : "rgba(20, 32, 51, 0.08)"}`,
          boxShadow: mode === "dark" ? "0 20px 50px rgba(0, 0, 0, 0.28)" : "0 20px 50px rgba(37, 59, 103, 0.1)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 750,
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          backgroundColor: mode === "dark" ? "rgba(158, 176, 204, 0.18)" : "rgba(96, 112, 140, 0.14)",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          color: "#60708c",
          fontSize: 12,
          fontWeight: 800,
          textTransform: "uppercase",
        },
      },
    },
  },
});

export const appTheme = createAppTheme("light");
