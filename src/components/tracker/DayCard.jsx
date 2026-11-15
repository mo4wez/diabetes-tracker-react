import { useState, useEffect } from "react";
import styled from "styled-components";
import { getGlucoseTheme } from "../../styles/theme";
import { useSaveDailyLog } from "../../hooks/useLogMutations";
import { MealSlotRow } from "./MealSlotRow";

export function DayCard({ day }) {
  const { isoDate, jalaliShort, dayNameFa, isToday, log, meals } = day;
  const saveDaily = useSaveDailyLog();

  const [fasting, setFasting] = useState(log?.fasting_glucose ?? "");
  const [lantus, setLantus] = useState(log?.lantus_dose ?? 12);
  const [activity, setActivity] = useState(log?.activity_level || "none");
  const [notes, setNotes] = useState(log?.daily_notes || "");
  const [showContext, setShowContext] = useState(
    Boolean(
      log?.daily_notes ||
      (log?.activity_level && log.activity_level !== "none"),
    ),
  );

  // Sync local inputs when switching weeks or after refetch
  useEffect(() => {
    setFasting(log?.fasting_glucose ?? "");
    setLantus(log?.lantus_dose ?? 12);
    setActivity(log?.activity_level || "none");
    setNotes(log?.daily_notes || "");
  }, [log]);

  const handleSaveFasting = () => {
    const numeric = fasting === "" ? null : Number(fasting);
    if (numeric === (log?.fasting_glucose ?? null)) return;
    saveDaily.mutate({ logDate: isoDate, fasting_glucose: numeric });
  };

  const handleSaveLantus = () => {
    const numeric = lantus === "" ? null : Number(lantus);
    if (numeric === (log?.lantus_dose ?? null)) return;
    saveDaily.mutate({ logDate: isoDate, lantus_dose: numeric });
  };

  const handleActivityChange = (e) => {
    const nextVal = e.target.value;
    setActivity(nextVal);
    saveDaily.mutate({ logDate: isoDate, activity_level: nextVal });
  };

  const handleSaveNotes = () => {
    if (notes.trim() === (log?.daily_notes || "")) return;
    saveDaily.mutate({ logDate: isoDate, daily_notes: notes.trim() || null });
  };

  const fastingColors = getGlucoseTheme(fasting, "fasting");

  return (
    <Card $isToday={isToday} className="avoid-page-break">
      <CardHeader>
        <DayTitleGroup>
          <DayName>{dayNameFa}</DayName>
          <DateLabel>{jalaliShort}</DateLabel>
        </DayTitleGroup>
        {isToday && <TodayBadge className="no-print">امروز</TodayBadge>}
      </CardHeader>

      {/* Morning Fasting BG & Midnight Lantus */}
      <VitalsGrid>
        <VitalBox $colors={fastingColors}>
          <VitalLabel>قند ناشتا (۶–۸ صبح)</VitalLabel>
          <VitalInput
            type="number"
            min="20"
            max="800"
            placeholder="---"
            value={fasting}
            onChange={(e) => setFasting(e.target.value)}
            onBlur={handleSaveFasting}
          />
        </VitalBox>

        <LantusBox>
          <VitalLabel>لانتوس (۱۲ شب)</VitalLabel>
          <VitalInput
            type="number"
            step="0.5"
            min="0"
            max="100"
            value={lantus}
            onChange={(e) => setLantus(e.target.value)}
            onBlur={handleSaveLantus}
          />
        </LantusBox>
      </VitalsGrid>

      {/* 3 Main Meals */}
      <MealsList>
        {["breakfast", "lunch", "dinner"].map((type) => (
          <MealSlotRow
            key={type}
            mealType={type}
            meal={meals[type]}
            logDate={isoDate}
            dailyLogId={log?.id}
          />
        ))}
      </MealsList>

      {/* Optional Activity / Stress / Notes Drawer */}
      <ContextToggle
        type="button"
        className="no-print"
        onClick={() => setShowContext((prev) => !prev)}
      >
        {showContext ? "بستن جزئیات روز ▲" : "فعالیت بدنی و یادداشت ▼"}
      </ContextToggle>

      {showContext && (
        <ContextPanel>
          <ContextRow>
            <label htmlFor={`act-${isoDate}`}>فعالیت بدنی:</label>
            <Select
              id={`act-${isoDate}`}
              value={activity}
              onChange={handleActivityChange}
            >
              <option value="none">بدون فعالیت خاص</option>
              <option value="light">سبک (پیاده‌روی کوتاه)</option>
              <option value="moderate">متوسط (ورزش ۳۰ دقیقه)</option>
              <option value="intense">سنگین</option>
            </Select>
          </ContextRow>

          <NoteInput
            type="text"
            placeholder="یادداشت (استرس، بیماری، دلیل افت یا افزایش قند...)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={handleSaveNotes}
          />
        </ContextPanel>
      )}
    </Card>
  );
}

const Card = styled.article`
  background-color: ${({ theme }) => theme.colors.bgSurface};
  border: ${({ theme, $isToday }) =>
    $isToday
      ? `2px solid ${theme.colors.primary}`
      : `1px solid ${theme.colors.border}`};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  padding: ${({ theme }) => theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const CardHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding-bottom: 8px;
`;

const DayTitleGroup = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
`;

const DayName = styled.h2`
  font-size: 1.05rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const DateLabel = styled.span`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const TodayBadge = styled.span`
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: ${({ theme }) => theme.radii.full};
  background-color: ${({ theme }) => theme.colors.primaryLight};
  color: ${({ theme }) => theme.colors.primary};
`;

const VitalsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`;

const VitalBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
  border-radius: ${({ theme }) => theme.radii.md};
  background-color: ${({ $colors }) => $colors.bg};
  border: 1px solid ${({ $colors }) => $colors.border};
  color: ${({ $colors }) => $colors.text};
`;

const LantusBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
  border-radius: ${({ theme }) => theme.radii.md};
  background-color: ${({ theme }) => theme.colors.lantusLight};
  border: 1px solid ${({ theme }) => theme.colors.lantus};
  color: ${({ theme }) => theme.colors.lantus};
`;

const VitalLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
`;

const VitalInput = styled.input`
  width: 100%;
  font-size: 1.05rem;
  font-weight: 700;
  padding: 2px 4px;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid transparent;
  background-color: rgba(255, 255, 255, 0.75);

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    background-color: #ffffff;
  }
`;

const MealsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const ContextToggle = styled.button`
  align-self: flex-start;
  font-size: 0.78rem;
  color: ${({ theme }) => theme.colors.textSecondary};

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const ContextPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 6px;
  border-top: 1px dashed ${({ theme }) => theme.colors.border};
`;

const ContextRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Select = styled.select`
  padding: 4px 8px;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  background-color: ${({ theme }) => theme.colors.bgSubtle};
  font-size: 0.8rem;
`;

const NoteInput = styled.input`
  width: 100%;
  padding: 6px 8px;
  font-size: 0.8rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
`;
