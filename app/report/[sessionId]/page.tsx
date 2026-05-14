import ReportCard from "@/components/report/ReportCard";
import { createAdminSupabaseClient } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function ReportPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const supabase = createAdminSupabaseClient();

  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .single();

  if (sessionError || !session) return notFound();

  let { data: report } = await supabase
    .from("reports")
    .select("*")
    .eq("session_id", sessionId)
    .single();

  if (!report) {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
      ? process.env.NEXT_PUBLIC_SITE_URL
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000";

    await fetch(`${baseUrl}/api/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
      cache: "no-store",
    });

    const { data: reportRetry } = await supabase
      .from("reports")
      .select("*")
      .eq("session_id", sessionId)
      .single();
    report = reportRetry || null;
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-400">Generating your comprehensive report...</p>
        <p className="text-xs text-gray-500 mt-2">Please refresh in a moment if this persists.</p>
      </div>
    );
  }

  const { data: answers } = await supabase
    .from("answers")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  const questions = session.questions_json || [];

  return (
    <div className="min-h-screen bg-background text-white pb-20">
      <header className="h-16 border-b border-border bg-surface px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="font-bold">InterviewIQ Report</div>
        </div>
      </header>

      <main className="p-6">
        <ReportCard session={session} report={report} answers={answers || []} questions={questions} />
      </main>
    </div>
  );
}
