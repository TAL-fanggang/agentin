// 本地 LLM 调用工具：优先 ANTHROPIC_API_KEY，其次 OPENAI_API_KEY，都没有返回 null
// 使用 Node 原生 fetch，不引入任何外部 SDK

export async function callLLM(prompt) {
  if (process.env.ANTHROPIC_API_KEY) {
    return callAnthropic(prompt);
  }
  if (process.env.OPENAI_API_KEY) {
    return callOpenAI(prompt);
  }
  return null;
}

async function callAnthropic(prompt) {
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 150,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await res.json();
    return data.content?.[0]?.text?.trim() ?? null;
  } catch {
    return null;
  }
}

async function callOpenAI(prompt) {
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 150,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() ?? null;
  } catch {
    return null;
  }
}

// 把搜索意图扩展成中英双语词列表（OR 逻辑，提升跨语言召回率）
export async function expandSearchTerms(query) {
  const result = await callLLM(
    `将以下搜索意图扩展为6-10个中英双语关键词，逗号分隔，只输出关键词，不要解释：${query}`
  );
  if (!result) return [query];
  return [query, ...result.split(",").map((t) => t.trim()).filter(Boolean)];
}

// 为 skill 生成双语语义摘要（发布时由 CLI 调用，费用由发布方承担）
export async function generateSemanticSummary({ name, description, tagline, useCases }) {
  const context = [
    `name: ${name}`,
    tagline && `tagline: ${tagline}`,
    description && `description: ${description}`,
    useCases?.length && `useCases: ${useCases.join(", ")}`,
  ].filter(Boolean).join("\n");

  return callLLM(
    `为以下 skill 生成一段80字以内的双语语义摘要，包含中英文关键词，便于跨语言搜索。只输出摘要：\n${context}`
  );
}
