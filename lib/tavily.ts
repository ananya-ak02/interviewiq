import { tavily } from "@tavily/core";

const tavilyKey = process.env.TAVILY_API_KEY;
if (!tavilyKey) {
  throw new Error("TAVILY_API_KEY is not set.");
}

export const tavilyClient = tavily({
  apiKey: tavilyKey,
});
