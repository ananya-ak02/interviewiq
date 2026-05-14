"use client";

import { useState } from "react";
import { Link2, AlignLeft } from "lucide-react";

export default function JDParser({
  jdText,
  jdUrl,
  onChange,
  onUrlChange,
}: {
  jdText: string;
  jdUrl: string;
  onChange: (text: string) => void;
  onUrlChange: (url: string) => void;
}) {
  const [inputType, setInputType] = useState<"paste" | "url">("paste");
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState("");

  const handleFetchUrl = async () => {
    if (!jdUrl) return;
    setIsFetching(true);
    setError("");
    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jdUrl }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to fetch JD.");
      }

      onChange(data.text);
    } catch (err) {
      setError("Unable to fetch or parse the JD URL. Try pasting the text instead.");
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex bg-surface-hover rounded-lg p-1 border border-border w-fit">
        <button
          onClick={() => setInputType("paste")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            inputType === "paste" ? "bg-surface text-white shadow-sm" : "text-gray-400 hover:text-gray-200"
          }`}
        >
          <AlignLeft size={16} /> Paste Text
        </button>
        <button
          onClick={() => setInputType("url")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            inputType === "url" ? "bg-surface text-white shadow-sm" : "text-gray-400 hover:text-gray-200"
          }`}
        >
          <Link2 size={16} /> JD URL
        </button>
      </div>

      {inputType === "paste" ? (
        <textarea
          className="w-full h-48 bg-background border border-border rounded-lg p-4 text-sm text-gray-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono resize-none"
          placeholder="Paste the full job description here..."
          value={jdText}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://boards.greenhouse.io/..."
              value={jdUrl}
              onChange={(e) => onUrlChange(e.target.value)}
              className="flex-1 bg-background border border-border rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary"
            />
            <button
              onClick={handleFetchUrl}
              disabled={isFetching || !jdUrl}
              className="bg-primary hover:bg-blue-600 text-white px-6 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isFetching ? "Fetching..." : "Fetch"}
            </button>
          </div>
          {error && <p className="text-danger text-sm">{error}</p>}
          {jdText && inputType === "url" && (
            <textarea
              className="w-full h-32 bg-background border border-border rounded-lg p-4 text-sm text-gray-300 focus:outline-none focus:border-primary font-mono resize-none"
              value={jdText}
              onChange={(e) => onChange(e.target.value)}
            />
          )}
        </div>
      )}
    </div>
  );
}
