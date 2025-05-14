'use client';

import Link from 'next/link';
import { SubmitButton } from '@/components/ui/submit-button';
import { Input } from '@/components/ui/input';
import GoogleSignIn from '@/components/GoogleSignIn';
import { FlickeringGrid } from '@/components/home/ui/flickering-grid';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useScroll } from 'motion/react';
import { signIn, signUp, forgotPassword } from './actions';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  X,
  CheckCircle,
  AlertCircle,
  MailCheck,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading } = useAuth();
  const mode = searchParams.get('mode');
  const returnUrl = searchParams.get('returnUrl');
  const message = searchParams.get('message');

  const isSignUp = mode === 'signup';
  const tablet = useMediaQuery('(max-width: 1024px)');
  const [mounted, setMounted] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const { scrollY } = useScroll();

  // Redirect if user is already logged in
  useEffect(() => {
    if (!isLoading && user) {
      router.push(returnUrl || '/dashboard');
    }
  }, [user, isLoading, router, returnUrl]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine if message is a success message
  const isSuccessMessage =
    message &&
    (message.includes('Check your email') ||
      message.includes('Account created') ||
      message.includes('success'));

  // Registration success state
  const [registrationSuccess, setRegistrationSuccess] =
    useState(!!isSuccessMessage);
  const [registrationEmail, setRegistrationEmail] = useState('');

  // Forgot password state
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordStatus, setForgotPasswordStatus] = useState<{
    success?: boolean;
    message?: string;
  }>({});

  // Set registration success state from URL params
  useEffect(() => {
    if (isSuccessMessage) {
      setRegistrationSuccess(true);
    }
  }, [isSuccessMessage]);

  const handleSignIn = async (prevState: any, formData: FormData) => {
    if (returnUrl) {
      formData.append('returnUrl', returnUrl);
    } else {
      formData.append('returnUrl', '/dashboard');
    }
    const result = await signIn(prevState, formData);

    if (
      result &&
      typeof result === 'object' &&
      'success' in result &&
      result.success &&
      'redirectTo' in result
    ) {
      window.location.href = result.redirectTo as string;
      return null;
    }

    return result;
  };

  const handleSignUp = async (prevState: any, formData: FormData) => {
    const email = formData.get('email') as string;
    setRegistrationEmail(email);

    if (returnUrl) {
      formData.append('returnUrl', returnUrl);
    }

    formData.append('origin', window.location.origin);

    const result = await signUp(prevState, formData);

    if (
      result &&
      typeof result === 'object' &&
      'success' in result &&
      result.success &&
      'redirectTo' in result
    ) {
      window.location.href = result.redirectTo as string;
      return null;
    }

    if (result && typeof result === 'object' && 'message' in result) {
      const resultMessage = result.message as string;
      if (resultMessage.includes('Check your email')) {
        setRegistrationSuccess(true);

        const params = new URLSearchParams(window.location.search);
        params.set('message', resultMessage);

        const newUrl =
          window.location.pathname +
          (params.toString() ? '?' + params.toString() : '');

        window.history.pushState({ path: newUrl }, '', newUrl);

        return result;
      }
    }

    return result;
  };

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setForgotPasswordStatus({});

    if (!forgotPasswordEmail || !forgotPasswordEmail.includes('@')) {
      setForgotPasswordStatus({
        success: false,
        message: 'Please enter a valid email address',
      });
      return;
    }

    const formData = new FormData();
    formData.append('email', forgotPasswordEmail);
    formData.append('origin', window.location.origin);

    const result = await forgotPassword(null, formData);

    if (result && typeof result === 'object' && 'message' in result) {
      setForgotPasswordStatus({
        success: result.message.includes('Check your email'),
        message: result.message,
      });
    }
  };

  const resetRegistrationSuccess = () => {
    setRegistrationSuccess(false);
    setRegistrationEmail('');
    const params = new URLSearchParams(window.location.search);
    params.delete('message');
    const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
    window.history.pushState({ path: newUrl }, '', newUrl);
  };

  if (!mounted) return null;

  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-[#0a0a1f] relative overflow-hidden">
        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-4">
          <div className="w-full max-w-md space-y-8 rounded-2xl bg-background/80 p-8 shadow-2xl backdrop-blur-xl">
            <div className="text-center">
              <MailCheck className="mx-auto h-12 w-12 text-primary" />
              <h2 className="mt-6 text-2xl font-bold tracking-tight">
                Check your email
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                We sent a verification link to {registrationEmail}
              </p>
            </div>
            <div className="mt-8 space-y-4">
              <button
                onClick={resetRegistrationSuccess}
                className="w-full rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Back to sign in
              </button>
            </div>
          </div>
        </div>
        <FlickeringGrid />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a1f] relative overflow-hidden">
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 rounded-2xl bg-background/80 p-8 shadow-2xl backdrop-blur-xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight">
              {isSignUp ? 'Join Luciq' : 'Welcome back'}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {isSignUp
                ? 'Create your account to get started'
                : 'Sign in to your account to continue'}
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <GoogleSignIn returnUrl={returnUrl || undefined} />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background/80 px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <form
              action={async (formData: FormData) => {
                const result = isSignUp
                  ? await handleSignUp(null, formData)
                  : await handleSignIn(null, formData);
                
                if (result && typeof result === 'object' && 'success' in result && result.success) {
                  return;
                }
                
                if (result && typeof result === 'object' && 'message' in result) {
                  const params = new URLSearchParams(window.location.search);
                  params.set('message', result.message as string);
                  const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
                  window.history.pushState({ path: newUrl }, '', newUrl);
                }
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Email"
                  required
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Password"
                  required
                  className="h-12"
                />
              </div>
              {isSignUp && (
                <div className="space-y-2">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm password"
                    required
                    className="h-12"
                  />
                </div>
              )}
              <SubmitButton
                formAction={async (formData: FormData) => {
                  const result = isSignUp
                    ? await handleSignUp(null, formData)
                    : await handleSignIn(null, formData);
                  
                  if (result && typeof result === 'object' && 'success' in result && result.success) {
                    return;
                  }
                  
                  if (result && typeof result === 'object' && 'message' in result) {
                    const params = new URLSearchParams(window.location.search);
                    params.set('message', result.message as string);
                    const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
                    window.history.pushState({ path: newUrl }, '', newUrl);
                  }
                }}
                className="w-full h-12"
              >
                {isSignUp ? 'Create account' : 'Sign in'}
              </SubmitButton>
            </form>

            <div className="flex items-center justify-between">
              <button
                onClick={() => setForgotPasswordOpen(true)}
                className="text-sm text-muted-foreground hover:text-primary"
              >
                Forgot password?
              </button>
              <Link
                href={`/auth?mode=${isSignUp ? 'signin' : 'signup'}${
                  returnUrl ? `&returnUrl=${returnUrl}` : ''
                }`}
                className="text-sm text-muted-foreground hover:text-primary"
              >
                {isSignUp ? 'Already have an account?' : 'Create new account'}
              </Link>
            </div>
          </div>

          <div className="mt-8 text-center text-xs text-muted-foreground">
            By continuing, you agree to our{' '}
            <Link href="/legal/terms" className="hover:text-primary">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/legal/privacy" className="hover:text-primary">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset your password</DialogTitle>
            <DialogDescription>
              Enter your email address and we'll send you a link to reset your
              password.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleForgotPassword} className="space-y-4">
            <Input
              id="forgotPasswordEmail"
              type="email"
              placeholder="Email"
              value={forgotPasswordEmail}
              onChange={(e) => setForgotPasswordEmail(e.target.value)}
              required
            />

            {forgotPasswordStatus.message && (
              <div
                className={`text-sm ${
                  forgotPasswordStatus.success
                    ? 'text-green-500'
                    : 'text-red-500'
                }`}
              >
                {forgotPasswordStatus.message}
              </div>
            )}

            <DialogFooter>
              <button
                type="submit"
                className="w-full rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Send reset link
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <FlickeringGrid />
    </div>
  );
}

export default function Login() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
