import { useState } from "react";
import styled, { useTheme } from "styled-components";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
} from "recharts";
import { Printer } from "lucide-react";
import { getTodayIso, shiftPersianMonth } from "../lib/persianDate";
import { useMonthlyLogs } from "../hooks/useMonthlyLogs";
import { getGlucoseTheme } from "../styles/theme";

export function MonthlyReportPage() {
  const theme = useTheme();
  const [anchorDate, setAnchorDate] = useState(() => getTodayIso());
  const [chartFilter, setChartFilter] = useState("all");
  const { data, isLoading, isError, error } = useMonthlyLogs(anchorDate);

  const chartData = (data?.days || [])
    .filter(
      (d) =>
        d.log?.fasting_glucose != null ||
        d.meals.breakfast?.post_meal_glucose != null ||
        d.meals.lunch?.post_meal_glucose != null ||
        d.meals.dinner?.post_meal_glucose != null,
    )
    .map((d) => ({
      day: d.jalaliDay,
      ناشتا: d.log?.fasting_glucose ?? null,
      صبحانه: d.meals.breakfast?.post_meal_glucose ?? null,
      ناهار: d.meals.lunch?.post_meal_glucose ?? null,
      شام: d.meals.dinner?.post_meal_glucose ?? null,
    }));

  return (
    <PageWrapper>
      {/* Screen Controls */}
      <ControlsBar className="no-print">
        <MonthNav>
          <NavBtn
            onClick={() => setAnchorDate((d) => shiftPersianMonth(d, -1))}
          >
            → ماه قبل
          </NavBtn>
          <MonthTitle>{data?.monthLabel || "..."}</MonthTitle>
          <NavBtn onClick={() => setAnchorDate((d) => shiftPersianMonth(d, 1))}>
            ماه بعد ←
          </NavBtn>
          <CurrentBtn onClick={() => setAnchorDate(getTodayIso())}>
            ماه جاری
          </CurrentBtn>
        </MonthNav>

        <PrintButton onClick={() => window.print()}>
          <Printer size={16} />
          <span>چاپ گزارش ماهانه پزشک</span>
        </PrintButton>
      </ControlsBar>

      {/* Print-Only Formal Medical Header */}
      <PrintHeader className="print-only">
        <h1>جدول پایش ماهانه قند خون و انسولین</h1>
        <p>
          ماه گزارش: <strong>{data?.monthLabel}</strong> | رژیم انسولین:
          NovoRapid (پیش از وعده‌ها) + Lantus (۱۲ شب)
        </p>
      </PrintHeader>

      {isLoading && <StatusText>در حال محاسبه گزارش ماهانه...</StatusText>}
      {isError && <ErrorText>خطا در دریافت گزارش: {error.message}</ErrorText>}

      {data && (
        <>
          {/* Summary KPI Cards (Visible on Screen & Print) */}
          <SummaryGrid>
            <StatCard>
              <StatLabel>میانگین قند ناشتا</StatLabel>
              <StatValue>
                {data.summary.avgFasting ?? "—"} <Unit>mg/dL</Unit>
              </StatValue>
            </StatCard>

            <StatCard>
              <StatLabel>میانگین ۲ ساعت پس از غذا</StatLabel>
              <StatValue>
                {data.summary.avgPostMeal ?? "—"} <Unit>mg/dL</Unit>
              </StatValue>
            </StatCard>

            <StatCard>
              <StatLabel>تخمین HbA1c (GMI)</StatLabel>
              <StatValue $highlight>
                {data.summary.estimatedA1c ?? "—"} <Unit>%</Unit>
              </StatValue>
            </StatCard>

            <StatCard>
              <StatLabel>میانگین انسولین روزانه</StatLabel>
              <StatValue>
                {data.summary.avgTotalInsulin ?? "—"} <Unit>واحد</Unit>
              </StatValue>
            </StatCard>

            <StatCard>
              <StatLabel>تعداد افت قند (&lt;70)</StatLabel>
              <StatValue $alert={data.summary.hypoCount > 0}>
                {data.summary.hypoCount} <Unit>مورد</Unit>
              </StatValue>
            </StatCard>
          </SummaryGrid>

          {/* Time-in-Range (TIR) Bar (Screen & Print) */}
          {data.summary.tir && (
            <TirCard className="avoid-page-break">
              <TirHeader>
                <SectionTitle style={{ marginBottom: 0 }}>
                  زمان در محدوده هدف (Time in Range — بر اساس{" "}
                  {data.summary.tir.totalReadings} اندازه‌گیری)
                </SectionTitle>
                <TirLegend>
                  <LegendItem $color="#16a34a">
                    در محدوده هدف (۷۰–۱۸۰):{" "}
                    <strong>{data.summary.tir.inRangePct}%</strong> (
                    {data.summary.tir.inRangeCount})
                  </LegendItem>
                  <LegendItem $color="#d97706">
                    بالا (&gt;۱۸۰): <strong>{data.summary.tir.highPct}%</strong>{" "}
                    ({data.summary.tir.highCount})
                  </LegendItem>
                  <LegendItem $color="#dc2626">
                    افت قند (&lt;۷۰):{" "}
                    <strong>{data.summary.tir.lowPct}%</strong> (
                    {data.summary.tir.lowCount})
                  </LegendItem>
                </TirLegend>
              </TirHeader>

              <TirTrack>
                {data.summary.tir.inRangePct > 0 && (
                  <TirSegment
                    $width={data.summary.tir.inRangePct}
                    $bg="#16a34a"
                    title={`در محدوده هدف: ${data.summary.tir.inRangePct}%`}
                  >
                    {data.summary.tir.inRangePct >= 10 &&
                      `${data.summary.tir.inRangePct}%`}
                  </TirSegment>
                )}
                {data.summary.tir.highPct > 0 && (
                  <TirSegment
                    $width={data.summary.tir.highPct}
                    $bg="#d97706"
                    title={`بالاتر از هدف: ${data.summary.tir.highPct}%`}
                  >
                    {data.summary.tir.highPct >= 10 &&
                      `${data.summary.tir.highPct}%`}
                  </TirSegment>
                )}
                {data.summary.tir.lowPct > 0 && (
                  <TirSegment
                    $width={data.summary.tir.lowPct}
                    $bg="#dc2626"
                    title={`افت قند: ${data.summary.tir.lowPct}%`}
                  >
                    {data.summary.tir.lowPct >= 10 &&
                      `${data.summary.tir.lowPct}%`}
                  </TirSegment>
                )}
              </TirTrack>
            </TirCard>
          )}

          {/* Recharts Trend Visualization (Screen Only) */}
          {/* Recharts Trend Visualization (Screen Only) */}
          {chartData.length > 0 && (
            <ChartCard className="no-print">
              <ChartHeader>
                <SectionTitle style={{ marginBottom: 0 }}>
                  روند تغییرات قند خون در {data.monthLabel}
                </SectionTitle>

                <ChartFilterGroup>
                  <FilterPill
                    type="button"
                    $active={chartFilter === "all"}
                    onClick={() => setChartFilter("all")}
                  >
                    همه
                  </FilterPill>
                  <FilterPill
                    type="button"
                    $active={chartFilter === "fasting"}
                    onClick={() => setChartFilter("fasting")}
                  >
                    ناشتا
                  </FilterPill>
                  <FilterPill
                    type="button"
                    $active={chartFilter === "postMeal"}
                    onClick={() => setChartFilter("postMeal")}
                  >
                    بعد غذا
                  </FilterPill>
                </ChartFilterGroup>
              </ChartHeader>

              <ChartLegendRow>
                {(chartFilter === "all" || chartFilter === "fasting") && (
                  <ChartLegendBadge $color="#0284c7">ناشتا</ChartLegendBadge>
                )}
                {(chartFilter === "all" || chartFilter === "postMeal") && (
                  <>
                    <ChartLegendBadge $color="#16a34a">صبحانه</ChartLegendBadge>
                    <ChartLegendBadge $color="#d97706">ناهار</ChartLegendBadge>
                    <ChartLegendBadge $color="#9333ea">شام</ChartLegendBadge>
                  </>
                )}
              </ChartLegendRow>

              <ChartContainer>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart
                    data={chartData}
                    margin={{ top: 12, right: 12, left: 0, bottom: 4 }}
                  >
                    <defs>
                      <linearGradient
                        id="fastingGrad"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#0284c7"
                          stopOpacity={0.22}
                        />
                        <stop
                          offset="95%"
                          stopColor="#0284c7"
                          stopOpacity={0.0}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke={theme.colors.border}
                    />

                    {/* Subtle green target range band (70 - 180 mg/dL) */}
                    <ReferenceArea
                      y1={70}
                      y2={180}
                      fill="#16a34a"
                      fillOpacity={theme.mode === "dark" ? 0.08 : 0.05}
                    />

                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      stroke={theme.colors.textSecondary}
                      tick={{ fontSize: 11 }}
                      tickMargin={8}
                    />

                    <YAxis
                      width={34}
                      domain={[
                        50,
                        (dataMax) =>
                          Math.max(190, Math.ceil((dataMax + 15) / 10) * 10),
                      ]}
                      axisLine={false}
                      tickLine={false}
                      stroke={theme.colors.textSecondary}
                      tick={{ fontSize: 11 }}
                    />

                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme.colors.bgSurface,
                        borderColor: theme.colors.borderStrong,
                        borderRadius: "10px",
                        boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                        fontSize: "12px",
                        direction: "rtl",
                      }}
                      labelFormatter={(label) => `روز ${label} ماه`}
                    />

                    <ReferenceLine
                      y={70}
                      stroke={theme.colors.glucose.low.text}
                      strokeDasharray="4 4"
                      strokeOpacity={0.75}
                    />
                    <ReferenceLine
                      y={180}
                      stroke={theme.colors.glucose.elevated.text}
                      strokeDasharray="4 4"
                      strokeOpacity={0.75}
                    />

                    {(chartFilter === "all" || chartFilter === "fasting") && (
                      <Area
                        type="monotone"
                        dataKey="ناشتا"
                        stroke="#0284c7"
                        strokeWidth={2.5}
                        fill="url(#fastingGrad)"
                        dot={{
                          r: 3.5,
                          fill: theme.colors.bgSurface,
                          strokeWidth: 2,
                        }}
                        activeDot={{ r: 5 }}
                        connectNulls
                      />
                    )}

                    {(chartFilter === "all" || chartFilter === "postMeal") && (
                      <>
                        <Area
                          type="monotone"
                          dataKey="صبحانه"
                          stroke="#16a34a"
                          strokeWidth={2}
                          fill="none"
                          dot={{
                            r: 3.5,
                            fill: theme.colors.bgSurface,
                            strokeWidth: 2,
                          }}
                          activeDot={{ r: 5 }}
                          connectNulls
                        />
                        <Area
                          type="monotone"
                          dataKey="ناهار"
                          stroke="#d97706"
                          strokeWidth={2}
                          fill="none"
                          dot={{
                            r: 3.5,
                            fill: theme.colors.bgSurface,
                            strokeWidth: 2,
                          }}
                          activeDot={{ r: 5 }}
                          connectNulls
                        />
                        <Area
                          type="monotone"
                          dataKey="شام"
                          stroke="#9333ea"
                          strokeWidth={2}
                          fill="none"
                          dot={{
                            r: 3.5,
                            fill: theme.colors.bgSurface,
                            strokeWidth: 2,
                          }}
                          activeDot={{ r: 5 }}
                          connectNulls
                        />
                      </>
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </ChartCard>
          )}

          {/* Printable Monthly Logbook Table */}
          <TableWrapper>
            <LogTable>
              <thead>
                <tr>
                  <th>تاریخ</th>
                  <th>روز</th>
                  <th>ناشتا</th>
                  <th>صبحانه (قند / انسولین)</th>
                  <th>ناهار (قند / انسولین)</th>
                  <th>شام (قند / انسولین)</th>
                  <th>لانتوس شب</th>
                  <th>وعده‌ها و یادداشت</th>
                </tr>
              </thead>
              <tbody>
                {data.days.map((day) => {
                  const fastingStyle = getGlucoseTheme(
                    day.log?.fasting_glucose,
                    "fasting",
                    theme.mode,
                  );
                  const fastingPrintStyle = getGlucoseTheme(
                    day.log?.fasting_glucose,
                    "fasting",
                    "light",
                  );

                  const mealDescriptions = [
                    day.meals.breakfast?.food_description &&
                      `ص: ${day.meals.breakfast.food_description}`,
                    day.meals.lunch?.food_description &&
                      `ن: ${day.meals.lunch.food_description}`,
                    day.meals.dinner?.food_description &&
                      `ش: ${day.meals.dinner.food_description}`,
                    day.log?.daily_notes && `(${day.log.daily_notes})`,
                  ]
                    .filter(Boolean)
                    .join(" | ");

                  return (
                    <tr key={day.isoDate}>
                      <td className="ltr-number">{day.jalaliDate}</td>
                      <td>{day.dayNameFa}</td>

                      <GlucoseCell
                        $colors={fastingStyle}
                        $printColors={fastingPrintStyle}
                      >
                        {day.log?.fasting_glucose ?? "—"}
                      </GlucoseCell>

                      {["breakfast", "lunch", "dinner"].map((type) => {
                        const m = day.meals[type];
                        const mStyle = getGlucoseTheme(
                          m?.post_meal_glucose,
                          "post_meal",
                          theme.mode,
                        );
                        const mPrintStyle = getGlucoseTheme(
                          m?.post_meal_glucose,
                          "post_meal",
                          "light",
                        );
                        return (
                          <GlucoseCell
                            key={type}
                            $colors={mStyle}
                            $printColors={mPrintStyle}
                          >
                            {m?.post_meal_glucose ?? "—"}
                            {m?.novorapid_dose != null && (
                              <DoseSub> ({m.novorapid_dose}u)</DoseSub>
                            )}
                          </GlucoseCell>
                        );
                      })}

                      <td className="ltr-number">
                        {day.log?.lantus_dose != null
                          ? `${day.log.lantus_dose}u`
                          : "—"}
                      </td>

                      <NotesCell>{mealDescriptions || "—"}</NotesCell>
                    </tr>
                  );
                })}
              </tbody>
            </LogTable>
          </TableWrapper>
        </>
      )}
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  max-width: 1320px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.md};

  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing.md} 12px;
  }

  @media print {
    padding: 0;
    max-width: 100%;
  }
