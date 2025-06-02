import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Agent | Luciq',
  description: 'Interactive agent playground powered by Luciq',
  openGraph: {
    title: 'Agent Playground | Luciq',
    description: 'Interactive agent playground powered by Luciq',
    type: 'website',
  },
};

export default function NewAgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
