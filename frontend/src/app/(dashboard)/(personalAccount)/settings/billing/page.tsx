import { createClient } from '@/lib/supabase/server';
import AccountBillingStatus from '@/components/billing/account-billing-status';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const returnUrl = process.env.NEXT_PUBLIC_URL as string;

export default async function PersonalAccountBillingPage() {
  try {
    const supabaseClient = await createClient();
    const { data: personalAccount, error } = await supabaseClient.rpc(
      'get_personal_account',
    );

    if (error || !personalAccount) {
      console.error('Error fetching personal account:', error);
      redirect('/settings');
    }

    return (
      <div>
        <AccountBillingStatus
          accountId={personalAccount.account_id}
          returnUrl={`${returnUrl}/settings/billing`}
        />
      </div>
    );
  } catch (error) {
    console.error('Error in billing page:', error);
    redirect('/settings');
  }
}
