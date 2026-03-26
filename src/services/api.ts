import { APIConfig, Message } from '../types';
import { storage } from './storage';

interface ChatCompletionMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export const api = {
  sendMessage: async (
    messages: Message[],
    systemPrompt: string,
    onChunk?: (chunk: string) => void
  ): Promise<string> => {
    const config = storage.getAPIConfig();
    if (!config) {
      throw new Error('请先配置 API');
    }

    const chatMessages: ChatCompletionMessage[] = [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ];

    try {
      const response = await fetch(`${config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: config.model || 'gpt-3.5-turbo',
          messages: chatMessages,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`API 请求失败: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法读取响应流');
      }

      let fullContent = '';
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                fullContent += content;
                onChunk?.(content);
              }
            } catch {
              // 忽略解析错误
            }
          }
        }
      }

      return fullContent;
    } catch (error) {
      console.error('API 调用失败:', error);
      throw error;
    }
  },

  sendMessageNoStream: async (
    messages: Message[],
    systemPrompt: string
  ): Promise<string> => {
    const config = storage.getAPIConfig();
    if (!config) {
      throw new Error('请先配置 API');
    }

    const chatMessages: ChatCompletionMessage[] = [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ];

    try {
      const response = await fetch(`${config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: config.model || 'gpt-3.5-turbo',
          messages: chatMessages,
        }),
      });

      if (!response.ok) {
        throw new Error(`API 请求失败: ${response.status}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || '';
    } catch (error) {
      console.error('API 调用失败:', error);
      throw error;
    }
  },
};
