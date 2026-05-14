import { NextResponse } from "next/server";
import { runCompanyResearch } from "@/lib/agents/researchAgent";
import { cacheSessionState } from "@/lib/redis";
import { createAdminSupabaseClient } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { sessionId, company, role, jdUrl } = await req.json();

    if (jdUrl) {
      const res = await fetch(jdUrl);
      if (!res.ok) {
        return NextResponse.json({ error: "Failed to fetch JD URL." }, { status: 400 });
      }

      const html = await res.text();
      const text = html
        .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, " ")
        .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 5000);

      return NextResponse.json({ text });
    }

    if (!company || !role) {
      return NextResponse.json({ error: "Company and role are required." }, { status: 400 });
    }

    const companyIntel = await runCompanyResearch(company, role);

    if (sessionId) {
      const supabase = createAdminSupabaseClient();
      await supabase.from("sessions").update({ company_intel_json: companyIntel }).eq("id", sessionId);
      await cacheSessionState(sessionId, { companyIntel });
    }

    return NextResponse.json(companyIntel);
  } catch (error) {
    console.error("Error in research API:", error);
    return NextResponse.json({ error: "Research failed." }, { status: 500 });
  }
}
