import { Metadata } from 'next';
import { getThread, getProject } from '@/lib/api-server';

export async function generateMetadata({ params }): Promise<Metadata> {
  const { threadId } = await params;
  const fallbackMetaData = {
    title: 'Shared Conversation | Luciq AI',
    description: 'Replay this Agent conversation on Luciq AI',
    openGraph: {
      title: 'Shared Conversation | Luciq AI',
      description: 'Replay this Agent conversation on Luciq AI',
      images: [`${process.env.NEXT_PUBLIC_URL}/share-page/og-fallback.png`],
    },
  };

  try {
    const threadData = await getThread(threadId);
    const projectData = await getProject(threadData.project_id);

    if (!threadData || !projectData) {
      return fallbackMetaData;
    }

    const isDevelopment =
      process.env.NODE_ENV === 'development' ||
      process.env.NEXT_PUBLIC_ENV_MODE === 'LOCAL' ||
      process.env.NEXT_PUBLIC_ENV_MODE === 'local';

    const title = projectData.name || 'Shared Conversation | Luciq AI';
    const description = projectData.description || 'Replay this Agent conversation on Luciq AI';
    const ogImage = isDevelopment
      ? `${process.env.NEXT_PUBLIC_URL}/share-page/og-fallback.png`
      : `${process.env.NEXT_PUBLIC_URL}/api/share-page/og-image?title=${projectData.name}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [ogImage],
      },
      twitter: {
        title,
        description,
        images: ogImage,
        creator: '@luciqai',
        card: 'summary_large_image',
      },
    };
  } catch (error) {
    return fallbackMetaData;
  }
}

export default async function ThreadLayout({ children }) {
  return <>{children}</>;
}
