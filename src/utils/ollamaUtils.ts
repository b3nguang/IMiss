/**
 * OpenAI Compatible AI 工具函数
 * 封装与 OpenAI 兼容 API 交互的逻辑（支持 OpenAI、Ollama、DeepSeek 等）
 */

import { flushSync } from "react-dom";

/**
 * LLM 设置接口
 */
export interface LlmSettings {
  model: string;
  base_url: string;
  api_key?: string;
}

// 向后兼容别名
export type OllamaSettings = LlmSettings;

/**
 * AI 回调函数接口
 */
export interface AiCallbacks {
  setAiAnswer: (answer: string) => void;
  setShowAiAnswer: (show: boolean) => void;
  setIsAiLoading: (loading: boolean) => void;
}

// 向后兼容别名
export type OllamaCallbacks = AiCallbacks;

/**
 * 调用 OpenAI 兼容 API 进行 AI 问答（SSE 流式请求）
 * 
 * @param prompt - 用户输入的提示词
 * @param settings - LLM 设置（模型、基础 URL、API Key）
 * @param callbacks - 状态更新回调函数
 */
export async function askAi(
  prompt: string,
  settings: LlmSettings,
  callbacks: AiCallbacks
): Promise<void> {
  if (!prompt.trim()) {
    return;
  }

  const { setAiAnswer, setShowAiAnswer, setIsAiLoading } = callbacks;

  // 清空之前的 AI 回答，并切换到 AI 回答模式
  setAiAnswer('');
  setShowAiAnswer(true);
  setIsAiLoading(true);
  
  let accumulatedAnswer = '';
  let buffer = '';
  
  try {
    const baseUrl = (settings.base_url || 'https://api.openai.com/v1').replace(/\/+$/, '');
    const model = settings.model || 'gpt-3.5-turbo';
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (settings.api_key) {
      headers['Authorization'] = `Bearer ${settings.api_key}`;
    }

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      throw new Error(`API 请求失败 (${response.status}): ${errorBody || response.statusText}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    
    if (!reader) {
      throw new Error('无法读取响应流');
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        // 处理剩余的 buffer
        if (buffer.trim()) {
          processSSELine(buffer, (content) => {
            accumulatedAnswer += content;
            flushSync(() => { setAiAnswer(accumulatedAnswer); });
          });
        }
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;
      const lines = buffer.split('\n');
      
      // 保留最后一个不完整的行
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;
        
        if (trimmedLine === 'data: [DONE]') {
          setIsAiLoading(false);
          flushSync(() => { setAiAnswer(accumulatedAnswer); });
          return;
        }

        processSSELine(trimmedLine, (content) => {
          accumulatedAnswer += content;
          flushSync(() => { setAiAnswer(accumulatedAnswer); });
        });
      }
    }
    
    setIsAiLoading(false);
    setAiAnswer(accumulatedAnswer);
  } catch (error: any) {
    console.error('调用 AI API 失败:', error);
    setIsAiLoading(false);
    const errorMessage = error.message || '未知错误';
    const baseUrl = settings.base_url || 'https://api.openai.com/v1';
    alert(`调用AI失败: ${errorMessage}\n\n请确保:\n1. API 服务可用\n2. 模型名称正确 (${settings.model})\n3. API 地址正确 (${baseUrl})\n4. API Key 已正确配置`);
  }
}

// 向后兼容别名
export const askOllama = askAi;

/**
 * 处理 SSE 行，提取 content delta
 */
function processSSELine(line: string, onContent: (content: string) => void): void {
  const dataPrefix = 'data: ';
  const jsonStr = line.startsWith(dataPrefix) ? line.slice(dataPrefix.length) : line;
  
  if (!jsonStr.trim() || jsonStr.trim() === '[DONE]') return;
  
  try {
    const data = JSON.parse(jsonStr);
    // OpenAI format: data.choices[0].delta.content
    const content = data.choices?.[0]?.delta?.content;
    if (content) {
      onContent(content);
    }
  } catch (e) {
    // 忽略解析错误
    console.warn('解析流式数据失败:', e, jsonStr);
  }
}

