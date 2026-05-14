"use client";

import { ConfidenceMetrics } from "@/lib/types";
import { Activity, Clock, MessageSquare, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function ConfidenceMetricsPanel({
  metrics,
  isRecording,
}: {
  metrics: ConfidenceMetrics | null;
  isRecording: boolean;
}) {
  if (!metrics && !isRecording) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-500 text-center">
        <Activity size={48} className="mb-4 opacity-20" />
        <p>Start recording to see live analysis of your speaking confidence, pace, and filler words.</p>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-danger";
  };

  return (
    <div className="flex-1 flex flex-col gap-6">
      <div className="flex flex-col items-center justify-center py-6 bg-background/70 rounded-xl border border-border backdrop-blur-sm">
        <span className="text-gray-400 text-sm font-medium mb-2 uppercase tracking-widest">Confidence Score</span>
        <motion.div
          key={metrics?.confidenceScore || 100}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`text-6xl font-bold ${getScoreColor(metrics?.confidenceScore || 100)}`}
        >
          {metrics?.confidenceScore || 100}
        </motion.div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-background/70 rounded-xl border border-border p-4 flex flex-col gap-2 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-gray-400">
            <Activity size={16} />
            <span className="text-sm font-medium uppercase tracking-wider">Pace</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{metrics?.wpm || 0}</span>
            <span className="text-xs text-gray-500">WPM</span>
          </div>
          <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden">
            <div
              className={`h-full ${metrics?.paceFeedback === "good" ? "bg-success" : "bg-warning"} transition-all`}
              style={{ width: `${Math.min(100, ((metrics?.wpm || 0) / 200) * 100)}%` }}
            />
          </div>
          <span className="text-xs text-gray-400 capitalize">
            {metrics?.paceFeedback.replace("_", " ") || "Waiting"}
          </span>
        </div>

        <div className="bg-background/70 rounded-xl border border-border p-4 flex flex-col gap-2 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-gray-400">
            <MessageSquare size={16} />
            <span className="text-sm font-medium uppercase tracking-wider">Fillers</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{metrics?.fillerCount || 0}</span>
            <span className="text-xs text-gray-500">total</span>
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            {metrics?.fillerWords.slice(-3).map((w, i) => (
              <span key={i} className="text-[10px] px-1.5 py-0.5 bg-danger/20 text-danger rounded border border-danger/30">
                "{w}"
              </span>
            ))}
            {(metrics?.fillerWords.length || 0) > 3 && (
              <span className="text-[10px] px-1 py-0.5 text-gray-500">
                +{metrics!.fillerWords.length - 3}
              </span>
            )}
          </div>
          <span className="text-xs text-gray-400">{metrics?.fillerRate || 0} per min</span>
        </div>

        <div className="bg-background/70 rounded-xl border border-border p-4 flex flex-col gap-2 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-gray-400">
            <Clock size={16} />
            <span className="text-sm font-medium uppercase tracking-wider">Duration</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{metrics?.answerDuration || 0}</span>
            <span className="text-xs text-gray-500">sec</span>
          </div>
          <span className={`text-xs ${metrics?.answerDuration && metrics.answerDuration < 30 ? "text-warning" : "text-gray-400"}`}>
            {metrics?.answerDuration && metrics.answerDuration < 30 ? "Too short" : "Good"}
          </span>
        </div>

        <div className="bg-background/70 rounded-xl border border-border p-4 flex flex-col gap-2 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-gray-400">
            <AlertCircle size={16} />
            <span className="text-sm font-medium uppercase tracking-wider">Long Pauses</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{metrics?.silencePauses || 0}</span>
            <span className="text-xs text-gray-500">{">"} 5s</span>
          </div>
          <span className="text-xs text-gray-400">Silences over 5 seconds</span>
        </div>
      </div>
    </div>
  );
}
