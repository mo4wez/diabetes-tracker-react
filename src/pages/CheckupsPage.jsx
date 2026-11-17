import { useState, useRef } from "react";
import styled from "styled-components";
import dayjs from "dayjs";
import {
  CalendarCheck,
  Eye,
  Activity,
  Trash2,
  PlusCircle,
  Paperclip,
  FileText,
} from "lucide-react";
import {
  useCheckups,
  useSaveCheckup,
  useDeleteCheckup,
  openCheckupFile,
} from "../hooks/useCheckups";

const CHECKUP_META = {
  hba1c: {
    label: "آزمایش HbA1c (۳ ماهه)",
    placeholderResult: "مثلاً: 6.7%",
  },
  eye_exam: {
    label: "معاینه شبکیه چشم (سالانه)",
    placeholderResult: "مثلاً: نرمال / بدون رتینوپاتی",
  },
  kidney_lipid: {
    label: "آزمایش کلیه و چربی خون",
    placeholderResult: "مثلاً: کراتینین 0.9 - LDL 95",
  },
  other: {
    label: "سایر چکاپ‌ها",
    placeholderResult: "نتیجه معاینه یا آزمایش",
  },
};

function toJalaliDisplay(isoDate) {
  if (!isoDate) return "—";
  return dayjs(isoDate).calendar("jalali").format("YYYY/MM/DD");
}

function getDueStatus(nextDueIso) {
  if (!nextDueIso) return { text: "ثبت نشده", tone: "neutral" };
  const today = dayjs().startOf("day");
  const due = dayjs(nextDueIso).startOf("day");
  const diff = due.diff(today, "day");

  if (diff < 0) {
    return { text: `${Math.abs(diff)} روز گذشته از موعد`, tone: "overdue" };
  }
  if (diff <= 14) {
    return {
      text: diff === 0 ? "موعد امروز است" : `${diff} روز مانده تا موعد`,
      tone: "soon",
    };
  }
  return { text: `${diff} روز مانده`, tone: "ok" };
}

