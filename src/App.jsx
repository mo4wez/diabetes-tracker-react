import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { theme } from "./styles/theme";
import { GlobalStyles } from "./styles/GlobalStyles";
import { useAuth } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";
import { LoginPage } from "./pages/LoginPage";
import { WeeklyTrackerPage } from "./pages/WeeklyTrackerPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Redirect away from /login if already signed in
function PublicOnlyLogin() {
  const { session, loading } = useAuth();
  if (loading) return null;
  if (session) return <Navigate to="/" replace />;
  return <LoginPage />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<PublicOnlyLogin />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<WeeklyTrackerPage />} />
                <Route
                  path="/report"
                  element={
                    <div style={{ padding: 24 }}>
                      گزارش ماهانه و نمودار (به‌زودی)
                    </div>
                  }
                />
                <Route
                  path="/checkups"
                  element={
                    <div style={{ padding: 24 }}>
                      آزمایش HbA1c و چکاپ سالانه (به‌زودی)
                    </div>
                  }
                />
              </Route>
            </Route>

            {/* Fallback for unknown URLs */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
