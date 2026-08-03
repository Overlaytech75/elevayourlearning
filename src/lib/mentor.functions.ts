import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";

import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

const AskInput = z.object({
  messages: z.array(MessageSchema).min(1).max(40),
  context: z.object({
    userName: z.string().default("there"),
    today: z.string(),
    courses: z
      .array(z.object({ code: z.string(), name: z.string() }))
      .max(20),
    assessments: z
      .array(
        z.object({
          title: z.string(),
          courseCode: z.string().optional(),
          type: z.string().optional(),
          weight: z.number().optional(),
          dueDate: z.string(),
          daysUntil: z.number(),
          status: z.string(),
          progress: z.number().optional(),
          grade: z.number().nullable().optional(),
        }),
      )
      .max(40),
    goals: z
      .array(
        z.object({
          title: z.string(),
          category: z.string(),
          current: z.number(),
          target: z.number(),
          unit: z.string(),
          deadline: z.string().optional(),
        }),
      )
      .max(20),
    openTasks: z.array(z.string()).max(20),
    habits: z
      .array(z.object({ name: z.string(), last7: z.number() }))
      .max(10),
    finance: z
      .object({
        monthIncome: z.number(),
        monthSpent: z.number(),
        topCategories: z
          .array(z.object({ category: z.string(), spent: z.number() }))
          .max(5),
      })
      .optional(),
  }),
});

export const askMentor = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => AskInput.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) {
      return {
        reply:
          "The AI mentor isn't configured yet (missing LOVABLE_API_KEY). Ask the project owner to enable Lovable AI.",
      };
    }

    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-3.6-flash");

    const system = [
      `You are Eleva, a warm, precise personal mentor for ${data.context.userName}, a university student.`,
      `Today is ${data.context.today}.`,
      `You have two sources of knowledge:`,
      `1. The user's live Eleva data (JSON below). Use it whenever the question touches their courses, deadlines, goals, tasks, habits or money. Cite specific items by name.`,
      `2. Your general knowledge — study techniques, subject explanations (math, science, humanities, coding, etc.), productivity science, budgeting basics, career and life advice. Use it freely when the question is general or the internal data is not enough.`,
      ``,
      `Style: concise and direct. Use short paragraphs and bullet lists when helpful. Markdown is rendered. Never invent Eleva data that isn't in the JSON. If the user asks something you genuinely can't know (e.g. today's news, private grades not in the data), say so briefly and offer the closest useful help.`,
      ``,
      `USER_DATA (JSON):`,
      "```json",
      JSON.stringify(data.context, null, 2),
      "```",
    ].join("\n");

    try {
      const { text } = await generateText({
        model,
        system,
        messages: data.messages,
      });
      return { reply: text.trim() || "(no response)" };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/429|rate/i.test(msg)) {
        return {
          reply:
            "I'm getting rate limited right now. Give it a few seconds and try again.",
        };
      }
      if (/402|credit|payment/i.test(msg)) {
        return {
          reply:
            "The workspace AI credits are exhausted. Add credits in Lovable settings and I'll be back.",
        };
      }
      return {
        reply: `Something went wrong talking to the model: ${msg}`,
      };
    }
  });
