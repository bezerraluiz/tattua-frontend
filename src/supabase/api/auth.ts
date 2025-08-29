import { supabase } from '../supabaseClient';

export async function forgotPassword(email: string) {
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + '/resetar-senha',
  });
}

export async function resetPassword(password: string) {
  return await supabase.auth.updateUser({ password });
}

export async function resendVerificationEmail(email: string) {
  return await supabase.auth.resend({
    type: 'signup',
    email,
    options: { emailRedirectTo: window.location.origin + '/login' },
  });
}
