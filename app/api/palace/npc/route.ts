import { NextResponse } from "next/server";
import { palaceNpcs, type NpcId } from "@/config/palace";
import { npcSystemPrompt, scriptedNpcReply } from "@/lib/palace/dialogue";
import type { NpcChatRequest, NpcChatResponse } from "@/lib/palace/types";

export const runtime = "nodejs";

function isNpcId(value: unknown): value is NpcId {
  return (
    typeof value === "string" &&
    palaceNpcs.some((npc) => npc.id === value)
  );
}

async function llmReply(body: NpcChatRequest): Promise<string | null> {
  const openaiKey = (process.env.OPENAI_API_KEY ?? "").trim();
  const anthropicKey = (process.env.ANTHROPIC_API_KEY ?? "").trim();
  const system = npcSystemPrompt(body.npcId, body.save);
  const history = (body.history ?? []).slice(-8);

  if (openaiKey) {
    const model = (process.env.PALACE_LLM_MODEL ?? "gpt-4o-mini").trim();
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.7,
        max_tokens: 280,
        messages: [
          { role: "system", content: system },
          ...history.map((entry) => ({
            role: entry.role,
            content: entry.content,
          })),
          { role: "user", content: body.message },
        ],
      }),
    });
    if (!response.ok) return null;
    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = data.choices?.[0]?.message?.content?.trim();
    return text || null;
  }

  if (anthropicKey) {
    const model = (
      process.env.PALACE_ANTHROPIC_MODEL ?? "claude-3-5-haiku-latest"
    ).trim();
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: 280,
        system,
        messages: [
          ...history.map((entry) => ({
            role: entry.role,
            content: entry.content,
          })),
          { role: "user", content: body.message },
        ],
      }),
    });
    if (!response.ok) return null;
    const data = (await response.json()) as {
      content?: Array<{ type?: string; text?: string }>;
    };
    const text = data.content?.find((block) => block.type === "text")?.text?.trim();
    return text || null;
  }

  return null;
}

export async function POST(request: Request) {
  let body: NpcChatRequest;
  try {
    body = (await request.json()) as NpcChatRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!isNpcId(body.npcId) || typeof body.message !== "string" || !body.message.trim()) {
    return NextResponse.json({ error: "Invalid npc chat payload" }, { status: 400 });
  }

  const message = body.message.trim().slice(0, 800);
  const history = Array.isArray(body.history) ? body.history.slice(-8) : [];

  try {
    const live = await llmReply({ ...body, message, history });
    if (live) {
      const payload: NpcChatResponse = {
        reply: live,
        source: "llm",
        suggested: palaceNpcs.find((npc) => npc.id === body.npcId)?.topics.slice(0, 3),
      };
      return NextResponse.json(payload);
    }
  } catch {
    // Fall through to sealed script — Palace must speak even when the wire is dark.
  }

  const scripted = scriptedNpcReply(body.npcId, message, body.save, history);
  const payload: NpcChatResponse = {
    reply: scripted.reply,
    source: "script",
    suggested: scripted.suggested,
  };
  return NextResponse.json(payload);
}
