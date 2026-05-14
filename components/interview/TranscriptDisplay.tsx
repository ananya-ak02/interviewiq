"use client";

import { useEffect, useMemo, useRef } from "react";

export default function TranscriptDisplay({ transcript, mode }: { transcript: string; mode: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const words = useMemo(() => transcript.trim().split(/\s+/).filter(Boolean), [transcript]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [transcript]);

  if (mode === "text") {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-48 bg-background border border-border rounded-lg p-4 overflow-y-auto"
    >
      {transcript ? (
        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap font-mono text-lg">
          {words.map((word, idx) => (
            <span key={`${word}-${idx}`} className="inline-block mr-2 animate-word-reveal">
              {word}
            </span>
          ))}
        </p>
      ) : (
        <div className="h-full flex items-center justify-center text-gray-500 italic">
          Waiting for speech...
        </div>
      )}
    </div>
  );
}
