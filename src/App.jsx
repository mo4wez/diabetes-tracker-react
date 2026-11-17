import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeModeProvider } from "./context/ThemeModeContext";
import { GlobalStyles } from "./styles/GlobalStyles";
import { useAuth } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";
import { LoginPage } from "./pages/LoginPage";
import { WeeklyTrackerPage } from "./pages/WeeklyTrackerPage";
import { MonthlyReportPage } from "./pages/MonthlyReportPage";
import { CheckupsPage } from "./pages/CheckupsPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function PublicOnlyLogin() {
  const { session, loading } = useAuth();
  if (loading) return null;
  if (session) return <Navigate to="/" replace />;
  return <LoginPage />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeModeProvider>
        <GlobalStyles />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<PublicOnlyLogin />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<WeeklyTrackerPage />} />
                <Route path="/report" element={<MonthlyReportPage />} />
                <Route path="/checkups" element={<CheckupsPage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeModeProvider>
    </QueryClientProvider>
  );
}
