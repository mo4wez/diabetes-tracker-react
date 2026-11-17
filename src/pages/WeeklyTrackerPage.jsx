import { useState } from "react";
import styled from "styled-components";
import { getTodayIso, shiftWeek } from "../lib/persianDate";
import { useWeeklyLogs } from "../hooks/useWeeklyLogs";
import { useAuth } from "../hooks/useAuth";
import { DayCard } from "../components/tracker/DayCard";
import { CheckupAlertBanner } from "../components/tracker/CheckupAlertBanner";

export function WeeklyTrackerPage() {
  const [anchorDate, setAnchorDate] = useState(() => getTodayIso());
  const {
    data: weekDays,
    isLoading,
    isError,
    error,
  } = useWeeklyLogs(anchorDate);
  const { signOut } = useAuth();

  const weekRangeLabel =
    weekDays && weekDays.length === 7
      ? `${weekDays[0].jalaliShort} تا ${weekDays[6].jalaliShort}`
      : "";

  return (
    <PageWrapper>
      <CheckupAlertBanner />

      <TopBar className="no-print">
        <BrandTitle>پایش روزانه قند خون و انسولین</BrandTitle>

        <NavControls>
          <NavBtn onClick={() => setAnchorDate((d) => shiftWeek(d, -1))}>
            → هفته قبل
          </NavBtn>

          <CurrentWeekLabel>{weekRangeLabel}</CurrentWeekLabel>

          <NavBtn onClick={() => setAnchorDate((d) => shiftWeek(d, 1))}>
            هفته بعد ←
          </NavBtn>

          <TodayBtn onClick={() => setAnchorDate(getTodayIso())}>
            هفته جاری
          </TodayBtn>
        </NavControls>

        <RightActions>
          <PrintBtn onClick={() => window.print()}>چاپ گزارش</PrintBtn>
          <LogoutBtn onClick={signOut}>خروج</LogoutBtn>
        </RightActions>
      </TopBar>

      {/* Visible only when printing */}
      <PrintHeader className="print-only">
        <h1>گزارش هفتگی قند خون و انسولین</h1>
        <p>بازه زمانی: {weekRangeLabel}</p>
      </PrintHeader>

      {isLoading && (
        <StatusMessage>در حال بارگذاری اطلاعات هفته...</StatusMessage>
      )}

      {isError && (
        <ErrorMessage>خطا در دریافت اطلاعات: {error.message}</ErrorMessage>
      )}

      {weekDays && (
        <DaysGrid>
          {weekDays.map((day) => (
            <DayCard key={day.isoDate} day={day} />
          ))}
        </DaysGrid>
      )}
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  max-width: 1320px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.md};
`;

const TopBar = styled.header`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.bgSurface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const BrandTitle = styled.h1`
  font-size: 1.1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const NavControls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const CurrentWeekLabel = styled.span`
  font-weight: 700;
  font-size: 0.95rem;
  min-width: 150px;
  text-align: center;
  color: ${({ theme }) => theme.colors.primary};
`;

const NavBtn = styled.button`
  padding: 6px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  background-color: ${({ theme }) => theme.colors.bgSubtle};
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  font-size: 0.85rem;
  font-weight: 600;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const TodayBtn = styled(NavBtn)`
  background-color: ${({ theme }) => theme.colors.primaryLight};
  border-color: transparent;
  color: ${({ theme }) => theme.colors.primary};
`;

const RightActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PrintBtn = styled.button`
  padding: 6px 14px;
  border-radius: ${({ theme }) => theme.radii.md};
  background-color: ${({ theme }) => theme.colors.primary};
  color: #ffffff;
  font-size: 0.85rem;
  font-weight: 600;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
  }
`;

const LogoutBtn = styled(NavBtn)`
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const PrintHeader = styled.div`
  margin-bottom: 16px;
  border-bottom: 2px solid #000;
  padding-bottom: 8px;

  h1 {
    font-size: 16pt;
    margin-bottom: 4px;
  }
`;

const DaysGrid = styled.main`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};

  @media print {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
`;

const StatusMessage = styled.p`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ErrorMessage = styled(StatusMessage)`
  color: ${({ theme }) => theme.colors.glucose.low.text};
`;
