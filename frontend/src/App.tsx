import MenuBookIcon from "@mui/icons-material/MenuBook";
import {
  AppBar,
  Container,
  CssBaseline,
  Toolbar,
  Typography,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Link as RouterLink, Route, Routes } from "react-router-dom";
import { FairDetailPage } from "./pages/FairDetailPage";
import { FairListPage } from "./pages/FairListPage";
import { theme } from "./theme";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

/**
 * 应用根组件。
 */
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <AppBar position="static" elevation={0}>
            <Toolbar>
              <MenuBookIcon sx={{ mr: 1 }} />
              <Typography
                variant="h6"
                component={RouterLink}
                to="/"
                sx={{
                  color: "inherit",
                  textDecoration: "none",
                  fontWeight: 700,
                }}
              >
                独立漫画市集备忘录
              </Typography>
            </Toolbar>
          </AppBar>
          <Container maxWidth="md" sx={{ py: 4 }}>
            <Routes>
              <Route path="/" element={<FairListPage />} />
              <Route path="/fairs/:id" element={<FairDetailPage />} />
            </Routes>
          </Container>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
