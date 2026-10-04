import { getSupabasePublicEnv } from "@painting-store/shared";
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const { url, key } = getSupabasePublicEnv();
  return createBrowserClient(url, key);
}
