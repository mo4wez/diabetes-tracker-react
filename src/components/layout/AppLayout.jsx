import { NavLink, Outlet } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../../hooks/useAuth";

export function AppLayout() {
  const { signOut } = useAuth();

  return (
    <Shell>
      <Navbar className="no-print">
        <NavInner>
          <Brand>دفترچه پایش دیابت</Brand>

          <NavLinks>
            <StyledNavLink to="/" end>
              ثبت هفتگی
            </StyledNavLink>
            <StyledNavLink to="/report">گزارش ماهانه و نمودار</StyledNavLink>
            <StyledNavLink to="/checkups">آزمایش HbA1c و چکاپ</StyledNavLink>
          </NavLinks>

          <LogoutButton onClick={signOut}>خروج</LogoutButton>
        </NavInner>
      </Navbar>

      <MainContent>
        <Outlet />
      </MainContent>
    </Shell>
  );
}

const Shell = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Navbar = styled.nav`
  background-color: ${({ theme }) => theme.colors.bgSurface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  position: sticky;
  top: 0;
  z-index: 20;
`;

const NavInner = styled.div`
  max-width: 1320px;
  margin: 0 auto;
  padding: 12px ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
`;

const Brand = styled.span`
  font-weight: 700;
  font-size: 1.05rem;
  color: ${({ theme }) => theme.colors.primary};
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const StyledNavLink = styled(NavLink)`
  padding: 6px 14px;
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  transition:
    background-color 0.15s ease,
    color 0.15s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.bgSubtle};
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  &.active {
    background-color: ${({ theme }) => theme.colors.primaryLight};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const LogoutButton = styled.button`
  padding: 6px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textSecondary};

  &:hover {
    border-color: ${({ theme }) => theme.colors.glucose.low.border};
    color: ${({ theme }) => theme.colors.glucose.low.text};
  }
`;

const MainContent = styled.div`
  flex: 1;
`;
