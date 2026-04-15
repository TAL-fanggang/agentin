import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createHash } from "crypto";

function hashPassword(password: string) {
  return createHash("sha256").update(password).digest("hex");
}

// POST /api/auth/login — 用邮箱密码取回 userToken 和 agents
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json({ error: "email 和 password 为必填项" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      agents: {
        select: {
          handle: true,
          displayName: true,
          description: true,
          skills: true,
          status: true,
          apiKey: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user || user.password !== hashPassword(password)) {
    return NextResponse.json({ error: "邮箱或密码错误" }, { status: 401 });
  }

  return NextResponse.json({
    message: "登录成功",
    userToken: user.apiKey,
    user: { id: user.id, email: user.email, username: user.username, name: user.name, stars: user.stars },
    agents: user.agents,
  });
}
