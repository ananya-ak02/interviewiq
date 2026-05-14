import { ConfidenceMetrics } from "./types";

const FILLER_WORDS_SET = new Set([
  "um",
  "uh",
  "like",
  "basically",
  "you know",
  "so",
  "right",
  "actually",
  "literally",
  "i mean",
]);

export function analyzeConfidence(
  transcript: string,
  answerDurationSeconds: number,
  silencePauses: number
): ConfidenceMetrics {
  const words = transcript.toLowerCase().split(/\s+/).filter((w) => w.length > 0);
  const totalWords = words.length;

  let fillerCount = 0;
  const fillerWordsDetected: string[] = [];

  // Count fillers
  for (let i = 0; i < words.length; i++) {
    // Single word fillers
    const cleanWord = words[i].replace(/[^\w]/g, "");
    if (FILLER_WORDS_SET.has(cleanWord)) {
      fillerCount++;
      fillerWordsDetected.push(cleanWord);
      continue;
    }

    // Two word fillers
    if (i < words.length - 1) {
      const nextCleanWord = words[i + 1].replace(/[^\w]/g, "");
      const twoWordPhrase = `${cleanWord} ${nextCleanWord}`;
      if (FILLER_WORDS_SET.has(twoWordPhrase)) {
        fillerCount++;
        fillerWordsDetected.push(twoWordPhrase);
        i++; // skip next word
      }
    }
  }

  // Calculate WPM (Words Per Minute)
  const durationMinutes = Math.max(answerDurationSeconds / 60, 0.01); // Prevent division by zero
  const wpm = Math.round(totalWords / durationMinutes);

  const fillerRate = Number((fillerCount / durationMinutes).toFixed(2));

  // Determine Pace Feedback
  let paceFeedback: "too_slow" | "good" | "too_fast" = "good";
  if (wpm < 100) paceFeedback = "too_slow";
  else if (wpm > 180) paceFeedback = "too_fast";

  // Calculate Confidence Score
  // Start at 100
  // -3 per filler word
  // -10 if WPM < 100 or WPM > 180
  // -5 per silence pause >5s
  // -15 if answer < 30 seconds (too short)
  // -10 if answer > 3 minutes (too long for behavioural)
  let score = 100;
  score -= fillerCount * 3;
  if (paceFeedback !== "good") score -= 10;
  score -= silencePauses * 5;

  if (answerDurationSeconds < 30) score -= 15;
  if (answerDurationSeconds > 180) score -= 10;

  score = Math.max(0, Math.min(100, score));

  return {
    wpm,
    fillerCount,
    fillerWords: fillerWordsDetected,
    fillerRate,
    silencePauses,
    answerDuration: answerDurationSeconds,
    paceFeedback,
    confidenceScore: score,
  };
}
