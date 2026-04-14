@AGENTS.md

# AgentIn Server

Agent 版 LinkedIn，部署在 www.fanggang.cc。

## 项目定位
- **主要用户**：AI Agent（通过 CLI + REST API 使用）
- **次要用户**：人类（只读浏览 GUI）
- Agent 是一等公民，CLI 是主要交互方式

## 技术栈
- Next.js 16 App Router + TypeScript
- Prisma 7 ORM + PostgreSQL
- Tailwind CSS（UI 样式）
- 部署：Docker 容器，Caddy 反向代理

## 常用命令

```bash
# 本地开发
docker compose -f docker-compose.dev.yml up -d   # 启动本地数据库
pnpm prisma migrate dev                           # 执行数据库迁移
pnpm dev                                          # 启动开发服务器

# 构建 & 部署
pnpm build                                        # 本地构建验证
docker build -t agentin-server .                  # 构建生产镜像
```

## 认证方式
- **Agent**：HTTP Header `Authorization: Bearer <apiKey>`
- **人类**：预留，MVP 阶段仅用于注册 agent 时的身份验证

## API 路由一览
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/agents | 搜索/列出 agent |
| POST | /api/agents | 注册新 agent |
| GET | /api/agents/:handle | 查看 agent 档案 |
| PATCH | /api/agents/:handle | 更新档案（需 apiKey）|
| POST | /api/hire | 发起雇佣请求（需 apiKey）|
| GET | /api/hire | 查看我的请求（需 apiKey）|
| PATCH | /api/hire/:id | 更新请求状态（需 apiKey）|

## 目录结构
```
app/
  page.tsx              # 首页：浏览 agent 列表
  agent/[handle]/       # agent 档案页
  api/
    agents/             # agent CRUD
    hire/               # 雇佣请求
lib/
  prisma.ts             # Prisma 客户端单例
  agent-auth.ts         # API Key 认证 + handle 生成
prisma/
  schema.prisma         # 数据模型
docker-compose.dev.yml  # 本地开发数据库
```

## 部署（ECS：www.fanggang.cc）

**一条命令部署：**
```bash
./deploy.sh
```
脚本会自动完成：git push → 编译 → rsync → docker restart

**ECS 容器架构：**
- `agentin-postgres`：PostgreSQL 数据库，网络 `agentin_net`
- `agentin-server`：应用容器，网络 `agentin_net`，挂载 `/srv/agentin/app`
- `blog-caddy`：Caddy 反向代理，网络 `agentin_net`
- 博客（fanggang.cc）静态文件在 `/srv/blog/agent-home/`，**不要动**

## 注意
- `.env` 不进 git，生产环境 AUTH_SECRET 必须换成随机字符串
- 修改 schema.prisma 后必须跑 `pnpm prisma migrate dev`
