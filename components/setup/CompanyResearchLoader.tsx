"use client";

import { motion } from "framer-motion";
import { Search, Database, Cpu, CheckCircle2 } from "lucide-react";

export default function CompanyResearchLoader({
  company,
  role,
  step = 0,
}: {
  company: string;
  role: string;
  step?: number;
}) {
  const steps = [
    { icon: Search, text: `Researching ${company || "company"} engineering culture...` },
    { icon: Database, text: `Analyzing ${role || "role"} requirements...` },
    { icon: Cpu, text: "Generating your question bank..." },
    { icon: CheckCircle2, text: "Preparing your interview room..." },
  ];

  const activeStep = Math.min(step, steps.length - 1);

  return (
    <div className="flex flex-col items-center justify-center min-h-[420px] bg-surface border border-border rounded-3xl p-10 shadow-2xl">
      <div className="relative w-36 h-36 mb-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border-t-2 border-primary border-r-2 border-transparent"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 4.4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-3 rounded-full border-b-2 border-success border-l-2 border-transparent"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          {(() => {
            const Icon = steps[activeStep].icon;
            return <Icon size={34} className={activeStep === 3 ? "text-success" : "text-primary"} />;
          })()}
        </div>
      </div>

      <div className="h-8 overflow-hidden">
        <motion.div
          key={activeStep}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          className="text-lg font-medium text-gray-300 text-center"
        >
          {steps[activeStep].text}
        </motion.div>
      </div>

      <div className="mt-8 flex gap-2">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i <= activeStep
                ? i === steps.length - 1
                  ? "bg-success w-8"
                  : "bg-primary w-8"
                : "bg-border w-4"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
