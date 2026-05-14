"use client";

import { InterviewSession } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";

export default function SessionHistoryTable({ sessions }: { sessions: InterviewSession[] }) {
  const router = useRouter();

  if (!sessions || sessions.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-2xl p-8 text-center">
        <p className="text-gray-400">No practice sessions yet. Start your first interview!</p>
      </div>
    );
  }

  const getScoreColor = (score: number | null) => {
    if (!score) return "text-gray-500";
    if (score >= 80) return "text-success bg-success/10 border-success/20";
    if (score >= 60) return "text-warning bg-warning/10 border-warning/20";
    return "text-danger bg-danger/10 border-danger/20";
  };

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-lg">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-bold text-white">Recent Sessions</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-hover border-b border-border text-xs uppercase tracking-wider text-gray-400 font-medium">
              <th className="p-4 pl-6">Company & Role</th>
              <th className="p-4">Type</th>
              <th className="p-4">Date</th>
              <th className="p-4 text-center">Score</th>
              <th className="p-4 pr-6"></th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr 
                key={session.id} 
                className="border-b border-border hover:bg-surface-hover/50 transition-colors cursor-pointer group"
                onClick={() => router.push(session.status === "completed" ? `/report/${session.id}` : `/interview/${session.id}`)}
              >
                <td className="p-4 pl-6">
                  <div className="flex flex-col">
                    <span className="font-bold text-white text-base">{session.company}</span>
                    <span className="text-sm text-gray-400">{session.role}</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className="capitalize text-sm text-gray-300 bg-background px-2 py-1 rounded border border-border">
                    {session.interview_type}
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-400">
                  {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
                </td>
                <td className="p-4 text-center">
                  {session.status === "completed" ? (
                    <span className={`px-3 py-1 rounded-md text-sm font-bold border ${getScoreColor(session.overall_score)}`}>
                      {session.overall_score}
                    </span>
                  ) : (
                    <span className="text-xs text-warning border border-warning/20 bg-warning/10 px-2 py-1 rounded">
                      Incomplete
                    </span>
                  )}
                </td>
                <td className="p-4 pr-6 text-right">
                  <ChevronRight size={18} className="inline text-gray-500 group-hover:text-primary transition-colors" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
