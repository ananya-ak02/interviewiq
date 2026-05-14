import { Suspense } from "react";
import SetupStepper from "@/components/setup/SetupStepper";

export default function SetupPage() {
  return (
    <div className="min-h-screen bg-background text-white p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-4xl font-black mb-2">Configure Your Interview</h1>
          <p className="text-gray-400 text-lg">
            Tell us about your target role. We will research the company and craft a high-signal question bank.
          </p>
        </div>
        <Suspense fallback={<div className="text-gray-400">Loading setup...</div>}>
          <SetupStepper />
        </Suspense>
      </div>
    </div>
  );
}
