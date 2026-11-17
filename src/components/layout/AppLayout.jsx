import { NavLink, Outlet } from "react-router-dom";
import styled from "styled-components";
import { Sun, Moon } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useThemeMode } from "../../context/ThemeModeContext";

export function AppLayout() {
  const { signOut } = useAuth();
  const { mode, toggleTheme } = useThemeMode();

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

          <RightActions>
            <ThemeToggleBtn
              type="button"
              onClick={toggleTheme}
              title={mode === "dark" ? "حالت روز" : "حالت شب"}
              aria-label="تغییر حالت شب و روز"
            >
              {mode === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </ThemeToggleBtn>

            <LogoutButton onClick={signOut}>خروج</LogoutButton>
          </RightActions>
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

const RightActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ThemeToggleBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  background-color: ${({ theme }) => theme.colors.bgSubtle};
  color: ${({ theme }) => theme.colors.textPrimary};
  transition:
    border-color 0.15s ease,
    color 0.15s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
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
