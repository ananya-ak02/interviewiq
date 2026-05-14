"use client";

import { InterviewSession } from "@/lib/types";
import { Flame } from "lucide-react";

export default function StreakTracker({ sessions }: { sessions: InterviewSession[] }) {
  // Simple streak logic: check consecutive days practiced
  let streak = 0;
  
  if (sessions.length > 0) {
    const dates = sessions.map(s => new Date(s.created_at).toDateString());
    const uniqueDates = Array.from(new Set(dates)).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    let currentDate = new Date();
    currentDate.setHours(0,0,0,0);
    
    // Allow yesterday to count for current streak if today is missed so far
    let firstDate = new Date(uniqueDates[0]);
    firstDate.setHours(0,0,0,0);
    
    const diffDays = Math.floor((currentDate.getTime() - firstDate.getTime()) / (1000 * 3600 * 24));
    
    if (diffDays <= 1) {
      streak = 1;
      for (let i = 0; i < uniqueDates.length - 1; i++) {
        const d1 = new Date(uniqueDates[i]);
        const d2 = new Date(uniqueDates[i+1]);
        d1.setHours(0,0,0,0);
        d2.setHours(0,0,0,0);
        
        const diff = Math.floor((d1.getTime() - d2.getTime()) / (1000 * 3600 * 24));
        if (diff === 1) {
          streak++;
        } else {
          break;
        }
      }
    }
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 h-full shadow-lg relative overflow-hidden flex items-center justify-center">
      <div className="absolute -bottom-6 -right-6 text-danger opacity-10">
        <Flame size={120} />
      </div>
      <div className="flex flex-col items-center z-10">
        <div className={`p-4 rounded-full mb-4 ${streak > 0 ? "bg-danger/20 text-danger animate-pulse-slow shadow-[0_0_20px_rgba(239,68,68,0.3)]" : "bg-surface-hover text-gray-500"}`}>
          <Flame size={32} />
        </div>
        <span className="text-4xl font-black text-white mb-1">{streak}</span>
        <span className="text-sm font-medium text-gray-400 tracking-widest uppercase">Day Streak</span>
      </div>
    </div>
  );
}
