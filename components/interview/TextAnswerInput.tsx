"use client";

import { useState, useEffect } from "react";
import { Send } from "lucide-react";

export default function TextAnswerInput({
  value,
  onChange,
  onSubmit,
  disabled,
}: {
  value: string;
  onChange: (text: string) => void;
  onSubmit: () => void;
  disabled: boolean;
}) {
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    const count = value.trim() ? value.trim().split(/\s+/).length : 0;
    setWordCount(count);
  }, [value]);

  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Type your answer here..."
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
            e.preventDefault();
            onSubmit();
          }
        }}
        className="w-full h-32 bg-background border border-border rounded-lg p-4 pb-12 text-sm text-gray-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none disabled:opacity-50"
      />
      <div className="absolute bottom-4 left-4 text-xs font-mono text-gray-500">
        {wordCount} words (Estimated speaking time: {Math.max(1, Math.round(wordCount / 140))} mins) · Ctrl+Enter to submit
      </div>
    </div>
  );
}
