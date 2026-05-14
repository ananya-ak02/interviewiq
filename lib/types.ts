export type InterviewType = "technical" | "behavioural" | "mixed";
export type Difficulty = "entry" | "mid" | "senior";
export type InterviewMode = "voice" | "text" | "both";
export type SessionStatus = "setup" | "active" | "completed";

export interface CompanyIntel {
  company_overview: string;
  tech_stack: string[];
  interview_style: string;
  known_question_patterns: string[];
  company_values: string[];
  recent_engineering_news: string[];
}

export interface QuestionMetadata {
  id: string;
  question: string;
  type:
    | "system_design"
    | "dsa"
    | "behavioural"
    | "culture"
    | "tech_concept"
    | "debugging"
    | "project_deep_dive"
    | "situational"
    | "values_based"
    | "follow_up";
  difficulty: "easy" | "medium" | "hard";
  what_interviewer_wants: string;
  red_flags_to_avoid: string[];
  time_limit_seconds: number;
}

export interface ConfidenceMetrics {
  wpm: number;
  fillerCount: number;
  fillerWords: string[];
  fillerRate: number;
  silencePauses: number;
  answerDuration: number;
  paceFeedback: "too_slow" | "good" | "too_fast";
  confidenceScore: number;
}

export interface AnswerFeedback {
  contentScore: number;
  structureScore: number;
  depthScore: number;
  confidenceScore: number;
  overallScore: number;
  whatYouDidWell: string[];
  whatToImprove: string[];
  strongAnswerExample: string;
  followUp: string | null;
}

export interface InterviewSession {
  id: string;
  user_id: string;
  company: string;
  role: string;
  interview_type: InterviewType;
  difficulty: Difficulty;
  mode: InterviewMode;
  company_intel_json: CompanyIntel | null;
  questions_json: QuestionMetadata[] | null;
  status: SessionStatus;
  overall_score: number | null;
  created_at: string;
  completed_at: string | null;
}

export interface InterviewAnswer {
  id: string;
  session_id: string;
  question_id: string;
  transcript: string;
  mode: "voice" | "text";
  content_score: number | null;
  structure_score: number | null;
  depth_score: number | null;
  confidence_score: number | null;
  overall_score: number | null;
  feedback_json: AnswerFeedback | null;
  confidence_metrics_json: ConfidenceMetrics | null;
  created_at: string;
}

export interface SessionReport {
  id: string;
  session_id: string;
  overall_score: number;
  grade: "A" | "B" | "C" | "D" | "F";
  strengths_json: string[];
  improvements_json: string[];
  verdict: string;
  created_at: string;
}

export interface SessionConfig {
  company: string;
  role: string;
  jdText: string;
  jdUrl?: string;
  interviewType: InterviewType;
  difficulty: Difficulty;
  mode: InterviewMode;
}

export interface ReportInsights {
  strengths: string[];
  improvements: string[];
  verdict: string;
}

export interface PaceSample {
  timestamp: number;
  wpm: number;
}

export interface FillerSummary {
  word: string;
  count: number;
}
