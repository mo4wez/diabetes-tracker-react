import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { supabase } from "../lib/supabase";
import { getPersianMonthRange } from "../lib/persianDate";

const PERSIAN_WEEKDAYS_BY_JS_DAY = [
  "یکشنبه", // 0: Sunday
  "دوشنبه", // 1: Monday
  "سه‌شنبه", // 2: Tuesday
  "چهارشنبه", // 3: Wednesday
  "پنج‌شنبه", // 4: Thursday
  "جمعه", // 5: Friday
  "شنبه", // 6: Saturday
];

async function fetchPersianMonth(anchorIsoDate) {
  const { startDate, endDate, monthLabel } =
    getPersianMonthRange(anchorIsoDate);

  const { data, error } = await supabase
    .from("daily_logs")
    .select(
      `
      id,
      log_date,
      fasting_glucose,
      lantus_dose,
      activity_level,
      daily_notes,
      meal_logs (
        id,
        meal_type,
        novorapid_dose,
        food_description,
        post_meal_glucose
      )
    `,
    )
    .gte("log_date", startDate)
    .lte("log_date", endDate)
    .order("log_date", { ascending: true });

  if (error) throw new Error(error.message);

  const logsByDate = new Map((data || []).map((row) => [row.log_date, row]));

  const start = dayjs(startDate);
  const end = dayjs(endDate);
  const totalDays = end.diff(start, "day") + 1;

  const days = [];
  const fastingValues = [];
  const postMealValues = [];
  const allGlucoseValues = [];
  const dailyInsulinTotals = [];

  let lowCount = 0; // < 70 mg/dL
  let inRangeCount = 0; // 70 - 180 mg/dL
  let highCount = 0; // > 180 mg/dL

  const classifyReading = (val) => {
    allGlucoseValues.push(val);
    if (val < 70) lowCount++;
    else if (val <= 180) inRangeCount++;
    else highCount++;
  };

  for (let i = 0; i < totalDays; i++) {
    const current = start.add(i, "day");
    const isoDate = current.format("YYYY-MM-DD");
    const jalali = current.calendar("jalali");
    const log = logsByDate.get(isoDate) || null;

    const meals = { breakfast: null, lunch: null, dinner: null };
    let dayNovoTotal = 0;
    let hasAnyInsulin = false;

    if (log?.meal_logs) {
      for (const m of log.meal_logs) {
        if (m.meal_type in meals) {
          meals[m.meal_type] = m;
        }
        if (m.novorapid_dose != null) {
          dayNovoTotal += Number(m.novorapid_dose);
          hasAnyInsulin = true;
        }
        if (m.post_meal_glucose != null) {
          const val = Number(m.post_meal_glucose);
          postMealValues.push(val);
          classifyReading(val);
        }
      }
    }

    if (log?.fasting_glucose != null) {
      const fVal = Number(log.fasting_glucose);
      fastingValues.push(fVal);
      classifyReading(fVal);
    }

    const lantusVal = log?.lantus_dose != null ? Number(log.lantus_dose) : 0;
    if (log?.lantus_dose != null) hasAnyInsulin = true;

    if (hasAnyInsulin) {
      dailyInsulinTotals.push(dayNovoTotal + lantusVal);
    }

    days.push({
      isoDate,
      jalaliDay: jalali.format("DD"),
      jalaliDate: jalali.format("YYYY/MM/DD"),
      dayNameFa: PERSIAN_WEEKDAYS_BY_JS_DAY[current.day()],
      log,
      meals,
      dayNovoTotal: hasAnyInsulin ? dayNovoTotal : null,
    });
  }

  const avg = (arr) =>
    arr.length
      ? Math.round(arr.reduce((sum, v) => sum + v, 0) / arr.length)
      : null;

  const totalReadings = allGlucoseValues.length;
  const overallMean = totalReadings
    ? allGlucoseValues.reduce((sum, v) => sum + v, 0) / totalReadings
    : null;

  // ADAG Estimated HbA1c formula: (Mean Glucose + 46.7) / 28.7
  const estimatedA1c =
    overallMean !== null ? ((overallMean + 46.7) / 28.7).toFixed(1) : null;

  const tir = totalReadings
    ? {
        totalReadings,
        inRangePct: Math.round((inRangeCount / totalReadings) * 100),
        highPct: Math.round((highCount / totalReadings) * 100),
        lowPct: Math.round((lowCount / totalReadings) * 100),
        inRangeCount,
        highCount,
        lowCount,
      }
    : null;

  return {
    monthLabel,
    startDate,
    endDate,
    days,
    summary: {
      avgFasting: avg(fastingValues),
      avgPostMeal: avg(postMealValues),
      estimatedA1c,
      tir,
      avgTotalInsulin: dailyInsulinTotals.length
        ? (
            dailyInsulinTotals.reduce((s, v) => s + v, 0) /
            dailyInsulinTotals.length
          ).toFixed(1)
        : null,
      hypoCount: lowCount,
      loggedDaysCount: data?.length || 0,
    },
  };
}

export function useMonthlyLogs(anchorIsoDate) {
  const { startDate } = getPersianMonthRange(anchorIsoDate);

  return useQuery({
    queryKey: ["monthlyLogs", startDate],
    queryFn: () => fetchPersianMonth(startDate),
    staleTime: 1000 * 60 * 5,
  });
}
