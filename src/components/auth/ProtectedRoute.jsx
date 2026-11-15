import { Navigate, Outlet } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../../hooks/useAuth";

export function ProtectedRoute() {
  const { session, loading } = useAuth();

  if (loading) {
    return <CenteredMessage>در حال بررسی حساب کاربری...</CenteredMessage>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

const CenteredMessage = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
