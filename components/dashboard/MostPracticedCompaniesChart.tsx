"use client";

import { InterviewSession } from "@/lib/types";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function MostPracticedCompaniesChart({ sessions }: { sessions: InterviewSession[] }) {
  if (!sessions || sessions.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-2xl p-6 h-full shadow-lg flex flex-col items-center justify-center text-center">
        <p className="text-gray-400">No session data yet.</p>
      </div>
    );
  }

  const counts = sessions.reduce((acc, s) => {
    acc[s.company] = (acc[s.company] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(counts)
    .map(([company, total]) => ({ company, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 h-full shadow-lg">
      <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">Most Practiced Companies</h3>
      <div className="w-full h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333333" vertical={false} />
            <XAxis
              dataKey="company"
              stroke="#9ca3af"
              tick={{ fill: "#9ca3af", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              stroke="#9ca3af"
              tick={{ fill: "#9ca3af", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "8px" }}
              itemStyle={{ color: "#3b82f6" }}
            />
            <Bar dataKey="total" fill="#3b82f6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
