"use client";

import { InterviewSession } from "@/lib/types";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

export default function ScoreTrendChart({ sessions }: { sessions: InterviewSession[] }) {
  const completedSessions = sessions
    .filter((s) => s.status === "completed" && s.overall_score !== null)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  if (completedSessions.length < 2) {
    return (
      <div className="bg-surface border border-border rounded-2xl p-6 h-full flex flex-col items-center justify-center text-center">
        <p className="text-gray-400">Complete more sessions to see your score trend over time.</p>
      </div>
    );
  }

  const data = completedSessions.map((s) => ({
    date: format(new Date(s.created_at), "MMM d"),
    score: s.overall_score,
    company: s.company,
  }));

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 h-full shadow-lg">
      <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">Score Trend</h3>
      <div className="w-full h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333333" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#9ca3af" 
              tick={{ fill: "#9ca3af", fontSize: 12 }} 
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              stroke="#9ca3af" 
              tick={{ fill: "#9ca3af", fontSize: 12 }} 
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "8px" }}
              itemStyle={{ color: "#3b82f6" }}
              labelStyle={{ color: "#9ca3af", marginBottom: "4px" }}
              formatter={(value, name, props) => [`${value}/100`, props.payload.company]}
            />
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke="#22c55e" 
              strokeWidth={3}
              dot={{ r: 4, fill: "#22c55e", strokeWidth: 2, stroke: "#0d0d0d" }}
              activeDot={{ r: 6, fill: "#fff", stroke: "#22c55e" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
