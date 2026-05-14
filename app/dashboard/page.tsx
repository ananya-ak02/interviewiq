import SessionHistoryTable from "@/components/dashboard/SessionHistoryTable";
import ScoreTrendChart from "@/components/dashboard/ScoreTrendChart";
import StreakTracker from "@/components/dashboard/StreakTracker";
import WeakAreaInsight from "@/components/dashboard/WeakAreaInsight";
import MostPracticedCompaniesChart from "@/components/dashboard/MostPracticedCompaniesChart";
import { createAdminSupabaseClient } from "@/lib/supabase";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = createAdminSupabaseClient();
  const userId = process.env.NEXT_PUBLIC_DEMO_USER_ID;

  const { data: sessions } = await supabase
    .from("sessions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const safeSessions = sessions || [];
  const latestSession = safeSessions[0];

  return (
    <div className="min-h-screen bg-background text-white">
      <header className="h-16 border-b border-border bg-surface px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center font-black">IQ</div>
          <div>
            <div className="text-sm font-semibold text-white">InterviewIQ</div>
            <div className="text-xs text-gray-400">Session Dashboard</div>
          </div>
        </div>
        <Link href="/setup" className="text-sm font-semibold text-primary">
          New Session
        </Link>
      </header>

      <main className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black">Practice Dashboard</h1>
            <p className="text-gray-400">Track your momentum and build interview confidence week over week.</p>
          </div>
          {latestSession && (
            <Link
              href={`/setup?company=${encodeURIComponent(latestSession.company)}&role=${encodeURIComponent(latestSession.role)}`}
              className="bg-primary text-white px-5 py-3 rounded-xl font-semibold shadow-[0_0_15px_rgba(59,130,246,0.35)]"
            >
              Practice again: {latestSession.company}
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ScoreTrendChart sessions={safeSessions} />
          <MostPracticedCompaniesChart sessions={safeSessions} />
          <StreakTracker sessions={safeSessions} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <WeakAreaInsight sessions={safeSessions} />
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-lg flex flex-col justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Quick Start</h3>
            <p className="text-sm text-gray-400 mb-6">
              Jump back in with your most recent company and role. We will reuse your preferences to save time.
            </p>
            {latestSession ? (
              <Link
                href={`/setup?company=${encodeURIComponent(latestSession.company)}&role=${encodeURIComponent(latestSession.role)}`}
                className="bg-surface-hover border border-border text-white px-4 py-2 rounded-lg font-semibold text-center"
              >
                Start another {latestSession.company} session
              </Link>
            ) : (
              <Link href="/setup" className="bg-surface-hover border border-border text-white px-4 py-2 rounded-lg font-semibold text-center">
                Start your first session
              </Link>
            )}
          </div>
        </div>

        <SessionHistoryTable sessions={safeSessions} />
      </main>
    </div>
  );
}
