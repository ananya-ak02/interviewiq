"use client";

import { QuestionMetadata } from "@/lib/types";

export default function QuestionDisplay({
  question,
  questionNumber,
  totalQuestions,
  isFollowUp = false,
}: {
  question: QuestionMetadata;
  questionNumber: number;
  totalQuestions: number;
  isFollowUp?: boolean;
}) {
  const difficultyColors = {
    easy: "text-success bg-success/10 border-success/20",
    medium: "text-warning bg-warning/10 border-warning/20",
    hard: "text-danger bg-danger/10 border-danger/20",
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center flex-wrap gap-3 text-xs font-mono">
        <span className="text-gray-400">
          Question {questionNumber} of {totalQuestions}
        </span>
        <span className="w-1 h-1 rounded-full bg-border" />
        <span className="text-gray-400 uppercase tracking-widest">
          {question.type.replace("_", " ")}
        </span>
        <span className="w-1 h-1 rounded-full bg-border" />
        <span className={`px-2 py-0.5 rounded border capitalize ${difficultyColors[question.difficulty]}`}>
          {question.difficulty}
        </span>
        {isFollowUp && (
          <span className="px-2 py-0.5 rounded border border-primary/40 bg-primary/10 text-primary uppercase tracking-widest">
            Follow-up
          </span>
        )}
      </div>
      <p className="text-xl text-white font-medium leading-relaxed">"{question.question}"</p>
    </div>
  );
}
