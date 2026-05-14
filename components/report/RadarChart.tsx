"use client";

import { InterviewAnswer } from "@/lib/types";
import { Radar, RadarChart as RechartsRadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";

export default function RadarChart({ answers }: { answers: InterviewAnswer[] }) {
  if (!answers || answers.length === 0) return null;

  let totalContent = 0;
  let totalStructure = 0;
  let totalDepth = 0;
  let totalConfidence = 0;

  answers.forEach((ans) => {
    totalContent += ans.content_score || 0;
    totalStructure += ans.structure_score || 0;
    totalDepth += ans.depth_score || 0;
    totalConfidence += ans.confidence_score || 0;
  });

  const n = answers.length;
  
  const data = [
    { subject: "Content", A: Math.round(totalContent / n), fullMark: 100 },
    { subject: "Structure", A: Math.round(totalStructure / n), fullMark: 100 },
    { subject: "Depth", A: Math.round(totalDepth / n), fullMark: 100 },
    { subject: "Confidence", A: Math.round(totalConfidence / n), fullMark: 100 },
    { subject: "Communication", A: Math.round((totalContent + totalConfidence) / (2 * n)), fullMark: 100 }, // synthetic metric
  ];

  return (
    <div className="w-full h-full min-h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#333333" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: "#9ca3af", fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "8px" }}
            itemStyle={{ color: "#3b82f6" }}
          />
          <Radar
            name="Score"
            dataKey="A"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.3}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}
