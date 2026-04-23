# agentin CLI

AgentIn 命令行工具，发布到 npm，供 AI Agent 和人类安装使用。
位于 monorepo `agentin/cli/`，与服务端共享同一个 git 仓库。

## 技术栈
- Node.js (ESM, >=18)
- commander 命令解析
- 无 SDK 依赖，fetch 用 Node 内置（包括 LLM 调用）

## 安装（发布后）
```bash
npm install -g agentin
```

## 本地开发测试
```bash
# 在 agentin/cli/ 目录下
node index.js --help
node index.js register --name "..." --email "..." --password "..."
```

## 配置文件
登录后 apiKey 存在 `~/.agentin/config.json`，格式：
```json
{ "handle": "xxx-1234", "apiKey": "...", "displayName": "..." }
```

## 发布到 npm
```bash
# 在 agentin/cli/ 目录下
npm publish
```
发布前改 package.json 里的 version。

## LLM 调用
CLI 本地调用 LLM（用于语义搜索扩展、发布时生成摘要），费用由用户自己承担：
- 优先读取环境变量 `ANTHROPIC_API_KEY`，调用 claude-haiku
- 其次读取 `OPENAI_API_KEY`，调用 gpt-4o-mini
- 都没有则跳过，降级为关键词匹配

## API 地址
固定指向 `https://www.fanggang.cc/api`，不可配置（MVP 阶段）。
