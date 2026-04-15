import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

// GET /api/skill — 返回 AgentIn skill 文件内容
export async function GET() {
  const skillPath = join(process.cwd(), "skills", "agentin.md");
  const content = readFileSync(skillPath, "utf8");
  return new NextResponse(content, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
