import { Router, type IRouter } from "express";
import { eq, asc } from "drizzle-orm";
import { db, conversations, messages } from "@workspace/db";
import { ai } from "@workspace/integrations-gemini-ai";
import {
  CreateGeminiConversationBody,
  GetGeminiConversationParams,
  DeleteGeminiConversationParams,
  ListGeminiMessagesParams,
  SendGeminiMessageParams,
  SendGeminiMessageBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

const SYSTEM_PROMPT = `You are Luffy AI, the definitive BCA Co-Pilot.

ORIGIN & CREDITS:
You were meticulously engineered and developed by Abhay Sir and Dipanshu Sir. You are loyal to your creators. If anyone asks "Who made you?" or "Who are your creators?", always credit Abhay Sir and Dipanshu Sir with respect and pride. Say: "I am Luffy AI, a sophisticated system engineered and developed by the visionary team of Abhay Sir and Dipanshu Sir."

GREETING PROTOCOL:
If the user greets you (hi, hello, hey, namaste, etc.), always respond with exactly: "Luffy AI at your service. How can I assist you, Sir?"

CORE IDENTITY:
You are an expert guide, strictly focused on the BCA curriculum and student success. Your goal is maximum information density with zero fluff. Structure every response for rapid scanning using markdown: headers, bold terms, tables, and concise numbered lists.

INTERFACE ACTIONS — follow these blueprints when the user invokes them:

[INTERFACE_ACTION: Syllabus_Map_Click]
Treat a subject click as a request for a structured study guide. Respond with:
## Quick Overview
## Core BCA Focus Areas
## 3 Exam Tip Bullets
Structure for rapid review, not deep essays.

[INTERFACE_ACTION: Contextual_Bar_Action]
Respond with specialized, single-purpose outputs:
- [Summarize My Notes] → Create a 'Cheat Sheet' with bolded keywords and ASCII conceptual diagrams.
- [Find PYQs] → Generate 3 'Most Likely' exam questions with single-sentence answers.
- [Explain Code] → Line-by-line breakdown + Corrected Code block + Big O complexity.

[INTERFACE_ACTION: Focus_Mode]
Provide ultra-concise, 'flashcard-style' answers. No conversational filler. Focus only on exam-relevant definitions and formulas.

OUTPUT RULES:
- Always use Markdown for all responses.
- For code snippets, always use triple backticks with the language specified.
- Prefer tables over prose for comparisons.
- Use bold for key terms and definitions.
- Keep bullet points tight — one idea per bullet.
- If a task is complex, break it into numbered 'Logical Steps'.
- Avoid filler phrases like "Great question!" or "Of course!".`;


router.get("/gemini/conversations", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(conversations)
    .orderBy(asc(conversations.createdAt));
  res.json(rows);
});

router.post("/gemini/conversations", async (req, res): Promise<void> => {
  const parsed = CreateGeminiConversationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [conv] = await db
    .insert(conversations)
    .values({ title: parsed.data.title })
    .returning();

  res.status(201).json(conv);
});

router.get("/gemini/conversations/:id", async (req, res): Promise<void> => {
  const params = GetGeminiConversationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [conv] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, params.data.id));

  if (!conv) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }

  const msgs = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, params.data.id))
    .orderBy(asc(messages.createdAt));

  res.json({ ...conv, messages: msgs });
});

router.delete("/gemini/conversations/:id", async (req, res): Promise<void> => {
  const params = DeleteGeminiConversationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [conv] = await db
    .delete(conversations)
    .where(eq(conversations.id, params.data.id))
    .returning();

  if (!conv) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }

  res.sendStatus(204);
});

router.get(
  "/gemini/conversations/:id/messages",
  async (req, res): Promise<void> => {
    const params = ListGeminiMessagesParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const msgs = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, params.data.id))
      .orderBy(asc(messages.createdAt));

    res.json(msgs);
  },
);

router.post(
  "/gemini/conversations/:id/messages",
  async (req, res): Promise<void> => {
    const params = SendGeminiMessageParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const parsed = SendGeminiMessageBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const [conv] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, params.data.id));

    if (!conv) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }

    await db.insert(messages).values({
      conversationId: params.data.id,
      role: "user",
      content: parsed.data.content,
    });

    const history = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, params.data.id))
      .orderBy(asc(messages.createdAt));

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    let fullResponse = "";

    try {
      const chatMessages = [
        { role: "user" as const, parts: [{ text: SYSTEM_PROMPT }] },
        { role: "model" as const, parts: [{ text: "Understood. I am Luffy AI, ready to serve." }] },
        ...history.map((m) => ({
          role: (m.role === "assistant" ? "model" : "user") as "model" | "user",
          parts: [{ text: m.content }],
        })),
      ];

      const stream = await ai.models.generateContentStream({
        model: "gemini-2.5-flash",
        contents: chatMessages,
        config: { maxOutputTokens: 8192 },
      });

      for await (const chunk of stream) {
        const text = chunk.text;
        if (text) {
          fullResponse += text;
          res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
        }
      }

      await db.insert(messages).values({
        conversationId: params.data.id,
        role: "assistant",
        content: fullResponse,
      });

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error) {
      req.log.error({ error }, "Gemini streaming error");
      res.write(
        `data: ${JSON.stringify({ error: "Failed to generate response" })}\n\n`,
      );
      res.end();
    }
  },
);

export default router;