`;

const ControlsBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background-color: ${({ theme }) => theme.colors.bgSurface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    padding: 14px;
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }
`;

const MonthNav = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 8px;
    width: 100%;
  }
`;

const MonthTitle = styled.h1`
  font-size: 1.1rem;
  font-weight: 700;
  min-width: 130px;
  text-align: center;
  color: ${({ theme }) => theme.colors.primary};

  @media (max-width: 768px) {
    min-width: 0;
    font-size: 1rem;
  }
`;

const NavBtn = styled.button`
  padding: 6px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  background-color: ${({ theme }) => theme.colors.bgSubtle};
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;

  @media (max-width: 768px) {
    padding: 7px 10px;
    font-size: 0.8rem;
  }
`;

const CurrentBtn = styled(NavBtn)`
  background-color: ${({ theme }) => theme.colors.primaryLight};
  border-color: transparent;
  color: ${({ theme }) => theme.colors.primary};

  @media (max-width: 768px) {
    grid-column: 1 / -1;
    width: 100%;
    padding: 8px;
  }
`;

const PrintButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: ${({ theme }) => theme.radii.md};
  background-color: ${({ theme }) => theme.colors.primary};
  color: #ffffff;
  font-weight: 600;
  font-size: 0.9rem;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
  }

  @media (max-width: 768px) {
    width: 100%;
    padding: 9px 14px;
  }
`;

