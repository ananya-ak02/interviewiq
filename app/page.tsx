"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Play, TrendingUp, ShieldCheck, Zap } from "lucide-react";

export default function LandingPage() {
  const roles = [
    "Software Engineer at Google",
    "Product Manager at Meta",
    "Data Scientist at Amazon",
    "Frontend Engineer at Vercel",
  ];
  const [roleIndex, setRoleIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRoleIndex((prev) => (prev + 1) % roles.length);
    }, 4000); // 4 seconds per cycle to allow typing + pause
    return () => clearInterval(interval);
  }, [roles.length]);

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <div className="absolute top-[-12rem] left-[-8rem] w-[28rem] h-[28rem] bg-primary/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10rem] right-[-6rem] w-[26rem] h-[26rem] bg-success/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-64 bg-[linear-gradient(180deg,_rgba(59,130,246,0.08),_transparent)]" />

      <header className="flex items-center justify-between px-6 md:px-12 py-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-black">IQ</div>
          <div>
            <div className="text-sm font-semibold text-white">InterviewIQ</div>
            <div className="text-xs text-gray-400">AI Interview Practice</div>
          </div>
        </div>
        <Link href="/dashboard" className="text-sm font-semibold text-gray-300 hover:text-white transition-colors">
          Dashboard
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center text-center max-w-5xl mx-auto px-6 w-full pt-12 pb-24 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-8">
          <Zap size={16} /> InterviewIQ AI Engine 2.0
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6">
          Crack the
          <div className="h-[1.2em] relative inline-block text-left w-full max-w-[820px] overflow-hidden">
            <span
              key={roleIndex}
              className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-primary border-r-4 border-primary overflow-hidden w-0 text-glow"
              style={{ animation: "typing 2.5s steps(40, end) forwards" }}
            >
              {roles[roleIndex]}
            </span>
          </div>
          Interview.
        </h1>

        <p className="text-xl text-gray-400 mb-10 max-w-2xl leading-relaxed">
          The premium AI mock interview platform. Hyper-realistic sessions, real-time voice analysis, and actionable feedback designed to get you the offer.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <Link
            href="/setup"
            className="flex items-center gap-2 px-8 py-4 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl transition-all hover:scale-105 shadow-[0_0_20px_rgba(59,130,246,0.4)] w-full sm:w-auto justify-center"
          >
            Start Practice Session <Play fill="currentColor" size={20} />
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-8 py-4 bg-surface hover:bg-surface-hover border border-border text-white font-bold rounded-xl transition-all w-full sm:w-auto justify-center"
          >
            View Dashboard
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full">
          <div className="bg-surface/50 border border-border rounded-xl p-6 backdrop-blur-sm">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center mb-4 text-primary">
              <Zap size={20} />
            </div>
            <h3 className="text-white font-bold mb-2">Real-time Intel</h3>
            <p className="text-sm text-gray-400">
              Our agent scans engineering blogs and interview debriefs to craft hyper-specific questions.
            </p>
          </div>
          <div className="bg-surface/50 border border-border rounded-xl p-6 backdrop-blur-sm">
            <div className="w-10 h-10 bg-success/20 rounded-lg flex items-center justify-center mb-4 text-success">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-white font-bold mb-2">Live Voice Analysis</h3>
            <p className="text-sm text-gray-400">
              Web Speech API measures your pace, filler words, and silence patterns while you speak.
            </p>
          </div>
          <div className="bg-surface/50 border border-border rounded-xl p-6 backdrop-blur-sm">
            <div className="w-10 h-10 bg-warning/20 rounded-lg flex items-center justify-center mb-4 text-warning">
              <TrendingUp size={20} />
            </div>
            <h3 className="text-white font-bold mb-2">Detailed Reports</h3>
            <p className="text-sm text-gray-400">
              Download a polished PDF with radar charts, pacing graphs, and executive summaries.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
