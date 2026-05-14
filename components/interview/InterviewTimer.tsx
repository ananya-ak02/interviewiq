"use client";

import { useState, useEffect } from "react";
import { Timer } from "lucide-react";

export default function InterviewTimer({
  isActive,
  timeLimit,
  onTimeUp,
}: {
  isActive: boolean;
  timeLimit: number;
  onTimeUp: () => void;
}) {
  const [timeLeft, setTimeLeft] = useState(timeLimit);

  useEffect(() => {
    setTimeLeft(timeLimit);
  }, [timeLimit]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            onTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, onTimeUp]);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  
  const isWarning = timeLeft <= 30;
  const isDanger = timeLeft <= 10;

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border bg-background/80 backdrop-blur-sm ${
      isDanger ? "border-danger text-danger bg-danger/10 animate-pulse" : 
      isWarning ? "border-warning text-warning bg-warning/10" : 
      "border-border text-gray-300"
    }`}>
      <Timer size={16} />
      <span className="font-mono text-sm font-medium">
        {mins.toString().padStart(2, "0")}:{secs.toString().padStart(2, "0")}
      </span>
    </div>
  );
}