const PrintHeader = styled.div`
  margin-bottom: 12px;
  border-bottom: 2px solid #000;
  padding-bottom: 6px;

  h1 {
    font-size: 15pt;
    margin-bottom: 2px;
  }
  p {
    font-size: 10pt;
  }
`;

const SummaryGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(185px, 1fr));
  gap: 12px;
  margin-bottom: ${({ theme }) => theme.spacing.md};

  @media (max-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;

    /* Span the 5th card neatly across the bottom row */
    > div:last-child {
      grid-column: 1 / -1;
    }
  }

  @media print {
    grid-template-columns: repeat(5, 1fr);
    gap: 6px;
    margin-bottom: 8px;

    > div:last-child {
      grid-column: auto;
    }
  }
`;

const StatCard = styled.div`
  background-color: ${({ theme }) => theme.colors.bgSurface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 12px 14px;

  @media (max-width: 600px) {
    padding: 10px 12px;
    text-align: center;
  }

  @media print {
    background-color: #ffffff !important;
    border: 1px solid #999 !important;
    padding: 5px 8px;
    text-align: right;
  }
`;

const StatLabel = styled.div`
  font-size: 0.78rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 4px;

  @media print {
    color: #475569 !important;
  }
`;

const StatValue = styled.div`
  font-size: 1.3rem;
  font-weight: 700;
  color: ${({ theme, $alert, $highlight }) => {
    if ($alert) return theme.colors.glucose.low.text;
    if ($highlight) return theme.colors.primary;
    return theme.colors.textPrimary;
  }};

  @media print {
    font-size: 11.5pt;
    color: ${({ $alert }) => ($alert ? "#b91c1c" : "#0f172a")} !important;
  }
`;

const Unit = styled.span`
  font-size: 0.75rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const TirCard = styled.section`
  background-color: ${({ theme }) => theme.colors.bgSurface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 14px 16px;
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  @media print {
    background-color: #ffffff !important;
    border: 1px solid #999 !important;
    padding: 8px 10px;
    margin-bottom: 10px;
  }
`;

const TirHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
`;

const TirLegend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  font-size: 0.82rem;
`;

const LegendItem = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: ${({ theme }) => theme.colors.textSecondary};

  &::before {
    content: "";
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: ${({ $color }) => $color};
  }

  @media print {
    color: #0f172a !important;
  }
`;

const TirTrack = styled.div`
  width: 100%;
  height: 24px;
  border-radius: ${({ theme }) => theme.radii.full};
  overflow: hidden;
  display: flex;
  background-color: ${({ theme }) => theme.colors.bgSubtle};

  @media print {
    height: 16px;
    border: 1px solid #888;
  }
`;

const TirSegment = styled.div`
  width: ${({ $width }) => $width}%;
  background-color: ${({ $bg }) => $bg};
  color: #ffffff;
  font-size: 0.78rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: width 0.3s ease;
`;

const ChartCard = styled.section`
  background-color: ${({ theme }) => theme.colors.bgSurface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const SectionTitle = styled.h2`
  font-size: 0.95rem;
  font-weight: 700;
  margin-bottom: 12px;
  color: ${({ theme }) => theme.colors.textPrimary};

  @media print {
    font-size: 9.5pt;
    color: #0f172a !important;
  }
`;

const ChartContainer = styled.div`
  width: 100%;
  direction: ltr;
`;

const ChartHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
`;

const ChartFilterGroup = styled.div`
  display: inline-flex;
  background-color: ${({ theme }) => theme.colors.bgSubtle};
  padding: 3px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const FilterPill = styled.button`
  padding: 4px 10px;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: 0.78rem;
  font-weight: 600;
  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.primary : "transparent"};
  color: ${({ theme, $active }) =>
    $active ? "#ffffff" : theme.colors.textSecondary};
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
`;

const ChartLegendRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 8px;
  font-size: 0.78rem;
`;

const ChartLegendBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 600;

  &::before {
    content: "";
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background-color: ${({ $color }) => $color};
  }
`;

const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  background-color: ${({ theme }) => theme.colors.bgSurface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};

  @media print {
    background-color: #ffffff !important;
    border: none;
    overflow: visible;
  }
`;

const LogTable = styled.table`
  width: 100%;
  min-width: 760px;
  border-collapse: collapse;
  font-size: 0.85rem;

  th,
  td {
    border: 1px solid ${({ theme }) => theme.colors.border};
    padding: 7px 8px;
    text-align: center;
    white-space: nowrap;
  }

  th {
    background-color: ${({ theme }) => theme.colors.bgSubtle};
    font-weight: 700;
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  @media print {
    min-width: auto;
    font-size: 8.5pt;
    background-color: #ffffff !important;
    color: #000000 !important;

    th,
    td {
      border: 1px solid #888 !important;
      padding: 3px 4px;
      color: #000000 !important;
      white-space: normal;
    }

    td {
      background-color: #ffffff !important;
    }

    th {
      background-color: #f1f5f9 !important;
    }
  }
`;

const GlucoseCell = styled.td`
  direction: ltr;
  font-weight: 700;
  background-color: ${({ $colors }) => $colors.bg};
  color: ${({ $colors }) => $colors.text};

  @media print {
    background-color: ${({ $printColors, $colors }) =>
      ($printColors || $colors).bg} !important;
    color: ${({ $printColors, $colors }) =>
      ($printColors || $colors).text} !important;
  }
`;

const DoseSub = styled.span`
  font-weight: 500;
  font-size: 0.75em;
  opacity: 0.85;
`;

const NotesCell = styled.td`
  text-align: right !important;
  max-width: 280px;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textSecondary};

  @media print {
    color: #000000 !important;
    max-width: none;
  }
`;

const StatusText = styled.p`
  text-align: center;
  padding: 24px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ErrorText = styled(StatusText)`
  color: ${({ theme }) => theme.colors.glucose.low.text};
`;
