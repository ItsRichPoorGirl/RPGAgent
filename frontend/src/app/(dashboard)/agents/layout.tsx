import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Agent Conversation | Luciq',
  description: 'Interactive agent conversation powered by Luciq',
  openGraph: {
    title: 'Agent Conversation | Luciq',
    description: 'Interactive agent conversation powered by Luciq',
    type: 'website',
  },
};

export default function AgentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
