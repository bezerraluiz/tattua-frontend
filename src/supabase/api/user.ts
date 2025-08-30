import { supabase } from '../supabaseClient';

export async function getCurrentUserId() {
  const { data } = await supabase.auth.getUser();

  return data.user?.id || null;
}
