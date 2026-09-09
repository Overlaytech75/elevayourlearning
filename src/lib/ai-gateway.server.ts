import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

const LOVABLE_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";

export function createLovableAiGatewayProvider(lovableApiKey: string) {
  return createOpenAICompatible({
    name: "lovable",
    baseURL: LOVABLE_GATEWAY_URL,
    headers: {
      "Lovable-API-Key": lovableApiKey,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
  });
}

/** Any OpenAI-compatible endpoint, configured entirely through env vars. */
function createCustomProvider(baseURL: string, apiKey: string) {
  return createOpenAICompatible({
    name: "custom",
    baseURL,
    headers: { Authorization: `Bearer ${apiKey}` },
  });
}

export const AI_UNAVAILABLE_REPLY =
  "AI features are unavailable in this environment — no AI provider is configured. Everything else in Eleva works normally.";



/**
 * Resolves an AI provider from the environment, or `null` when none is
 * configured (e.g. local development with no AI key). Callers must handle
 * `null` gracefully instead of throwing.
 *
 * Server-only: call inside a server-function handler, never at module scope.
 */
export function resolveAiProvider(): {
  model: (id?: string) => ReturnType<ReturnType<typeof createOpenAICompatible>> | any;
} | null {
  const lovableKey = process.env['LOVABLE_API_KEY'];
  if (lovableKey) {
    const gateway = createLovableAiGatewayProvider(lovableKey);
    return { model: (id) => gateway(id || "google/gemini-3.6-flash") };
  }

  const apiKey = process.env['AI_API_KEY'] || process.env['GEMINI_API_KEY'];
  const baseURL = process.env['AI_GATEWAY_URL'];
  const fallbackModel = process.env['AI_MODEL'] || "gemini-3.6-flash";

  // Custom OpenAI compatible endpoint (e.g. Groq, local Ollama, Gemini OpenAI)
  if (baseURL && apiKey) {
    const provider = createCustomProvider(baseURL, apiKey);
    return { model: () => provider(fallbackModel) };
  }

  return null;
}
