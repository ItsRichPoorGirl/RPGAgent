"use client";

import Image from "next/image";

export default function RobotImage() {
  return (
    <div className="relative w-full h-[500px] flex items-center justify-center group">
      <div className="relative w-[400px] h-[400px] mx-auto transition-all duration-300 group-hover:scale-105">
        <Image
          src="/ai-robot-head.png"
          alt="Luciq AI Robot"
          width={400}
          height={400}
          className="w-full h-full object-contain"
          priority
        />
        
        {/* Simple outer glow on hover only */}
        <div className="absolute inset-[-30px] bg-gradient-to-r from-teal-400/25 to-purple-500/25 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </div>
    </div>
  );
} 