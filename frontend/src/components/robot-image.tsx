"use client"

import { useState } from "react"
import Image from "next/image"

export default function RobotImage() {
  const [isLoaded, setIsLoaded] = useState(false)

  return (
    <div className="robot-container mt-[-40px]">
      <Image
        src="/ai-robot-head.png"
        width={500}
        height={500}
        alt="Luciq AI Robot"
        className={`robot-image ${isLoaded ? "opacity-100" : "opacity-0"}`}
        onLoad={() => setIsLoaded(true)}
        priority
      />
    </div>
  )
} 