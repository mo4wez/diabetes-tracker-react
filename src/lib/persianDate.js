import dayjs from "dayjs";
import jalaliday from "jalaliday";
import "dayjs/locale/fa";

dayjs.extend(jalaliday);

const PERSIAN_WEEKDAYS = [
  "شنبه",
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنج‌شنبه",
  "جمعه",
];

// Returns today's Gregorian ISO date ('YYYY-MM-DD') for Supabase queries.
export function getTodayIso() {
  return dayjs().format("YYYY-MM-DD");
}

// Given any Gregorian ISO date string (defaults to today), returns an array of 7 day
// objects spanning Saturday (index 0) through Friday (index 6) of that Persian week.
export function getPersianWeekDays(anchorIsoDate = getTodayIso()) {
  const anchor = dayjs(anchorIsoDate);
  const todayIso = getTodayIso();

  // JS day(): Sunday = 0 ... Saturday = 6.
  // Offset needed to step backward to Saturday:
  const daysSinceSaturday = (anchor.day() + 1) % 7;
  const saturday = anchor.subtract(daysSinceSaturday, "day");

  return Array.from({ length: 7 }, (_, index) => {
    const current = saturday.add(index, "day");
    const jalali = current.calendar("jalali");
    const isoDate = current.format("YYYY-MM-DD");

    return {
      isoDate, // '2026-11-14' -> matches daily_logs.log_date in Supabase
      jalaliDate: jalali.format("YYYY/MM/DD"), // '1405/08/23'
      jalaliShort: jalali.locale("fa").format("D MMMM"), // '۲۳ آبان'
      dayNameFa: PERSIAN_WEEKDAYS[index], // 'شنبه' .. 'جمعه'
      isToday: isoDate === todayIso,
    };
  });
}

// Shifts a Gregorian ISO anchor date forward (+1) or backward (-1) by full weeks.
export function shiftWeek(anchorIsoDate, offsetWeeks) {
  return dayjs(anchorIsoDate)
    .add(offsetWeeks * 7, "day")
    .format("YYYY-MM-DD");
}

// Shifts a Gregorian ISO anchor date forward (+1) or backward (-1) by Persian months.
export function shiftPersianMonth(anchorIsoDate, offsetMonths) {
  return dayjs(anchorIsoDate)
    .calendar("jalali")
    .add(offsetMonths, "month")
    .calendar("gregory")
    .format("YYYY-MM-DD");
}

// Given any Gregorian ISO date inside a Persian month, returns the exact Gregorian
// startDate and endDate ('YYYY-MM-DD') for Supabase range queries, plus a display label.
export function getPersianMonthRange(anchorIsoDate = getTodayIso()) {
  const jalaliAnchor = dayjs(anchorIsoDate).calendar("jalali");
  const startJalali = jalaliAnchor.startOf("month");
  const endJalali = jalaliAnchor.endOf("month");

  return {
    startDate: startJalali.calendar("gregory").format("YYYY-MM-DD"),
    endDate: endJalali.calendar("gregory").format("YYYY-MM-DD"),
    monthLabel: jalaliAnchor.locale("fa").format("MMMM YYYY"), // e.g., 'آبان ۱۴۰۵'
  };
}

// Converts a Gregorian ISO date from Supabase into a formatted Jalali string.
export function toJalali(isoDate, formatStr = "YYYY/MM/DD") {
  if (!isoDate) return "";
  return dayjs(isoDate).calendar("jalali").format(formatStr);
}
