import { createAdminClient } from "@/lib/supabase/admin"

// Limites journalières par plan (nombre d'appels IA toutes routes confondues).
const DAILY_LIMITS: Record<string, number> = {
  free: 10,
  creator: 100,
  studio: 200,
  expert: 500,
}

export async function checkAiRateLimit(
  userId: string,
  plan: string
): Promise<{ allowed: boolean; used: number; limit: number }> {
  const admin = createAdminClient()
  const limit = DAILY_LIMITS[plan] ?? DAILY_LIMITS.free

  const since = new Date()
  since.setHours(0, 0, 0, 0)

  const { count } = await admin
    .from("ai_usage")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", since.toISOString())

  const used = count ?? 0
  return { allowed: used < limit, used, limit }
}

export async function recordAiCall(userId: string, endpoint: string) {
  const admin = createAdminClient()
  await admin.from("ai_usage").insert({ user_id: userId, endpoint })
}
