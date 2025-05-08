import { useQuery } from '@tanstack/react-query';
import { createBrowserClient } from '@supabase/ssr';

export type SubscriptionStatus = {
  status: 'active' | 'inactive' | 'no_subscription';
  plan?: string;
  expires_at?: string;
};

export function useSubscription() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return useQuery<SubscriptionStatus>({
    queryKey: ['subscription'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        return { status: 'no_subscription' };
      }

      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (error || !subscription) {
        return { status: 'no_subscription' };
      }

      return {
        status: subscription.status === 'active' ? 'active' : 'inactive',
        plan: subscription.plan,
        expires_at: subscription.expires_at,
      };
    },
  });
} 