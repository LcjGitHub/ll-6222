import { createTheme } from "@mui/material/styles";

/** 应用 MUI 主题。 */
export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#5c4d7d",
    },
    secondary: {
      main: "#e07a5f",
    },
    background: {
      default: "#f7f4ef",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: '"Noto Sans SC", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});
