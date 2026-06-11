import OpenAI from "openai";
import { NonRetriableError } from "inngest";
import { SYSTEM_PROMPT, ClipsResponseSchema, type ClipsResponse } from "./schema";

let _client: OpenAI | null = null;
function getClient(): OpenAI {
  if (_client) return _client;
  const apiKey = process.env.MOONSHOT_API_KEY;
  if (!apiKey) throw new Error("MOONSHOT_API_KEY is not set");
  _client = new OpenAI({
    apiKey,
    baseURL: process.env.MOONSHOT_BASE_URL || "https://api.moonshot.ai/v1",
    timeout: 10 * 60 * 1000,
    maxRetries: 0,
  });
  return _client;
}

async function callWithRetry<T>(fn: () => Promise<T>, maxAttempts = 2): Promise<T> {
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
      max_tokens: 8000,
      temperature: 1,
    })
  );
}

export async function callKimi(transcript: string, customPrompt: string) {
  const userMsg = `${customPrompt ? `User instructions: ${customPrompt}\n\n` : ""}Transcript:\n${transcript}`;
  const messages = [
    { role: "system" as const, content: SYSTEM_PROMPT },
    { role: "user" as const, content: userMsg },
  ];

  let usedModel = process.env.MOONSHOT_MODEL || "kimi-k2.6";
  let res;
  try {
    res = await callModel(usedModel, messages);
  } catch (e: unknown) {
    const status = (e as { status?: number })?.status;
    if (status === 400 || status === 401 || status === 404) {
      // Permanent error — don't retry the whole Inngest function.
      throw new NonRetriableError(`Kimi rejected request (${status})`, { cause: e });
    }
    if (status !== 429 && status !== 503) throw e;
    console.warn(`${usedModel} still overloaded after retries, falling back to kimi-k2.5`);
    usedModel = "kimi-k2.5";
    res = await callModel(usedModel, messages);
  }

  let content = res.choices[0]?.message?.content || "{}";
  // Some models wrap JSON in a ```json ... ``` markdown fence despite json_object mode.
  const fence = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) content = fence[1].trim();
  let raw: unknown;
  try {
    raw = JSON.parse(content);
  } catch (e) {
    console.error("Kimi unparseable output:", content.slice(0, 2000));
    throw new NonRetriableError("Kimi returned invalid JSON", { cause: e });
  }

  // Tolerate models that return an array directly, or wrap clips under a different key.
  let normalized: unknown = raw;
  if (Array.isArray(raw)) {
    normalized = { clips: raw };
  } else if (raw && typeof raw === "object" && !("clips" in raw)) {
    const obj = raw as Record<string, unknown>;
    const arrayKey = Object.keys(obj).find((k) => Array.isArray(obj[k]));
    if (arrayKey) normalized = { clips: obj[arrayKey] };
  }
  const parsed = ClipsResponseSchema.safeParse(normalized);
  if (!parsed.success) {
    console.error("Kimi raw output:", content.slice(0, 2000));
    throw new NonRetriableError(`Kimi output failed schema: ${parsed.error.message}`);
  }
  const data: ClipsResponse = parsed.data;
  return {
    provider: "kimi" as const,
    model: usedModel,
    clips: data.clips,
    usage: {
      input: res.usage?.prompt_tokens,
      output: res.usage?.completion_tokens,
    },
  };
}
