import { useState } from "react";
import styled from "styled-components";
import { getGlucoseTheme } from "../../styles/theme";
import { useSaveMealLog } from "../../hooks/useLogMutations";

const MEAL_LABELS = {
  breakfast: "صبحانه",
  lunch: "ناهار",
  dinner: "شام",
};

export function MealSlotRow({ mealType, meal, logDate, dailyLogId }) {
  const saveMeal = useSaveMealLog();
  const [isEditing, setIsEditing] = useState(false);

  const [food, setFood] = useState(meal?.food_description || "");
  const [dose, setDose] = useState(meal?.novorapid_dose ?? 4);
  const [postBg, setPostBg] = useState(meal?.post_meal_glucose ?? "");
  const [notes, setNotes] = useState(meal?.meal_notes || "");

  const handleOpenEdit = () => {
    setFood(meal?.food_description || "");
    setDose(meal?.novorapid_dose ?? 4);
    setPostBg(meal?.post_meal_glucose ?? "");
    setNotes(meal?.meal_notes || "");
    setIsEditing(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    saveMeal.mutate(
      {
        mealId: meal?.id,
        dailyLogId,
        logDate,
        mealType,
        novorapidDose: dose === "" ? null : Number(dose),
        foodDescription: food.trim(),
        postMealGlucose: postBg === "" ? null : Number(postBg),
        mealNotes: notes.trim(),
      },
      {
        onSuccess: () => setIsEditing(false),
      },
    );
  };

  const bgColors = getGlucoseTheme(meal?.post_meal_glucose, "post_meal");

  if (isEditing) {
    return (
      <EditForm onSubmit={handleSave}>
        <EditHeader>
          <MealTitle>{MEAL_LABELS[mealType]}</MealTitle>
          <DoseInputGroup>
            <span>نووراپید:</span>
            <SmallNumberInput
              type="number"
              step="0.5"
              min="0"
              max="50"
              value={dose}
              onChange={(e) => setDose(e.target.value)}
            />
            <span>واحد</span>
          </DoseInputGroup>
        </EditHeader>

        <TextInput
          type="text"
          placeholder="چه غذایی خوردید؟ (مثلاً: نان سنگک، پنیر، گردو)"
          value={food}
          onChange={(e) => setFood(e.target.value)}
          autoFocus
        />

        <BottomRow>
          <DoseInputGroup>
            <span>قند ۲ ساعت بعد:</span>
            <SmallNumberInput
              type="number"
              min="20"
              max="800"
              placeholder="---"
              value={postBg}
              onChange={(e) => setPostBg(e.target.value)}
            />
          </DoseInputGroup>

          <TextInput
            type="text"
            placeholder="یادداشت (اختیاری)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </BottomRow>

        <Actions className="no-print">
          <SaveBtn type="submit" disabled={saveMeal.isPending}>
            {saveMeal.isPending ? "در حال ذخیره..." : "ثبت"}
          </SaveBtn>
          <CancelBtn type="button" onClick={() => setIsEditing(false)}>
            انصراف
          </CancelBtn>
        </Actions>
      </EditForm>
    );
  }

  return (
    <SummaryRow onClick={handleOpenEdit} title="برای ویرایش یا ثبت کلیک کنید">
      <MealBadge>{MEAL_LABELS[mealType]}</MealBadge>

      <FoodText $empty={!meal?.food_description}>
        {meal?.food_description || "ثبت نشده — کلیک کنید"}
      </FoodText>

      <MetricsGroup>
        {meal?.novorapid_dose != null && (
          <InsulinPill>{meal.novorapid_dose}u</InsulinPill>
        )}
        <GlucosePill $colors={bgColors}>
          {meal?.post_meal_glucose ? `${meal.post_meal_glucose}` : "—"}
        </GlucosePill>
      </MetricsGroup>
    </SummaryRow>
  );
}

const SummaryRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: 8px 10px;
  border-radius: ${({ theme }) => theme.radii.sm};
  background-color: ${({ theme }) => theme.colors.bgSubtle};
  border: 1px solid ${({ theme }) => theme.colors.border};
  cursor: pointer;
  transition: border-color 0.15s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const MealBadge = styled.span`
  font-size: 0.8rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textSecondary};
  min-width: 48px;
`;

const FoodText = styled.span`
  flex: 1;
  font-size: 0.85rem;
  color: ${({ theme, $empty }) =>
    $empty ? theme.colors.textMuted : theme.colors.textPrimary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const MetricsGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const InsulinPill = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: ${({ theme }) => theme.radii.full};
  background-color: ${({ theme }) => theme.colors.novorapidLight};
  color: ${({ theme }) => theme.colors.novorapid};
  direction: ltr;
`;

const GlucosePill = styled.span`
  font-size: 0.8rem;
  font-weight: 700;
  min-width: 40px;
  text-align: center;
  padding: 2px 8px;
  border-radius: ${({ theme }) => theme.radii.full};
  background-color: ${({ $colors }) => $colors.bg};
  color: ${({ $colors }) => $colors.text};
  border: 1px solid ${({ $colors }) => $colors.border};
  direction: ltr;
`;

const EditForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  border-radius: ${({ theme }) => theme.radii.md};
  background-color: ${({ theme }) => theme.colors.bgSurface};
  border: 1.5px solid ${({ theme }) => theme.colors.primary};
`;

const EditHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const MealTitle = styled.span`
  font-weight: 700;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.primary};
`;

const DoseInputGroup = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const SmallNumberInput = styled.input`
  width: 64px;
  padding: 4px 6px;
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  border-radius: ${({ theme }) => theme.radii.sm};
  background-color: ${({ theme }) => theme.colors.bgSubtle};
`;

const TextInput = styled.input`
  width: 100%;
  padding: 6px 10px;
  font-size: 0.85rem;
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  border-radius: ${({ theme }) => theme.radii.sm};
`;

const BottomRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
`;

const SaveBtn = styled.button`
  padding: 4px 12px;
  border-radius: ${({ theme }) => theme.radii.sm};
  background-color: ${({ theme }) => theme.colors.primary};
  color: #ffffff;
  font-size: 0.8rem;
  font-weight: 600;
`;

const CancelBtn = styled.button`
  padding: 4px 10px;
  border-radius: ${({ theme }) => theme.radii.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.8rem;
`;
