"use client";

import { InterviewAnswer } from "@/lib/types";

export default function FillerWordHeatmap({ answers }: { answers: InterviewAnswer[] }) {
  if (!answers || answers.length === 0) return null;

  const fillerCounts: Record<string, number> = {};
  let totalFillers = 0;

  answers.forEach((ans) => {
    if (ans.confidence_metrics_json?.fillerWords) {
      ans.confidence_metrics_json.fillerWords.forEach((word) => {
        fillerCounts[word] = (fillerCounts[word] || 0) + 1;
        totalFillers++;
      });
    }
  });

  if (totalFillers === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-gray-500 text-center">
        <p className="text-success font-medium mb-2">Excellent!</p>
        <p className="text-sm">No filler words detected in this session.</p>
      </div>
    );
  }

  const sortedFillers = Object.entries(fillerCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-3xl font-bold text-white">{totalFillers}</span>
        <span className="text-sm text-gray-400">total fillers used</span>
      </div>
      
      <div className="flex flex-wrap gap-3">
        {sortedFillers.map(([word, count]) => {
          // Heatmap coloring: higher count -> more red/danger
          const intensity = Math.min(100, (count / (totalFillers || 1)) * 300); // arbitrary scaling for visual effect
          const bgOpacity = Math.max(0.2, intensity / 100);
          
          return (
            <div 
              key={word}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-danger/20"
              style={{ backgroundColor: `rgba(239, 68, 68, ${bgOpacity})` }}
            >
              <span className="text-white font-medium">"{word}"</span>
              <span className="bg-black/30 px-2 py-0.5 rounded text-xs font-mono text-white/80">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
