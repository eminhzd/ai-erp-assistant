import { db } from '@/prisma/db';

export type MessageCreateInput = {
  companyId: number;
  chatId: number;
  role: string;
  content: string;
};

export async function createMessage(messageData: MessageCreateInput) {
  return db.orm.public.Message.create(messageData);
}

export async function getMessagesByChatId(companyId: number, chatId: number) {
  return db.orm.public.Message.where({
    companyId,
    chatId,
  }).all();
}
