import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

/**
 * Helper to fetch the current authenticated user's ID.
 * Ensures explicit user_id is always available for composite unique constraints (user_id, log_date).
 */
async function getCurrentUserId() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error("کاربر احراز هویت نشده است.");
  return user.id;
}

/**
 * Ensures a daily_logs row exists for a given 'YYYY-MM-DD' date and returns its id.
 * Used internally by useSaveMealLog when logging a meal on an empty day.
 */
async function ensureDailyLogExists(userId, logDate) {
  const { data: existing, error: fetchError } = await supabase
    .from("daily_logs")
    .select("id")
    .eq("user_id", userId)
    .eq("log_date", logDate)
    .maybeSingle();

  if (fetchError) throw new Error(fetchError.message);
  if (existing) return existing.id;

  const { data: created, error: insertError } = await supabase
    .from("daily_logs")
    .insert({ user_id: userId, log_date: logDate })
    .select("id")
    .single();

  if (insertError) throw new Error(insertError.message);
  return created.id;
}

/**
 * 1. Upserts daily-level fields:
 *    fasting_glucose, fasting_time, lantus_dose, lantus_time,
 *    activity_level, stress_or_illness, daily_notes
 */
export function useSaveDailyLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ logDate, ...fields }) => {
      const userId = await getCurrentUserId();

      const payload = {
        user_id: userId,
        log_date: logDate,
        ...fields,
      };

      const { data, error } = await supabase
        .from("daily_logs")
        .upsert(payload, { onConflict: "user_id,log_date" })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      // Invalidates all cached weeks (and monthly reports) so UI stays in sync
      queryClient.invalidateQueries({ queryKey: ["weeklyLogs"] });
      queryClient.invalidateQueries({ queryKey: ["monthlyLogs"] });
    },
  });
}

/**
 * 2. Creates or updates a meal_logs entry (breakfast, lunch, dinner, snack).
 *    Automatically creates the parent daily_logs row if the day has no entries yet.
 */
export function useSaveMealLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      mealId, // Optional: pass existing meal.id when updating
      dailyLogId, // Optional: pass day.log?.id if already exists
      logDate, // Required: 'YYYY-MM-DD' so we can auto-create daily_log if needed
      mealType, // 'breakfast' | 'lunch' | 'dinner' | 'snack'
      novorapidDose, // Number (e.g., 4) or null
      foodDescription, // String
      postMealGlucose, // Number or null
      postMealTime, // 'HH:MM' or null
      mealNotes, // String or null
    }) => {
      const userId = await getCurrentUserId();
      const resolvedDailyLogId =
        dailyLogId || (await ensureDailyLogExists(userId, logDate));

      const payload = {
        user_id: userId,
        daily_log_id: resolvedDailyLogId,
        meal_type: mealType,
        novorapid_dose: novorapidDose === "" ? null : novorapidDose,
        food_description: foodDescription || null,
        post_meal_glucose: postMealGlucose === "" ? null : postMealGlucose,
        post_meal_time: postMealTime || null,
        meal_notes: mealNotes || null,
      };

      if (mealId) {
        // Update existing meal row
        const { data, error } = await supabase
          .from("meal_logs")
          .update(payload)
          .eq("id", mealId)
          .select()
          .single();

        if (error) throw new Error(error.message);
        return data;
      }

      // Insert new meal row
      const { data, error } = await supabase
        .from("meal_logs")
        .insert(payload)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weeklyLogs"] });
      queryClient.invalidateQueries({ queryKey: ["monthlyLogs"] });
    },
  });
}

/**
 * 3. Optional helper to delete an accidental meal/snack entry
 */
export function useDeleteMealLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mealId) => {
      const { error } = await supabase
        .from("meal_logs")
        .delete()
        .eq("id", mealId);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weeklyLogs"] });
      queryClient.invalidateQueries({ queryKey: ["monthlyLogs"] });
    },
  });
}
