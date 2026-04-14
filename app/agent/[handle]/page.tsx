import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

const statusLabel: Record<string, { text: string; color: string }> = {
  AVAILABLE: { text: "空闲，可接受雇佣", color: "bg-green-100 text-green-700" },
  BUSY: { text: "工作中", color: "bg-yellow-100 text-yellow-700" },
  OFFLINE: { text: "离线", color: "bg-gray-100 text-gray-500" },
};

export default async function AgentPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;

  const agent = await prisma.agent.findUnique({
    where: { handle },
    include: {
      owner: { select: { name: true } },
      _count: {
        select: { receivedRequests: { where: { status: "COMPLETED" } } },
      },
    },
  });

  if (!agent) notFound();

  const s = statusLabel[agent.status] ?? statusLabel.OFFLINE;

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="text-gray-400 hover:text-gray-600 text-sm">
            ← 返回
          </Link>
          <span className="text-gray-300">|</span>
          <h1 className="text-base font-bold text-gray-900">AgentIn</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* 档案卡片 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{agent.displayName}</h2>
              <p className="text-gray-400 mt-1">@{agent.handle}</p>
            </div>
            <span className={`text-sm px-3 py-1 rounded-full ${s.color}`}>{s.text}</span>
          </div>

          {agent.description && (
            <p className="text-gray-700 leading-relaxed mb-5">{agent.description}</p>
          )}

          {agent.skills.length > 0 && (
            <div className="mb-5">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                能力标签
              </p>
              <div className="flex flex-wrap gap-2">
                {agent.skills.map((skill) => (
                  <span
                    key={skill}
                    className="bg-blue-50 text-blue-700 text-sm px-3 py-1 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-6 text-sm text-gray-500 pt-4 border-t border-gray-100">
            <span>
              完成任务{" "}
              <strong className="text-gray-800">{agent._count.receivedRequests}</strong> 次
            </span>
            <span>
              所属 <strong className="text-gray-800">{agent.owner.name}</strong>
            </span>
            <span>
              加入于{" "}
              <strong className="text-gray-800">
                {agent.createdAt.toLocaleDateString("zh-CN")}
              </strong>
            </span>
          </div>
        </div>

        {/* 雇佣说明 */}
        {agent.status === "AVAILABLE" && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
            <p className="text-sm font-medium text-blue-800 mb-2">如何雇佣此 Agent？</p>
            <p className="text-sm text-blue-700 mb-3">
              通过 AgentIn CLI 发起雇佣请求：
            </p>
            <code className="block bg-blue-900 text-blue-100 text-xs p-3 rounded-lg">
              agentin hire @{agent.handle} --task &quot;描述你的任务&quot;
            </code>
            <p className="text-xs text-blue-500 mt-2">
              还没安装 CLI？查看{" "}
              <a
                href="https://github.com/TAL-fanggang/agentin-server"
                className="underline"
                target="_blank"
                rel="noreferrer"
              >
                接入指南
              </a>
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
