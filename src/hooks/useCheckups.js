import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { supabase } from "../lib/supabase";

const BUCKET_NAME = "checkup-files";

const DEFAULT_INTERVAL_MONTHS = {
  hba1c: 3,
  eye_exam: 12,
  kidney_lipid: 6,
  other: 6,
};

async function fetchCheckups() {
  const { data, error } = await supabase
    .from("periodic_checkups")
    .select("*")
    .order("checkup_date", { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

export function useCheckups() {
  return useQuery({
    queryKey: ["periodicCheckups"],
    queryFn: fetchCheckups,
    staleTime: 1000 * 60 * 5,
  });
}

export function useSaveCheckup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      checkupType,
      checkupDate,
      nextDueDate,
      resultValue,
      doctorOrLab,
      notes,
      file, // Optional File object from <input type="file" />
    }) => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("کاربر احراز هویت نشده است.");

      let filePath = null;
      let fileName = null;

      if (file) {
        const fileExt = file.name.split(".").pop();
        const safePath = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(safePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError)
          throw new Error(`خطا در آپلود فایل: ${uploadError.message}`);

        filePath = safePath;
        fileName = file.name;
      }

      const intervalMonths = DEFAULT_INTERVAL_MONTHS[checkupType] ?? 3;
      const resolvedNextDue =
        nextDueDate ||
        dayjs(checkupDate).add(intervalMonths, "month").format("YYYY-MM-DD");

      const payload = {
        user_id: user.id,
        checkup_type: checkupType,
        checkup_date: checkupDate,
        next_due_date: resolvedNextDue,
        result_value: resultValue?.trim() || null,
        doctor_or_lab: doctorOrLab?.trim() || null,
        notes: notes?.trim() || null,
        file_path: filePath,
        file_name: fileName,
      };

      const { data, error } = await supabase
        .from("periodic_checkups")
        .insert(payload)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["periodicCheckups"] });
    },
  });
}

export function useDeleteCheckup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, filePath }) => {
      if (filePath) {
        await supabase.storage.from(BUCKET_NAME).remove([filePath]);
      }

      const { error } = await supabase
        .from("periodic_checkups")
        .delete()
        .eq("id", id);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["periodicCheckups"] });
    },
  });
}

/**
 * Generates a temporary 60-minute signed URL and opens the private file in a new tab.
 */
export async function openCheckupFile(filePath) {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(filePath, 60 * 60);

  if (error) throw new Error(error.message);
  window.open(data.signedUrl, "_blank", "noopener,noreferrer");
}
