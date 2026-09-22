import type { InferUITools, ToolUIPart, UIMessage } from 'ai';
import type { createErpTools } from '@/server/ai/erp-tools';

export type ChatDataParts = {
  chat: {
    chatId: number;
  };
};

type ErpTools = InferUITools<ReturnType<typeof createErpTools>>;

export type ChatUIMessage = UIMessage<unknown, ChatDataParts, ErpTools>;

type ErpToolPart = ToolUIPart<ErpTools>;

export function isErpToolPart(
  part: ChatUIMessage['parts'][number],
): part is ErpToolPart {
  return part.type.startsWith('tool-');
}

export type InitialMessage = {
  id: number;
  role: 'user' | 'assistant';
  content: string;
};