export function CheckupsPage() {
  const { data: checkups = [], isLoading, isError, error } = useCheckups();
  const saveCheckup = useSaveCheckup();
  const deleteCheckup = useDeleteCheckup();
  const fileInputRef = useRef(null);

  const todayJalali = dayjs().calendar("jalali").format("YYYY/MM/DD");

  const [checkupType, setCheckupType] = useState("hba1c");
  const [jalaliDateInput, setJalaliDateInput] = useState(todayJalali);
  const [resultValue, setResultValue] = useState("");
  const [doctorOrLab, setDoctorOrLab] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [formError, setFormError] = useState("");

  const latestHba1c = checkups.find((c) => c.checkup_type === "hba1c");
  const latestEye = checkups.find((c) => c.checkup_type === "eye_exam");

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setFormError("حجم فایل نباید بیشتر از ۱۰ مگابایت باشد.");
      e.target.value = "";
      return;
    }
    setFormError("");
    setSelectedFile(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");

    const normalized = jalaliDateInput.trim().replace(/-/g, "/");
    const parsed = dayjs(normalized, { jalali: true });

    if (!parsed.isValid() || !/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(normalized)) {
      setFormError("فرمت تاریخ شمسی معتبر نیست (مثال صحیح: 1405/08/27)");
      return;
    }

    const isoDate = parsed.calendar("gregory").format("YYYY-MM-DD");

    saveCheckup.mutate(
      {
        checkupType,
        checkupDate: isoDate,
        resultValue,
        doctorOrLab,
        notes,
        file: selectedFile,
      },
      {
        onSuccess: () => {
          setResultValue("");
          setDoctorOrLab("");
          setNotes("");
          setSelectedFile(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
        },
        onError: (err) => setFormError(err.message),
      },
    );
  };

  const handleOpenAttachment = async (filePath) => {
    try {
      await openCheckupFile(filePath);
    } catch (err) {
      setFormError(`خطا در باز کردن فایل: ${err.message}`);
    }
  };

  const hba1cStatus = getDueStatus(latestHba1c?.next_due_date);
  const eyeStatus = getDueStatus(latestEye?.next_due_date);

  return (
    <PageWrapper>
      <HeaderRow>
        <div>
          <PageTitle>آزمایش HbA1c و چکاپ‌های دوره‌ای</PageTitle>
          <SubTitle>
            پیگیری خودکار موعد آزمایش سه‌ماهه هموگلوبین A1c، معاینه سالانه چشم و
            آرشیو فایل‌های آزمایشگاهی
          </SubTitle>
        </div>
      </HeaderRow>

      <RemindersGrid>
        <ReminderCard $tone={hba1cStatus.tone}>
          <CardTop>
            <IconBadge>
              <Activity size={20} />
            </IconBadge>
            <StatusPill $tone={hba1cStatus.tone}>{hba1cStatus.text}</StatusPill>
          </CardTop>
          <ReminderTitle>آزمایش HbA1c (هر ۳ ماه)</ReminderTitle>
          <MetaLine>
            آخرین نتیجه:{" "}
            <strong>{latestHba1c?.result_value || "هنوز ثبت نشده"}</strong>
          </MetaLine>
          <MetaLine>
            تاریخ انجام:{" "}
            <span className="ltr-number">
              {toJalaliDisplay(latestHba1c?.checkup_date)}
            </span>
          </MetaLine>
          <MetaLine>
            موعد بعدی:{" "}
            <strong className="ltr-number">
              {toJalaliDisplay(latestHba1c?.next_due_date)}
            </strong>
          </MetaLine>
        </ReminderCard>

        <ReminderCard $tone={eyeStatus.tone}>
          <CardTop>
            <IconBadge>
              <Eye size={20} />
            </IconBadge>
            <StatusPill $tone={eyeStatus.tone}>{eyeStatus.text}</StatusPill>
          </CardTop>
          <ReminderTitle>معاینه چشم پزشکی (سالانه)</ReminderTitle>
          <MetaLine>
            آخرین وضعیت:{" "}
            <strong>{latestEye?.result_value || "هنوز ثبت نشده"}</strong>
          </MetaLine>
          <MetaLine>
            تاریخ انجام:{" "}
            <span className="ltr-number">
              {toJalaliDisplay(latestEye?.checkup_date)}
            </span>
          </MetaLine>
          <MetaLine>
            موعد بعدی:{" "}
            <strong className="ltr-number">
              {toJalaliDisplay(latestEye?.next_due_date)}
            </strong>
          </MetaLine>
        </ReminderCard>
      </RemindersGrid>

      <FormCard className="no-print" onSubmit={handleSubmit}>
        <FormHeader>
          <PlusCircle size={18} />
          <span>ثبت آزمایش یا معاینه جدید</span>
        </FormHeader>

        <FormGrid>
          <FieldGroup>
            <Label htmlFor="checkup-type">نوع چکاپ</Label>
            <Select
              id="checkup-type"
              value={checkupType}
              onChange={(e) => setCheckupType(e.target.value)}
            >
              <option value="hba1c">آزمایش HbA1c (سه‌ماهه)</option>
              <option value="eye_exam">معاینه چشم (سالانه)</option>
              <option value="kidney_lipid">
                آزمایش کلیه و چربی خون (شش‌ماهه)
              </option>
              <option value="other">سایر آزمایش‌ها / ویزیت</option>
            </Select>
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="checkup-date">تاریخ انجام (شمسی)</Label>
            <Input
              id="checkup-date"
              type="text"
              dir="ltr"
              placeholder="1405/08/27"
              value={jalaliDateInput}
              onChange={(e) => setJalaliDateInput(e.target.value)}
            />
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="checkup-result">نتیجه / مقدار</Label>
            <Input
              id="checkup-result"
              type="text"
              placeholder={CHECKUP_META[checkupType].placeholderResult}
              value={resultValue}
              onChange={(e) => setResultValue(e.target.value)}
            />
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="checkup-doctor">پزشک یا آزمایشگاه (اختیاری)</Label>
            <Input
              id="checkup-doctor"
              type="text"
              placeholder="نام آزمایشگاه یا پزشک"
              value={doctorOrLab}
              onChange={(e) => setDoctorOrLab(e.target.value)}
            />
          </FieldGroup>
        </FormGrid>

        <BottomFormRow>
          <Input
            type="text"
            placeholder="توضیحات یا توصیه پزشک (اختیاری)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <FileUploadLabel>
            <Paperclip size={16} />
            <span>
              {selectedFile
                ? selectedFile.name
                : "پیوست فایل PDF یا تصویر آزمایش (اختیاری)"}
            </span>
            <HiddenFileInput
              ref={fileInputRef}
              type="file"
              accept=".pdf,image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
            />
          </FileUploadLabel>

          <SubmitButton type="submit" disabled={saveCheckup.isPending}>
            <CalendarCheck size={16} />
            <span>{saveCheckup.isPending ? "در حال ثبت..." : "ثبت چکاپ"}</span>
          </SubmitButton>
        </BottomFormRow>

        {formError && <ErrorBanner>{formError}</ErrorBanner>}
      </FormCard>

      <HistoryCard>
        <SectionTitle>سوابق آزمایش‌ها و چکاپ‌ها</SectionTitle>

        {isLoading && <InfoText>در حال دریافت سوابق...</InfoText>}
        {isError && <ErrorBanner>خطا: {error.message}</ErrorBanner>}

        {!isLoading && checkups.length === 0 ? (
          <InfoText>هنوز هیچ آزمایش یا چکاپی ثبت نشده است.</InfoText>
        ) : (
          <TableScroll>
            <Table>
              <thead>
                <tr>
                  <th>نوع چکاپ</th>
                  <th>تاریخ انجام</th>
                  <th>نتیجه</th>
                  <th>موعد بعدی</th>
                  <th>پزشک / آزمایشگاه</th>
                  <th>فایل پیوست</th>
                  <th>یادداشت</th>
                  <th className="no-print">حذف</th>
                </tr>
              </thead>
              <tbody>
                {checkups.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>
                        {CHECKUP_META[item.checkup_type]?.label ||
                          item.checkup_type}
                      </strong>
                    </td>
                    <td className="ltr-number">
                      {toJalaliDisplay(item.checkup_date)}
                    </td>
                    <td>{item.result_value || "—"}</td>
                    <td className="ltr-number">
                      {toJalaliDisplay(item.next_due_date)}
                    </td>
                    <td>{item.doctor_or_lab || "—"}</td>
                    <td>
                      {item.file_path ? (
                        <ViewFileBtn
                          type="button"
                          onClick={() => handleOpenAttachment(item.file_path)}
                          title={item.file_name || "مشاهده فایل"}
                        >
                          <FileText size={15} />
                          <span>مشاهده فایل</span>
                        </ViewFileBtn>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>{item.notes || "—"}</td>
                    <td className="no-print">
                      <DeleteBtn
                        type="button"
                        title="حذف رکورد"
                        onClick={() =>
                          deleteCheckup.mutate({
                            id: item.id,
                            filePath: item.file_path,
                          })
                        }
                      >
                        <Trash2 size={15} />
                      </DeleteBtn>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableScroll>
        )}
      </HistoryCard>
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  max-width: 1120px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.md};
`;

const HeaderRow = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const PageTitle = styled.h1`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const SubTitle = styled.p`
  font-size: 0.88rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 4px;
`;

const RemindersGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const ReminderCard = styled.div`
  background-color: ${({ theme }) => theme.colors.bgSurface};
  border: 1.5px solid
    ${({ theme, $tone }) => {
      if ($tone === "overdue") return theme.colors.glucose.low.border;
      if ($tone === "soon") return theme.colors.glucose.elevated.border;
      if ($tone === "ok") return theme.colors.glucose.target.border;
      return theme.colors.border;
    }};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: ${({ theme }) => theme.spacing.md};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CardTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const IconBadge = styled.div`
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.radii.md};
  background-color: ${({ theme }) => theme.colors.primaryLight};
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StatusPill = styled.span`
  font-size: 0.78rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: ${({ theme }) => theme.radii.full};
  background-color: ${({ theme, $tone }) => {
    if ($tone === "overdue") return theme.colors.glucose.low.bg;
    if ($tone === "soon") return theme.colors.glucose.elevated.bg;
    if ($tone === "ok") return theme.colors.glucose.target.bg;
    return theme.colors.glucose.empty.bg;
  }};
  color: ${({ theme, $tone }) => {
    if ($tone === "overdue") return theme.colors.glucose.low.text;
    if ($tone === "soon") return theme.colors.glucose.elevated.text;
    if ($tone === "ok") return theme.colors.glucose.target.text;
    return theme.colors.glucose.empty.text;
  }};
`;

const ReminderTitle = styled.h2`
  font-size: 1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-top: 4px;
`;

const MetaLine = styled.p`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const FormCard = styled.form`
  background-color: ${({ theme }) => theme.colors.bgSurface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const FormHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.primary};
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 12px;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Label = styled.label`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 10px;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  background-color: ${({ theme }) => theme.colors.bgInput};
  font-size: 0.88rem;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 8px 10px;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  background-color: ${({ theme }) => theme.colors.bgInput};
  font-size: 0.88rem;
`;

const BottomFormRow = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;

  > input {
    flex: 1;
    min-width: 220px;
  }
`;

const FileUploadLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px dashed ${({ theme }) => theme.colors.borderStrong};
  background-color: ${({ theme }) => theme.colors.bgSubtle};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.84rem;
  cursor: pointer;
  max-width: 290px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const SubmitButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border-radius: ${({ theme }) => theme.radii.md};
  background-color: ${({ theme }) => theme.colors.primary};
  color: #ffffff;
  font-weight: 600;
  font-size: 0.9rem;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const HistoryCard = styled.section`
  background-color: ${({ theme }) => theme.colors.bgSurface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: ${({ theme }) => theme.spacing.md};
`;

const SectionTitle = styled.h2`
  font-size: 0.98rem;
  font-weight: 700;
  margin-bottom: 12px;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const TableScroll = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.86rem;

  th,
  td {
    border: 1px solid ${({ theme }) => theme.colors.border};
    padding: 8px 10px;
    text-align: center;
  }

  th {
    background-color: ${({ theme }) => theme.colors.bgSubtle};
    font-weight: 700;
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

const ViewFileBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: ${({ theme }) => theme.radii.full};
  background-color: ${({ theme }) => theme.colors.primaryLight};
  color: ${({ theme }) => theme.colors.primary};
  font-size: 0.78rem;
  font-weight: 600;

  &:hover {
    opacity: 0.85;
  }
`;

const DeleteBtn = styled.button`
  color: ${({ theme }) => theme.colors.textMuted};
  padding: 4px;
  border-radius: ${({ theme }) => theme.radii.sm};

  &:hover {
    color: ${({ theme }) => theme.colors.glucose.low.text};
    background-color: ${({ theme }) => theme.colors.glucose.low.bg};
  }
`;

const InfoText = styled.p`
  text-align: center;
  padding: 20px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;
`;

const ErrorBanner = styled.p`
  font-size: 0.82rem;
  color: ${({ theme }) => theme.colors.glucose.low.text};
  background-color: ${({ theme }) => theme.colors.glucose.low.bg};
  border: 1px solid ${({ theme }) => theme.colors.glucose.low.border};
  padding: 6px 10px;
  border-radius: ${({ theme }) => theme.radii.sm};
`;
