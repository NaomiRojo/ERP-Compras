import { createTheme } from "@mui/material/styles";

export const appTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#2156d9",
      dark: "#173f9e",
    },
    secondary: {
      main: "#0f766e",
    },
    background: {
      default: "#f5f7fb",
      paper: "#ffffff",
    },
    text: {
      primary: "#142033",
      secondary: "#60708c",
    },
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
          border: "1px solid rgba(20, 32, 51, 0.08)",
          boxShadow: "0 20px 50px rgba(37, 59, 103, 0.1)",
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
