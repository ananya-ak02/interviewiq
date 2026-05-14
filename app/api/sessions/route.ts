import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase";
import { cacheSessionState } from "@/lib/redis";
import type { SessionConfig } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user_id, company, role, interview_type, difficulty, mode, jdText, jdUrl } = body;

    if (!company || !role || !interview_type || !difficulty || !mode) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();
    const resolvedUserId = user_id || process.env.NEXT_PUBLIC_DEMO_USER_ID;
    if (!resolvedUserId) {
      return NextResponse.json({ error: "Missing user id." }, { status: 400 });
    }

    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("id", resolvedUserId)
      .single();

    if (!existingUser) {
      const { error: userInsertError } = await supabase.from("users").insert({
        id: resolvedUserId,
        email: `${resolvedUserId}@demo.local`,
      });
      if (userInsertError) throw userInsertError;
    }

    const { data, error } = await supabase
      .from("sessions")
      .insert({
        user_id: resolvedUserId,
        company,
        role,
        interview_type,
        difficulty,
        mode,
        status: "setup",
      })
      .select()
      .single();

    if (error) throw error;

    const sessionConfig: SessionConfig = {
      company,
      role,
      jdText: jdText || "",
      jdUrl,
      interviewType: interview_type,
      difficulty,
      mode,
    };
    await cacheSessionState(data.id, { sessionConfig });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json({ error: "Failed to create session." }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || process.env.NEXT_PUBLIC_DEMO_USER_ID;
    if (!userId) {
      return NextResponse.json({ error: "Missing user id." }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json({ error: "Failed to fetch sessions." }, { status: 500 });
  }
}
