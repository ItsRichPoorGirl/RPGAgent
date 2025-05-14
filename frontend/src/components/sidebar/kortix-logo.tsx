'use client';

import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function KortixLogo() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // After mount, we can access the theme
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex items-center justify-center" style={{ width: 40, height: 40, minWidth: 40, minHeight: 40, maxWidth: 40, maxHeight: 40 }}>
      <Image
        src="/luciq-logo.png"
        alt="Luciq"
        width={40}
        height={40}
        style={{ minWidth: 40, minHeight: 40, maxWidth: 40, maxHeight: 40 }}
        className={`${mounted && theme === 'dark' ? 'invert' : ''}`}
      />
    </div>
  );
}
