"use client";

import { InterviewAnswer } from "@/lib/types";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

export default function PaceGraph({ answers }: { answers: InterviewAnswer[] }) {
  if (!answers || answers.length === 0) return null;

  const data = answers.map((ans, idx) => ({
    question: `Q${idx + 1}`,
    wpm: ans.confidence_metrics_json?.wpm || 0,
  }));

  return (
    <div className="w-full h-full min-h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333333" vertical={false} />
          <XAxis 
            dataKey="question" 
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
            domain={[0, 250]}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "8px" }}
            itemStyle={{ color: "#3b82f6" }}
          />
          {/* Optimal pace zone: 130-160 WPM */}
          <ReferenceLine y={100} stroke="#ef4444" strokeDasharray="3 3" opacity={0.5} />
          <ReferenceLine y={180} stroke="#ef4444" strokeDasharray="3 3" opacity={0.5} />
          
          <Line 
            type="monotone" 
            dataKey="wpm" 
            stroke="#3b82f6" 
            strokeWidth={3}
            dot={{ r: 4, fill: "#3b82f6", strokeWidth: 2, stroke: "#0d0d0d" }}
            activeDot={{ r: 6, fill: "#fff", stroke: "#3b82f6" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
