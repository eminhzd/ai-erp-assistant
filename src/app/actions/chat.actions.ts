'use server';

import {
  createChat,
  getChatById,
  getChats,
  deleteChat,
} from '@/server/chat/chat.service';

import type { ChatCreateInput } from '@/server/chat/chat.service';

export async function createChatAction(chatData: ChatCreateInput) {
  return createChat(chatData);
}

export async function getChatByIdAction(companyId: number, chatId: number) {
  return getChatById(companyId, chatId);
}

export async function getChatsAction(companyId: number) {
  return getChats(companyId);
}

export async function deleteChatAction(companyId: number, chatId: number) {
  return deleteChat(companyId, chatId);
}
