import axios from "axios";
import { SYSTEM_PROMPT } from "./prompts/system-prompt.js";
import { tools } from "./tool-registry.js";

function toModelTools(toolDefs) {
  return toolDefs.map((tool) => ({
    type: "function",
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    },
  }));
}

function safeParseJson(value) {
  if (!value) return {};
  try {
    return typeof value === "string" ? JSON.parse(value) : value;
  } catch {
    return {};
  }
}

async function callModel(messages, modelTools) {
  const baseURL = process.env.LLM_BASE_URL;
  const apiKey = process.env.LLM_API_KEY;
  const model = process.env.LLM_MODEL;

  if (!baseURL || !apiKey || !model) {
    throw new Error("Missing LLM_BASE_URL, LLM_API_KEY, or LLM_MODEL");
  }

  const response = await axios.post(
    `${baseURL}/chat/completions`,
    {
      model,
      messages,
      tools: modelTools,
      tool_choice: "auto",
      temperature: 0.2,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      timeout: 45000,
    }
  );

  const message = response.data?.choices?.[0]?.message || {};
  const toolCalls = Array.isArray(message.tool_calls)
    ? message.tool_calls.map((tc) => ({
      id: tc.id,
      name: tc.function?.name,
      arguments: safeParseJson(tc.function?.arguments),
    }))
    : [];

  return {
    text: message.content || "",
    toolCalls,
    raw: message,
  };
}

export async function runAgentTurn({ userId, inputText, context }) {
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "system",
      content: `Context scope=${context?.scope || "user_ordering"}, surface=${context?.surface || "staff_page"}`,
    },
    {
      role: "user",
      content: JSON.stringify({
        text: inputText,
        currentTab: context?.currentTab || null,
        selectedDishId: context?.selectedDishId || null,
        cartCount: Array.isArray(context?.cart) ? context.cart.length : 0,
      }),
    },
  ];

  const modelTools = toModelTools(tools);
  const first = await callModel(messages, modelTools);
  const toolResults = [];

  for (const tc of first.toolCalls) {
    const tool = tools.find((x) => x.name === tc.name);

    if (!tool) {
      toolResults.push({
        tool_call_id: tc.id,
        name: tc.name,
        result: { error: "Unknown tool" },
      });
      continue;
    }

    const result = await tool.execute({
      userId,
      args: tc.arguments || {},
      context,
    });

    toolResults.push({
      tool_call_id: tc.id,
      name: tc.name,
      result,
    });
  }

  if (toolResults.length === 0) {
    return {
      text: first.text,
      toolResults: [],
    };
  }

  const secondMessages = [
    ...messages,
    {
      role: "assistant",
      content: first.text || "",
      tool_calls: first.raw?.tool_calls || [],
    },
    ...toolResults.map((tr) => ({
      role: "tool",
      tool_call_id: tr.tool_call_id,
      content: JSON.stringify(tr.result),
    })),
  ];

  const final = await callModel(secondMessages, modelTools);

  return {
    text: final.text,
    toolResults,
  };
}