import { NextResponse } from "next/server";
import { generateQuestionBank } from "@/lib/agents/questionAgent";
import { createAdminSupabaseClient } from "@/lib/supabase";
import { getSessionState, cacheSessionState } from "@/lib/redis";
import type { CompanyIntel } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const { sessionId, company, role, jdText, interviewType, difficulty } = await req.json();

    if (!sessionId || !company || !role || !interviewType || !difficulty) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    let companyIntel: CompanyIntel | null = null;
    const cachedState = await getSessionState<{ companyIntel?: CompanyIntel }>(sessionId);
    if (cachedState?.companyIntel) {
      companyIntel = cachedState.companyIntel;
    }

    const supabase = createAdminSupabaseClient();
    if (!companyIntel) {
      const { data } = await supabase
        .from("sessions")
        .select("company_intel_json")
        .eq("id", sessionId)
        .single();
      if (data?.company_intel_json) companyIntel = data.company_intel_json;
    }

    // Generate questions
    const questions = await generateQuestionBank(company, role, jdText, interviewType, difficulty, companyIntel);

    // Update Supabase
    await supabase
      .from("sessions")
      .update({ questions_json: questions, status: "active" })
      .eq("id", sessionId);

    await cacheSessionState(sessionId, { companyIntel, questions });

    return NextResponse.json(questions);
  } catch (error) {
    console.error("Error in questions API:", error);
    return NextResponse.json({ error: "Failed to generate questions." }, { status: 500 });
  }
}
