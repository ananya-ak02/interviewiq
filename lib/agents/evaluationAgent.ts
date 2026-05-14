import { groq } from "../groq";
import { QuestionMetadata } from "../types";

export async function evaluateAnswerStream(
  question: QuestionMetadata,
  transcript: string,
  metricsStr: string,
  company: string,
  role: string
) {
  const systemPrompt = `You are a strict, top-tier interviewer at ${company} for a ${role} position.
You are evaluating the candidate's answer to the following question:
"${question.question}"

What you are looking for: ${question.what_interviewer_wants}
Red flags to avoid: ${question.red_flags_to_avoid.join(", ")}
Candidate's voice metrics context: ${metricsStr}

You MUST evaluate the answer and provide feedback.
Your output must be a valid JSON object streaming in, matching EXACTLY this structure:
{
  "contentScore": number (0-100),
  "structureScore": number (0-100),
  "depthScore": number (0-100),
  "confidenceScore": number (0-100),
  "overallScore": number (0-100),
  "whatYouDidWell": ["point 1", "point 2"],
  "whatToImprove": ["point 1", "point 2"],
  "strongAnswerExample": "A 3-4 sentence example of a great answer",
  "followUp": "A natural follow-up question based on their answer, OR null if we should move to the next question."
}

Be critical. Average answers should score around 60. Only excellent answers score 85+.
Respond ONLY with the JSON object. Do not include markdown code blocks. Start directly with '{' and end with '}'.`;

  const stream = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Candidate Answer Transcript: "${transcript}"` }
    ],
    temperature: 0.2,
    stream: true,
  });

  return stream;
}
