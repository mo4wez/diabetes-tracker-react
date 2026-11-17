import { NavLink, Outlet } from "react-router-dom";
import styled from "styled-components";
import {
  Sun,
  Moon,
  LogOut,
  CalendarDays,
  BarChart3,
  Stethoscope,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useThemeMode } from "../../context/ThemeModeContext";

const NAV_ITEMS = [
  {
    to: "/",
    end: true,
    desktopLabel: "ثبت هفتگی",
    mobileLabel: "ثبت هفتگی",
    icon: CalendarDays,
  },
  {
    to: "/report",
    end: false,
    desktopLabel: "گزارش ماهانه و نمودار",
    mobileLabel: "گزارش و نمودار",
    icon: BarChart3,
  },
  {
    to: "/checkups",
    end: false,
    desktopLabel: "آزمایش HbA1c و چکاپ",
    mobileLabel: "چکاپ و HbA1c",
    icon: Stethoscope,
  },
];

export function AppLayout() {
  const { signOut } = useAuth();
  const { mode, toggleTheme } = useThemeMode();

  return (
    <Shell>
      {/* Top Bar: Full nav on desktop, compact header on mobile */}
      <TopNavbar className="no-print">
        <NavInner>
          <Brand>دفترچه پایش دیابت</Brand>

          <DesktopNavLinks>
            {NAV_ITEMS.map(({ to, end, desktopLabel, icon: Icon }) => (
              <DesktopNavLink key={to} to={to} end={end}>
                <Icon size={16} />
                <span>{desktopLabel}</span>
              </DesktopNavLink>
            ))}
          </DesktopNavLinks>

          <RightActions>
            <IconActionBtn
              type="button"
              onClick={toggleTheme}
              title={mode === "dark" ? "حالت روز" : "حالت شب"}
              aria-label="تغییر حالت شب و روز"
            >
              {mode === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </IconActionBtn>

            <LogoutButton type="button" onClick={signOut} title="خروج از حساب">
              <LogOut size={16} />
              <LogoutText>خروج</LogoutText>
            </LogoutButton>
          </RightActions>
        </NavInner>
      </TopNavbar>

      <MainContent>
        <Outlet />
      </MainContent>

      {/* Mobile Bottom Tab Bar (hidden on desktop & print) */}
      <MobileBottomNav className="no-print" aria-label="منوی اصلی موبایل">
        {NAV_ITEMS.map(({ to, end, mobileLabel, icon: Icon }) => (
          <MobileTabLink key={to} to={to} end={end}>
            <IconWrap>
              <Icon size={20} />
            </IconWrap>
            <span>{mobileLabel}</span>
          </MobileTabLink>
        ))}
      </MobileBottomNav>
    </Shell>
  );
}

const Shell = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const TopNavbar = styled.nav`
  background-color: ${({ theme }) => theme.colors.bgSurface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  position: sticky;
  top: 0;
  z-index: 30;
`;

const NavInner = styled.div`
  max-width: 1320px;
  margin: 0 auto;
  padding: 10px ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const Brand = styled.span`
  font-weight: 700;
  font-size: 1.05rem;
  color: ${({ theme }) => theme.colors.primary};
  white-space: nowrap;
`;

const DesktopNavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 768px) {
    display: none;
  }
`;

const DesktopNavLink = styled(NavLink)`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 14px;
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

const IconActionBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 36px;
  padding: 0 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  background-color: ${({ theme }) => theme.colors.bgSubtle};
  font-size: 0.85rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  transition:
    border-color 0.15s ease,
    color 0.15s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.glucose.low.border};
    color: ${({ theme }) => theme.colors.glucose.low.text};
  }

  @media (max-width: 480px) {
    padding: 0 10px;
  }
`;

const LogoutText = styled.span`
  @media (max-width: 480px) {
    display: none;
  }
`;

const MainContent = styled.div`
  flex: 1;
  width: 100%;
  min-width: 0;

  @media (max-width: 768px) {
    padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px));
  }

  @media print {
    padding-bottom: 0 !important;
  }
`;

const MobileBottomNav = styled.nav`
  display: none;

  @media (max-width: 768px) {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    box-sizing: border-box;
    z-index: 100;
    background-color: ${({ theme }) => theme.colors.bgSurface};
    border-top: 1px solid ${({ theme }) => theme.colors.borderStrong};
    box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.14);
    padding: 8px 6px calc(8px + env(safe-area-inset-bottom, 0px));
  }
`;

const IconWrap = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 14px;
  border-radius: ${({ theme }) => theme.radii.full};
  transition: background-color 0.15s ease;
`;

const MobileTabLink = styled(NavLink)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  text-decoration: none;
  font-size: 0.75rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: 2px 0;
  -webkit-tap-highlight-color: transparent;

  &.active {
    color: ${({ theme }) => theme.colors.primary};
    font-weight: 700;

    ${IconWrap} {
      background-color: ${({ theme }) => theme.colors.primaryLight};
    }
  }
`;
