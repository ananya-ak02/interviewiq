import { NextResponse } from "next/server";
import { generateSessionReportInsights } from "@/lib/agents/reportAgent";
import { createAdminSupabaseClient } from "@/lib/supabase";

function calculateGrade(score: number): "A" | "B" | "C" | "D" | "F" {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();
    if (!sessionId) return NextResponse.json({ error: "Session ID required." }, { status: 400 });

    const supabase = createAdminSupabaseClient();

    const { data: sessionData, error: sessionError } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (sessionError || !sessionData) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const { data: answersData, error: answersError } = await supabase
      .from("answers")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (answersError) throw answersError;

    if (!answersData || answersData.length === 0) {
      return NextResponse.json({ error: "No answers found for session" }, { status: 400 });
    }

    const totalScore = answersData.reduce((acc, ans) => acc + (ans.overall_score || 0), 0);
    const overallScore = Math.round(totalScore / answersData.length);
    const grade = calculateGrade(overallScore);

    const insights = await generateSessionReportInsights(
      sessionData.company,
      sessionData.role,
      answersData,
      overallScore
    );

    const { data: reportData, error: reportError } = await supabase
      .from("reports")
      .insert({
        session_id: sessionId,
        overall_score: overallScore,
        grade,
        strengths_json: insights.strengths,
        improvements_json: insights.improvements,
        verdict: insights.verdict,
      })
      .select()
      .single();

    if (reportError) throw reportError;

    await supabase
      .from("sessions")
      .update({ status: "completed", overall_score: overallScore, completed_at: new Date().toISOString() })
      .eq("id", sessionId);

    return NextResponse.json(reportData);
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
