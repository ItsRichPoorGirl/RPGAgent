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
        {/* Base glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-teal-400/20 to-purple-500/20 rounded-full blur-3xl"></div>
        
        {/* Hover glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-teal-400/40 to-purple-500/40 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Outer glow ring on hover */}
        <div className="absolute inset-[-20px] bg-gradient-to-r from-teal-400/30 to-purple-500/30 rounded-full blur-[50px] opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
      </div>
    </div>
  );
} 