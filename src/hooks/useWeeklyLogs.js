import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { getPersianWeekDays } from "../lib/persianDate";

/**
 * Fetches daily_logs + nested meal_logs for a 7-day Persian week (Sat-Fri)
 * and merges them into a guaranteed 7-element array.
 */
async function fetchPersianWeek(anchorIsoDate) {
  const weekDays = getPersianWeekDays(anchorIsoDate);
  const startIso = weekDays[0].isoDate; // Saturday
  const endIso = weekDays[6].isoDate; // Friday

  const { data, error } = await supabase
    .from("daily_logs")
    .select(
      `
      id,
      log_date,
      fasting_glucose,
      fasting_time,
      lantus_dose,
      lantus_time,
      activity_level,
      stress_or_illness,
      daily_notes,
      meal_logs (
        id,
        meal_type,
        novorapid_dose,
        food_description,
        post_meal_glucose,
        post_meal_time,
        meal_notes
      )
    `,
    )
    .gte("log_date", startIso)
    .lte("log_date", endIso)
    .order("log_date", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const logsByDate = new Map((data || []).map((row) => [row.log_date, row]));

  return weekDays.map((day) => {
    const existingLog = logsByDate.get(day.isoDate) || null;

    const mealsByType = {
      breakfast: null,
      lunch: null,
      dinner: null,
      snacks: [],
    };

    if (existingLog?.meal_logs) {
      for (const meal of existingLog.meal_logs) {
        if (meal.meal_type === "snack") {
          mealsByType.snacks.push(meal);
        } else if (meal.meal_type in mealsByType) {
          mealsByType[meal.meal_type] = meal;
        }
      }
    }

    return {
      ...day,
      log: existingLog,
      meals: mealsByType,
    };
  });
}

export function useWeeklyLogs(anchorIsoDate) {
  const weekDays = getPersianWeekDays(anchorIsoDate);
  const weekStartIso = weekDays[0].isoDate;

  return useQuery({
    queryKey: ["weeklyLogs", weekStartIso],
    queryFn: () => fetchPersianWeek(weekStartIso),
    staleTime: 1000 * 60 * 5,
  });
}
