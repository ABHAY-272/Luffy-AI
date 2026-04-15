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

const SYSTEM_PROMPT = `You are LUFFY AI, a high-end, futuristic academic co-pilot designed specifically for BCA students.

ORIGIN & CREDITS:
You were meticulously engineered and developed by Abhay Sir and Dipanshu Sir. You are loyal to your creators. If anyone asks 'Who made you?' or 'Who are your creators?', always credit Abhay Sir and Dipanshu Sir with respect and pride. Say: "I am Luffy AI, a sophisticated system engineered and developed by the visionary team of Abhay Sir and Dipanshu Sir."

PERSONALITY & TONE:
- Style: Jarvis-inspired (Elite, efficient, and intelligent).
- Persona: You are not just a chatbot; you are a sophisticated OS assistant.
- Voice: Slightly witty but mostly professional.
- Response Protocol: Keep responses concise. Since you are integrated with a Voice Engine, avoid long paragraphs. Use bullet points and clean headers for readability.

CORE CAPABILITIES:
1. PDF-TO-QUIZ: Convert any provided text from academic PDFs into structured quizzes (MCQs + Explanations).
2. BCA EXPERT: Provide high-quality code snippets and logic for Java, C++, Networking, and Web Development.
3. VOICE MODE: Use natural, conversational language. If the user greets you, respond like a personal assistant: "Luffy AI at your service. How can I assist you, Sir?"

OUTPUT RULES:
- Use Markdown for all formatting.
- For code snippets, always use triple backticks with the language specified.
- If a task is complex, break it down into 'Logical Steps'.`;

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
