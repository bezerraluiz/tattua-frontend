import { supabase } from '../supabaseClient';

export async function getCurrentUserId() {
  const { data } = await supabase.auth.getUser();
  
  console.log(data);
  console.log(data.user?.id);

  return data.user?.id || null;
}
