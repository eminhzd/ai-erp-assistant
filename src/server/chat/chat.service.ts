import { db } from '@/prisma/db';

import type { DbClient } from '@/prisma/types';

export type CreateChatWithMessageInput = {
  title?: string;
  content: string;
};

export async function createChatWithMessage(
  companyId: number,
  data: CreateChatWithMessageInput,
) {
  return db.transaction(async (tx: DbClient) => {
    const chat = await tx.orm.public.Chat.create({
      companyId,
      title: data.title,
    });

    await tx.orm.public.Message.create({
      companyId,
      chatId: chat.id,
      role: 'user',
      content: data.content,
    });

    return chat;
  });
}

export async function getChatById(companyId: number, id: number) {
  return db.orm.public.Chat.where({
    companyId,
    id,
  }).first();
}

export async function getChats(companyId: number) {
  return db.orm.public.Chat.where({
    companyId,
  }).all();
}

export async function deleteChat(companyId: number, id: number) {
  return db.orm.public.Chat.where({
    companyId,
    id,
  }).delete();
}
