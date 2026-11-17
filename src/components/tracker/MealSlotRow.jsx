import { useState } from "react";
import styled, { useTheme } from "styled-components";
import { Trash2 } from "lucide-react";
import { getGlucoseTheme } from "../../styles/theme";
import { useSaveMealLog, useDeleteMealLog } from "../../hooks/useLogMutations";

const MEAL_LABELS = {
  breakfast: "صبحانه",
  lunch: "ناهار",
  dinner: "شام",
  snack: "میان‌وعده",
};

export function MealSlotRow({
  mealType,
  meal,
  logDate,
  dailyLogId,
  defaultEditing = false,
  onCancelNew,
}) {
  const theme = useTheme();
  const saveMeal = useSaveMealLog();
  const deleteMeal = useDeleteMealLog();
  const [isEditing, setIsEditing] = useState(defaultEditing);

  const defaultDose = mealType === "snack" ? "" : 4;

  const [food, setFood] = useState(meal?.food_description || "");
  const [dose, setDose] = useState(meal?.novorapid_dose ?? defaultDose);
  const [postBg, setPostBg] = useState(meal?.post_meal_glucose ?? "");
  const [notes, setNotes] = useState(meal?.meal_notes || "");

  const handleOpenEdit = () => {
    setFood(meal?.food_description || "");
    setDose(meal?.novorapid_dose ?? defaultDose);
    setPostBg(meal?.post_meal_glucose ?? "");
    setNotes(meal?.meal_notes || "");
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (!meal && onCancelNew) {
      onCancelNew();
      return;
    }
    setIsEditing(false);
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
        onSuccess: () => {
          setIsEditing(false);
          if (!meal && onCancelNew) onCancelNew();
        },
      },
    );
  };

  const handleDelete = () => {
    if (!meal?.id) return;
    deleteMeal.mutate(meal.id, {
      onSuccess: () => setIsEditing(false),
    });
  };

  const bgColors = getGlucoseTheme(
    meal?.post_meal_glucose,
    "post_meal",
    theme.mode,
  );

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
              placeholder={mealType === "snack" ? "0" : "4"}
              value={dose}
              onChange={(e) => setDose(e.target.value)}
            />
            <span>واحد</span>
          </DoseInputGroup>
        </EditHeader>

        <TextInput
          type="text"
          placeholder={
            mealType === "snack"
              ? "شرح میان‌وعده یا دلیل دوز اصلاحی (مثلاً: میوه یا اصلاح قند بالا)"
              : "چه غذایی خوردید؟ (مثلاً: نان سنگک، پنیر، گردو)"
          }
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
          {meal?.id && (
            <DeleteIconBtn
              type="button"
              onClick={handleDelete}
              disabled={deleteMeal.isPending}
              title="حذف این مورد"
            >
              <Trash2 size={14} />
              <span>حذف</span>
            </DeleteIconBtn>
          )}

          <RightBtns>
            <CancelBtn type="button" onClick={handleCancel}>
              انصراف
            </CancelBtn>
            <SaveBtn type="submit" disabled={saveMeal.isPending}>
              {saveMeal.isPending ? "در حال ذخیره..." : "ثبت"}
            </SaveBtn>
          </RightBtns>
        </Actions>
      </EditForm>
    );
  }

  return (
    <SummaryRow onClick={handleOpenEdit} title="برای ویرایش یا ثبت کلیک کنید">
      <MealBadge $isSnack={mealType === "snack"}>
        {MEAL_LABELS[mealType]}
      </MealBadge>

      <FoodText $empty={!meal?.food_description}>
        {meal?.food_description ||
          (mealType === "snack"
            ? "دوز اصلاحی / میان‌وعده"
            : "ثبت نشده — کلیک کنید")}
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
  color: ${({ theme, $isSnack }) =>
    $isSnack ? theme.colors.novorapid : theme.colors.textSecondary};
  min-width: 54px;
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
  background-color: ${({ theme }) => theme.colors.bgInput};
`;

const TextInput = styled.input`
  width: 100%;
  padding: 6px 10px;
  font-size: 0.85rem;
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  border-radius: ${({ theme }) => theme.radii.sm};
  background-color: ${({ theme }) => theme.colors.bgInput};
`;

const BottomRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const RightBtns = styled.div`
  display: flex;
  gap: 8px;
  margin-right: auto;
`;

const DeleteIconBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: ${({ theme }) => theme.radii.sm};
  color: ${({ theme }) => theme.colors.glucose.low.text};
  font-size: 0.78rem;

  &:hover {
    background-color: ${({ theme }) => theme.colors.glucose.low.bg};
  }
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
