"use client";

import Image from "next/image";

export default function RobotImage() {
  return (
    <div className="relative w-full h-96 flex items-center justify-center animate-pulse">
      <div className="relative w-80 h-80 mx-auto">
        <Image
          src="/ai-robot-head.png"
          alt="Luciq AI Robot"
          width={320}
          height={320}
          className="w-full h-full object-contain animate-bounce"
          priority
        />
        {/* Glowing effect around robot */}
        <div className="absolute inset-0 bg-gradient-to-r from-teal-400/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
      </div>
    </div>
  );
} 