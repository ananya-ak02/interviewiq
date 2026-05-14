"use client";

import { InterviewAnswer, QuestionMetadata } from "@/lib/types";

export default function ScoreBreakdownTable({
  answers,
  questions,
}: {
  answers: InterviewAnswer[];
  questions: QuestionMetadata[];
}) {
  if (!answers || answers.length === 0) return null;

  const getScoreColor = (score: number | null) => {
    if (!score) return "text-gray-500";
    if (score >= 80) return "text-success bg-success/10";
    if (score >= 60) return "text-warning bg-warning/10";
    return "text-danger bg-danger/10";
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-hover border-b border-border text-xs uppercase tracking-wider text-gray-400 font-medium">
            <th className="p-4 w-16 text-center">Q#</th>
            <th className="p-4">Question</th>
            <th className="p-4">Type</th>
            <th className="p-4 text-center">Content</th>
            <th className="p-4 text-center">Structure</th>
            <th className="p-4 text-center">Depth</th>
            <th className="p-4 text-center">Confidence</th>
            <th className="p-4 text-center">Overall</th>
          </tr>
        </thead>
        <tbody>
          {answers.map((ans, idx) => {
            const questionMeta = questions.find((q) => q.id === ans.question_id);
            return (
            <tr key={ans.id} className="border-b border-border hover:bg-surface-hover/50 transition-colors">
              <td className="p-4 text-center font-mono text-gray-400">{idx + 1}</td>
              <td className="p-4">
                <span className="text-sm text-gray-300">
                  {questionMeta?.question ?? `Question ${idx + 1}`}
                </span>
              </td>
              <td className="p-4">
                <span className="capitalize text-xs text-gray-300 bg-background px-2 py-1 rounded border border-border">
                  {questionMeta?.type.replace("_", " ") ?? "—"}
                </span>
              </td>
              <td className="p-4 text-center">
                <span className={`px-3 py-1 rounded-md text-xs font-bold ${getScoreColor(ans.content_score)}`}>
                  {ans.content_score || "--"}
                </span>
              </td>
              <td className="p-4 text-center">
                <span className={`px-3 py-1 rounded-md text-xs font-bold ${getScoreColor(ans.structure_score)}`}>
                  {ans.structure_score || "--"}
                </span>
              </td>
              <td className="p-4 text-center">
                <span className={`px-3 py-1 rounded-md text-xs font-bold ${getScoreColor(ans.depth_score)}`}>
                  {ans.depth_score || "--"}
                </span>
              </td>
              <td className="p-4 text-center">
                <span className={`px-3 py-1 rounded-md text-xs font-bold ${getScoreColor(ans.confidence_score)}`}>
                  {ans.confidence_score || "--"}
                </span>
              </td>
              <td className="p-4 text-center">
                <span className={`px-3 py-1 rounded-md text-sm font-black ${getScoreColor(ans.overall_score)} border border-current`}>
                  {ans.overall_score || "--"}
                </span>
              </td>
            </tr>
          );
          })}
        </tbody>
      </table>
    </div>
  );
}
