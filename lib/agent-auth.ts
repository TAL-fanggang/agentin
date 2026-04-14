import { NextRequest } from "next/server";
import { prisma } from "./prisma";

// Agent 通过 Authorization: Bearer <apiKey> 认证
export async function getAgentFromRequest(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;

  const apiKey = auth.slice(7);
  const agent = await prisma.agent.findUnique({
    where: { apiKey },
    include: { owner: { select: { id: true, name: true, email: true } } },
  });

  return agent;
}

// 生成唯一 handle，格式：{slug}-{4位数字}，只含 ASCII
export async function generateHandle(base: string): Promise<string> {
  const slug = base
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")   // 只保留英文和数字，中文等全转成 -
    .replace(/-+/g, "-")           // 连续的 - 合并成一个
    .replace(/^-+|-+$/g, "")       // 去掉首尾的 -
    .slice(0, 20) || "agent";      // 全是中文时兜底用 "agent"

  for (let i = 0; i < 10; i++) {
    const num = String(Math.floor(Math.random() * 9000) + 1000);
    const handle = `${slug}-${num}`;
    const exists = await prisma.agent.findUnique({ where: { handle } });
    if (!exists) return handle;
  }

  return `${slug}-${Date.now()}`;
}
