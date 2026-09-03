import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateText } from "ai";
import { z } from "zod";

import { AI_UNAVAILABLE_REPLY, resolveAiProvider } from "./ai-gateway.server";

const ToolInput = z.object({
  tool: z.enum([
    "flashcards",
    "quiz",
    "summarize",
    "explain",
    "citation",
    "essay",
    "plan",
    "exam",
  ]),
  content: z.string().min(1).max(20000),
  level: z.enum(["child", "beginner", "undergrad", "expert"]).default("undergrad"),
  style: z.enum(["APA", "MLA", "Chicago", "Harvard", "IEEE"]).default("APA"),
  count: z.number().min(1).max(20).default(8),
});

const PROMPTS: Record<string, (i: z.infer<typeof ToolInput>) => string> = {
  flashcards: (i) =>
    `Create exactly ${i.count} study flashcards from the material below. Return ONLY a JSON array of objects with "front" and "back" keys — no prose, no code fences. Keep fronts under 15 words and backs under 40 words.\n\nMATERIAL:\n${i.content}`,
  quiz: (i) =>
    `Create a ${i.count}-question multiple-choice quiz from the material below. For each question give 4 options labelled A–D, then the answer and a one-line explanation. Use markdown.\n\nMATERIAL:\n${i.content}`,
  summarize: (i) =>
    `Summarize the material below for a student revising for an exam. Give: a 3-sentence overview, key points as bullets, key terms with short definitions, and 3 likely exam questions. Use markdown.\n\nMATERIAL:\n${i.content}`,
  explain: (i) =>
    `Explain the concept below at a ${i.level} level. Use a concrete analogy, a worked example, and a short "common mistakes" list. Use markdown.\n\nCONCEPT:\n${i.content}`,
  citation: (i) =>
    `Generate correct ${i.style} citations for the sources below — both a reference-list entry and an in-text citation for each. If information is missing, note what's missing. Use markdown.\n\nSOURCES:\n${i.content}`,
  essay: (i) =>
    `Act as a supportive but rigorous writing tutor. Give feedback on the essay below: overall impression, thesis strength, structure, evidence, style, and a prioritized list of 5 concrete edits. Do not rewrite the essay for the student. Use markdown.\n\nESSAY:\n${i.content}`,
  plan: (i) =>
    `Build a personalized, realistic study plan from the situation below. Include a day-by-day schedule, session lengths, spaced-repetition checkpoints, and a fallback plan for a bad day. Use markdown tables where useful.\n\nSITUATION:\n${i.content}`,
  exam: (i) =>
    `Write a practice exam based on the material below: ${i.count} questions mixing multiple choice, short answer and one extended-response question, with marks allocated. Put a full answer key at the end under "## Answer key". Use markdown.\n\nMATERIAL:\n${i.content}`,
};

export const runStudyTool = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ToolInput.parse(input))
  .handler(async ({ data }) => {
    const provider = resolveAiProvider();
    if (!provider) return { result: AI_UNAVAILABLE_REPLY, unavailable: true as const };

    try {
      const { text } = await generateText({
        model: provider.model(),
        system:
          "You are Eleva, an expert academic tutor. Be accurate, concise and practical. When asked for JSON, output raw JSON only.",
        prompt: PROMPTS[data.tool](data),
      });
      return { result: text.trim() };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/429|rate/i.test(msg)) return { result: "Rate limited — try again in a few seconds." };
      if (/402|credit|payment/i.test(msg)) return { result: "AI credits are exhausted for this workspace." };
      return { result: `Something went wrong: ${msg}` };
    }
  });
