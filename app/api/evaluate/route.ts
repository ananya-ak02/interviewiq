import { NextRequest } from "next/server";
import { evaluateAnswerStream } from "@/lib/agents/evaluationAgent";
import { createAdminSupabaseClient } from "@/lib/supabase";
import type { AnswerFeedback, ConfidenceMetrics, QuestionMetadata } from "@/lib/types";

function safeParseJson(value: string): AnswerFeedback | null {
  try {
    return JSON.parse(value) as AnswerFeedback;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { sessionId, questionId, question, transcript, metrics, company, role, mode } =
      await req.json();

    if (!sessionId || !questionId || !question || !transcript || !company || !role) {
      return new Response(JSON.stringify({ error: "Missing required fields." }), { status: 400 });
    }

    const stream = await evaluateAnswerStream(
      question as QuestionMetadata,
      transcript,
      JSON.stringify(metrics ?? {}),
      company,
      role
    );

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        let fullResponse = "";
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              fullResponse += content;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
            }
          }

          const parsedFeedback = safeParseJson(fullResponse.trim());
          if (parsedFeedback) {
            const confidenceScore = (metrics as ConfidenceMetrics | undefined)?.confidenceScore ?? 0;
            const overallScore = Math.round(
              (parsedFeedback.contentScore +
                parsedFeedback.structureScore +
                parsedFeedback.depthScore +
                confidenceScore) /
                4
            );

            const supabase = createAdminSupabaseClient();
            await supabase.from("answers").insert({
              session_id: sessionId,
              question_id: questionId,
              transcript,
              mode,
              content_score: parsedFeedback.contentScore,
              structure_score: parsedFeedback.structureScore,
              depth_score: parsedFeedback.depthScore,
              confidence_score: confidenceScore,
              overall_score: overallScore,
              feedback_json: { ...parsedFeedback, overallScore },
              confidence_metrics_json: metrics ?? {},
            });

            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ final: { ...parsedFeedback, overallScore } })}\n\n`)
            );
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err) {
          console.error("Stream error:", err);
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Evaluate API Error:", error);
    return new Response(JSON.stringify({ error: "Evaluation failed" }), { status: 500 });
  }
}
