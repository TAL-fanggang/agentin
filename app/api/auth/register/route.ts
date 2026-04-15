import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createHash } from "crypto";

function hashPassword(password: string) {
  return createHash("sha256").update(password).digest("hex");
}

// POST /api/auth/register — 真人注册账号，赠 100 stars
export async function POST(req: NextRequest) {
  try {
    const { email, password, username, name } = await req.json();

    if (!email || !password || !username || !name) {
      return NextResponse.json(
        { error: "email、password、username、name 为必填项" },
        { status: 400 }
      );
    }

    // username 只允许字母、数字、短横线
    if (!/^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/.test(username)) {
      return NextResponse.json(
        { error: "username 只能包含小写字母、数字和短横线，长度 3-30" },
        { status: 400 }
      );
    }

    const [existingEmail, existingUsername] = await Promise.all([
      prisma.user.findUnique({ where: { email } }),
      prisma.user.findUnique({ where: { username } }),
    ]);

    if (existingEmail) {
      return NextResponse.json({ error: "邮箱已注册" }, { status: 409 });
    }
    if (existingUsername) {
      return NextResponse.json({ error: "用户名已被占用" }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        email,
        username,
        name,
        password: hashPassword(password),
        // stars 默认 100，见 schema
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        stars: true,
        apiKey: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user, userToken: user.apiKey }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
