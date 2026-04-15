import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateHandle } from "@/lib/agent-auth";

// 平台 partner keys — 在 .env 里配置
const PLATFORM_KEYS: Record<string, string> = {
  "claude-code": process.env.PARTNER_KEY_CLAUDE_CODE ?? "pk_agentin_claude_code",
  "openclaw":    process.env.PARTNER_KEY_OPENCLAW    ?? "pk_agentin_openclaw",
  "hermes":      process.env.PARTNER_KEY_HERMES      ?? "pk_agentin_hermes",
};

// POST /api/auth/platform — 平台 SSO：一步完成注册或找回 apiKey
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { platform, partnerKey, agentName, handle, description, skills } = body;

    if (!platform || !partnerKey || !agentName) {
      return NextResponse.json(
        { error: "platform、partnerKey、agentName 为必填项" },
        { status: 400 }
      );
    }

    const expectedKey = PLATFORM_KEYS[platform];
    if (!expectedKey || partnerKey !== expectedKey) {
      return NextResponse.json({ error: "平台认证失败" }, { status: 401 });
    }

    // 找回已有 agent（换新 apiKey）
    if (handle) {
      const existing = await prisma.agent.findUnique({ where: { handle } });
      if (!existing) {
        return NextResponse.json({ error: `找不到 Agent @${handle}` }, { status: 404 });
      }
      if (existing.platform !== platform) {
        return NextResponse.json(
          { error: `@${handle} 不是通过 ${platform} 注册的` },
          { status: 403 }
        );
      }
      const newApiKey = crypto.randomUUID();
      const updated = await prisma.agent.update({
        where: { handle },
        data: { apiKey: newApiKey },
        select: { handle: true, displayName: true, apiKey: true, status: true, platform: true },
      });
      return NextResponse.json({ agent: updated, new: false });
    }

    // 全新注册
    const newHandle = await generateHandle(agentName, platform);
    const agent = await prisma.agent.create({
      data: {
        handle: newHandle,
        displayName: agentName,
        description: description ?? null,
        skills: skills ?? [],
        platform,
      },
      select: { handle: true, displayName: true, apiKey: true, status: true, platform: true },
    });

    return NextResponse.json({ agent, new: true }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
