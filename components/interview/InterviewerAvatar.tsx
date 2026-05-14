"use client";

import { motion } from "framer-motion";

export default function InterviewerAvatar({ isSpeaking, isListening }: { isSpeaking: boolean; isListening: boolean }) {
  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      {/* Background pulsing ring when listening */}
      {isListening && (
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full bg-primary opacity-20 blur-md"
        />
      )}

      {/* Main Avatar Circle */}
      <div className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-br ${isSpeaking ? "from-primary to-blue-800" : "from-surface-hover to-surface"} border-2 ${isSpeaking ? "border-primary" : "border-border"} transition-all duration-500 shadow-xl`}>
        {/* Soundwave bars when speaking */}
        {isSpeaking ? (
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <motion.div
                key={i}
                animate={{ height: ["10%", "80%", "30%", "100%", "20%"] }}
                transition={{
                  duration: 0.5 + Math.random() * 0.5,
                  repeat: Infinity,
                  repeatType: "mirror",
                  ease: "easeInOut",
                  delay: i * 0.1,
                }}
                className="w-1.5 bg-white rounded-full"
                style={{ height: "20%" }}
              />
            ))}
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-500 opacity-50" />
        )}
      </div>

      {/* Status indicator badge */}
      <div className={`absolute bottom-0 right-0 w-6 h-6 rounded-full border-2 border-surface flex items-center justify-center z-20 ${
        isSpeaking ? "bg-success" : isListening ? "bg-primary" : "bg-gray-500"
      }`}>
        <div className={`w-2 h-2 rounded-full bg-white ${isListening ? "animate-pulse" : ""}`} />
      </div>
    </div>
  );
}
