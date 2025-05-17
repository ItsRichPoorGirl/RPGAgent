'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function BetaSignupModal() {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center relative">
        {/* Close Button */}
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
          aria-label="Close"
        >
          &times;
        </button>
        {/* Luciq Logo */}
        <div className="flex justify-center mb-4">
          <Image src="/luciq-logo.svg" alt="Luciq Logo" width={64} height={64} />
        </div>
        <h2 className="text-2xl font-bold text-luciq-primary mb-2">Beta Access Restricted</h2>
        <p className="text-gray-700 mb-6">
          Sign ups are currently restricted and only available to invited beta testers and EasyFlow CMO subscribers.<br />
          If you are interested in being part of the beta group, please email <a href="mailto:audrey@luciqai.com" className="text-luciq-primary underline">audrey@luciqai.com</a>.
        </p>
        <div className="flex flex-col gap-3">
          <a
            href="mailto:audrey@taylormadebranding.com?subject=Luciq%20Beta%20Invite%20Request"
            className="bg-luciq-primary text-white font-semibold py-2 rounded-lg hover:bg-luciq-dark transition"
          >
            Request Invite
          </a>
          <button
            onClick={() => router.push('/auth')}
            className="bg-gray-100 text-luciq-primary font-semibold py-2 rounded-lg border border-luciq-primary hover:bg-luciq-primary hover:text-white transition"
          >
            Beta Access
          </button>
        </div>
      </div>
    </div>
  );
} 