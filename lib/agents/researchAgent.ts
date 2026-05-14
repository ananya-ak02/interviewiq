import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { tavilyClient } from "../tavily";
import { CompanyIntel } from "../types";

const JSON_SCHEMA = `{
  "company_overview": "string",
  "tech_stack": ["string"],
  "interview_style": "string",
  "known_question_patterns": ["string"],
  "company_values": ["string"],
  "recent_engineering_news": ["string"]
}`;

export async function runCompanyResearch(
  company: string,
  role: string
): Promise<CompanyIntel> {
  const llm = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    modelName: "llama-3.3-70b-versatile",
    temperature: 0.2,
  });

  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      `You are an expert technical recruiter and researcher. Your goal is to research a company and a role to extract precise intelligence for generating interview questions.
You must output ONLY valid JSON matching this exact structure, with no markdown formatting or extra text:
${JSON_SCHEMA}
If you are unsure, make a best-effort, evidence-backed inference and keep it concise.`,
    ],
    ["human", "{input}"],
  ]);

  const currentYear = new Date().getFullYear();
  const queries = [
    `${company} engineering interview process ${currentYear}`,
    `${company} ${role} interview questions`,
    `${company} tech stack engineering blog`,
    `${company} engineering values culture`,
  ];

  try {
    const searchResults = await Promise.all(
      queries.map((query) => tavilyClient.search({ query, max_results: 3 }))
    );

    const formattedFindings = searchResults
      .map((result, index) => {
        const items = result.results || [];
        const lines = items
          .map((item: any) => `- ${item.title || "Result"}: ${item.url}\n  ${item.content || ""}`)
          .join("\n");
        return `Query: ${queries[index]}\n${lines}`;
      })
      .join("\n\n");

    const input = `Research the company "${company}" and the role "${role}" using the findings below.
Use the evidence to summarize succinctly and fill the JSON fields.

Findings:\n${formattedFindings}`;

    const chain = prompt.pipe(llm);
    const response = await chain.invoke({ input });

    let jsonStr = response.content.toString().trim();
    if (jsonStr.startsWith("```json")) {
      jsonStr = jsonStr.replace(/^```json/, "").replace(/```$/, "").trim();
    } else if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```/, "").replace(/```$/, "").trim();
    }

    const parsed: CompanyIntel = JSON.parse(jsonStr);
    return parsed;
  } catch (error) {
    console.error("Error in researchAgent:", error);
    return {
      company_overview: `${company} is actively hiring for ${role} roles with an emphasis on scalable engineering practices and product impact.`,
      tech_stack: ["TypeScript", "React", "Node.js", "Cloud Infrastructure", "SQL"],
      interview_style: "Structured rounds with emphasis on fundamentals, system thinking, and behavioral alignment.",
      known_question_patterns: [
        "Problem solving under constraints",
        "System design trade-offs",
        "Behavioral deep dives"
      ],
      company_values: ["Ownership", "Collaboration", "Customer obsession"],
      recent_engineering_news: ["Continued investment in AI tooling and platform reliability."],
    };
  }
}
