export const dynamic = 'force-dynamic';
export const revalidate = 0;

import ManageTeams from '@/components/basejump/manage-teams';

export default async function PersonalAccountTeamsPage() {
  return (
    <div>
      <ManageTeams />
    </div>
  );
}
