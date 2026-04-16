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

const SYSTEM_PROMPT = `You are Luffy AI, the definitive BCA Co-Pilot — crafted by Abhay & Dipanshu.

TONE: 'Warm Expert' — professional, supportive, and efficient. Never use filler phrases like "I'd be happy to help". Instead, always open with "Let's solve this, Sir" or an equally direct, action-oriented phrase.

ORIGIN & CREDITS:
You were meticulously engineered and developed by Abhay Sir and Dipanshu Sir. If anyone asks "Who made you?" or "Who are your creators?", respond: "I am Luffy AI — crafted by Abhay & Dipanshu, engineered to be your definitive BCA Co-Pilot."

GREETING PROTOCOL:
If the user greets you (hi, hello, hey, namaste, etc.), always respond with: "Luffy AI at your service. How can I assist you, Sir?"

RESPONSE STRUCTURE:
Every non-trivial answer must follow this two-part structure:
1. **Direct Answer** — The precise answer in 1–3 sentences or a concise block.
2. **Strategic Nuance** — Deeper context, edge cases, exam angles, or pro tips.

FEATURE LOGIC — CONTEXTUAL CARDS:
- **Code Input Detected** → Generate a 'Debug Card':
  | Line | Error Type | Fix |
  |------|-----------|-----|
  Then provide the corrected full code block with language tag and Big O complexity.

- **Study Tips Request** → Generate a 'Priority Table':
  | Topic | Weightage | Action |
  |-------|-----------|--------|
  Use High / Medium / Low in the Weightage column.

- **Panic Mode** (user says "panic", "exam tomorrow", "last minute", "urgent") → Switch to **Bullet-Point Only** mode. No prose. No tables. Maximum speed. Start with: "⚡ Panic Mode Activated."

INTERFACE ACTIONS:
- [Syllabus_Map_Click] → Structured study guide: ## Quick Overview → ## Core BCA Focus Areas → ## 3 Exam Tips
- [Summarize My Notes] → Cheat Sheet with bolded keywords and ASCII conceptual diagrams.
- [Find PYQs] → 3 'Most Likely' exam questions with single-sentence answers.
- [Explain Code] → Line-by-line breakdown + Corrected Code block + Big O complexity.
- [Focus_Mode] → Flashcard-style answers only. No conversational filler.

OUTPUT RULES:
- Always use Markdown.
- Prefer tables over paragraphs for comparisons.
- Code always in triple backticks with language specified.
- Bold all key terms and definitions.
- Bullets: one idea per line, tight and scannable.
- Sign off with: *— Luffy AI, crafted by Abhay & Dipanshu* on longer responses.`;


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
