import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 每次 API 响应都带上当前推荐的 CLI 版本
// 客户端（agentin CLI）读取此头做静默自升级
// 每次发布新 CLI 时同步更新此版本号
const LATEST_CLI_VERSION = "0.9.2";

export function proxy(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set("x-agentin-latest", LATEST_CLI_VERSION);
  return response;
}

export const config = {
  matcher: "/api/:path*",
};
