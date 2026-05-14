"use client";

import { motion } from "framer-motion";
import { CheckCircle2, TrendingUp, AlertTriangle, Sparkles } from "lucide-react";
import type { AnswerFeedback } from "@/lib/types";

export default function AnswerFeedbackCard({
  streamContent,
  finalFeedback,
}: {
  streamContent: string;
  finalFeedback: AnswerFeedback | null;
}) {
  let partialData: Partial<AnswerFeedback> = {};
  try {
    const cleanStr = streamContent.trim();
    if (cleanStr.startsWith("{") && cleanStr.endsWith("}")) {
      partialData = JSON.parse(cleanStr) as AnswerFeedback;
    } else {
      const contentMatch = cleanStr.match(/"contentScore":\s*(\d+)/);
      if (contentMatch) partialData.contentScore = parseInt(contentMatch[1], 10);

      const structureMatch = cleanStr.match(/"structureScore":\s*(\d+)/);
      if (structureMatch) partialData.structureScore = parseInt(structureMatch[1], 10);

      const depthMatch = cleanStr.match(/"depthScore":\s*(\d+)/);
      if (depthMatch) partialData.depthScore = parseInt(depthMatch[1], 10);
    }
  } catch {
    // Ignore parsing errors during stream
  }

  const data = finalFeedback ?? partialData;

  const getScoreColor = (score?: number) => {
    if (!score) return "text-gray-500";
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-danger";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-background border border-primary/30 rounded-xl p-6 shadow-[0_0_15px_rgba(59,130,246,0.1)] h-full overflow-y-auto"
    >
      <div className="flex items-center gap-2 mb-6">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <h3 className="text-lg font-bold text-white">AI Evaluation</h3>
      </div>

      <div className="grid grid-cols-5 gap-4 mb-8">
        {[
          { label: "Content", score: data.contentScore },
          { label: "Structure", score: data.structureScore },
          { label: "Depth", score: data.depthScore },
          { label: "Confidence", score: data.confidenceScore },
          { label: "Overall", score: data.overallScore },
        ].map((s, i) => (
          <div key={i} className="flex flex-col items-center bg-surface border border-border rounded-lg py-4">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">{s.label}</span>
            <span className={`text-2xl font-bold ${getScoreColor(s.score)}`}>{s.score ?? "--"}</span>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        {data.whatYouDidWell && Array.isArray(data.whatYouDidWell) && (
          <div>
            <div className="flex items-center gap-2 text-success mb-2 font-medium">
              <CheckCircle2 size={18} /> What you did well
            </div>
            <ul className="list-disc list-inside text-gray-300 text-sm space-y-1 ml-1">
              {data.whatYouDidWell.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          </div>
        )}

        {data.whatToImprove && Array.isArray(data.whatToImprove) && (
          <div>
            <div className="flex items-center gap-2 text-warning mb-2 font-medium">
              <TrendingUp size={18} /> Areas for improvement
            </div>
            <ul className="list-disc list-inside text-gray-300 text-sm space-y-1 ml-1">
              {data.whatToImprove.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          </div>
        )}

        {data.strongAnswerExample && (
          <div className="bg-surface p-4 rounded-lg border border-border">
            <div className="flex items-center gap-2 text-primary mb-2 font-medium text-sm">
              <Sparkles size={16} /> Strong answer example
            </div>
            <p className="text-gray-300 text-sm italic leading-relaxed">"{data.strongAnswerExample}"</p>
          </div>
        )}

        {!data.contentScore && (
          <div className="text-sm font-mono text-gray-500 whitespace-pre-wrap">
            {streamContent}
            <span className="animate-pulse">_</span>
          </div>
        )}

        {data.followUp && (
          <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 text-sm text-warning flex items-start gap-2">
            <AlertTriangle size={16} className="mt-0.5" />
            <span>Follow-up queued: {data.followUp}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
