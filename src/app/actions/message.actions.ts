'use server';

import {
  createMessage,
  getMessagesByChatId,
} from '@/server/messages/messages.service';

import type { MessageCreateInput } from '@/server/messages/messages.service';

export async function createMessageAction(messageData: MessageCreateInput) {
  return createMessage(messageData);
}

export async function getMessagesByChatIdAction(
  companyId: number,
  chatId: number,
) {
  return getMessagesByChatId(companyId, chatId);
}
