"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
import { ConfidenceMetrics } from "@/lib/types";
import { analyzeConfidence } from "@/lib/confidenceAnalyzer";
import { createSpeechRecognizer } from "@/lib/speechRecognition";

export default function VoiceRecorder({
  isRecording,
  onToggle,
  onTranscriptUpdate,
  onMetricsUpdate,
}: {
  isRecording: boolean;
  onToggle: () => void;
  onTranscriptUpdate: (text: string) => void;
  onMetricsUpdate: (metrics: ConfidenceMetrics) => void;
}) {
  const recognizerRef = useRef<ReturnType<typeof createSpeechRecognizer> | null>(null);
  const [displayTranscript, setDisplayTranscript] = useState("");
  const finalTranscriptRef = useRef<string>("");
  const displayTranscriptRef = useRef<string>("");
  const [error, setError] = useState<string | null>(null);
  const startTimeRef = useRef<number>(0);
  const silenceStartRef = useRef<number>(0);
  const silencePausesRef = useRef<number>(0);

  useEffect(() => {
    if (isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
    return () => stopRecording();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording]);

  useEffect(() => {
    onTranscriptUpdate(displayTranscript);
  }, [displayTranscript, onTranscriptUpdate]);

  const startRecording = async () => {
    setDisplayTranscript("");
    finalTranscriptRef.current = "";
    displayTranscriptRef.current = "";
    setError(null);
    startTimeRef.current = Date.now();
    silenceStartRef.current = Date.now();
    silencePausesRef.current = 0;

    const recognizer = createSpeechRecognizer(
      (chunk) => {
        silenceStartRef.current = Date.now();
        if (chunk.isFinal) {
          finalTranscriptRef.current = `${finalTranscriptRef.current} ${chunk.text}`.trim();
          displayTranscriptRef.current = finalTranscriptRef.current;
        } else {
          displayTranscriptRef.current = `${finalTranscriptRef.current} ${chunk.text}`.trim();
        }
        setDisplayTranscript(displayTranscriptRef.current);
      },
      (err) => {
        setError(err);
      }
    );

    recognizerRef.current = recognizer;
    if (!recognizer) {
      onToggle();
      return;
    }

    recognizer.start();

    const metricsInterval = setInterval(() => {
      if (!isRecording) return;
      const now = Date.now();
      const durationSec = Math.floor((now - startTimeRef.current) / 1000);
      if (now - silenceStartRef.current > 5000) {
        silencePausesRef.current += 1;
        silenceStartRef.current = now;
      }

      const metrics = analyzeConfidence(displayTranscriptRef.current, durationSec, silencePausesRef.current);
      onMetricsUpdate(metrics);
    }, 1000);

    (recognizerRef as any).current.metricsInterval = metricsInterval;
  };

  const stopRecording = () => {
    if (recognizerRef.current) {
      clearInterval((recognizerRef as any).current.metricsInterval);
      recognizerRef.current.stop();
      recognizerRef.current = null;
    }
  };

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={onToggle}
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg ${
          isRecording
            ? "bg-danger hover:bg-red-600 animate-pulse-slow shadow-danger/50"
            : "bg-primary hover:bg-blue-600 shadow-primary/50"
        }`}
      >
        {isRecording ? (
          <Square fill="currentColor" size={24} className="text-white" />
        ) : (
          <Mic size={24} className="text-white" />
        )}
      </button>
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-white">
          {isRecording ? "Listening..." : "Click to speak"}
        </span>
        <span className="text-xs text-gray-400">
          {isRecording ? "Speak clearly into your microphone." : "We analyze pace, fillers, and pauses live."}
        </span>
        {error && <span className="text-xs text-danger mt-1">{error}</span>}
      </div>
    </div>
  );
}
