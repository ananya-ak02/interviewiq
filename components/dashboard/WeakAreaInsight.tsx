"use client";

import { InterviewSession } from "@/lib/types";
import { AlertTriangle, TrendingUp } from "lucide-react";

export default function WeakAreaInsight({ sessions }: { sessions: InterviewSession[] }) {
  if (!sessions || sessions.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-2xl p-6 h-full shadow-lg flex flex-col justify-center text-center">
        <p className="text-gray-400 text-sm">Insights will appear here once you complete sessions.</p>
      </div>
    );
  }

  const completed = sessions.filter((s) => s.status === "completed" && s.overall_score !== null);
  if (completed.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-2xl p-6 h-full shadow-lg flex flex-col justify-center text-center">
        <p className="text-gray-400 text-sm">Complete a session to unlock insights.</p>
      </div>
    );
  }

  const byType = completed.reduce(
    (acc, s) => {
      const key = s.interview_type;
      acc[key] = acc[key] || { total: 0, count: 0 };
      acc[key].total += s.overall_score || 0;
      acc[key].count += 1;
      return acc;
    },
    {} as Record<string, { total: number; count: number }>
  );

  const weakest = Object.entries(byType)
    .map(([type, data]) => ({ type, avg: Math.round(data.total / data.count) }))
    .sort((a, b) => a.avg - b.avg)[0];

  const adviceMap: Record<string, string> = {
    technical: "Focus on system trade-offs, algorithm choices, and explaining complexity out loud.",
    behavioural: "Structure responses with STAR and quantify outcomes for stronger impact.",
    mixed: "Balance technical depth with structured storytelling to avoid shallow answers.",
  };

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 h-full shadow-lg flex flex-col">
      <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
        <TrendingUp size={16} className="text-primary" /> Key Insights
      </h3>

      <div className="space-y-4 flex-1">
        <div className="flex gap-4 items-start p-3 rounded-lg hover:bg-surface-hover transition-colors">
          <div className="mt-0.5 text-warning">
            <AlertTriangle size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-gray-200 text-sm">Weakest interview type</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded border bg-danger/10 border-danger/20 text-danger">
                Avg: {weakest.avg}
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed capitalize">
              {weakest.type}: {adviceMap[weakest.type] || "Focus on structured, high-signal answers."}
            </p>
          </div>
        </div>

        <div className="flex gap-4 items-start p-3 rounded-lg hover:bg-surface-hover transition-colors">
          <div className="mt-0.5 text-warning">
            <AlertTriangle size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-gray-200 text-sm">Consistency gap</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Your scores vary across sessions. Aim for a steady 75+ by rehearsing a consistent structure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
