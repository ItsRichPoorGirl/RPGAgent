'use client';

import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

interface LuciqLogoProps {
  size?: number;
}

export function LuciqLogo({ size = 24 }: LuciqLogoProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // After mount, we can access the theme
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex items-center justify-center flex-shrink-0" style={{ height: size, width: size }}>
      <Image
        src="/luciq-logo.png"
        alt="Luciq AI"
        width={size}
        height={size}
        className="rounded-sm"
      />
    </div>
  );
}
