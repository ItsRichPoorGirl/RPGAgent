'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function BetaSignupModal() {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a1f]/90">
      <div className="bg-[#18182f] rounded-2xl shadow-2xl p-8 max-w-md w-full text-center relative border border-teal-400/30">
        {/* Close Button */}
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 text-teal-300 hover:text-white text-2xl font-bold focus:outline-none"
          aria-label="Close"
        >
          &times;
        </button>
        {/* Luciq Logo */}
        <div className="flex justify-center mb-4">
          <Image src="/luciq-logo.png" alt="Luciq Logo" width={64} height={64} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Beta Access Restricted</h2>
        <p className="text-teal-100 mb-6">
          Sign ups are currently restricted and only available to invited beta testers and EasyFlow CMO subscribers.<br />
          If you are interested in being part of the beta group, please email <a href="mailto:audrey@luciqai.com" className="text-teal-300 underline">audrey@luciqai.com</a>.
        </p>
        <div className="flex flex-col gap-3">
          <a
            href="mailto:audrey@taylormadebranding.com?subject=Luciq%20Beta%20Invite%20Request"
            className="bg-gradient-to-r from-teal-400 to-purple-500 text-white font-semibold py-2 rounded-lg hover:opacity-90 transition"
          >
            Request Invite
          </a>
          <button
            onClick={() => router.push('/auth')}
            className="bg-[#0a0a1f] text-teal-300 font-semibold py-2 rounded-lg border border-teal-400 hover:bg-gradient-to-r hover:from-teal-400 hover:to-purple-500 hover:text-white transition"
          >
            Beta Access
          </button>
        </div>
      </div>
    </div>
  );
} 