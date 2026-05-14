"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { generatePDFReport } from "@/lib/pdf";

export default function PDFExporter({ elementId, filename }: { elementId: string; filename: string }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await generatePDFReport(elementId, filename);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary hover:bg-blue-600 text-white font-medium transition-colors disabled:opacity-50"
    >
      <Download size={18} />
      {isExporting ? "Generating PDF..." : "Download Report"}
    </button>
  );
}
