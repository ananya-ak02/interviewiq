"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Briefcase, FileText, Settings, Mic, Gauge, Play } from "lucide-react";
import JDParser from "./JDParser";
import CompanyResearchLoader from "./CompanyResearchLoader";
import { useRouter, useSearchParams } from "next/navigation";

type StepId = 1 | 2 | 3 | 4 | 5;

export default function SetupStepper() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<StepId>(1);
  const [formData, setFormData] = useState({
    company: "",
    role: "",
    jdText: "",
    jdUrl: "",
    interviewType: "technical",
    mode: "voice",
    difficulty: "mid",
  });
  const [isResearching, setIsResearching] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const companyParam = searchParams.get("company");
    const roleParam = searchParams.get("role");
    if (companyParam) {
      setFormData((prev) => ({ ...prev, company: companyParam }));
    }
    if (roleParam) {
      setFormData((prev) => ({ ...prev, role: roleParam }));
    }
  }, [searchParams]);

  const updateForm = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const nextStep = () => setStep((s) => (Math.min(s + 1, 5) as StepId));
  const prevStep = () => setStep((s) => (Math.max(s - 1, 1) as StepId));

  const startSession = async () => {
    setErrorMessage(null);
    setIsResearching(true);
    setProgressStep(0);
    try {
      const sessionRes = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: formData.company,
          role: formData.role,
          jdText: formData.jdText,
          jdUrl: formData.jdUrl,
          interview_type: formData.interviewType,
          difficulty: formData.difficulty,
          mode: formData.mode,
        }),
      });
      const sessionPayload = await sessionRes.json();
      if (!sessionRes.ok || !sessionPayload?.id) {
        throw new Error(sessionPayload?.error || "Failed to create session.");
      }

      const session = sessionPayload;
      setProgressStep(1);

      await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session.id, company: formData.company, role: formData.role }),
      });
      if (!session?.id) {
        throw new Error("Session was not created correctly.");
      }
      setProgressStep(2);

      const questionsRes = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.id,
          company: formData.company,
          role: formData.role,
          jdText: formData.jdText,
          interviewType: formData.interviewType,
          difficulty: formData.difficulty,
        }),
      });
      const questionsPayload = await questionsRes.json();
      if (!questionsRes.ok) {
        throw new Error(questionsPayload?.error || "Failed to generate questions.");
      }
      setProgressStep(3);

      router.push(`/interview/${session.id}`);
    } catch (error) {
      console.error("Setup failed", error);
      setIsResearching(false);
      setErrorMessage(error instanceof Error ? error.message : "Setup failed. Try again.");
    }
  };

  const stepMeta = useMemo(
    () => [
      { num: 1, icon: Briefcase, label: "Role" },
      { num: 2, icon: FileText, label: "JD" },
      { num: 3, icon: Settings, label: "Type" },
      { num: 4, icon: Mic, label: "Mode" },
      { num: 5, icon: Gauge, label: "Level" },
    ],
    []
  );

  if (isResearching) {
    return <CompanyResearchLoader company={formData.company} role={formData.role} step={progressStep} />;
  }

  return (
    <div className="max-w-4xl mx-auto mt-12 bg-surface border border-border rounded-3xl p-8 shadow-2xl">
      <div className="flex items-center justify-between mb-10 relative">
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-border/70 -z-10 -translate-y-1/2" />
        <div
          className="absolute top-1/2 left-0 h-1 bg-primary -z-10 -translate-y-1/2 transition-all duration-500"
          style={{ width: `${((step - 1) / 4) * 100}%` }}
        />
        {stepMeta.map((s) => (
          <div key={s.num} className="flex flex-col items-center gap-2 bg-surface px-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                step >= s.num ? "bg-primary border-primary text-white" : "bg-surface border-border text-gray-500"
              }`}
            >
              <s.icon size={18} />
            </div>
            <span className={`text-xs font-medium ${step >= s.num ? "text-white" : "text-gray-500"}`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="min-h-[320px]"
        >
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Your target role</h2>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Company Name</label>
                <input
                  type="text"
                  placeholder="e.g. Google, Meta, Stripe"
                  value={formData.company}
                  onChange={(e) => updateForm("company", e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Role Title</label>
                <input
                  type="text"
                  placeholder="e.g. Software Engineer L3"
                  value={formData.role}
                  onChange={(e) => updateForm("role", e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Job description</h2>
              <p className="text-gray-400 text-sm">
                Paste the JD or provide a URL. We will extract the responsibilities and requirements for a sharper question bank.
              </p>
              <JDParser
                jdText={formData.jdText}
                jdUrl={formData.jdUrl}
                onChange={(val) => updateForm("jdText", val)}
                onUrlChange={(val) => updateForm("jdUrl", val)}
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Interview type</h2>
              <div className="grid grid-cols-3 gap-4">
                {["technical", "behavioural", "mixed"].map((type) => (
                  <button
                    key={type}
                    onClick={() => updateForm("interviewType", type)}
                    className={`px-4 py-6 rounded-xl border text-left transition-all ${
                      formData.interviewType === type
                        ? "bg-primary/10 border-primary text-white"
                        : "bg-background border-border text-gray-400 hover:border-gray-600"
                    }`}
                  >
                    <div className="text-sm uppercase tracking-widest font-semibold">{type}</div>
                    <div className="mt-2 text-xs text-gray-400">
                      {type === "technical" && "DSA, system design, and debugging focus."}
                      {type === "behavioural" && "STAR responses, values, and situational depth."}
                      {type === "mixed" && "Balanced blend of technical and behavioural."}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Interaction mode</h2>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { key: "voice", title: "Voice", desc: "Real-time speaking analysis." },
                  { key: "text", title: "Text", desc: "Structured written responses." },
                  { key: "both", title: "Both", desc: "Switch between voice and text." },
                ].map((option) => (
                  <button
                    key={option.key}
                    onClick={() => updateForm("mode", option.key)}
                    className={`px-4 py-6 rounded-xl border text-left transition-all ${
                      formData.mode === option.key
                        ? "bg-primary/10 border-primary text-white"
                        : "bg-background border-border text-gray-400 hover:border-gray-600"
                    }`}
                  >
                    <div className="text-sm uppercase tracking-widest font-semibold">{option.title}</div>
                    <div className="mt-2 text-xs text-gray-400">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6 text-center py-4">
              <h2 className="text-3xl font-bold text-white">Finalize difficulty</h2>
              <div className="grid grid-cols-3 gap-4 mt-6">
                {[
                  { key: "entry", label: "Entry", desc: "Core fundamentals and clarity." },
                  { key: "mid", label: "Mid", desc: "Ownership, trade-offs, system depth." },
                  { key: "senior", label: "Senior", desc: "Architecture, leadership, ambiguity." },
                ].map((level) => (
                  <button
                    key={level.key}
                    onClick={() => updateForm("difficulty", level.key)}
                    className={`px-4 py-6 rounded-xl border text-left transition-all ${
                      formData.difficulty === level.key
                        ? "bg-primary/10 border-primary text-white"
                        : "bg-background border-border text-gray-400 hover:border-gray-600"
                    }`}
                  >
                    <div className="text-sm uppercase tracking-widest font-semibold">{level.label}</div>
                    <div className="mt-2 text-xs text-gray-400">{level.desc}</div>
                  </button>
                ))}
              </div>

              <div className="mt-8 p-6 bg-background rounded-xl border border-border inline-block text-left">
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>
                    <strong className="text-white">Company:</strong> {formData.company}
                  </li>
                  <li>
                    <strong className="text-white">Role:</strong> {formData.role}
                  </li>
                  <li>
                    <strong className="text-white">Type:</strong> {formData.interviewType} | {formData.difficulty}
                  </li>
                  <li>
                    <strong className="text-white">Mode:</strong> {formData.mode}
                  </li>
                </ul>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between mt-8 pt-6 border-t border-border">
        <button
          onClick={prevStep}
          disabled={step === 1}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            step === 1 ? "opacity-0 cursor-default" : "text-gray-400 hover:text-white bg-surface-hover"
          }`}
        >
          Back
        </button>
        {step < 5 ? (
          <button
            onClick={nextStep}
            disabled={step === 1 && (!formData.company || !formData.role)}
            className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue <ChevronRight size={18} />
          </button>
        ) : (
          <button
            onClick={startSession}
            className="flex items-center gap-2 bg-success hover:bg-green-500 text-white px-8 py-2 rounded-lg font-bold shadow-[0_0_15px_rgba(34,197,94,0.4)] transition-all hover:scale-105"
          >
            Generate Interview <Play size={18} fill="currentColor" />
          </button>
        )}
      </div>
      {errorMessage && (
        <div className="mt-4 text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg px-4 py-3">
          {errorMessage}
        </div>
      )}
    </div>
  );
}
