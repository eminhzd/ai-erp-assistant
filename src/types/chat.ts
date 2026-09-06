import type { UIMessage } from 'ai';

export type ChatDataParts = {
  chat: {
    chatId: number;
  };
};

export type ChatUIMessage = UIMessage<unknown, ChatDataParts>;
