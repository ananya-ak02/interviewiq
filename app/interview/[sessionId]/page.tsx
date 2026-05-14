import InterviewRoom from "@/components/interview/InterviewRoom";
import { createAdminSupabaseClient } from "@/lib/supabase";
import { notFound } from "next/navigation";

export default async function InterviewPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const supabase = createAdminSupabaseClient();

  const { data: session, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .single();

  if (error || !session) {
    return notFound();
  }

  if (session.status === "completed") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Session Completed</h1>
          <p className="text-gray-400 mb-6">This interview session has already been completed.</p>
          <a href={`/report/${session.id}`} className="px-6 py-2 bg-primary rounded-lg font-medium hover:bg-blue-600 transition-colors">
            View Report
          </a>
        </div>
      </div>
    );
  }

  const questions = session.questions_json || [];

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-white">
        <p>No questions generated for this session. Please try setting it up again.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white">
      {/* Header */}
      <header className="h-16 border-b border-border bg-surface px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center font-bold">IQ</div>
          <div>
            <h1 className="font-bold text-sm leading-tight">{session.company}</h1>
            <p className="text-xs text-gray-400">{session.role} • {session.interview_type}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs font-medium text-success uppercase tracking-widest">Live Session</span>
        </div>
      </header>

      <InterviewRoom session={session} questions={questions} />
    </div>
  );
}
