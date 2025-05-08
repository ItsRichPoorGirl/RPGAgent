import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the SSR package. It exchanges an auth code for the user's session.
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const returnUrl = requestUrl.searchParams.get('returnUrl');
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // URL to redirect to after sign up process completes
  // Handle the case where returnUrl is 'null' (string) or actual null
  const redirectPath = returnUrl && returnUrl !== 'null' ? returnUrl : '/dashboard';
  
  // Ensure we're using the correct origin for production
  const baseUrl = process.env.NEXT_PUBLIC_URL || origin;
  
  // Construct the redirect URL
  const redirectUrl = `${baseUrl}${redirectPath.startsWith('/') ? '' : '/'}${redirectPath}`;
  
  // Log the redirect for debugging
  console.log('Redirecting to:', redirectUrl);
  
  return NextResponse.redirect(redirectUrl);
}
