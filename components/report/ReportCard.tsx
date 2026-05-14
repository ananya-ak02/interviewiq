"use client";

import { useMemo, useState } from "react";
import { SessionReport, InterviewSession, InterviewAnswer, QuestionMetadata } from "@/lib/types";
import RadarChart from "./RadarChart";
import ScoreBreakdownTable from "./ScoreBreakdownTable";
import FillerWordHeatmap from "./FillerWordHeatmap";
import PaceGraph from "./PaceGraph";
import PDFExporter from "./PDFExporter";
import { RefreshCw, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ReportCard({
  session,
  report,
  answers,
  questions,
}: {
  session: InterviewSession;
  report: SessionReport;
  answers: InterviewAnswer[];
  questions: QuestionMetadata[];
}) {
  const router = useRouter();
  const [isRetrying, setIsRetrying] = useState(false);

  const gradeColor = useMemo(() => {
    switch (report.grade) {
      case "A":
        return "text-success drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]";
      case "B":
        return "text-success";
      case "C":
        return "text-warning";
      case "D":
        return "text-danger";
      case "F":
        return "text-danger drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]";
      default:
        return "text-white";
    }
  }, [report.grade]);

  const handleRetryWeak = async () => {
    setIsRetrying(true);
    try {
      const weakAnswers = answers.filter((ans) => (ans.overall_score ?? 0) < 70);
      const weakQuestionIds = new Set(weakAnswers.map((ans) => ans.question_id));
      const weakQuestions = questions.filter((q) => weakQuestionIds.has(q.id));

      const sessionRes = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: session.company,
          role: session.role,
          interview_type: session.interview_type,
          difficulty: session.difficulty,
          mode: session.mode,
        }),
      });
      const newSession = await sessionRes.json();

      await fetch(`/api/sessions/${newSession.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions_json: weakQuestions, status: "active" }),
      });

      router.push(`/interview/${newSession.id}`);
    } catch (error) {
      console.error("Retry failed:", error);
    } finally {
      setIsRetrying(false);
    }
  };

  const scoreOffset = 283 - (283 * report.overall_score) / 100;

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-8" id="report-content">
      <div className="flex items-center justify-between bg-surface border border-border rounded-2xl p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{session.company} Interview Report</h1>
          <p className="text-gray-400 font-mono">
            Role: {session.role} | Type: {session.interview_type} | Mode: {session.mode}
          </p>
        </div>

        <div className="flex items-center gap-8">
          <div className="relative w-28 h-28">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" stroke="#1f2937" strokeWidth="8" fill="none" />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="#3b82f6"
                strokeWidth="8"
                fill="none"
                strokeDasharray="283"
                strokeDashoffset={scoreOffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs text-gray-400 uppercase tracking-widest">Score</span>
              <span className="text-2xl font-bold text-white">{report.overall_score}</span>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-sm text-gray-400 font-medium tracking-widest uppercase mb-1">Grade</span>
            <span className={`text-6xl font-black ${gradeColor}`}>{report.grade}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-1 space-y-6">
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Trophy size={20} className="text-warning" /> Final Verdict
            </h3>
            <p className="text-gray-300 leading-relaxed text-sm">{report.verdict}</p>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-6 shadow-lg">
            <h3 className="text-sm font-bold text-success uppercase tracking-wider mb-4">Top Strengths</h3>
            <ul className="space-y-3">
              {Array.isArray(report.strengths_json) &&
                report.strengths_json.map((s, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-300">
                    <span className="text-success mt-0.5">•</span> {s}
                  </li>
                ))}
            </ul>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-6 shadow-lg">
            <h3 className="text-sm font-bold text-danger uppercase tracking-wider mb-4">Areas to Improve</h3>
            <ul className="space-y-3">
              {Array.isArray(report.improvements_json) &&
                report.improvements_json.map((s, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-300">
                    <span className="text-danger mt-0.5">•</span> {s}
                  </li>
                ))}
            </ul>
          </div>
        </div>

        <div className="col-span-2 space-y-8">
          <div className="grid grid-cols-2 gap-8">
            <div className="bg-surface border border-border rounded-2xl p-6 shadow-lg flex flex-col items-center justify-center min-h-[300px]">
              <h3 className="text-sm font-bold text-white mb-4 self-start">Performance Radar</h3>
              <RadarChart answers={answers} />
            </div>
            <div className="bg-surface border border-border rounded-2xl p-6 shadow-lg flex flex-col min-h-[300px]">
              <h3 className="text-sm font-bold text-white mb-4">Speaking Pace (WPM)</h3>
              <PaceGraph answers={answers} />
            </div>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-6 shadow-lg">
            <h3 className="text-sm font-bold text-white mb-4">Filler Word Analysis</h3>
            <FillerWordHeatmap answers={answers} />
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-lg">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-bold text-white">Question Score Breakdown</h3>
        </div>
        <ScoreBreakdownTable answers={answers} questions={questions} />
      </div>

      <div className="flex justify-end gap-4 mt-8 no-print">
        <button
          onClick={handleRetryWeak}
          disabled={isRetrying}
          className="flex items-center gap-2 px-6 py-3 rounded-lg border border-border bg-surface hover:bg-surface-hover text-white font-medium transition-colors disabled:opacity-50"
        >
          <RefreshCw size={18} /> {isRetrying ? "Preparing..." : "Retry Weak Questions"}
        </button>
        <PDFExporter elementId="report-content" filename={`${session.company}_Interview_Report.pdf`} />
      </div>
    </div>
  );
}
