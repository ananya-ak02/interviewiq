import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ReportInsights } from "../types";

export async function generateSessionReportInsights(
  company: string,
  role: string,
  answersData: any[],
  overallScore: number
): Promise<ReportInsights> {
  const llm = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    modelName: "llama-3.3-70b-versatile",
    temperature: 0.2,
  });

  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      `You are a hiring manager at {company} reviewing a candidate for the {role} position.
You have the data of their performance across {numQuestions} questions. Their overall score was {overallScore}/100.

You must provide a final assessment. Output ONLY valid JSON matching this exact structure:
{{
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["area 1", "area 2", "area 3"],
  "verdict": "A 1-2 sentence final verdict on whether they would pass the interview and why."
}}
Do not output markdown code blocks. Output purely the JSON object.`,
    ],
  ]);

  const chain = prompt.pipe(llm);

  try {
    const response = await chain.invoke({
      company,
      role,
      numQuestions: answersData.length,
      overallScore: Math.round(overallScore),
    });

    let jsonStr = response.content.toString().trim();
    if (jsonStr.startsWith("```json")) {
      jsonStr = jsonStr.replace(/^```json/, "").replace(/```$/, "").trim();
    } else if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```/, "").replace(/```$/, "").trim();
    }

    return JSON.parse(jsonStr) as ReportInsights;
  } catch (error) {
    console.error("Error generating report insights:", error);
    return {
      strengths: [
        "Stayed engaged across questions",
        "Provided clear explanations",
        "Demonstrated willingness to learn"
      ],
      improvements: [
        "Add more concrete examples",
        "Improve answer structure",
        "Deepen technical trade-off discussion"
      ],
      verdict:
        "The candidate shows potential but needs more depth and structured storytelling to be competitive in a full loop.",
    };
  }
}
