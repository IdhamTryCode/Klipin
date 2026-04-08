import OpenAI from "openai";
import { SYSTEM_PROMPT, ClipsResponseSchema, type ClipsResponse } from "./schema";

let _client: OpenAI | null = null;
function getClient(): OpenAI {
  if (_client) return _client;
  const apiKey = process.env.MOONSHOT_API_KEY;
  if (!apiKey) throw new Error("MOONSHOT_API_KEY is not set");
  _client = new OpenAI({
    apiKey,
    baseURL: process.env.MOONSHOT_BASE_URL || "https://api.moonshot.ai/v1",
  });
  return _client;
}

async function callWithRetry<T>(fn: () => Promise<T>, maxAttempts = 4): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (e: unknown) {
      lastErr = e;
      const status = (e as { status?: number })?.status;
      // Retry only on overload / rate limit
      if (status !== 429 && status !== 503) throw e;
      if (attempt === maxAttempts) break;
      const delayMs = 2000 * Math.pow(2, attempt - 1) + Math.random() * 500;
      console.warn(`Kimi ${status}, retry ${attempt}/${maxAttempts - 1} in ${Math.round(delayMs)}ms`);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw lastErr;
}

async function callModel(model: string, messages: Array<{ role: "system" | "user"; content: string }>) {
  return callWithRetry(() =>
    getClient().chat.completions.create({
      model,
      messages,
      response_format: { type: "json_object" },
    })
  );
}

export async function callKimi(transcript: string, customPrompt: string) {
  const userMsg = `${customPrompt ? `User instructions: ${customPrompt}\n\n` : ""}Transcript:\n${transcript}`;
  const messages = [
    { role: "system" as const, content: SYSTEM_PROMPT },
    { role: "user" as const, content: userMsg },
  ];

  let usedModel = "kimi-k2.5";
  let res;
  try {
    res = await callModel(usedModel, messages);
  } catch (e: unknown) {
    const status = (e as { status?: number })?.status;
    if (status !== 429 && status !== 503) throw e;
    console.warn("kimi-k2.5 still overloaded after retries, falling back to kimi-k2-0905-preview");
    usedModel = "kimi-k2-0905-preview";
    res = await callModel(usedModel, messages);
  }

  const content = res.choices[0]?.message?.content || "{}";
  const parsed: ClipsResponse = ClipsResponseSchema.parse(JSON.parse(content));
  return {
    provider: "kimi" as const,
    model: usedModel,
    clips: parsed.clips,
    usage: {
      input: res.usage?.prompt_tokens,
      output: res.usage?.completion_tokens,
    },
  };
}
