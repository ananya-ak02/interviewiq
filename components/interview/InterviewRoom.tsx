"use client";

import { useMemo, useState } from "react";
import InterviewerAvatar from "./InterviewerAvatar";
import QuestionDisplay from "./QuestionDisplay";
import VoiceRecorder from "./VoiceRecorder";
import TextAnswerInput from "./TextAnswerInput";
import TranscriptDisplay from "./TranscriptDisplay";
import ConfidenceMetricsPanel from "./ConfidenceMetricsPanel";
import AnswerFeedbackCard from "./AnswerFeedbackCard";
import InterviewTimer from "./InterviewTimer";
import { analyzeConfidence } from "@/lib/confidenceAnalyzer";
import type { AnswerFeedback, ConfidenceMetrics, InterviewSession, QuestionMetadata } from "@/lib/types";
import { useRouter } from "next/navigation";

export default function InterviewRoom({
  session,
  questions,
}: {
  session: InterviewSession;
  questions: QuestionMetadata[];
}) {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [feedbackStream, setFeedbackStream] = useState<string | null>(null);
  const [finalFeedback, setFinalFeedback] = useState<AnswerFeedback | null>(null);
  const [currentMetrics, setCurrentMetrics] = useState<ConfidenceMetrics | null>(null);
  const [followUpQuestion, setFollowUpQuestion] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<"voice" | "text">(
    session.mode === "both" ? "voice" : session.mode
  );

  const baseQuestion = questions[currentQuestionIndex];
  const activeQuestion = useMemo<QuestionMetadata>(() => {
    if (!followUpQuestion) return baseQuestion;
    return {
      ...baseQuestion,
      id: `${baseQuestion.id}-followup`,
      question: followUpQuestion,
      type: "follow_up",
      difficulty: baseQuestion.difficulty,
      what_interviewer_wants: "Clarify the candidate's thinking with specific examples.",
      red_flags_to_avoid: ["Ignoring the follow-up", "Vague justification"],
      time_limit_seconds: 90,
    };
  }, [baseQuestion, followUpQuestion]);

  const handleTranscriptUpdate = (text: string) => {
    setTranscript(text);
  };

  const handleMetricsUpdate = (metrics: ConfidenceMetrics) => {
    setCurrentMetrics(metrics);
  };

  const handleSubmitAnswer = async () => {
    if (!transcript.trim()) return;
    setIsRecording(false);
    setIsEvaluating(true);
    setFeedbackStream("");
    setFinalFeedback(null);

    const computedMetrics =
      activeMode === "text"
        ? analyzeConfidence(transcript, Math.max(10, Math.round((transcript.split(/\s+/).length / 140) * 60)), 0)
        : currentMetrics;

    if (computedMetrics && activeMode === "text") {
      setCurrentMetrics(computedMetrics);
    }

    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.id,
          questionId: activeQuestion.id,
          question: activeQuestion,
          transcript,
          metrics: computedMetrics,
          company: session.company,
          role: session.role,
          mode: activeMode,
        }),
      });

      if (!res.body) return;
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let completeFeedback = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.replace("data: ", "");
            if (dataStr === "[DONE]") break;
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.content) {
                completeFeedback += parsed.content;
                setFeedbackStream(completeFeedback);
              }
              if (parsed.final) {
                setFinalFeedback(parsed.final as AnswerFeedback);
                if (parsed.final.followUp) {
                  setFollowUpQuestion(parsed.final.followUp);
                }
              }
            } catch {
              // Ignore streaming parse failures
            }
          }
        }
      }
    } catch (error) {
      console.error("Evaluation error:", error);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    setTranscript("");
    setFeedbackStream(null);
    setFinalFeedback(null);
    setCurrentMetrics(null);

    if (followUpQuestion) {
      setFollowUpQuestion(null);
      return;
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      router.push(`/report/${session.id}`);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background overflow-hidden gap-6 p-6">
      <div className="flex-[0.6] flex flex-col gap-4">
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-lg flex items-center gap-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_55%)] opacity-80" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,_rgba(255,255,255,0.04)_0%,_transparent_50%)] pointer-events-none" />
          <InterviewerAvatar isSpeaking={isEvaluating} isListening={isRecording} />
          <div className="flex-1 relative z-10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white mb-2">Interviewer</h2>
              {session.mode === "both" && (
                <div className="flex gap-2 text-xs font-semibold uppercase tracking-widest">
                  {(["voice", "text"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setActiveMode(mode)}
                      className={`px-3 py-1 rounded-full border transition-colors ${
                        activeMode === mode
                          ? "bg-primary/20 border-primary text-primary"
                          : "bg-background border-border text-gray-400"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <QuestionDisplay
              question={activeQuestion}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={questions.length}
              isFollowUp={Boolean(followUpQuestion)}
            />
          </div>
          <div className="absolute top-4 right-4">
            <InterviewTimer
              isActive={isRecording}
              timeLimit={activeQuestion.time_limit_seconds}
              onTimeUp={handleSubmitAnswer}
            />
          </div>
        </div>

        <div className="flex-1 bg-surface border border-border rounded-2xl p-6 flex flex-col relative overflow-hidden">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Your Answer</h3>

          <div className="flex-1 overflow-y-auto mb-4">
            {feedbackStream ? (
              <AnswerFeedbackCard streamContent={feedbackStream} finalFeedback={finalFeedback} />
            ) : (
              <TranscriptDisplay transcript={transcript} mode={activeMode} />
            )}
          </div>

          <div className="mt-auto border-t border-border pt-4">
            {!feedbackStream && (
              <>
                {activeMode === "text" ? (
                  <TextAnswerInput
                    value={transcript}
                    onChange={handleTranscriptUpdate}
                    onSubmit={handleSubmitAnswer}
                    disabled={isEvaluating}
                  />
                ) : (
                  <VoiceRecorder
                    isRecording={isRecording}
                    onToggle={() => setIsRecording(!isRecording)}
                    onTranscriptUpdate={handleTranscriptUpdate}
                    onMetricsUpdate={handleMetricsUpdate}
                  />
                )}

                <div className="flex justify-end mt-4">
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={!transcript.trim() || isEvaluating}
                    className="bg-primary text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50"
                  >
                    {isEvaluating ? "Evaluating..." : "Submit Answer"}
                  </button>
                </div>
              </>
            )}

            {feedbackStream && !isEvaluating && (
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleNextQuestion}
                  className="bg-success text-white px-6 py-2 rounded-lg font-medium shadow-[0_0_10px_rgba(34,197,94,0.3)] hover:scale-105 transition-transform"
                >
                  {followUpQuestion
                    ? "Answer Follow-up"
                    : currentQuestionIndex < questions.length - 1
                      ? "Next Question"
                      : "Finish Interview"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-[0.4] bg-surface/80 border border-border rounded-2xl p-6 flex flex-col shadow-lg relative overflow-hidden backdrop-blur-md">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.12),_transparent_55%)]" />
        <h3 className="text-lg font-bold text-white mb-6 border-b border-border pb-4 relative z-10">
          Live Analysis
        </h3>
        <div className="relative z-10">
          <ConfidenceMetricsPanel metrics={currentMetrics} isRecording={isRecording} />
        </div>
      </div>
    </div>
  );
}
