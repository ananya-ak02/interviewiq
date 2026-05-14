import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { CompanyIntel, QuestionMetadata } from "../types";

const FALLBACK_QUESTIONS: QuestionMetadata[] = [
  {
    id: "q1",
    question: "Walk me through a recent project where you had to trade off performance and maintainability. How did you decide?",
    type: "project_deep_dive",
    difficulty: "medium",
    what_interviewer_wants: "Decision-making under constraints and clear articulation of trade-offs.",
    red_flags_to_avoid: ["No concrete examples", "Blaming others for outcomes"],
    time_limit_seconds: 120,
  },
  {
    id: "q2",
    question: "Design a system that can handle spiky traffic for a read-heavy feature like a feed or dashboard.",
    type: "system_design",
    difficulty: "medium",
    what_interviewer_wants: "Scalable architecture, caching strategy, and data freshness considerations.",
    red_flags_to_avoid: ["Single point of failure", "No scalability discussion"],
    time_limit_seconds: 180,
  },
  {
    id: "q3",
    question: "Explain how you would detect and fix a memory leak in a Node.js service.",
    type: "debugging",
    difficulty: "medium",
    what_interviewer_wants: "Systematic debugging process and tooling knowledge.",
    red_flags_to_avoid: ["Guessing without evidence", "No monitoring strategy"],
    time_limit_seconds: 120,
  },
  {
    id: "q4",
    question: "Given an array of integers, find the length of the longest increasing subsequence.",
    type: "dsa",
    difficulty: "hard",
    what_interviewer_wants: "Dynamic programming and optimization thinking.",
    red_flags_to_avoid: ["O(n^2) without discussion", "No edge cases"],
    time_limit_seconds: 150,
  },
  {
    id: "q5",
    question: "Tell me about a time you received critical feedback. What did you do next?",
    type: "behavioural",
    difficulty: "easy",
    what_interviewer_wants: "Self-awareness, growth mindset, and accountability.",
    red_flags_to_avoid: ["Deflecting blame", "No actionable follow-up"],
    time_limit_seconds: 90,
  },
  {
    id: "q6",
    question: "How would you approach designing a rate limiter for an API?",
    type: "system_design",
    difficulty: "medium",
    what_interviewer_wants: "Understanding of algorithms like token bucket and practical constraints.",
    red_flags_to_avoid: ["No persistence strategy", "Ignoring distributed systems"],
    time_limit_seconds: 150,
  },
  {
    id: "q7",
    question: "Describe a time you had to influence a decision without direct authority.",
    type: "behavioural",
    difficulty: "medium",
    what_interviewer_wants: "Communication and stakeholder alignment.",
    red_flags_to_avoid: ["Vague outcome", "No concrete actions"],
    time_limit_seconds: 90,
  },
  {
    id: "q8",
    question: "Explain eventual consistency with a real-world example and where it breaks down.",
    type: "tech_concept",
    difficulty: "medium",
    what_interviewer_wants: "Conceptual clarity and practical implications.",
    red_flags_to_avoid: ["No example", "Confusing with strong consistency"],
    time_limit_seconds: 120,
  },
  {
    id: "q9",
    question: "Tell me about a time you had to work with ambiguous requirements.",
    type: "situational",
    difficulty: "medium",
    what_interviewer_wants: "Clarification, risk management, and iterative delivery.",
    red_flags_to_avoid: ["Waiting for instructions", "No validation of assumptions"],
    time_limit_seconds: 90,
  },
  {
    id: "q10",
    question: "What does ownership mean to you in an engineering team?",
    type: "values_based",
    difficulty: "easy",
    what_interviewer_wants: "Values alignment and accountability.",
    red_flags_to_avoid: ["Only focusing on individual tasks", "No mention of customer impact"],
    time_limit_seconds: 90,
  },
];

export async function generateQuestionBank(
  company: string,
  role: string,
  jdText: string,
  interviewType: "technical" | "behavioural" | "mixed",
  difficulty: "entry" | "mid" | "senior",
  companyIntel: CompanyIntel | null
): Promise<QuestionMetadata[]> {
  const llm = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    modelName: "llama-3.3-70b-versatile",
    temperature: 0.7,
  });

  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      `You are an expert technical interviewer at {company} hiring for a {difficulty} {role}.
You need to generate exactly 10 interview questions tailored to the provided Job Description and Company Intel.

Question distribution based on Interview Type '{interviewType}':
- technical: DSA (2), System Design (2), Tech concepts (2), Debugging scenario (1), Project deep-dive (2), Culture fit (1)
- behavioural: STAR-format (5), Situational (3), Values-based (2)
- mixed: DSA (1), System Design (1), Tech concepts (2), STAR-format (3), Situational (2), Values-based (1)

Company Intel:
{intel}

Job Description:
{jdText}

You must return ONLY a JSON array of 10 objects matching this exact structure:
[
  {{
    "id": "q1",
    "question": "The actual interview question text...",
    "type": "system_design|dsa|behavioural|culture|tech_concept|debugging|project_deep_dive|situational|values_based",
    "difficulty": "easy|medium|hard",
    "what_interviewer_wants": "What a strong answer should demonstrate...",
    "red_flags_to_avoid": ["red flag 1", "red flag 2"],
    "time_limit_seconds": 120
  }}
]
Do not output markdown code blocks. Output purely the JSON array. Make the questions specific and realistic for {company} and the role.`,
    ],
  ]);

  const chain = prompt.pipe(llm);

  try {
    const response = await chain.invoke({
      company,
      difficulty,
      role,
      interviewType,
      intel: companyIntel ? JSON.stringify(companyIntel, null, 2) : "No specific intel available.",
      jdText: jdText || "General industry standards for this role.",
    });

    let jsonStr = response.content.toString().trim();
    if (jsonStr.startsWith("```json")) {
      jsonStr = jsonStr.replace(/^```json/, "").replace(/```$/, "").trim();
    } else if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```/, "").replace(/```$/, "").trim();
    }

    const questions: QuestionMetadata[] = JSON.parse(jsonStr);
    return questions.slice(0, 10);
  } catch (error) {
    console.error("Error generating question bank:", error);
    return FALLBACK_QUESTIONS;
  }
}
