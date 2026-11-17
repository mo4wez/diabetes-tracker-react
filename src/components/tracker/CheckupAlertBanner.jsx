import { Link } from "react-router-dom";
import styled from "styled-components";
import dayjs from "dayjs";
import { AlertTriangle, Clock, ArrowLeft } from "lucide-react";
import { useCheckups } from "../../hooks/useCheckups";

const CHECKUP_LABELS = {
  hba1c: "آزمایش HbA1c (سه‌ماهه)",
  eye_exam: "معاینه چشم پزشکی (سالانه)",
  kidney_lipid: "آزمایش کلیه و چربی خون",
  other: "چکاپ دوره‌ای",
};

export function CheckupAlertBanner() {
  const { data: checkups = [] } = useCheckups();

  if (!checkups.length) return null;

  // Pick only the latest record per checkup_type (checkups are already ordered newest-first)
  const latestByType = new Map();
  for (const item of checkups) {
    if (!latestByType.has(item.checkup_type) && item.next_due_date) {
      latestByType.set(item.checkup_type, item);
    }
  }

  const today = dayjs().startOf("day");
  const alerts = [];

  for (const [type, item] of latestByType.entries()) {
    const due = dayjs(item.next_due_date).startOf("day");
    const diffDays = due.diff(today, "day");

    if (diffDays <= 14) {
      const jalaliDue = due.calendar("jalali").format("YYYY/MM/DD");
      alerts.push({
        id: item.id,
        label: CHECKUP_LABELS[type] || type,
        jalaliDue,
        diffDays,
        isOverdue: diffDays < 0,
      });
    }
  }

  if (alerts.length === 0) return null;

  // Sort most urgent (overdue) first
  alerts.sort((a, b) => a.diffDays - b.diffDays);
  const hasOverdue = alerts.some((a) => a.isOverdue);

  return (
    <Banner className="no-print" $overdue={hasOverdue} role="status">
      <ContentGroup>
        <IconWrap $overdue={hasOverdue}>
          {hasOverdue ? <AlertTriangle size={20} /> : <Clock size={20} />}
        </IconWrap>

        <MessagesList>
          {alerts.map((alert) => (
            <AlertLine key={alert.id}>
              <strong>{alert.label}:</strong>{" "}
              {alert.isOverdue ? (
                <span>
                  {Math.abs(alert.diffDays)} روز از موعد ({alert.jalaliDue})
                  گذشته است
                </span>
              ) : alert.diffDays === 0 ? (
                <span>موعد انجام امروز ({alert.jalaliDue}) است</span>
              ) : (
                <span>
                  {alert.diffDays} روز مانده تا موعد ({alert.jalaliDue})
                </span>
              )}
            </AlertLine>
          ))}
        </MessagesList>
      </ContentGroup>

      <ActionLink to="/checkups" $overdue={hasOverdue}>
        <span>ثبت / مشاهده چکاپ‌ها</span>
        <ArrowLeft size={15} />
      </ActionLink>
    </Banner>
  );
}

const Banner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 12px 16px;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.radii.lg};
  background-color: ${({ theme, $overdue }) =>
    $overdue ? theme.colors.glucose.low.bg : theme.colors.glucose.elevated.bg};
  border: 1.5px solid
    ${({ theme, $overdue }) =>
      $overdue
        ? theme.colors.glucose.low.border
        : theme.colors.glucose.elevated.border};
  color: ${({ theme, $overdue }) =>
    $overdue
      ? theme.colors.glucose.low.text
      : theme.colors.glucose.elevated.text};
`;

const ContentGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const IconWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const MessagesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const AlertLine = styled.p`
  font-size: 0.88rem;
  line-height: 1.5;
`;

const ActionLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: 0.82rem;
  font-weight: 700;
  text-decoration: none;
  background-color: ${({ theme }) => theme.colors.bgSurface};
  color: ${({ theme, $overdue }) =>
    $overdue
      ? theme.colors.glucose.low.text
      : theme.colors.glucose.elevated.text};
  border: 1px solid currentColor;
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 0.85;
  }
`;
