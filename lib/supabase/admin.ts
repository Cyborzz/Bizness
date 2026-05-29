import "server-only";

import { createClient } from "@supabase/supabase-js";
import { getSupabaseServiceEnv } from "./env";

export function createAdminClient() {
  const { supabaseUrl, serviceRoleKey } = getSupabaseServiceEnv();

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
